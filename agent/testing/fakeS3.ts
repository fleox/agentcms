// In-memory S3-compatible service for tests: path-style API at
// https://s3.fake.test/<bucket>/<key> (signature checked for the access
// key id only) and static website hosting of PUBLIC buckets at
// https://<bucket>.website.fake.test/ (index.html for folders). Install
// as `fetch` in tests.

interface StoredObject {
  body: Uint8Array;
  contentType: string;
}

export interface FakeS3 {
  fetch: typeof fetch;
  createBucket(name: string, opts?: { public?: boolean }): void;
  object(bucket: string, key: string): StoredObject | undefined;
  keys(bucket: string): string[];
  endpoint: string;
  websiteUrl(bucket: string): string;
}

export function createFakeS3(opts: { accessKeyId: string }): FakeS3 {
  const buckets = new Map<string, { public: boolean; objects: Map<string, StoredObject> }>();

  const xml = (body: string, status = 200) => new Response(body, { status, headers: { "content-type": "application/xml" } });
  const error = (code: string, status: number) => xml(`<?xml version="1.0"?><Error><Code>${code}</Code></Error>`, status);

  const impl = async (input: string | URL | Request, init: RequestInit = {}): Promise<Response> => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
    const method = (init.method ?? "GET").toUpperCase();

    const site = /^(.+)\.website\.fake\.test$/.exec(url.hostname);
    if (site) {
      const bucket = buckets.get(site[1]);
      if (!bucket?.public) return error("AccessDenied", 403);
      let key = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
      if (key === "" || key.endsWith("/")) key += "index.html";
      const obj = bucket.objects.get(key);
      return obj ? new Response(obj.body.slice(), { headers: { "content-type": obj.contentType } }) : error("NoSuchKey", 404);
    }

    if (url.hostname !== "s3.fake.test") throw new TypeError(`fake s3: unexpected host ${url.hostname}`);
    const auth = new Headers(init.headers).get("authorization") ?? "";
    if (!auth.startsWith(`AWS4-HMAC-SHA256 Credential=${opts.accessKeyId}/`)) return error("InvalidAccessKeyId", 403);
    const [, bucketName, ...rest] = url.pathname.split("/");
    const bucket = buckets.get(bucketName);
    if (!bucket) return error("NoSuchBucket", 404);
    const key = rest.map(decodeURIComponent).join("/");

    if (method === "GET" && !key) {
      const prefix = url.searchParams.get("prefix") ?? "";
      const items = [...bucket.objects].filter(([k]) => k.startsWith(prefix));
      return xml(
        `<?xml version="1.0"?><ListBucketResult><IsTruncated>false</IsTruncated>${items
          .map(([k, o]) => `<Contents><Key>${k}</Key><Size>${o.body.length}</Size></Contents>`)
          .join("")}</ListBucketResult>`,
      );
    }
    if (method === "PUT") {
      const body = init.body instanceof Uint8Array ? init.body : new TextEncoder().encode(String(init.body ?? ""));
      bucket.objects.set(key, { body: new Uint8Array(body), contentType: new Headers(init.headers).get("content-type") ?? "application/octet-stream" });
      return new Response(null, { status: 200 });
    }
    if (method === "GET") {
      const obj = bucket.objects.get(key);
      return obj ? new Response(obj.body.slice(), { headers: { "content-type": obj.contentType } }) : error("NoSuchKey", 404);
    }
    if (method === "DELETE") {
      bucket.objects.delete(key);
      return new Response(null, { status: 204 });
    }
    return error("NotImplemented", 501);
  };

  return {
    fetch: impl as typeof fetch,
    endpoint: "https://s3.fake.test",
    websiteUrl: (bucket) => `https://${bucket}.website.fake.test`,
    createBucket(name, o = {}) {
      buckets.set(name, { public: !!o.public, objects: new Map() });
    },
    object: (bucket, key) => buckets.get(bucket)?.objects.get(key),
    keys: (bucket) => [...(buckets.get(bucket)?.objects.keys() ?? [])].sort(),
  };
}
