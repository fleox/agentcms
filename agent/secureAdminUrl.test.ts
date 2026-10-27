import { secureAdminUrlOf } from "./remote";

const s3 = (settings: Record<string, unknown>) => ({ connectorId: "s3", settings });

describe("secureAdminUrlOf", () => {
  it("opens an S3 website site's admin through the bucket's HTTPS endpoint", () => {
    expect(
      secureAdminUrlOf({
        siteUrl: "http://shop.s3-website.eu-west-par.io.cloud.ovh.net/blog",
        adminFolder: "admin",
        hosting: s3({ bucket: "shop", endpoint: "https://s3.eu-west-par.io.cloud.ovh.net", prefix: "blog", forcePathStyle: true }),
      }),
    ).toBe("https://shop.s3.eu-west-par.io.cloud.ovh.net/blog/admin/index.html");
    // AWS without an endpoint; dotted bucket → path-style.
    expect(
      secureAdminUrlOf({ siteUrl: "http://www.example.com.s3-website-eu-west-1.amazonaws.com", adminFolder: "admin", hosting: s3({ bucket: "www.example.com", region: "eu-west-1" }) }),
    ).toBe("https://s3.eu-west-1.amazonaws.com/www.example.com/admin/index.html");
  });

  it("names index.html on an https REST URL, and leaves other hostings alone", () => {
    expect(secureAdminUrlOf({ siteUrl: "https://shop.s3.example.net", adminFolder: "admin", hosting: s3({ bucket: "shop" }) })).toBe("https://shop.s3.example.net/admin/index.html");
    expect(secureAdminUrlOf({ siteUrl: "https://me.github.io/site", adminFolder: "admin", hosting: { connectorId: "git-pages", settings: {} } })).toBeNull();
    expect(secureAdminUrlOf({ siteUrl: "http://localhost:8080", adminFolder: "admin", hosting: s3({ bucket: "x" }) })).toBeNull();
    expect(secureAdminUrlOf({ siteUrl: "http://x.s3-website.example", adminFolder: null, hosting: s3({ bucket: "x" }) })).toBeNull();
  });
});
