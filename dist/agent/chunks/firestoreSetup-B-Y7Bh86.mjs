import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { c as collection, g as getDocs, q as query, l as limit, aH as orderBy, a$ as where } from "./index.node-DYLwqGPq.mjs";
import { collections, getDb } from "./firebaseClient-BjUVAcKz.mjs";
import "./index.esm2017-BUfxW6Jp.mjs";
import "util";
import "crypto";
import "process";
import "tls";
import "fs";
import "os";
import "net";
import "events";
import "stream";
import "./_commonjsHelpers-DtUDk_0l.mjs";
import "path";
import "http2";
import "http";
import "url";
import "dns";
import "zlib";
import "./index-CuB-ym-g.mjs";
import "./index-CjBqWaZn.mjs";
import "./runtimeConfig-BNLCrrQo.mjs";
const CACHE_KEY = "agentcms.firestoreIndexesReady";
const FAILED_PRECONDITION = "failed-precondition";
function extractSuggestUrl(message) {
  const m = message.match(/https:\/\/console\.firebase\.google\.com\/[^\s)]+/);
  return m ? m[0] : "";
}
function buildPingQueries() {
  const postsCollection = collection(getDb(), collections.posts);
  return [
    {
      label: "Posts list — all",
      fields: "type ASC, createdAt DESC",
      run: () => getDocs(
        query(
          postsCollection,
          where("type", "==", "post"),
          orderBy("createdAt", "desc"),
          limit(1)
        )
      )
    },
    {
      label: "Posts list — by status",
      fields: "type ASC, status ASC, createdAt DESC",
      run: () => getDocs(
        query(
          postsCollection,
          where("type", "==", "post"),
          where("status", "==", "online"),
          orderBy("createdAt", "desc"),
          limit(1)
        )
      )
    }
  ];
}
async function pingPaginatedQueries() {
  const missingIndexes = [];
  let unexpectedError;
  for (const ping of buildPingQueries()) {
    try {
      await ping.run();
    } catch (err) {
      const fbErr = err;
      if (fbErr.code === FAILED_PRECONDITION) {
        missingIndexes.push({
          label: ping.label,
          fields: ping.fields,
          createUrl: extractSuggestUrl(fbErr.message ?? "")
        });
      } else {
        unexpectedError = unexpectedError ?? {
          code: fbErr.code ?? "unknown",
          message: fbErr.message ?? String(err)
        };
      }
    }
  }
  const ready = missingIndexes.length === 0 && !unexpectedError;
  if (ready) markIndexesReady();
  return { ready, missingIndexes, unexpectedError };
}
function markIndexesReady() {
  try {
    window.localStorage.setItem(CACHE_KEY, "1");
  } catch {
  }
}
function invalidateCachedReady() {
  try {
    window.localStorage.removeItem(CACHE_KEY);
  } catch {
  }
}
export {
  invalidateCachedReady,
  pingPaginatedQueries
};
