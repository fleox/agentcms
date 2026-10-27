import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
const ADMIN_FORMATS = {
  "admin-thumb": { width: 240, height: 240, fit: "cover" },
  "admin-preview": { width: 800, height: 800, fit: "contain" },
  "admin-original": { width: 2e3, height: 2e3, fit: "contain", quality: 90 }
};
const ADMIN_THUMB_KEY = "admin-thumb";
export {
  ADMIN_FORMATS,
  ADMIN_THUMB_KEY
};
