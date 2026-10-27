import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { i as initializeApp, g as getApps, r as registerVersion } from "./index.esm2017-C4mMOVmK.mjs";
import { F, S, D, _, a, b, c, d, e, f, h } from "./index.esm2017-C4mMOVmK.mjs";
var name = "firebase";
var version = "11.10.0";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
registerVersion(name, version, "app");
export {
  F as FirebaseError,
  S as SDK_VERSION,
  D as _DEFAULT_ENTRY_NAME,
  _ as _addComponent,
  a as _apps,
  b as _components,
  c as _getProvider,
  d as _isFirebaseServerApp,
  e as _registerComponent,
  f as _serverApps,
  h as getApp,
  getApps,
  initializeApp,
  registerVersion
};
