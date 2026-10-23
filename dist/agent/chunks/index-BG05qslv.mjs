import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
const DB_NAME$1 = "flexweg-git-blobs";
const STORE$1 = "texts";
const memory = /* @__PURE__ */ new Map();
let dbPromise = null;
function openDb$1() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    try {
      if (typeof indexedDB === "undefined") return resolve(null);
      const req = indexedDB.open(DB_NAME$1, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE$1);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}
async function getCachedTexts(shas) {
  const out = /* @__PURE__ */ new Map();
  const missing = [];
  for (const sha of shas) {
    const hit = memory.get(sha);
    if (hit !== void 0) out.set(sha, hit);
    else missing.push(sha);
  }
  if (missing.length === 0) return out;
  const db = await openDb$1();
  if (!db) return out;
  await new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE$1, "readonly");
      const store = tx.objectStore(STORE$1);
      for (const sha of missing) {
        const req = store.get(sha);
        req.onsuccess = () => {
          if (typeof req.result === "string") {
            out.set(sha, req.result);
            memory.set(sha, req.result);
          }
        };
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
  return out;
}
async function putCachedTexts(entries) {
  for (const [sha, text] of entries) memory.set(sha, text);
  const db = await openDb$1();
  if (!db || entries.size === 0) return;
  await new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE$1, "readwrite");
      const store = tx.objectStore(STORE$1);
      for (const [sha, text] of entries) store.put(text, sha);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
}
function bytesToBase64(bytes) {
  let binary = "";
  const chunk = 32768;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
function base64ToBytes(base64) {
  const binary = atob(base64.replace(/\s+/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
function utf8ToBase64(text) {
  return bytesToBase64(new TextEncoder().encode(text));
}
function base64ToUtf8(base64) {
  return new TextDecoder().decode(base64ToBytes(base64));
}
function changeToBytes(change) {
  return change.encoding === "base64" ? base64ToBytes(change.content) : new TextEncoder().encode(change.content);
}
const isString = (obj) => typeof obj === "string";
const defer = () => {
  let res;
  let rej;
  const promise = new Promise((resolve, reject) => {
    res = resolve;
    rej = reject;
  });
  promise.resolve = res;
  promise.reject = rej;
  return promise;
};
const makeString = (object) => {
  if (object == null) return "";
  return "" + object;
};
const copy = (a, s, t) => {
  a.forEach((m) => {
    if (s[m]) t[m] = s[m];
  });
};
const lastOfPathSeparatorRegExp = /###/g;
const cleanKey = (key) => key && key.indexOf("###") > -1 ? key.replace(lastOfPathSeparatorRegExp, ".") : key;
const canNotTraverseDeeper = (object) => !object || isString(object);
const getLastOfPath = (object, path, Empty) => {
  const stack = !isString(path) ? path : path.split(".");
  let stackIndex = 0;
  while (stackIndex < stack.length - 1) {
    if (canNotTraverseDeeper(object)) return {};
    const key = cleanKey(stack[stackIndex]);
    if (!object[key] && Empty) object[key] = new Empty();
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      object = object[key];
    } else {
      object = {};
    }
    ++stackIndex;
  }
  if (canNotTraverseDeeper(object)) return {};
  return {
    obj: object,
    k: cleanKey(stack[stackIndex])
  };
};
const setPath = (object, path, newValue) => {
  const {
    obj,
    k
  } = getLastOfPath(object, path, Object);
  if (obj !== void 0 || path.length === 1) {
    obj[k] = newValue;
    return;
  }
  let e = path[path.length - 1];
  let p = path.slice(0, path.length - 1);
  let last = getLastOfPath(object, p, Object);
  while (last.obj === void 0 && p.length) {
    e = `${p[p.length - 1]}.${e}`;
    p = p.slice(0, p.length - 1);
    last = getLastOfPath(object, p, Object);
    if (last && last.obj && typeof last.obj[`${last.k}.${e}`] !== "undefined") {
      last.obj = void 0;
    }
  }
  last.obj[`${last.k}.${e}`] = newValue;
};
const pushPath = (object, path, newValue, concat) => {
  const {
    obj,
    k
  } = getLastOfPath(object, path, Object);
  obj[k] = obj[k] || [];
  obj[k].push(newValue);
};
const getPath = (object, path) => {
  const {
    obj,
    k
  } = getLastOfPath(object, path);
  if (!obj) return void 0;
  return obj[k];
};
const getPathWithDefaults = (data, defaultData, key) => {
  const value = getPath(data, key);
  if (value !== void 0) {
    return value;
  }
  return getPath(defaultData, key);
};
const deepExtend = (target, source, overwrite) => {
  for (const prop in source) {
    if (prop !== "__proto__" && prop !== "constructor") {
      if (prop in target) {
        if (isString(target[prop]) || target[prop] instanceof String || isString(source[prop]) || source[prop] instanceof String) {
          if (overwrite) target[prop] = source[prop];
        } else {
          deepExtend(target[prop], source[prop], overwrite);
        }
      } else {
        target[prop] = source[prop];
      }
    }
  }
  return target;
};
const regexEscape = (str) => str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
var _entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;"
};
const escape = (data) => {
  if (isString(data)) {
    return data.replace(/[&<>"'\/]/g, (s) => _entityMap[s]);
  }
  return data;
};
class RegExpCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.regExpMap = /* @__PURE__ */ new Map();
    this.regExpQueue = [];
  }
  getRegExp(pattern) {
    const regExpFromCache = this.regExpMap.get(pattern);
    if (regExpFromCache !== void 0) {
      return regExpFromCache;
    }
    const regExpNew = new RegExp(pattern);
    if (this.regExpQueue.length === this.capacity) {
      this.regExpMap.delete(this.regExpQueue.shift());
    }
    this.regExpMap.set(pattern, regExpNew);
    this.regExpQueue.push(pattern);
    return regExpNew;
  }
}
const chars = [" ", ",", "?", "!", ";"];
const looksLikeObjectPathRegExpCache = new RegExpCache(20);
const looksLikeObjectPath = (key, nsSeparator, keySeparator) => {
  nsSeparator = nsSeparator || "";
  keySeparator = keySeparator || "";
  const possibleChars = chars.filter((c) => nsSeparator.indexOf(c) < 0 && keySeparator.indexOf(c) < 0);
  if (possibleChars.length === 0) return true;
  const r = looksLikeObjectPathRegExpCache.getRegExp(`(${possibleChars.map((c) => c === "?" ? "\\?" : c).join("|")})`);
  let matched = !r.test(key);
  if (!matched) {
    const ki = key.indexOf(keySeparator);
    if (ki > 0 && !r.test(key.substring(0, ki))) {
      matched = true;
    }
  }
  return matched;
};
const deepFind = function(obj, path) {
  let keySeparator = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : ".";
  if (!obj) return void 0;
  if (obj[path]) return obj[path];
  const tokens = path.split(keySeparator);
  let current = obj;
  for (let i = 0; i < tokens.length; ) {
    if (!current || typeof current !== "object") {
      return void 0;
    }
    let next;
    let nextPath = "";
    for (let j = i; j < tokens.length; ++j) {
      if (j !== i) {
        nextPath += keySeparator;
      }
      nextPath += tokens[j];
      next = current[nextPath];
      if (next !== void 0) {
        if (["string", "number", "boolean"].indexOf(typeof next) > -1 && j < tokens.length - 1) {
          continue;
        }
        i += j - i + 1;
        break;
      }
    }
    current = next;
  }
  return current;
};
const getCleanedCode = (code) => code && code.replace("_", "-");
const consoleLogger = {
  type: "logger",
  log(args) {
    this.output("log", args);
  },
  warn(args) {
    this.output("warn", args);
  },
  error(args) {
    this.output("error", args);
  },
  output(type, args) {
    if (console && console[type]) console[type].apply(console, args);
  }
};
class Logger {
  constructor(concreteLogger) {
    let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    this.init(concreteLogger, options);
  }
  init(concreteLogger) {
    let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    this.prefix = options.prefix || "i18next:";
    this.logger = concreteLogger || consoleLogger;
    this.options = options;
    this.debug = options.debug;
  }
  log() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return this.forward(args, "log", "", true);
  }
  warn() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    return this.forward(args, "warn", "", true);
  }
  error() {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }
    return this.forward(args, "error", "");
  }
  deprecate() {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }
    return this.forward(args, "warn", "WARNING DEPRECATED: ", true);
  }
  forward(args, lvl, prefix, debugOnly) {
    if (debugOnly && !this.debug) return null;
    if (isString(args[0])) args[0] = `${prefix}${this.prefix} ${args[0]}`;
    return this.logger[lvl](args);
  }
  create(moduleName) {
    return new Logger(this.logger, {
      ...{
        prefix: `${this.prefix}:${moduleName}:`
      },
      ...this.options
    });
  }
  clone(options) {
    options = options || this.options;
    options.prefix = options.prefix || this.prefix;
    return new Logger(this.logger, options);
  }
}
var baseLogger = new Logger();
class EventEmitter {
  constructor() {
    this.observers = {};
  }
  on(events, listener) {
    events.split(" ").forEach((event) => {
      if (!this.observers[event]) this.observers[event] = /* @__PURE__ */ new Map();
      const numListeners = this.observers[event].get(listener) || 0;
      this.observers[event].set(listener, numListeners + 1);
    });
    return this;
  }
  off(event, listener) {
    if (!this.observers[event]) return;
    if (!listener) {
      delete this.observers[event];
      return;
    }
    this.observers[event].delete(listener);
  }
  emit(event) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    if (this.observers[event]) {
      const cloned = Array.from(this.observers[event].entries());
      cloned.forEach((_ref) => {
        let [observer, numTimesAdded] = _ref;
        for (let i = 0; i < numTimesAdded; i++) {
          observer(...args);
        }
      });
    }
    if (this.observers["*"]) {
      const cloned = Array.from(this.observers["*"].entries());
      cloned.forEach((_ref2) => {
        let [observer, numTimesAdded] = _ref2;
        for (let i = 0; i < numTimesAdded; i++) {
          observer.apply(observer, [event, ...args]);
        }
      });
    }
  }
}
class ResourceStore extends EventEmitter {
  constructor(data) {
    let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {
      ns: ["translation"],
      defaultNS: "translation"
    };
    super();
    this.data = data || {};
    this.options = options;
    if (this.options.keySeparator === void 0) {
      this.options.keySeparator = ".";
    }
    if (this.options.ignoreJSONStructure === void 0) {
      this.options.ignoreJSONStructure = true;
    }
  }
  addNamespaces(ns) {
    if (this.options.ns.indexOf(ns) < 0) {
      this.options.ns.push(ns);
    }
  }
  removeNamespaces(ns) {
    const index2 = this.options.ns.indexOf(ns);
    if (index2 > -1) {
      this.options.ns.splice(index2, 1);
    }
  }
  getResource(lng, ns, key) {
    let options = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {};
    const keySeparator = options.keySeparator !== void 0 ? options.keySeparator : this.options.keySeparator;
    const ignoreJSONStructure = options.ignoreJSONStructure !== void 0 ? options.ignoreJSONStructure : this.options.ignoreJSONStructure;
    let path;
    if (lng.indexOf(".") > -1) {
      path = lng.split(".");
    } else {
      path = [lng, ns];
      if (key) {
        if (Array.isArray(key)) {
          path.push(...key);
        } else if (isString(key) && keySeparator) {
          path.push(...key.split(keySeparator));
        } else {
          path.push(key);
        }
      }
    }
    const result = getPath(this.data, path);
    if (!result && !ns && !key && lng.indexOf(".") > -1) {
      lng = path[0];
      ns = path[1];
      key = path.slice(2).join(".");
    }
    if (result || !ignoreJSONStructure || !isString(key)) return result;
    return deepFind(this.data && this.data[lng] && this.data[lng][ns], key, keySeparator);
  }
  addResource(lng, ns, key, value) {
    let options = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : {
      silent: false
    };
    const keySeparator = options.keySeparator !== void 0 ? options.keySeparator : this.options.keySeparator;
    let path = [lng, ns];
    if (key) path = path.concat(keySeparator ? key.split(keySeparator) : key);
    if (lng.indexOf(".") > -1) {
      path = lng.split(".");
      value = ns;
      ns = path[1];
    }
    this.addNamespaces(ns);
    setPath(this.data, path, value);
    if (!options.silent) this.emit("added", lng, ns, key, value);
  }
  addResources(lng, ns, resources) {
    let options = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {
      silent: false
    };
    for (const m in resources) {
      if (isString(resources[m]) || Array.isArray(resources[m])) this.addResource(lng, ns, m, resources[m], {
        silent: true
      });
    }
    if (!options.silent) this.emit("added", lng, ns, resources);
  }
  addResourceBundle(lng, ns, resources, deep, overwrite) {
    let options = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : {
      silent: false,
      skipCopy: false
    };
    let path = [lng, ns];
    if (lng.indexOf(".") > -1) {
      path = lng.split(".");
      deep = resources;
      resources = ns;
      ns = path[1];
    }
    this.addNamespaces(ns);
    let pack = getPath(this.data, path) || {};
    if (!options.skipCopy) resources = JSON.parse(JSON.stringify(resources));
    if (deep) {
      deepExtend(pack, resources, overwrite);
    } else {
      pack = {
        ...pack,
        ...resources
      };
    }
    setPath(this.data, path, pack);
    if (!options.silent) this.emit("added", lng, ns, resources);
  }
  removeResourceBundle(lng, ns) {
    if (this.hasResourceBundle(lng, ns)) {
      delete this.data[lng][ns];
    }
    this.removeNamespaces(ns);
    this.emit("removed", lng, ns);
  }
  hasResourceBundle(lng, ns) {
    return this.getResource(lng, ns) !== void 0;
  }
  getResourceBundle(lng, ns) {
    if (!ns) ns = this.options.defaultNS;
    if (this.options.compatibilityAPI === "v1") return {
      ...{},
      ...this.getResource(lng, ns)
    };
    return this.getResource(lng, ns);
  }
  getDataByLanguage(lng) {
    return this.data[lng];
  }
  hasLanguageSomeTranslations(lng) {
    const data = this.getDataByLanguage(lng);
    const n = data && Object.keys(data) || [];
    return !!n.find((v) => data[v] && Object.keys(data[v]).length > 0);
  }
  toJSON() {
    return this.data;
  }
}
var postProcessor = {
  processors: {},
  addPostProcessor(module) {
    this.processors[module.name] = module;
  },
  handle(processors, value, key, options, translator) {
    processors.forEach((processor) => {
      if (this.processors[processor]) value = this.processors[processor].process(value, key, options, translator);
    });
    return value;
  }
};
const checkedLoadedFor = {};
class Translator extends EventEmitter {
  constructor(services) {
    let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    super();
    copy(["resourceStore", "languageUtils", "pluralResolver", "interpolator", "backendConnector", "i18nFormat", "utils"], services, this);
    this.options = options;
    if (this.options.keySeparator === void 0) {
      this.options.keySeparator = ".";
    }
    this.logger = baseLogger.create("translator");
  }
  changeLanguage(lng) {
    if (lng) this.language = lng;
  }
  exists(key) {
    let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {
      interpolation: {}
    };
    if (key === void 0 || key === null) {
      return false;
    }
    const resolved = this.resolve(key, options);
    return resolved && resolved.res !== void 0;
  }
  extractFromKey(key, options) {
    let nsSeparator = options.nsSeparator !== void 0 ? options.nsSeparator : this.options.nsSeparator;
    if (nsSeparator === void 0) nsSeparator = ":";
    const keySeparator = options.keySeparator !== void 0 ? options.keySeparator : this.options.keySeparator;
    let namespaces = options.ns || this.options.defaultNS || [];
    const wouldCheckForNsInKey = nsSeparator && key.indexOf(nsSeparator) > -1;
    const seemsNaturalLanguage = !this.options.userDefinedKeySeparator && !options.keySeparator && !this.options.userDefinedNsSeparator && !options.nsSeparator && !looksLikeObjectPath(key, nsSeparator, keySeparator);
    if (wouldCheckForNsInKey && !seemsNaturalLanguage) {
      const m = key.match(this.interpolator.nestingRegexp);
      if (m && m.length > 0) {
        return {
          key,
          namespaces: isString(namespaces) ? [namespaces] : namespaces
        };
      }
      const parts = key.split(nsSeparator);
      if (nsSeparator !== keySeparator || nsSeparator === keySeparator && this.options.ns.indexOf(parts[0]) > -1) namespaces = parts.shift();
      key = parts.join(keySeparator);
    }
    return {
      key,
      namespaces: isString(namespaces) ? [namespaces] : namespaces
    };
  }
  translate(keys, options, lastKey) {
    if (typeof options !== "object" && this.options.overloadTranslationOptionHandler) {
      options = this.options.overloadTranslationOptionHandler(arguments);
    }
    if (typeof options === "object") options = {
      ...options
    };
    if (!options) options = {};
    if (keys === void 0 || keys === null) return "";
    if (!Array.isArray(keys)) keys = [String(keys)];
    const returnDetails = options.returnDetails !== void 0 ? options.returnDetails : this.options.returnDetails;
    const keySeparator = options.keySeparator !== void 0 ? options.keySeparator : this.options.keySeparator;
    const {
      key,
      namespaces
    } = this.extractFromKey(keys[keys.length - 1], options);
    const namespace = namespaces[namespaces.length - 1];
    const lng = options.lng || this.language;
    const appendNamespaceToCIMode = options.appendNamespaceToCIMode || this.options.appendNamespaceToCIMode;
    if (lng && lng.toLowerCase() === "cimode") {
      if (appendNamespaceToCIMode) {
        const nsSeparator = options.nsSeparator || this.options.nsSeparator;
        if (returnDetails) {
          return {
            res: `${namespace}${nsSeparator}${key}`,
            usedKey: key,
            exactUsedKey: key,
            usedLng: lng,
            usedNS: namespace,
            usedParams: this.getUsedParamsDetails(options)
          };
        }
        return `${namespace}${nsSeparator}${key}`;
      }
      if (returnDetails) {
        return {
          res: key,
          usedKey: key,
          exactUsedKey: key,
          usedLng: lng,
          usedNS: namespace,
          usedParams: this.getUsedParamsDetails(options)
        };
      }
      return key;
    }
    const resolved = this.resolve(keys, options);
    let res = resolved && resolved.res;
    const resUsedKey = resolved && resolved.usedKey || key;
    const resExactUsedKey = resolved && resolved.exactUsedKey || key;
    const resType = Object.prototype.toString.apply(res);
    const noObject = ["[object Number]", "[object Function]", "[object RegExp]"];
    const joinArrays = options.joinArrays !== void 0 ? options.joinArrays : this.options.joinArrays;
    const handleAsObjectInI18nFormat = !this.i18nFormat || this.i18nFormat.handleAsObject;
    const handleAsObject = !isString(res) && typeof res !== "boolean" && typeof res !== "number";
    if (handleAsObjectInI18nFormat && res && handleAsObject && noObject.indexOf(resType) < 0 && !(isString(joinArrays) && Array.isArray(res))) {
      if (!options.returnObjects && !this.options.returnObjects) {
        if (!this.options.returnedObjectHandler) {
          this.logger.warn("accessing an object - but returnObjects options is not enabled!");
        }
        const r = this.options.returnedObjectHandler ? this.options.returnedObjectHandler(resUsedKey, res, {
          ...options,
          ns: namespaces
        }) : `key '${key} (${this.language})' returned an object instead of string.`;
        if (returnDetails) {
          resolved.res = r;
          resolved.usedParams = this.getUsedParamsDetails(options);
          return resolved;
        }
        return r;
      }
      if (keySeparator) {
        const resTypeIsArray = Array.isArray(res);
        const copy2 = resTypeIsArray ? [] : {};
        const newKeyToUse = resTypeIsArray ? resExactUsedKey : resUsedKey;
        for (const m in res) {
          if (Object.prototype.hasOwnProperty.call(res, m)) {
            const deepKey = `${newKeyToUse}${keySeparator}${m}`;
            copy2[m] = this.translate(deepKey, {
              ...options,
              ...{
                joinArrays: false,
                ns: namespaces
              }
            });
            if (copy2[m] === deepKey) copy2[m] = res[m];
          }
        }
        res = copy2;
      }
    } else if (handleAsObjectInI18nFormat && isString(joinArrays) && Array.isArray(res)) {
      res = res.join(joinArrays);
      if (res) res = this.extendTranslation(res, keys, options, lastKey);
    } else {
      let usedDefault = false;
      let usedKey = false;
      const needsPluralHandling = options.count !== void 0 && !isString(options.count);
      const hasDefaultValue = Translator.hasDefaultValue(options);
      const defaultValueSuffix = needsPluralHandling ? this.pluralResolver.getSuffix(lng, options.count, options) : "";
      const defaultValueSuffixOrdinalFallback = options.ordinal && needsPluralHandling ? this.pluralResolver.getSuffix(lng, options.count, {
        ordinal: false
      }) : "";
      const needsZeroSuffixLookup = needsPluralHandling && !options.ordinal && options.count === 0 && this.pluralResolver.shouldUseIntlApi();
      const defaultValue = needsZeroSuffixLookup && options[`defaultValue${this.options.pluralSeparator}zero`] || options[`defaultValue${defaultValueSuffix}`] || options[`defaultValue${defaultValueSuffixOrdinalFallback}`] || options.defaultValue;
      if (!this.isValidLookup(res) && hasDefaultValue) {
        usedDefault = true;
        res = defaultValue;
      }
      if (!this.isValidLookup(res)) {
        usedKey = true;
        res = key;
      }
      const missingKeyNoValueFallbackToKey = options.missingKeyNoValueFallbackToKey || this.options.missingKeyNoValueFallbackToKey;
      const resForMissing = missingKeyNoValueFallbackToKey && usedKey ? void 0 : res;
      const updateMissing = hasDefaultValue && defaultValue !== res && this.options.updateMissing;
      if (usedKey || usedDefault || updateMissing) {
        this.logger.log(updateMissing ? "updateKey" : "missingKey", lng, namespace, key, updateMissing ? defaultValue : res);
        if (keySeparator) {
          const fk = this.resolve(key, {
            ...options,
            keySeparator: false
          });
          if (fk && fk.res) this.logger.warn("Seems the loaded translations were in flat JSON format instead of nested. Either set keySeparator: false on init or make sure your translations are published in nested format.");
        }
        let lngs = [];
        const fallbackLngs = this.languageUtils.getFallbackCodes(this.options.fallbackLng, options.lng || this.language);
        if (this.options.saveMissingTo === "fallback" && fallbackLngs && fallbackLngs[0]) {
          for (let i = 0; i < fallbackLngs.length; i++) {
            lngs.push(fallbackLngs[i]);
          }
        } else if (this.options.saveMissingTo === "all") {
          lngs = this.languageUtils.toResolveHierarchy(options.lng || this.language);
        } else {
          lngs.push(options.lng || this.language);
        }
        const send = (l, k, specificDefaultValue) => {
          const defaultForMissing = hasDefaultValue && specificDefaultValue !== res ? specificDefaultValue : resForMissing;
          if (this.options.missingKeyHandler) {
            this.options.missingKeyHandler(l, namespace, k, defaultForMissing, updateMissing, options);
          } else if (this.backendConnector && this.backendConnector.saveMissing) {
            this.backendConnector.saveMissing(l, namespace, k, defaultForMissing, updateMissing, options);
          }
          this.emit("missingKey", l, namespace, k, res);
        };
        if (this.options.saveMissing) {
          if (this.options.saveMissingPlurals && needsPluralHandling) {
            lngs.forEach((language) => {
              const suffixes = this.pluralResolver.getSuffixes(language, options);
              if (needsZeroSuffixLookup && options[`defaultValue${this.options.pluralSeparator}zero`] && suffixes.indexOf(`${this.options.pluralSeparator}zero`) < 0) {
                suffixes.push(`${this.options.pluralSeparator}zero`);
              }
              suffixes.forEach((suffix) => {
                send([language], key + suffix, options[`defaultValue${suffix}`] || defaultValue);
              });
            });
          } else {
            send(lngs, key, defaultValue);
          }
        }
      }
      res = this.extendTranslation(res, keys, options, resolved, lastKey);
      if (usedKey && res === key && this.options.appendNamespaceToMissingKey) res = `${namespace}:${key}`;
      if ((usedKey || usedDefault) && this.options.parseMissingKeyHandler) {
        if (this.options.compatibilityAPI !== "v1") {
          res = this.options.parseMissingKeyHandler(this.options.appendNamespaceToMissingKey ? `${namespace}:${key}` : key, usedDefault ? res : void 0);
        } else {
          res = this.options.parseMissingKeyHandler(res);
        }
      }
    }
    if (returnDetails) {
      resolved.res = res;
      resolved.usedParams = this.getUsedParamsDetails(options);
      return resolved;
    }
    return res;
  }
  extendTranslation(res, key, options, resolved, lastKey) {
    var _this = this;
    if (this.i18nFormat && this.i18nFormat.parse) {
      res = this.i18nFormat.parse(res, {
        ...this.options.interpolation.defaultVariables,
        ...options
      }, options.lng || this.language || resolved.usedLng, resolved.usedNS, resolved.usedKey, {
        resolved
      });
    } else if (!options.skipInterpolation) {
      if (options.interpolation) this.interpolator.init({
        ...options,
        ...{
          interpolation: {
            ...this.options.interpolation,
            ...options.interpolation
          }
        }
      });
      const skipOnVariables = isString(res) && (options && options.interpolation && options.interpolation.skipOnVariables !== void 0 ? options.interpolation.skipOnVariables : this.options.interpolation.skipOnVariables);
      let nestBef;
      if (skipOnVariables) {
        const nb = res.match(this.interpolator.nestingRegexp);
        nestBef = nb && nb.length;
      }
      let data = options.replace && !isString(options.replace) ? options.replace : options;
      if (this.options.interpolation.defaultVariables) data = {
        ...this.options.interpolation.defaultVariables,
        ...data
      };
      res = this.interpolator.interpolate(res, data, options.lng || this.language || resolved.usedLng, options);
      if (skipOnVariables) {
        const na = res.match(this.interpolator.nestingRegexp);
        const nestAft = na && na.length;
        if (nestBef < nestAft) options.nest = false;
      }
      if (!options.lng && this.options.compatibilityAPI !== "v1" && resolved && resolved.res) options.lng = this.language || resolved.usedLng;
      if (options.nest !== false) res = this.interpolator.nest(res, function() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        if (lastKey && lastKey[0] === args[0] && !options.context) {
          _this.logger.warn(`It seems you are nesting recursively key: ${args[0]} in key: ${key[0]}`);
          return null;
        }
        return _this.translate(...args, key);
      }, options);
      if (options.interpolation) this.interpolator.reset();
    }
    const postProcess = options.postProcess || this.options.postProcess;
    const postProcessorNames = isString(postProcess) ? [postProcess] : postProcess;
    if (res !== void 0 && res !== null && postProcessorNames && postProcessorNames.length && options.applyPostProcessor !== false) {
      res = postProcessor.handle(postProcessorNames, res, key, this.options && this.options.postProcessPassResolved ? {
        i18nResolved: {
          ...resolved,
          usedParams: this.getUsedParamsDetails(options)
        },
        ...options
      } : options, this);
    }
    return res;
  }
  resolve(keys) {
    let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    let found;
    let usedKey;
    let exactUsedKey;
    let usedLng;
    let usedNS;
    if (isString(keys)) keys = [keys];
    keys.forEach((k) => {
      if (this.isValidLookup(found)) return;
      const extracted = this.extractFromKey(k, options);
      const key = extracted.key;
      usedKey = key;
      let namespaces = extracted.namespaces;
      if (this.options.fallbackNS) namespaces = namespaces.concat(this.options.fallbackNS);
      const needsPluralHandling = options.count !== void 0 && !isString(options.count);
      const needsZeroSuffixLookup = needsPluralHandling && !options.ordinal && options.count === 0 && this.pluralResolver.shouldUseIntlApi();
      const needsContextHandling = options.context !== void 0 && (isString(options.context) || typeof options.context === "number") && options.context !== "";
      const codes = options.lngs ? options.lngs : this.languageUtils.toResolveHierarchy(options.lng || this.language, options.fallbackLng);
      namespaces.forEach((ns) => {
        if (this.isValidLookup(found)) return;
        usedNS = ns;
        if (!checkedLoadedFor[`${codes[0]}-${ns}`] && this.utils && this.utils.hasLoadedNamespace && !this.utils.hasLoadedNamespace(usedNS)) {
          checkedLoadedFor[`${codes[0]}-${ns}`] = true;
          this.logger.warn(`key "${usedKey}" for languages "${codes.join(", ")}" won't get resolved as namespace "${usedNS}" was not yet loaded`, "This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!");
        }
        codes.forEach((code) => {
          if (this.isValidLookup(found)) return;
          usedLng = code;
          const finalKeys = [key];
          if (this.i18nFormat && this.i18nFormat.addLookupKeys) {
            this.i18nFormat.addLookupKeys(finalKeys, key, code, ns, options);
          } else {
            let pluralSuffix;
            if (needsPluralHandling) pluralSuffix = this.pluralResolver.getSuffix(code, options.count, options);
            const zeroSuffix = `${this.options.pluralSeparator}zero`;
            const ordinalPrefix = `${this.options.pluralSeparator}ordinal${this.options.pluralSeparator}`;
            if (needsPluralHandling) {
              finalKeys.push(key + pluralSuffix);
              if (options.ordinal && pluralSuffix.indexOf(ordinalPrefix) === 0) {
                finalKeys.push(key + pluralSuffix.replace(ordinalPrefix, this.options.pluralSeparator));
              }
              if (needsZeroSuffixLookup) {
                finalKeys.push(key + zeroSuffix);
              }
            }
            if (needsContextHandling) {
              const contextKey = `${key}${this.options.contextSeparator}${options.context}`;
              finalKeys.push(contextKey);
              if (needsPluralHandling) {
                finalKeys.push(contextKey + pluralSuffix);
                if (options.ordinal && pluralSuffix.indexOf(ordinalPrefix) === 0) {
                  finalKeys.push(contextKey + pluralSuffix.replace(ordinalPrefix, this.options.pluralSeparator));
                }
                if (needsZeroSuffixLookup) {
                  finalKeys.push(contextKey + zeroSuffix);
                }
              }
            }
          }
          let possibleKey;
          while (possibleKey = finalKeys.pop()) {
            if (!this.isValidLookup(found)) {
              exactUsedKey = possibleKey;
              found = this.getResource(code, ns, possibleKey, options);
            }
          }
        });
      });
    });
    return {
      res: found,
      usedKey,
      exactUsedKey,
      usedLng,
      usedNS
    };
  }
  isValidLookup(res) {
    return res !== void 0 && !(!this.options.returnNull && res === null) && !(!this.options.returnEmptyString && res === "");
  }
  getResource(code, ns, key) {
    let options = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {};
    if (this.i18nFormat && this.i18nFormat.getResource) return this.i18nFormat.getResource(code, ns, key, options);
    return this.resourceStore.getResource(code, ns, key, options);
  }
  getUsedParamsDetails() {
    let options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    const optionsKeys = ["defaultValue", "ordinal", "context", "replace", "lng", "lngs", "fallbackLng", "ns", "keySeparator", "nsSeparator", "returnObjects", "returnDetails", "joinArrays", "postProcess", "interpolation"];
    const useOptionsReplaceForData = options.replace && !isString(options.replace);
    let data = useOptionsReplaceForData ? options.replace : options;
    if (useOptionsReplaceForData && typeof options.count !== "undefined") {
      data.count = options.count;
    }
    if (this.options.interpolation.defaultVariables) {
      data = {
        ...this.options.interpolation.defaultVariables,
        ...data
      };
    }
    if (!useOptionsReplaceForData) {
      data = {
        ...data
      };
      for (const key of optionsKeys) {
        delete data[key];
      }
    }
    return data;
  }
  static hasDefaultValue(options) {
    const prefix = "defaultValue";
    for (const option in options) {
      if (Object.prototype.hasOwnProperty.call(options, option) && prefix === option.substring(0, prefix.length) && void 0 !== options[option]) {
        return true;
      }
    }
    return false;
  }
}
const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);
class LanguageUtil {
  constructor(options) {
    this.options = options;
    this.supportedLngs = this.options.supportedLngs || false;
    this.logger = baseLogger.create("languageUtils");
  }
  getScriptPartFromCode(code) {
    code = getCleanedCode(code);
    if (!code || code.indexOf("-") < 0) return null;
    const p = code.split("-");
    if (p.length === 2) return null;
    p.pop();
    if (p[p.length - 1].toLowerCase() === "x") return null;
    return this.formatLanguageCode(p.join("-"));
  }
  getLanguagePartFromCode(code) {
    code = getCleanedCode(code);
    if (!code || code.indexOf("-") < 0) return code;
    const p = code.split("-");
    return this.formatLanguageCode(p[0]);
  }
  formatLanguageCode(code) {
    if (isString(code) && code.indexOf("-") > -1) {
      if (typeof Intl !== "undefined" && typeof Intl.getCanonicalLocales !== "undefined") {
        try {
          let formattedCode = Intl.getCanonicalLocales(code)[0];
          if (formattedCode && this.options.lowerCaseLng) {
            formattedCode = formattedCode.toLowerCase();
          }
          if (formattedCode) return formattedCode;
        } catch (e) {
        }
      }
      const specialCases = ["hans", "hant", "latn", "cyrl", "cans", "mong", "arab"];
      let p = code.split("-");
      if (this.options.lowerCaseLng) {
        p = p.map((part) => part.toLowerCase());
      } else if (p.length === 2) {
        p[0] = p[0].toLowerCase();
        p[1] = p[1].toUpperCase();
        if (specialCases.indexOf(p[1].toLowerCase()) > -1) p[1] = capitalize(p[1].toLowerCase());
      } else if (p.length === 3) {
        p[0] = p[0].toLowerCase();
        if (p[1].length === 2) p[1] = p[1].toUpperCase();
        if (p[0] !== "sgn" && p[2].length === 2) p[2] = p[2].toUpperCase();
        if (specialCases.indexOf(p[1].toLowerCase()) > -1) p[1] = capitalize(p[1].toLowerCase());
        if (specialCases.indexOf(p[2].toLowerCase()) > -1) p[2] = capitalize(p[2].toLowerCase());
      }
      return p.join("-");
    }
    return this.options.cleanCode || this.options.lowerCaseLng ? code.toLowerCase() : code;
  }
  isSupportedCode(code) {
    if (this.options.load === "languageOnly" || this.options.nonExplicitSupportedLngs) {
      code = this.getLanguagePartFromCode(code);
    }
    return !this.supportedLngs || !this.supportedLngs.length || this.supportedLngs.indexOf(code) > -1;
  }
  getBestMatchFromCodes(codes) {
    if (!codes) return null;
    let found;
    codes.forEach((code) => {
      if (found) return;
      const cleanedLng = this.formatLanguageCode(code);
      if (!this.options.supportedLngs || this.isSupportedCode(cleanedLng)) found = cleanedLng;
    });
    if (!found && this.options.supportedLngs) {
      codes.forEach((code) => {
        if (found) return;
        const lngOnly = this.getLanguagePartFromCode(code);
        if (this.isSupportedCode(lngOnly)) return found = lngOnly;
        found = this.options.supportedLngs.find((supportedLng) => {
          if (supportedLng === lngOnly) return supportedLng;
          if (supportedLng.indexOf("-") < 0 && lngOnly.indexOf("-") < 0) return;
          if (supportedLng.indexOf("-") > 0 && lngOnly.indexOf("-") < 0 && supportedLng.substring(0, supportedLng.indexOf("-")) === lngOnly) return supportedLng;
          if (supportedLng.indexOf(lngOnly) === 0 && lngOnly.length > 1) return supportedLng;
        });
      });
    }
    if (!found) found = this.getFallbackCodes(this.options.fallbackLng)[0];
    return found;
  }
  getFallbackCodes(fallbacks, code) {
    if (!fallbacks) return [];
    if (typeof fallbacks === "function") fallbacks = fallbacks(code);
    if (isString(fallbacks)) fallbacks = [fallbacks];
    if (Array.isArray(fallbacks)) return fallbacks;
    if (!code) return fallbacks.default || [];
    let found = fallbacks[code];
    if (!found) found = fallbacks[this.getScriptPartFromCode(code)];
    if (!found) found = fallbacks[this.formatLanguageCode(code)];
    if (!found) found = fallbacks[this.getLanguagePartFromCode(code)];
    if (!found) found = fallbacks.default;
    return found || [];
  }
  toResolveHierarchy(code, fallbackCode) {
    const fallbackCodes = this.getFallbackCodes(fallbackCode || this.options.fallbackLng || [], code);
    const codes = [];
    const addCode = (c) => {
      if (!c) return;
      if (this.isSupportedCode(c)) {
        codes.push(c);
      } else {
        this.logger.warn(`rejecting language code not found in supportedLngs: ${c}`);
      }
    };
    if (isString(code) && (code.indexOf("-") > -1 || code.indexOf("_") > -1)) {
      if (this.options.load !== "languageOnly") addCode(this.formatLanguageCode(code));
      if (this.options.load !== "languageOnly" && this.options.load !== "currentOnly") addCode(this.getScriptPartFromCode(code));
      if (this.options.load !== "currentOnly") addCode(this.getLanguagePartFromCode(code));
    } else if (isString(code)) {
      addCode(this.formatLanguageCode(code));
    }
    fallbackCodes.forEach((fc) => {
      if (codes.indexOf(fc) < 0) addCode(this.formatLanguageCode(fc));
    });
    return codes;
  }
}
let sets = [{
  lngs: ["ach", "ak", "am", "arn", "br", "fil", "gun", "ln", "mfe", "mg", "mi", "oc", "pt", "pt-BR", "tg", "tl", "ti", "tr", "uz", "wa"],
  nr: [1, 2],
  fc: 1
}, {
  lngs: ["af", "an", "ast", "az", "bg", "bn", "ca", "da", "de", "dev", "el", "en", "eo", "es", "et", "eu", "fi", "fo", "fur", "fy", "gl", "gu", "ha", "hi", "hu", "hy", "ia", "it", "kk", "kn", "ku", "lb", "mai", "ml", "mn", "mr", "nah", "nap", "nb", "ne", "nl", "nn", "no", "nso", "pa", "pap", "pms", "ps", "pt-PT", "rm", "sco", "se", "si", "so", "son", "sq", "sv", "sw", "ta", "te", "tk", "ur", "yo"],
  nr: [1, 2],
  fc: 2
}, {
  lngs: ["ay", "bo", "cgg", "fa", "ht", "id", "ja", "jbo", "ka", "km", "ko", "ky", "lo", "ms", "sah", "su", "th", "tt", "ug", "vi", "wo", "zh"],
  nr: [1],
  fc: 3
}, {
  lngs: ["be", "bs", "cnr", "dz", "hr", "ru", "sr", "uk"],
  nr: [1, 2, 5],
  fc: 4
}, {
  lngs: ["ar"],
  nr: [0, 1, 2, 3, 11, 100],
  fc: 5
}, {
  lngs: ["cs", "sk"],
  nr: [1, 2, 5],
  fc: 6
}, {
  lngs: ["csb", "pl"],
  nr: [1, 2, 5],
  fc: 7
}, {
  lngs: ["cy"],
  nr: [1, 2, 3, 8],
  fc: 8
}, {
  lngs: ["fr"],
  nr: [1, 2],
  fc: 9
}, {
  lngs: ["ga"],
  nr: [1, 2, 3, 7, 11],
  fc: 10
}, {
  lngs: ["gd"],
  nr: [1, 2, 3, 20],
  fc: 11
}, {
  lngs: ["is"],
  nr: [1, 2],
  fc: 12
}, {
  lngs: ["jv"],
  nr: [0, 1],
  fc: 13
}, {
  lngs: ["kw"],
  nr: [1, 2, 3, 4],
  fc: 14
}, {
  lngs: ["lt"],
  nr: [1, 2, 10],
  fc: 15
}, {
  lngs: ["lv"],
  nr: [1, 2, 0],
  fc: 16
}, {
  lngs: ["mk"],
  nr: [1, 2],
  fc: 17
}, {
  lngs: ["mnk"],
  nr: [0, 1, 2],
  fc: 18
}, {
  lngs: ["mt"],
  nr: [1, 2, 11, 20],
  fc: 19
}, {
  lngs: ["or"],
  nr: [2, 1],
  fc: 2
}, {
  lngs: ["ro"],
  nr: [1, 2, 20],
  fc: 20
}, {
  lngs: ["sl"],
  nr: [5, 1, 2, 3],
  fc: 21
}, {
  lngs: ["he", "iw"],
  nr: [1, 2, 20, 21],
  fc: 22
}];
let _rulesPluralsTypes = {
  1: (n) => Number(n > 1),
  2: (n) => Number(n != 1),
  3: (n) => 0,
  4: (n) => Number(n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2),
  5: (n) => Number(n == 0 ? 0 : n == 1 ? 1 : n == 2 ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : n % 100 >= 11 ? 4 : 5),
  6: (n) => Number(n == 1 ? 0 : n >= 2 && n <= 4 ? 1 : 2),
  7: (n) => Number(n == 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2),
  8: (n) => Number(n == 1 ? 0 : n == 2 ? 1 : n != 8 && n != 11 ? 2 : 3),
  9: (n) => Number(n >= 2),
  10: (n) => Number(n == 1 ? 0 : n == 2 ? 1 : n < 7 ? 2 : n < 11 ? 3 : 4),
  11: (n) => Number(n == 1 || n == 11 ? 0 : n == 2 || n == 12 ? 1 : n > 2 && n < 20 ? 2 : 3),
  12: (n) => Number(n % 10 != 1 || n % 100 == 11),
  13: (n) => Number(n !== 0),
  14: (n) => Number(n == 1 ? 0 : n == 2 ? 1 : n == 3 ? 2 : 3),
  15: (n) => Number(n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2),
  16: (n) => Number(n % 10 == 1 && n % 100 != 11 ? 0 : n !== 0 ? 1 : 2),
  17: (n) => Number(n == 1 || n % 10 == 1 && n % 100 != 11 ? 0 : 1),
  18: (n) => Number(n == 0 ? 0 : n == 1 ? 1 : 2),
  19: (n) => Number(n == 1 ? 0 : n == 0 || n % 100 > 1 && n % 100 < 11 ? 1 : n % 100 > 10 && n % 100 < 20 ? 2 : 3),
  20: (n) => Number(n == 1 ? 0 : n == 0 || n % 100 > 0 && n % 100 < 20 ? 1 : 2),
  21: (n) => Number(n % 100 == 1 ? 1 : n % 100 == 2 ? 2 : n % 100 == 3 || n % 100 == 4 ? 3 : 0),
  22: (n) => Number(n == 1 ? 0 : n == 2 ? 1 : (n < 0 || n > 10) && n % 10 == 0 ? 2 : 3)
};
const nonIntlVersions = ["v1", "v2", "v3"];
const intlVersions = ["v4"];
const suffixesOrder = {
  zero: 0,
  one: 1,
  two: 2,
  few: 3,
  many: 4,
  other: 5
};
const createRules = () => {
  const rules = {};
  sets.forEach((set) => {
    set.lngs.forEach((l) => {
      rules[l] = {
        numbers: set.nr,
        plurals: _rulesPluralsTypes[set.fc]
      };
    });
  });
  return rules;
};
class PluralResolver {
  constructor(languageUtils) {
    let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    this.languageUtils = languageUtils;
    this.options = options;
    this.logger = baseLogger.create("pluralResolver");
    if ((!this.options.compatibilityJSON || intlVersions.includes(this.options.compatibilityJSON)) && (typeof Intl === "undefined" || !Intl.PluralRules)) {
      this.options.compatibilityJSON = "v3";
      this.logger.error("Your environment seems not to be Intl API compatible, use an Intl.PluralRules polyfill. Will fallback to the compatibilityJSON v3 format handling.");
    }
    this.rules = createRules();
    this.pluralRulesCache = {};
  }
  addRule(lng, obj) {
    this.rules[lng] = obj;
  }
  clearCache() {
    this.pluralRulesCache = {};
  }
  getRule(code) {
    let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.shouldUseIntlApi()) {
      const cleanedCode = getCleanedCode(code === "dev" ? "en" : code);
      const type = options.ordinal ? "ordinal" : "cardinal";
      const cacheKey = JSON.stringify({
        cleanedCode,
        type
      });
      if (cacheKey in this.pluralRulesCache) {
        return this.pluralRulesCache[cacheKey];
      }
      let rule;
      try {
        rule = new Intl.PluralRules(cleanedCode, {
          type
        });
      } catch (err) {
        if (!code.match(/-|_/)) return;
        const lngPart = this.languageUtils.getLanguagePartFromCode(code);
        rule = this.getRule(lngPart, options);
      }
      this.pluralRulesCache[cacheKey] = rule;
      return rule;
    }
    return this.rules[code] || this.rules[this.languageUtils.getLanguagePartFromCode(code)];
  }
  needsPlural(code) {
    let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    const rule = this.getRule(code, options);
    if (this.shouldUseIntlApi()) {
      return rule && rule.resolvedOptions().pluralCategories.length > 1;
    }
    return rule && rule.numbers.length > 1;
  }
  getPluralFormsOfKey(code, key) {
    let options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    return this.getSuffixes(code, options).map((suffix) => `${key}${suffix}`);
  }
  getSuffixes(code) {
    let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    const rule = this.getRule(code, options);
    if (!rule) {
      return [];
    }
    if (this.shouldUseIntlApi()) {
      return rule.resolvedOptions().pluralCategories.sort((pluralCategory1, pluralCategory2) => suffixesOrder[pluralCategory1] - suffixesOrder[pluralCategory2]).map((pluralCategory) => `${this.options.prepend}${options.ordinal ? `ordinal${this.options.prepend}` : ""}${pluralCategory}`);
    }
    return rule.numbers.map((number) => this.getSuffix(code, number, options));
  }
  getSuffix(code, count) {
    let options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    const rule = this.getRule(code, options);
    if (rule) {
      if (this.shouldUseIntlApi()) {
        return `${this.options.prepend}${options.ordinal ? `ordinal${this.options.prepend}` : ""}${rule.select(count)}`;
      }
      return this.getSuffixRetroCompatible(rule, count);
    }
    this.logger.warn(`no plural rule found for: ${code}`);
    return "";
  }
  getSuffixRetroCompatible(rule, count) {
    const idx = rule.noAbs ? rule.plurals(count) : rule.plurals(Math.abs(count));
    let suffix = rule.numbers[idx];
    if (this.options.simplifyPluralSuffix && rule.numbers.length === 2 && rule.numbers[0] === 1) {
      if (suffix === 2) {
        suffix = "plural";
      } else if (suffix === 1) {
        suffix = "";
      }
    }
    const returnSuffix = () => this.options.prepend && suffix.toString() ? this.options.prepend + suffix.toString() : suffix.toString();
    if (this.options.compatibilityJSON === "v1") {
      if (suffix === 1) return "";
      if (typeof suffix === "number") return `_plural_${suffix.toString()}`;
      return returnSuffix();
    } else if (this.options.compatibilityJSON === "v2") {
      return returnSuffix();
    } else if (this.options.simplifyPluralSuffix && rule.numbers.length === 2 && rule.numbers[0] === 1) {
      return returnSuffix();
    }
    return this.options.prepend && idx.toString() ? this.options.prepend + idx.toString() : idx.toString();
  }
  shouldUseIntlApi() {
    return !nonIntlVersions.includes(this.options.compatibilityJSON);
  }
}
const deepFindWithDefaults = function(data, defaultData, key) {
  let keySeparator = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : ".";
  let ignoreJSONStructure = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : true;
  let path = getPathWithDefaults(data, defaultData, key);
  if (!path && ignoreJSONStructure && isString(key)) {
    path = deepFind(data, key, keySeparator);
    if (path === void 0) path = deepFind(defaultData, key, keySeparator);
  }
  return path;
};
const regexSafe = (val) => val.replace(/\$/g, "$$$$");
class Interpolator {
  constructor() {
    let options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    this.logger = baseLogger.create("interpolator");
    this.options = options;
    this.format = options.interpolation && options.interpolation.format || ((value) => value);
    this.init(options);
  }
  init() {
    let options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (!options.interpolation) options.interpolation = {
      escapeValue: true
    };
    const {
      escape: escape$1,
      escapeValue,
      useRawValueToEscape,
      prefix,
      prefixEscaped,
      suffix,
      suffixEscaped,
      formatSeparator,
      unescapeSuffix,
      unescapePrefix,
      nestingPrefix,
      nestingPrefixEscaped,
      nestingSuffix,
      nestingSuffixEscaped,
      nestingOptionsSeparator,
      maxReplaces,
      alwaysFormat
    } = options.interpolation;
    this.escape = escape$1 !== void 0 ? escape$1 : escape;
    this.escapeValue = escapeValue !== void 0 ? escapeValue : true;
    this.useRawValueToEscape = useRawValueToEscape !== void 0 ? useRawValueToEscape : false;
    this.prefix = prefix ? regexEscape(prefix) : prefixEscaped || "{{";
    this.suffix = suffix ? regexEscape(suffix) : suffixEscaped || "}}";
    this.formatSeparator = formatSeparator || ",";
    this.unescapePrefix = unescapeSuffix ? "" : unescapePrefix || "-";
    this.unescapeSuffix = this.unescapePrefix ? "" : unescapeSuffix || "";
    this.nestingPrefix = nestingPrefix ? regexEscape(nestingPrefix) : nestingPrefixEscaped || regexEscape("$t(");
    this.nestingSuffix = nestingSuffix ? regexEscape(nestingSuffix) : nestingSuffixEscaped || regexEscape(")");
    this.nestingOptionsSeparator = nestingOptionsSeparator || ",";
    this.maxReplaces = maxReplaces || 1e3;
    this.alwaysFormat = alwaysFormat !== void 0 ? alwaysFormat : false;
    this.resetRegExp();
  }
  reset() {
    if (this.options) this.init(this.options);
  }
  resetRegExp() {
    const getOrResetRegExp = (existingRegExp, pattern) => {
      if (existingRegExp && existingRegExp.source === pattern) {
        existingRegExp.lastIndex = 0;
        return existingRegExp;
      }
      return new RegExp(pattern, "g");
    };
    this.regexp = getOrResetRegExp(this.regexp, `${this.prefix}(.+?)${this.suffix}`);
    this.regexpUnescape = getOrResetRegExp(this.regexpUnescape, `${this.prefix}${this.unescapePrefix}(.+?)${this.unescapeSuffix}${this.suffix}`);
    this.nestingRegexp = getOrResetRegExp(this.nestingRegexp, `${this.nestingPrefix}(.+?)${this.nestingSuffix}`);
  }
  interpolate(str, data, lng, options) {
    let match;
    let value;
    let replaces;
    const defaultData = this.options && this.options.interpolation && this.options.interpolation.defaultVariables || {};
    const handleFormat = (key) => {
      if (key.indexOf(this.formatSeparator) < 0) {
        const path = deepFindWithDefaults(data, defaultData, key, this.options.keySeparator, this.options.ignoreJSONStructure);
        return this.alwaysFormat ? this.format(path, void 0, lng, {
          ...options,
          ...data,
          interpolationkey: key
        }) : path;
      }
      const p = key.split(this.formatSeparator);
      const k = p.shift().trim();
      const f = p.join(this.formatSeparator).trim();
      return this.format(deepFindWithDefaults(data, defaultData, k, this.options.keySeparator, this.options.ignoreJSONStructure), f, lng, {
        ...options,
        ...data,
        interpolationkey: k
      });
    };
    this.resetRegExp();
    const missingInterpolationHandler = options && options.missingInterpolationHandler || this.options.missingInterpolationHandler;
    const skipOnVariables = options && options.interpolation && options.interpolation.skipOnVariables !== void 0 ? options.interpolation.skipOnVariables : this.options.interpolation.skipOnVariables;
    const todos = [{
      regex: this.regexpUnescape,
      safeValue: (val) => regexSafe(val)
    }, {
      regex: this.regexp,
      safeValue: (val) => this.escapeValue ? regexSafe(this.escape(val)) : regexSafe(val)
    }];
    todos.forEach((todo) => {
      replaces = 0;
      while (match = todo.regex.exec(str)) {
        const matchedVar = match[1].trim();
        value = handleFormat(matchedVar);
        if (value === void 0) {
          if (typeof missingInterpolationHandler === "function") {
            const temp = missingInterpolationHandler(str, match, options);
            value = isString(temp) ? temp : "";
          } else if (options && Object.prototype.hasOwnProperty.call(options, matchedVar)) {
            value = "";
          } else if (skipOnVariables) {
            value = match[0];
            continue;
          } else {
            this.logger.warn(`missed to pass in variable ${matchedVar} for interpolating ${str}`);
            value = "";
          }
        } else if (!isString(value) && !this.useRawValueToEscape) {
          value = makeString(value);
        }
        const safeValue = todo.safeValue(value);
        str = str.replace(match[0], safeValue);
        if (skipOnVariables) {
          todo.regex.lastIndex += value.length;
          todo.regex.lastIndex -= match[0].length;
        } else {
          todo.regex.lastIndex = 0;
        }
        replaces++;
        if (replaces >= this.maxReplaces) {
          break;
        }
      }
    });
    return str;
  }
  nest(str, fc) {
    let options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    let match;
    let value;
    let clonedOptions;
    const handleHasOptions = (key, inheritedOptions) => {
      const sep = this.nestingOptionsSeparator;
      if (key.indexOf(sep) < 0) return key;
      const c = key.split(new RegExp(`${sep}[ ]*{`));
      let optionsString = `{${c[1]}`;
      key = c[0];
      optionsString = this.interpolate(optionsString, clonedOptions);
      const matchedSingleQuotes = optionsString.match(/'/g);
      const matchedDoubleQuotes = optionsString.match(/"/g);
      if (matchedSingleQuotes && matchedSingleQuotes.length % 2 === 0 && !matchedDoubleQuotes || matchedDoubleQuotes.length % 2 !== 0) {
        optionsString = optionsString.replace(/'/g, '"');
      }
      try {
        clonedOptions = JSON.parse(optionsString);
        if (inheritedOptions) clonedOptions = {
          ...inheritedOptions,
          ...clonedOptions
        };
      } catch (e) {
        this.logger.warn(`failed parsing options string in nesting for key ${key}`, e);
        return `${key}${sep}${optionsString}`;
      }
      if (clonedOptions.defaultValue && clonedOptions.defaultValue.indexOf(this.prefix) > -1) delete clonedOptions.defaultValue;
      return key;
    };
    while (match = this.nestingRegexp.exec(str)) {
      let formatters = [];
      clonedOptions = {
        ...options
      };
      clonedOptions = clonedOptions.replace && !isString(clonedOptions.replace) ? clonedOptions.replace : clonedOptions;
      clonedOptions.applyPostProcessor = false;
      delete clonedOptions.defaultValue;
      let doReduce = false;
      if (match[0].indexOf(this.formatSeparator) !== -1 && !/{.*}/.test(match[1])) {
        const r = match[1].split(this.formatSeparator).map((elem) => elem.trim());
        match[1] = r.shift();
        formatters = r;
        doReduce = true;
      }
      value = fc(handleHasOptions.call(this, match[1].trim(), clonedOptions), clonedOptions);
      if (value && match[0] === str && !isString(value)) return value;
      if (!isString(value)) value = makeString(value);
      if (!value) {
        this.logger.warn(`missed to resolve ${match[1]} for nesting ${str}`);
        value = "";
      }
      if (doReduce) {
        value = formatters.reduce((v, f) => this.format(v, f, options.lng, {
          ...options,
          interpolationkey: match[1].trim()
        }), value.trim());
      }
      str = str.replace(match[0], value);
      this.regexp.lastIndex = 0;
    }
    return str;
  }
}
const parseFormatStr = (formatStr) => {
  let formatName = formatStr.toLowerCase().trim();
  const formatOptions = {};
  if (formatStr.indexOf("(") > -1) {
    const p = formatStr.split("(");
    formatName = p[0].toLowerCase().trim();
    const optStr = p[1].substring(0, p[1].length - 1);
    if (formatName === "currency" && optStr.indexOf(":") < 0) {
      if (!formatOptions.currency) formatOptions.currency = optStr.trim();
    } else if (formatName === "relativetime" && optStr.indexOf(":") < 0) {
      if (!formatOptions.range) formatOptions.range = optStr.trim();
    } else {
      const opts = optStr.split(";");
      opts.forEach((opt) => {
        if (opt) {
          const [key, ...rest] = opt.split(":");
          const val = rest.join(":").trim().replace(/^'+|'+$/g, "");
          const trimmedKey = key.trim();
          if (!formatOptions[trimmedKey]) formatOptions[trimmedKey] = val;
          if (val === "false") formatOptions[trimmedKey] = false;
          if (val === "true") formatOptions[trimmedKey] = true;
          if (!isNaN(val)) formatOptions[trimmedKey] = parseInt(val, 10);
        }
      });
    }
  }
  return {
    formatName,
    formatOptions
  };
};
const createCachedFormatter = (fn) => {
  const cache = {};
  return (val, lng, options) => {
    let optForCache = options;
    if (options && options.interpolationkey && options.formatParams && options.formatParams[options.interpolationkey] && options[options.interpolationkey]) {
      optForCache = {
        ...optForCache,
        [options.interpolationkey]: void 0
      };
    }
    const key = lng + JSON.stringify(optForCache);
    let formatter = cache[key];
    if (!formatter) {
      formatter = fn(getCleanedCode(lng), options);
      cache[key] = formatter;
    }
    return formatter(val);
  };
};
class Formatter {
  constructor() {
    let options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    this.logger = baseLogger.create("formatter");
    this.options = options;
    this.formats = {
      number: createCachedFormatter((lng, opt) => {
        const formatter = new Intl.NumberFormat(lng, {
          ...opt
        });
        return (val) => formatter.format(val);
      }),
      currency: createCachedFormatter((lng, opt) => {
        const formatter = new Intl.NumberFormat(lng, {
          ...opt,
          style: "currency"
        });
        return (val) => formatter.format(val);
      }),
      datetime: createCachedFormatter((lng, opt) => {
        const formatter = new Intl.DateTimeFormat(lng, {
          ...opt
        });
        return (val) => formatter.format(val);
      }),
      relativetime: createCachedFormatter((lng, opt) => {
        const formatter = new Intl.RelativeTimeFormat(lng, {
          ...opt
        });
        return (val) => formatter.format(val, opt.range || "day");
      }),
      list: createCachedFormatter((lng, opt) => {
        const formatter = new Intl.ListFormat(lng, {
          ...opt
        });
        return (val) => formatter.format(val);
      })
    };
    this.init(options);
  }
  init(services) {
    let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {
      interpolation: {}
    };
    this.formatSeparator = options.interpolation.formatSeparator || ",";
  }
  add(name, fc) {
    this.formats[name.toLowerCase().trim()] = fc;
  }
  addCached(name, fc) {
    this.formats[name.toLowerCase().trim()] = createCachedFormatter(fc);
  }
  format(value, format, lng) {
    let options = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {};
    const formats = format.split(this.formatSeparator);
    if (formats.length > 1 && formats[0].indexOf("(") > 1 && formats[0].indexOf(")") < 0 && formats.find((f) => f.indexOf(")") > -1)) {
      const lastIndex = formats.findIndex((f) => f.indexOf(")") > -1);
      formats[0] = [formats[0], ...formats.splice(1, lastIndex)].join(this.formatSeparator);
    }
    const result = formats.reduce((mem, f) => {
      const {
        formatName,
        formatOptions
      } = parseFormatStr(f);
      if (this.formats[formatName]) {
        let formatted = mem;
        try {
          const valOptions = options && options.formatParams && options.formatParams[options.interpolationkey] || {};
          const l = valOptions.locale || valOptions.lng || options.locale || options.lng || lng;
          formatted = this.formats[formatName](mem, l, {
            ...formatOptions,
            ...options,
            ...valOptions
          });
        } catch (error) {
          this.logger.warn(error);
        }
        return formatted;
      } else {
        this.logger.warn(`there was no format function for ${formatName}`);
      }
      return mem;
    }, value);
    return result;
  }
}
const removePending = (q, name) => {
  if (q.pending[name] !== void 0) {
    delete q.pending[name];
    q.pendingCount--;
  }
};
class Connector extends EventEmitter {
  constructor(backend, store, services) {
    let options = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {};
    super();
    this.backend = backend;
    this.store = store;
    this.services = services;
    this.languageUtils = services.languageUtils;
    this.options = options;
    this.logger = baseLogger.create("backendConnector");
    this.waitingReads = [];
    this.maxParallelReads = options.maxParallelReads || 10;
    this.readingCalls = 0;
    this.maxRetries = options.maxRetries >= 0 ? options.maxRetries : 5;
    this.retryTimeout = options.retryTimeout >= 1 ? options.retryTimeout : 350;
    this.state = {};
    this.queue = [];
    if (this.backend && this.backend.init) {
      this.backend.init(services, options.backend, options);
    }
  }
  queueLoad(languages, namespaces, options, callback) {
    const toLoad = {};
    const pending = {};
    const toLoadLanguages = {};
    const toLoadNamespaces = {};
    languages.forEach((lng) => {
      let hasAllNamespaces = true;
      namespaces.forEach((ns) => {
        const name = `${lng}|${ns}`;
        if (!options.reload && this.store.hasResourceBundle(lng, ns)) {
          this.state[name] = 2;
        } else if (this.state[name] < 0) ;
        else if (this.state[name] === 1) {
          if (pending[name] === void 0) pending[name] = true;
        } else {
          this.state[name] = 1;
          hasAllNamespaces = false;
          if (pending[name] === void 0) pending[name] = true;
          if (toLoad[name] === void 0) toLoad[name] = true;
          if (toLoadNamespaces[ns] === void 0) toLoadNamespaces[ns] = true;
        }
      });
      if (!hasAllNamespaces) toLoadLanguages[lng] = true;
    });
    if (Object.keys(toLoad).length || Object.keys(pending).length) {
      this.queue.push({
        pending,
        pendingCount: Object.keys(pending).length,
        loaded: {},
        errors: [],
        callback
      });
    }
    return {
      toLoad: Object.keys(toLoad),
      pending: Object.keys(pending),
      toLoadLanguages: Object.keys(toLoadLanguages),
      toLoadNamespaces: Object.keys(toLoadNamespaces)
    };
  }
  loaded(name, err, data) {
    const s = name.split("|");
    const lng = s[0];
    const ns = s[1];
    if (err) this.emit("failedLoading", lng, ns, err);
    if (!err && data) {
      this.store.addResourceBundle(lng, ns, data, void 0, void 0, {
        skipCopy: true
      });
    }
    this.state[name] = err ? -1 : 2;
    if (err && data) this.state[name] = 0;
    const loaded = {};
    this.queue.forEach((q) => {
      pushPath(q.loaded, [lng], ns);
      removePending(q, name);
      if (err) q.errors.push(err);
      if (q.pendingCount === 0 && !q.done) {
        Object.keys(q.loaded).forEach((l) => {
          if (!loaded[l]) loaded[l] = {};
          const loadedKeys = q.loaded[l];
          if (loadedKeys.length) {
            loadedKeys.forEach((n) => {
              if (loaded[l][n] === void 0) loaded[l][n] = true;
            });
          }
        });
        q.done = true;
        if (q.errors.length) {
          q.callback(q.errors);
        } else {
          q.callback();
        }
      }
    });
    this.emit("loaded", loaded);
    this.queue = this.queue.filter((q) => !q.done);
  }
  read(lng, ns, fcName) {
    let tried = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
    let wait = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : this.retryTimeout;
    let callback = arguments.length > 5 ? arguments[5] : void 0;
    if (!lng.length) return callback(null, {});
    if (this.readingCalls >= this.maxParallelReads) {
      this.waitingReads.push({
        lng,
        ns,
        fcName,
        tried,
        wait,
        callback
      });
      return;
    }
    this.readingCalls++;
    const resolver = (err, data) => {
      this.readingCalls--;
      if (this.waitingReads.length > 0) {
        const next = this.waitingReads.shift();
        this.read(next.lng, next.ns, next.fcName, next.tried, next.wait, next.callback);
      }
      if (err && data && tried < this.maxRetries) {
        setTimeout(() => {
          this.read.call(this, lng, ns, fcName, tried + 1, wait * 2, callback);
        }, wait);
        return;
      }
      callback(err, data);
    };
    const fc = this.backend[fcName].bind(this.backend);
    if (fc.length === 2) {
      try {
        const r = fc(lng, ns);
        if (r && typeof r.then === "function") {
          r.then((data) => resolver(null, data)).catch(resolver);
        } else {
          resolver(null, r);
        }
      } catch (err) {
        resolver(err);
      }
      return;
    }
    return fc(lng, ns, resolver);
  }
  prepareLoading(languages, namespaces) {
    let options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    let callback = arguments.length > 3 ? arguments[3] : void 0;
    if (!this.backend) {
      this.logger.warn("No backend was added via i18next.use. Will not load resources.");
      return callback && callback();
    }
    if (isString(languages)) languages = this.languageUtils.toResolveHierarchy(languages);
    if (isString(namespaces)) namespaces = [namespaces];
    const toLoad = this.queueLoad(languages, namespaces, options, callback);
    if (!toLoad.toLoad.length) {
      if (!toLoad.pending.length) callback();
      return null;
    }
    toLoad.toLoad.forEach((name) => {
      this.loadOne(name);
    });
  }
  load(languages, namespaces, callback) {
    this.prepareLoading(languages, namespaces, {}, callback);
  }
  reload(languages, namespaces, callback) {
    this.prepareLoading(languages, namespaces, {
      reload: true
    }, callback);
  }
  loadOne(name) {
    let prefix = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    const s = name.split("|");
    const lng = s[0];
    const ns = s[1];
    this.read(lng, ns, "read", void 0, void 0, (err, data) => {
      if (err) this.logger.warn(`${prefix}loading namespace ${ns} for language ${lng} failed`, err);
      if (!err && data) this.logger.log(`${prefix}loaded namespace ${ns} for language ${lng}`, data);
      this.loaded(name, err, data);
    });
  }
  saveMissing(languages, namespace, key, fallbackValue, isUpdate) {
    let options = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : {};
    let clb = arguments.length > 6 && arguments[6] !== void 0 ? arguments[6] : () => {
    };
    if (this.services.utils && this.services.utils.hasLoadedNamespace && !this.services.utils.hasLoadedNamespace(namespace)) {
      this.logger.warn(`did not save key "${key}" as the namespace "${namespace}" was not yet loaded`, "This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!");
      return;
    }
    if (key === void 0 || key === null || key === "") return;
    if (this.backend && this.backend.create) {
      const opts = {
        ...options,
        isUpdate
      };
      const fc = this.backend.create.bind(this.backend);
      if (fc.length < 6) {
        try {
          let r;
          if (fc.length === 5) {
            r = fc(languages, namespace, key, fallbackValue, opts);
          } else {
            r = fc(languages, namespace, key, fallbackValue);
          }
          if (r && typeof r.then === "function") {
            r.then((data) => clb(null, data)).catch(clb);
          } else {
            clb(null, r);
          }
        } catch (err) {
          clb(err);
        }
      } else {
        fc(languages, namespace, key, fallbackValue, clb, opts);
      }
    }
    if (!languages || !languages[0]) return;
    this.store.addResource(languages[0], namespace, key, fallbackValue);
  }
}
const get = () => ({
  debug: false,
  initImmediate: true,
  ns: ["translation"],
  defaultNS: ["translation"],
  fallbackLng: ["dev"],
  fallbackNS: false,
  supportedLngs: false,
  nonExplicitSupportedLngs: false,
  load: "all",
  preload: false,
  simplifyPluralSuffix: true,
  keySeparator: ".",
  nsSeparator: ":",
  pluralSeparator: "_",
  contextSeparator: "_",
  partialBundledLanguages: false,
  saveMissing: false,
  updateMissing: false,
  saveMissingTo: "fallback",
  saveMissingPlurals: true,
  missingKeyHandler: false,
  missingInterpolationHandler: false,
  postProcess: false,
  postProcessPassResolved: false,
  returnNull: false,
  returnEmptyString: true,
  returnObjects: false,
  joinArrays: false,
  returnedObjectHandler: false,
  parseMissingKeyHandler: false,
  appendNamespaceToMissingKey: false,
  appendNamespaceToCIMode: false,
  overloadTranslationOptionHandler: (args) => {
    let ret = {};
    if (typeof args[1] === "object") ret = args[1];
    if (isString(args[1])) ret.defaultValue = args[1];
    if (isString(args[2])) ret.tDescription = args[2];
    if (typeof args[2] === "object" || typeof args[3] === "object") {
      const options = args[3] || args[2];
      Object.keys(options).forEach((key) => {
        ret[key] = options[key];
      });
    }
    return ret;
  },
  interpolation: {
    escapeValue: true,
    format: (value) => value,
    prefix: "{{",
    suffix: "}}",
    formatSeparator: ",",
    unescapePrefix: "-",
    nestingPrefix: "$t(",
    nestingSuffix: ")",
    nestingOptionsSeparator: ",",
    maxReplaces: 1e3,
    skipOnVariables: true
  }
});
const transformOptions = (options) => {
  if (isString(options.ns)) options.ns = [options.ns];
  if (isString(options.fallbackLng)) options.fallbackLng = [options.fallbackLng];
  if (isString(options.fallbackNS)) options.fallbackNS = [options.fallbackNS];
  if (options.supportedLngs && options.supportedLngs.indexOf("cimode") < 0) {
    options.supportedLngs = options.supportedLngs.concat(["cimode"]);
  }
  return options;
};
const noop = () => {
};
const bindMemberFunctions = (inst) => {
  const mems = Object.getOwnPropertyNames(Object.getPrototypeOf(inst));
  mems.forEach((mem) => {
    if (typeof inst[mem] === "function") {
      inst[mem] = inst[mem].bind(inst);
    }
  });
};
class I18n extends EventEmitter {
  constructor() {
    let options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    let callback = arguments.length > 1 ? arguments[1] : void 0;
    super();
    this.options = transformOptions(options);
    this.services = {};
    this.logger = baseLogger;
    this.modules = {
      external: []
    };
    bindMemberFunctions(this);
    if (callback && !this.isInitialized && !options.isClone) {
      if (!this.options.initImmediate) {
        this.init(options, callback);
        return this;
      }
      setTimeout(() => {
        this.init(options, callback);
      }, 0);
    }
  }
  init() {
    var _this = this;
    let options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    let callback = arguments.length > 1 ? arguments[1] : void 0;
    this.isInitializing = true;
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    if (!options.defaultNS && options.defaultNS !== false && options.ns) {
      if (isString(options.ns)) {
        options.defaultNS = options.ns;
      } else if (options.ns.indexOf("translation") < 0) {
        options.defaultNS = options.ns[0];
      }
    }
    const defOpts = get();
    this.options = {
      ...defOpts,
      ...this.options,
      ...transformOptions(options)
    };
    if (this.options.compatibilityAPI !== "v1") {
      this.options.interpolation = {
        ...defOpts.interpolation,
        ...this.options.interpolation
      };
    }
    if (options.keySeparator !== void 0) {
      this.options.userDefinedKeySeparator = options.keySeparator;
    }
    if (options.nsSeparator !== void 0) {
      this.options.userDefinedNsSeparator = options.nsSeparator;
    }
    const createClassOnDemand = (ClassOrObject) => {
      if (!ClassOrObject) return null;
      if (typeof ClassOrObject === "function") return new ClassOrObject();
      return ClassOrObject;
    };
    if (!this.options.isClone) {
      if (this.modules.logger) {
        baseLogger.init(createClassOnDemand(this.modules.logger), this.options);
      } else {
        baseLogger.init(null, this.options);
      }
      let formatter;
      if (this.modules.formatter) {
        formatter = this.modules.formatter;
      } else if (typeof Intl !== "undefined") {
        formatter = Formatter;
      }
      const lu = new LanguageUtil(this.options);
      this.store = new ResourceStore(this.options.resources, this.options);
      const s = this.services;
      s.logger = baseLogger;
      s.resourceStore = this.store;
      s.languageUtils = lu;
      s.pluralResolver = new PluralResolver(lu, {
        prepend: this.options.pluralSeparator,
        compatibilityJSON: this.options.compatibilityJSON,
        simplifyPluralSuffix: this.options.simplifyPluralSuffix
      });
      if (formatter && (!this.options.interpolation.format || this.options.interpolation.format === defOpts.interpolation.format)) {
        s.formatter = createClassOnDemand(formatter);
        s.formatter.init(s, this.options);
        this.options.interpolation.format = s.formatter.format.bind(s.formatter);
      }
      s.interpolator = new Interpolator(this.options);
      s.utils = {
        hasLoadedNamespace: this.hasLoadedNamespace.bind(this)
      };
      s.backendConnector = new Connector(createClassOnDemand(this.modules.backend), s.resourceStore, s, this.options);
      s.backendConnector.on("*", function(event) {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }
        _this.emit(event, ...args);
      });
      if (this.modules.languageDetector) {
        s.languageDetector = createClassOnDemand(this.modules.languageDetector);
        if (s.languageDetector.init) s.languageDetector.init(s, this.options.detection, this.options);
      }
      if (this.modules.i18nFormat) {
        s.i18nFormat = createClassOnDemand(this.modules.i18nFormat);
        if (s.i18nFormat.init) s.i18nFormat.init(this);
      }
      this.translator = new Translator(this.services, this.options);
      this.translator.on("*", function(event) {
        for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }
        _this.emit(event, ...args);
      });
      this.modules.external.forEach((m) => {
        if (m.init) m.init(this);
      });
    }
    this.format = this.options.interpolation.format;
    if (!callback) callback = noop;
    if (this.options.fallbackLng && !this.services.languageDetector && !this.options.lng) {
      const codes = this.services.languageUtils.getFallbackCodes(this.options.fallbackLng);
      if (codes.length > 0 && codes[0] !== "dev") this.options.lng = codes[0];
    }
    if (!this.services.languageDetector && !this.options.lng) {
      this.logger.warn("init: no languageDetector is used and no lng is defined");
    }
    const storeApi = ["getResource", "hasResourceBundle", "getResourceBundle", "getDataByLanguage"];
    storeApi.forEach((fcName) => {
      this[fcName] = function() {
        return _this.store[fcName](...arguments);
      };
    });
    const storeApiChained = ["addResource", "addResources", "addResourceBundle", "removeResourceBundle"];
    storeApiChained.forEach((fcName) => {
      this[fcName] = function() {
        _this.store[fcName](...arguments);
        return _this;
      };
    });
    const deferred = defer();
    const load = () => {
      const finish = (err, t) => {
        this.isInitializing = false;
        if (this.isInitialized && !this.initializedStoreOnce) this.logger.warn("init: i18next is already initialized. You should call init just once!");
        this.isInitialized = true;
        if (!this.options.isClone) this.logger.log("initialized", this.options);
        this.emit("initialized", this.options);
        deferred.resolve(t);
        callback(err, t);
      };
      if (this.languages && this.options.compatibilityAPI !== "v1" && !this.isInitialized) return finish(null, this.t.bind(this));
      this.changeLanguage(this.options.lng, finish);
    };
    if (this.options.resources || !this.options.initImmediate) {
      load();
    } else {
      setTimeout(load, 0);
    }
    return deferred;
  }
  loadResources(language) {
    let callback = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : noop;
    let usedCallback = callback;
    const usedLng = isString(language) ? language : this.language;
    if (typeof language === "function") usedCallback = language;
    if (!this.options.resources || this.options.partialBundledLanguages) {
      if (usedLng && usedLng.toLowerCase() === "cimode" && (!this.options.preload || this.options.preload.length === 0)) return usedCallback();
      const toLoad = [];
      const append = (lng) => {
        if (!lng) return;
        if (lng === "cimode") return;
        const lngs = this.services.languageUtils.toResolveHierarchy(lng);
        lngs.forEach((l) => {
          if (l === "cimode") return;
          if (toLoad.indexOf(l) < 0) toLoad.push(l);
        });
      };
      if (!usedLng) {
        const fallbacks = this.services.languageUtils.getFallbackCodes(this.options.fallbackLng);
        fallbacks.forEach((l) => append(l));
      } else {
        append(usedLng);
      }
      if (this.options.preload) {
        this.options.preload.forEach((l) => append(l));
      }
      this.services.backendConnector.load(toLoad, this.options.ns, (e) => {
        if (!e && !this.resolvedLanguage && this.language) this.setResolvedLanguage(this.language);
        usedCallback(e);
      });
    } else {
      usedCallback(null);
    }
  }
  reloadResources(lngs, ns, callback) {
    const deferred = defer();
    if (typeof lngs === "function") {
      callback = lngs;
      lngs = void 0;
    }
    if (typeof ns === "function") {
      callback = ns;
      ns = void 0;
    }
    if (!lngs) lngs = this.languages;
    if (!ns) ns = this.options.ns;
    if (!callback) callback = noop;
    this.services.backendConnector.reload(lngs, ns, (err) => {
      deferred.resolve();
      callback(err);
    });
    return deferred;
  }
  use(module) {
    if (!module) throw new Error("You are passing an undefined module! Please check the object you are passing to i18next.use()");
    if (!module.type) throw new Error("You are passing a wrong module! Please check the object you are passing to i18next.use()");
    if (module.type === "backend") {
      this.modules.backend = module;
    }
    if (module.type === "logger" || module.log && module.warn && module.error) {
      this.modules.logger = module;
    }
    if (module.type === "languageDetector") {
      this.modules.languageDetector = module;
    }
    if (module.type === "i18nFormat") {
      this.modules.i18nFormat = module;
    }
    if (module.type === "postProcessor") {
      postProcessor.addPostProcessor(module);
    }
    if (module.type === "formatter") {
      this.modules.formatter = module;
    }
    if (module.type === "3rdParty") {
      this.modules.external.push(module);
    }
    return this;
  }
  setResolvedLanguage(l) {
    if (!l || !this.languages) return;
    if (["cimode", "dev"].indexOf(l) > -1) return;
    for (let li = 0; li < this.languages.length; li++) {
      const lngInLngs = this.languages[li];
      if (["cimode", "dev"].indexOf(lngInLngs) > -1) continue;
      if (this.store.hasLanguageSomeTranslations(lngInLngs)) {
        this.resolvedLanguage = lngInLngs;
        break;
      }
    }
  }
  changeLanguage(lng, callback) {
    var _this2 = this;
    this.isLanguageChangingTo = lng;
    const deferred = defer();
    this.emit("languageChanging", lng);
    const setLngProps = (l) => {
      this.language = l;
      this.languages = this.services.languageUtils.toResolveHierarchy(l);
      this.resolvedLanguage = void 0;
      this.setResolvedLanguage(l);
    };
    const done = (err, l) => {
      if (l) {
        setLngProps(l);
        this.translator.changeLanguage(l);
        this.isLanguageChangingTo = void 0;
        this.emit("languageChanged", l);
        this.logger.log("languageChanged", l);
      } else {
        this.isLanguageChangingTo = void 0;
      }
      deferred.resolve(function() {
        return _this2.t(...arguments);
      });
      if (callback) callback(err, function() {
        return _this2.t(...arguments);
      });
    };
    const setLng = (lngs) => {
      if (!lng && !lngs && this.services.languageDetector) lngs = [];
      const l = isString(lngs) ? lngs : this.services.languageUtils.getBestMatchFromCodes(lngs);
      if (l) {
        if (!this.language) {
          setLngProps(l);
        }
        if (!this.translator.language) this.translator.changeLanguage(l);
        if (this.services.languageDetector && this.services.languageDetector.cacheUserLanguage) this.services.languageDetector.cacheUserLanguage(l);
      }
      this.loadResources(l, (err) => {
        done(err, l);
      });
    };
    if (!lng && this.services.languageDetector && !this.services.languageDetector.async) {
      setLng(this.services.languageDetector.detect());
    } else if (!lng && this.services.languageDetector && this.services.languageDetector.async) {
      if (this.services.languageDetector.detect.length === 0) {
        this.services.languageDetector.detect().then(setLng);
      } else {
        this.services.languageDetector.detect(setLng);
      }
    } else {
      setLng(lng);
    }
    return deferred;
  }
  getFixedT(lng, ns, keyPrefix) {
    var _this3 = this;
    const fixedT = function(key, opts) {
      let options;
      if (typeof opts !== "object") {
        for (var _len3 = arguments.length, rest = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
          rest[_key3 - 2] = arguments[_key3];
        }
        options = _this3.options.overloadTranslationOptionHandler([key, opts].concat(rest));
      } else {
        options = {
          ...opts
        };
      }
      options.lng = options.lng || fixedT.lng;
      options.lngs = options.lngs || fixedT.lngs;
      options.ns = options.ns || fixedT.ns;
      if (options.keyPrefix !== "") options.keyPrefix = options.keyPrefix || keyPrefix || fixedT.keyPrefix;
      const keySeparator = _this3.options.keySeparator || ".";
      let resultKey;
      if (options.keyPrefix && Array.isArray(key)) {
        resultKey = key.map((k) => `${options.keyPrefix}${keySeparator}${k}`);
      } else {
        resultKey = options.keyPrefix ? `${options.keyPrefix}${keySeparator}${key}` : key;
      }
      return _this3.t(resultKey, options);
    };
    if (isString(lng)) {
      fixedT.lng = lng;
    } else {
      fixedT.lngs = lng;
    }
    fixedT.ns = ns;
    fixedT.keyPrefix = keyPrefix;
    return fixedT;
  }
  t() {
    return this.translator && this.translator.translate(...arguments);
  }
  exists() {
    return this.translator && this.translator.exists(...arguments);
  }
  setDefaultNamespace(ns) {
    this.options.defaultNS = ns;
  }
  hasLoadedNamespace(ns) {
    let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (!this.isInitialized) {
      this.logger.warn("hasLoadedNamespace: i18next was not initialized", this.languages);
      return false;
    }
    if (!this.languages || !this.languages.length) {
      this.logger.warn("hasLoadedNamespace: i18n.languages were undefined or empty", this.languages);
      return false;
    }
    const lng = options.lng || this.resolvedLanguage || this.languages[0];
    const fallbackLng = this.options ? this.options.fallbackLng : false;
    const lastLng = this.languages[this.languages.length - 1];
    if (lng.toLowerCase() === "cimode") return true;
    const loadNotPending = (l, n) => {
      const loadState = this.services.backendConnector.state[`${l}|${n}`];
      return loadState === -1 || loadState === 0 || loadState === 2;
    };
    if (options.precheck) {
      const preResult = options.precheck(this, loadNotPending);
      if (preResult !== void 0) return preResult;
    }
    if (this.hasResourceBundle(lng, ns)) return true;
    if (!this.services.backendConnector.backend || this.options.resources && !this.options.partialBundledLanguages) return true;
    if (loadNotPending(lng, ns) && (!fallbackLng || loadNotPending(lastLng, ns))) return true;
    return false;
  }
  loadNamespaces(ns, callback) {
    const deferred = defer();
    if (!this.options.ns) {
      if (callback) callback();
      return Promise.resolve();
    }
    if (isString(ns)) ns = [ns];
    ns.forEach((n) => {
      if (this.options.ns.indexOf(n) < 0) this.options.ns.push(n);
    });
    this.loadResources((err) => {
      deferred.resolve();
      if (callback) callback(err);
    });
    return deferred;
  }
  loadLanguages(lngs, callback) {
    const deferred = defer();
    if (isString(lngs)) lngs = [lngs];
    const preloaded = this.options.preload || [];
    const newLngs = lngs.filter((lng) => preloaded.indexOf(lng) < 0 && this.services.languageUtils.isSupportedCode(lng));
    if (!newLngs.length) {
      if (callback) callback();
      return Promise.resolve();
    }
    this.options.preload = preloaded.concat(newLngs);
    this.loadResources((err) => {
      deferred.resolve();
      if (callback) callback(err);
    });
    return deferred;
  }
  dir(lng) {
    if (!lng) lng = this.resolvedLanguage || (this.languages && this.languages.length > 0 ? this.languages[0] : this.language);
    if (!lng) return "rtl";
    const rtlLngs = ["ar", "shu", "sqr", "ssh", "xaa", "yhd", "yud", "aao", "abh", "abv", "acm", "acq", "acw", "acx", "acy", "adf", "ads", "aeb", "aec", "afb", "ajp", "apc", "apd", "arb", "arq", "ars", "ary", "arz", "auz", "avl", "ayh", "ayl", "ayn", "ayp", "bbz", "pga", "he", "iw", "ps", "pbt", "pbu", "pst", "prp", "prd", "ug", "ur", "ydd", "yds", "yih", "ji", "yi", "hbo", "men", "xmn", "fa", "jpr", "peo", "pes", "prs", "dv", "sam", "ckb"];
    const languageUtils = this.services && this.services.languageUtils || new LanguageUtil(get());
    return rtlLngs.indexOf(languageUtils.getLanguagePartFromCode(lng)) > -1 || lng.toLowerCase().indexOf("-arab") > 1 ? "rtl" : "ltr";
  }
  static createInstance() {
    let options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    let callback = arguments.length > 1 ? arguments[1] : void 0;
    return new I18n(options, callback);
  }
  cloneInstance() {
    let options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    let callback = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : noop;
    const forkResourceStore = options.forkResourceStore;
    if (forkResourceStore) delete options.forkResourceStore;
    const mergedOptions = {
      ...this.options,
      ...options,
      ...{
        isClone: true
      }
    };
    const clone = new I18n(mergedOptions);
    if (options.debug !== void 0 || options.prefix !== void 0) {
      clone.logger = clone.logger.clone(options);
    }
    const membersToCopy = ["store", "services", "language"];
    membersToCopy.forEach((m) => {
      clone[m] = this[m];
    });
    clone.services = {
      ...this.services
    };
    clone.services.utils = {
      hasLoadedNamespace: clone.hasLoadedNamespace.bind(clone)
    };
    if (forkResourceStore) {
      clone.store = new ResourceStore(this.store.data, mergedOptions);
      clone.services.resourceStore = clone.store;
    }
    clone.translator = new Translator(clone.services, mergedOptions);
    clone.translator.on("*", function(event) {
      for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
        args[_key4 - 1] = arguments[_key4];
      }
      clone.emit(event, ...args);
    });
    clone.init(mergedOptions, callback);
    clone.translator.options = mergedOptions;
    clone.translator.backendConnector.services.utils = {
      hasLoadedNamespace: clone.hasLoadedNamespace.bind(clone)
    };
    return clone;
  }
  toJSON() {
    return {
      options: this.options,
      store: this.store,
      language: this.language,
      languages: this.languages,
      resolvedLanguage: this.resolvedLanguage
    };
  }
}
const instance = I18n.createInstance();
instance.createInstance = I18n.createInstance;
instance.createInstance;
instance.dir;
instance.init;
instance.loadResources;
instance.reloadResources;
instance.use;
instance.changeLanguage;
instance.getFixedT;
instance.t;
instance.exists;
instance.setDefaultNamespace;
instance.hasLoadedNamespace;
instance.loadNamespaces;
instance.loadLanguages;
const matchHtmlEntity = /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34|nbsp|#160|copy|#169|reg|#174|hellip|#8230|#x2F|#47);/g;
const htmlEntities = {
  "&amp;": "&",
  "&#38;": "&",
  "&lt;": "<",
  "&#60;": "<",
  "&gt;": ">",
  "&#62;": ">",
  "&apos;": "'",
  "&#39;": "'",
  "&quot;": '"',
  "&#34;": '"',
  "&nbsp;": " ",
  "&#160;": " ",
  "&copy;": "©",
  "&#169;": "©",
  "&reg;": "®",
  "&#174;": "®",
  "&hellip;": "…",
  "&#8230;": "…",
  "&#x2F;": "/",
  "&#47;": "/"
};
const unescapeHtmlEntity = (m) => htmlEntities[m];
const unescape = (text) => text.replace(matchHtmlEntity, unescapeHtmlEntity);
let defaultOptions = {
  bindI18n: "languageChanged",
  bindI18nStore: "",
  transEmptyNodeValue: "",
  transSupportBasicHtmlNodes: true,
  transWrapTextNodes: "",
  transKeepBasicHtmlNodesFor: ["br", "strong", "i", "p"],
  useSuspense: true,
  unescape
};
const setDefaults = (options = {}) => {
  defaultOptions = {
    ...defaultOptions,
    ...options
  };
};
const initReactI18next = {
  type: "3rdParty",
  init(instance2) {
    setDefaults(instance2.options.react);
  }
};
const common$6 = { "save": "Save", "saving": "Saving…", "saved": "Saved", "cancel": "Cancel", "delete": "Delete", "deleting": "Deleting…", "edit": "Edit", "create": "Create", "search": "Search", "loading": "Loading…", "yes": "Yes", "no": "No", "confirm": "Confirm", "back": "Back", "next": "Next", "previous": "Previous", "close": "Close", "all": "All", "none": "None", "actions": "Actions", "name": "Name", "slug": "Slug", "description": "Description", "status": "Status", "createdAt": "Created", "updatedAt": "Updated", "publishedAt": "Published", "language": "Language", "darkMode": "Dark mode", "lightMode": "Light mode", "signOut": "Sign out", "administrator": "Administrator", "editor": "Editor", "appName": "AgentCMS" };
const auth$6 = { "signIn": "Sign in", "signingIn": "Signing in…", "email": "Email", "password": "Password", "emailPlaceholder": "you@company.com", "passwordPlaceholder": "••••••••", "forgotPassword": "Forgot password?", "resetEmailSent": "Password reset email sent to {{email}}.", "enterEmailFirst": "Enter your email above first, then click reset.", "emailPasswordRequired": "Email and password are required.", "signInSubtitle": "Use your work email and password.", "footer": "Account requests go through your administrator.", "errors": { "invalidEmail": "Invalid email address.", "invalidCredentials": "Invalid email or password.", "tooManyRequests": "Too many attempts. Try again later or reset your password.", "userDisabled": "This account has been disabled.", "networkFailed": "Network error. Check your connection.", "generic": "Authentication failed." } };
const nav$6 = { "openMenu": "Open menu", "closeMenu": "Close menu", "dashboard": "Dashboard", "posts": "Posts", "pages": "Pages", "taxonomies": "Categories & Tags", "media": "Media", "themes": "Themes", "themeSettings": "Theme settings", "plugins": "Plugins", "menus": "Menus", "users": "Users", "settings": "Settings" };
const dashboard$6 = { "title": "Dashboard", "welcome": "Welcome back, {{email}}.", "stats": { "totalPosts": "Posts", "totalPages": "Pages", "online": "Online", "drafts": "Drafts" } };
const posts$6 = { "title": "Posts", "newPost": "New post", "noPosts": "No posts yet. Create your first one to get started.", "noPostsInFilter": "No posts match the current filter.", "search": { "placeholder": "Search posts…", "clear": "Clear search", "noResults": "No posts match your search." }, "pagination": { "previous": "Previous", "next": "Next", "showing": "Showing {{from}}–{{to}} of {{total}}", "pageOf": "Page {{page}} of {{total}}" }, "bulk": { "selectedCount_one": "{{count}} selected", "selectedCount_other": "{{count}} selected", "selectPage_one": "Select {{count}} on this page", "selectPage_other": "Select all {{count}} on this page", "deselectPage": "Deselect page", "allOnPageSelected_one": "{{count}} on this page selected.", "allOnPageSelected_other": "All {{count}} on this page selected.", "selectAllMatching_one": "Select the {{count}} matching post", "selectAllMatching_other": "Select all {{count}} matching posts", "allMatchingSelected_one": "All {{count}} matching post selected.", "allMatchingSelected_other": "All {{count}} matching posts selected.", "selectOne": 'Select "{{title}}"', "publish": "Publish ({{count}})", "publishing": "Publishing…", "publishedCount": "Published {{ok}}, failed {{failed}}.", "unpublish": "Unpublish ({{count}})", "unpublishing": "Unpublishing…", "unpublishedCount": "Unpublished {{ok}}, failed {{failed}}.", "delete": "Delete", "deleting": "Deleting…", "deletedCount": "Deleted {{ok}}, failed {{failed}}.", "confirmDelete_one": "Delete {{count}} post? This unpublishes from Flexweg and cannot be undone.", "confirmDelete_other": "Delete {{count}} posts? This unpublishes from Flexweg and cannot be undone.", "noDraftSelected": "No draft posts selected.", "noOnlineSelected": "No online posts selected.", "clear": "Clear selection" }, "filters": { "all": "All", "draft": "Draft", "online": "Online" }, "fields": { "title": "Title", "slug": "Slug", "excerpt": "Excerpt", "content": "Content", "category": "Category", "tags": "Tags", "heroImage": "Hero image", "seoTitle": "SEO title", "seoDescription": "SEO description", "createdAt": "Created at", "updatedAt": "Last updated", "publishedAt": "Published at" }, "edit": { "newTitle": "New post", "editTitle": "Edit post", "saved": "Saved.", "savedAndRepublished": "Saved and republished.", "saveFailed": "Save failed.", "saveAndRepublish": "Save & republish", "draftSaved": "Draft saved.", "slugCollision": { "post": 'This URL is already used by post: "{{label}}".', "page": 'This URL is already used by page: "{{label}}".', "category": 'This URL is already used by category: "{{label}}".' }, "publish": "Publish", "unpublish": "Unpublish", "publishing": "Publishing…", "unpublishing": "Unpublishing…", "titlePlaceholder": "Add title", "permalink": "Permalink", "slugFormatHint": "Lower-case, ASCII, dash-separated only.", "slugAutoSuffixed": 'Auto-suffixed because "{{base}}" is already used by {{owner}}.', "slugAutoSuffixedOwner": { "post": 'post: "{{label}}"', "page": 'page: "{{label}}"', "category": 'category: "{{label}}"' }, "saveBlocked": { "titleRequired": "Add a title before saving.", "slugRequired": "A title and URL slug are required to save.", "slugInvalid": "Slug format is invalid (lower-case ASCII + dashes).", "slugCollision": "Fix the URL conflict before saving." }, "viewPublished": "View", "confirmDelete": "Delete this entry?", "inspector": { "document": "Document", "block": "Block", "blockEmpty": "Select a block in the editor to see its options.", "publishing": "Publishing", "permalink": "Permalink", "categories": "Categories & tags", "featured": "Featured image", "seo": "SEO", "excerpt": "Excerpt", "dates": "Dates" }, "blocks": { "addBlock": "Add block", "transform": "Transform to", "moveUp": "Move up", "moveDown": "Move down", "duplicate": "Duplicate", "remove": "Delete block", "paragraph": "Paragraph", "heading2": "Heading 2", "heading3": "Heading 3", "bulletList": "Bullet list", "orderedList": "Numbered list", "blockquote": "Quote", "codeBlock": "Code", "image": "Image", "horizontalRule": "Separator", "categories": { "text": "Text", "media": "Media", "layout": "Layout", "embed": "Embeds", "advanced": "Advanced" }, "noSettings": "This block has no settings.", "noSelection": "Select a block in the editor to see its options.", "slash": { "noResults": "No matching block." } } }, "status": { "draft": "Draft", "online": "Online" }, "preview": { "title": "Preview", "rendering": "Rendering preview…", "error": "Preview failed: {{error}}", "viewports": { "mobile": "Mobile", "tablet": "Tablet", "desktop": "Desktop" } } };
const pages$6 = { "title": "Pages", "newPage": "New page", "noPages": "No pages yet.", "homeBadge": "Home", "homeBadgeTooltip": "Used as the site's home page" };
const taxonomies$6 = { "title": "Categories & Tags", "categories": "Categories", "tags": "Tags", "newCategory": "New category", "newTag": "New tag", "noCategories": "No categories yet.", "noTags": "No tags yet.", "slugCollision": 'This slug is already used by "{{label}}".', "seo": { "button": "SEO", "buttonTitle": "Edit SEO meta tags", "title": "SEO meta tags", "subtitle": 'Custom title and description for the "{{name}}" archive page.', "metaTitle": "Meta title", "metaTitleHint": "Used as the page <title>. Defaults to the term name when blank.", "metaDescription": "Meta description", "metaDescriptionHint": "Used as the page meta description. Defaults to the term description when blank." } };
const media$6 = { "title": "Media library", "upload": "Upload", "uploading": "Uploading…", "finalizing": "Finalizing…", "uploadFailed": "Upload failed", "retry": "Retry", "noMedia": "No media yet.", "alt": "Alt text", "caption": "Caption", "filename": "Filename", "size": "Size", "type": "Type" };
const themes$6 = { "title": "Themes", "active": "Active", "activate": "Activate", "installExternal": "Install theme", "uninstallDisabledTitle": "Switch to another theme before uninstalling this one.", "syncAssets": "Sync theme assets", "regenerateSite": "Regenerate site", "regenerating": "Regenerating…", "regenerate": { "button": "Regenerate", "running": "Running…", "groupBuiltins": "Site", "groupPlugins": "Plugins", "home": "Home page only", "homeHelp": "Re-renders index.html only — fastest option.", "allHtml": "All HTML pages", "allHtmlHelp": "Every post, page, archive and listing — plus menu / posts / authors JSON snapshots.", "repair": "Repair URLs", "repairHelp": "Recompute every online post's canonical path and migrate files that landed at the wrong URL. Useful after an import that ran before terms had synced.", "assets": "Theme assets", "assetsHelp": "Pushes the active theme's CSS + companion scripts to /theme-assets/.", "everything": "Everything", "everythingHelp": "Theme assets + all HTML + every plugin output. Slowest option.", "noPluginTargets": "No plugin regeneration targets — enable a plugin that supports regenerate." }, "confirmSwitch": { "title": "Switch to {{theme}}?", "body": "Switching theme requires re-uploading the theme's assets and regenerating every published page so the new look propagates everywhere. This may take a moment.", "confirm": "Switch & regenerate", "cancel": "Cancel" } };
const plugins$6 = { "title": "Plugins", "enabled": "Enabled", "disabled": "Disabled", "enable": "Enable", "disable": "Disable", "configure": "Configure", "author": "author", "learnMore": "Learn more", "mustUseBadge": "Must-use", "installExternal": "Install plugin", "tabs": { "regular": "Plugins", "mustUse": "Must-use" } };
const externalInstall$6 = { "titlePlugin": "Install a plugin", "titleTheme": "Install a theme", "labelPlugin": "plugin", "labelTheme": "theme", "intro": "Drop a ZIP file containing a {{label}} bundle (manifest.json + bundle.js at the ZIP root). The {{label}} will be uploaded to your Flexweg site and registered after a reload. Re-uploading a ZIP with the same manifest id upgrades the existing entry in place — no uninstall needed.", "zipField": "Bundle ZIP file", "install": "Install", "installing": "Installing…", "installSuccess": "{{name}} installed ({{count}} files uploaded). Reloading…", "upgradeSuccess": "{{name}} upgraded from v{{previousVersion}} to v{{newVersion}} ({{count}} files uploaded). Reloading…", "installedTitle": "Already installed", "bundledDefaultsTitle": "Bundled defaults available", "bundledDefaultsHint": "{{count}} bundled plugin/theme is currently uninstalled. Restore them to bring back what shipped with this admin version.", "bundledDefaultsRestore": "Restore", "bundledDefaultsRestored": "Restored {{plugins}} plugin(s) and {{themes}} theme(s). Reloading…", "uninstall": "Uninstall", "uninstallSuccess": "{{id}} uninstalled. Reloading…", "confirmUninstall": "Uninstall {{id}}? Files will be deleted from Flexweg.", "errors": { "no-manifest": "ZIP is missing manifest.json at its root.", "invalid-manifest": "manifest.json is invalid (missing required fields or not valid JSON).", "incompatible-api": "The bundle was built against an incompatible runtime API version.", "no-bundle": "ZIP does not contain the entry file declared in the manifest.", "fetch-manifest": "Could not read the current external.json on Flexweg.", "upload-failed": "Upload failed — check your Flexweg API key + connection." } };
const externalLoader$6 = { "someFailed": "{{count}} external bundle(s) failed to load. Check the browser console." };
const menus$6 = { "title": "Menus", "header": "Header menu", "footer": "Footer menu", "label": "Label", "saveAndPublish": "Save & generate", "discard": "Discard", "saved": "Menus saved and published.", "saveFailed": "Could not save menus.", "unsavedChanges": "You have unsaved changes." };
const settings$6 = { "title": "Settings", "tabs": { "general": "General" }, "site": { "title": "Site", "siteTitle": "Site title", "siteDescription": "Site description", "siteLanguage": "Site language", "siteLanguageHelp": 'BCP-47 tag (e.g. en, fr-CA) injected into <html lang="…"> on every published page. The prefix is matched against supported translation locales for sitemap/RSS labels and theme-baked strings; unsupported locales fall back to English.', "siteLanguageResolved": "Translations will use: {{label}}", "baseUrl": "Public site URL", "postsPerPage": "Posts per page", "homeMode": "Home content", "homeLatest": "Latest posts", "homeStatic": "Static page", "homePage": "Home page", "discourageIndexing": "Discourage search engines from indexing this site", "discourageIndexingHelp": "When enabled, every published page gets a noindex/nofollow meta tag and robots.txt is set to disallow all crawlers. Mirrors WordPress' behaviour — useful for staging sites or pre-launch reviews. Search engines that respect the directive will not index the site.", "discourageRegenerateHint": "Indexing setting saved. Click 'Regenerate all' in Themes to apply the change to every published page and robots.txt." }, "flexweg": { "title": "Flexweg API", "apiKey": "API key", "apiKeyHelp": "Generated from your Flexweg account → API.", "siteUrl": "Site URL", "siteUrlHelp": "Public URL of your Flexweg site without trailing slash.", "apiBaseUrl": "API base URL", "storageHelpFirebase": "Stored in Firestore (config/flexweg). Readable by any signed-in team member, writable by admins only.", "storageHelpSqlite": "Stored in the local SQLite config table. Readable by any signed-in team member, writable by admins only." }, "backend": { "title": "Data backend", "active": "Active backend:", "switchButton": "Switch backend…", "confirmTitle": "All current data will be lost.", "confirmBody": "Switching wipes the in-browser config and reloads into the setup form. The new backend starts empty — the previous backend's data stays where it was (in Firestore or as a .sqlite file on Flexweg), but the CMS will not read it anymore until you switch back.", "confirmYes": "Yes, switch backend", "downloadBackup": "Download a backup of the .sqlite file", "downloadBackupHelp": "do this before switching backends.", "markdownGit": "Markdown — {{source}}", "localFolder": "local folder", "localBrowser": "This browser (local, single user)", "sqliteFile": "SQLite file — {{location}}" }, "performance": { "title": "Performance", "help": "How the admin loads posts and pages. Default works on the free Firestore plan with no setup; the paginated mode is for very large sites and requires a one-time index setup.", "mode": "Loading mode", "modeGlobal": "Standard (no setup required)", "modePaginated": "Server-side paginated (requires Firestore indexes)", "globalHelp": "Loads the whole posts collection in one live subscription. Sorting, filtering and search happen in memory. Best for sites under ~5 000 posts.", "paginatedHelp": "Cursor-paginated subscriptions, one page at a time. Requires composite Firestore indexes — see README. Recommended for very large sites.", "savedReload": "Saved. Reload the admin to apply the new mode." }, "editor": { "title": "Editor", "help": "Typography used inside the post / page editor. Independent of the public theme.", "fontFamily": "Font family", "bodySize": "Body size", "h1Size": "H1 size", "h2Size": "H2 size", "h3Size": "H3 size", "sizeHelp": "CSS length, e.g. 16px or 1rem. Leave empty for default.", "reset": "Reset to defaults" }, "profile": { "title": "Profile", "adminLocale": "Admin language", "adminLocaleHelp": "Language used by the admin interface. Saved to your profile.", "firstName": "First name", "lastName": "Last name", "headline": "Title", "headlinePlaceholder": "e.g. Senior Editor, Investigative Reporter…", "headlineHelp": "Shown publicly under your name in author cards and on your archive page.", "bio": "Bio", "bioPlaceholder": "A short paragraph shown on your author page and below your articles.", "bioHelp": "Visible on the public site in the author bio sidebar and the author archive page.", "socials": "Social profiles", "socialsHelp": 'Add the URLs of the profiles you want to surface on the public site, then tick "Show" for the ones you want visible. Empty URLs are ignored.', "socialsShow": "Show", "socialsShowHelp": "Toggle the visibility of this network on the public site.", "avatar": "Profile picture", "avatarHelp": "Pick an image from your media library. Square images render best.", "pickAvatar": "Pick from media", "changeAvatar": "Change picture", "removeAvatar": "Remove", "save": "Save profile" }, "transfer": { "title": "Move or back up content", "help": "Export everything (posts, pages, categories, media metadata, profiles, settings) as one JSON file. On a Markdown or local backend you can import such a file, ids preserved — the way to migrate from Firebase or SQLite. Media files and secret keys are not included.", "export": "Export content (JSON)", "import": "Import content…", "modeMerge": "Merge (overwrite same ids)", "modeReplace": "Replace imported collections", "replaceConfirm": "Replace mode deletes every existing item of the collections present in the file before importing. Continue?", "invalidFile": "This file is not a AgentCMS content export.", "imported": "Imported {{posts}} posts/pages, {{terms}} terms, {{media}} media. Run Regenerate → Everything to publish them." }, "encryption": { "title": "Database encryption:", "on": "on", "off": "off", "onHelp": "The database file is unreadable without the passphrase. Changing it re-saves the file with a new key; other browsers will ask for the new passphrase.", "offHelp": "The database file is readable by anyone who can download it (a static host serves it like any page). Encrypt it with a passphrase.", "enable": "Encrypt the database…", "change": "Change the passphrase…", "savedConfirm": "I saved this passphrase in my password manager — without it the content can't be opened.", "enableConfirm": "Encrypt now", "changeConfirm": "Change passphrase", "done": "Database re-saved with the new passphrase." } };
const users$6 = { "title": "Users", "noUsers": "No users yet.", "role": "Role", "disabled": "Disabled", "editProfileTitle": "Edit profile — {{email}}", "profileSaved": "Profile saved.", "descriptionFirebase": "Manage your team. New accounts are created in the Firebase Console, then mirrored here on first sign-in.", "descriptionSqlite": "Manage your team. Use the +Add user button below to create new accounts directly.", "addUser": "Add user", "addUserSuccess": "{{email}} added.", "removeConfirmFirebase": "Delete the user record for {{email}}? This removes their profile + role from the CMS. To revoke sign-in access, also delete the account in the Firebase Console.", "removeConfirmSqlite": "Permanently delete {{email}}? This revokes their sign-in access AND removes their profile + role. This cannot be undone.", "empty": { "title": "No team members yet", "descriptionFirebase": "Create the first account in the Firebase Console, then sign in here once to register the profile.", "descriptionSqlite": "Click +Add user above to invite the first team member." }, "help": { "title": "How to add a new team member", "bootstrapLine": "The bootstrap admin (always full access) is:", "firebase": { "step1": "Open the Firebase Console → Authentication → Add user.", "step2": "Set an email and password and send them to the new team member.", "step3": "Ask them to sign in here once — their profile appears in the list above and you can edit their role / details." }, "sqlite": { "step1": "Click the +Add user button above.", "step2": "Enter their email and a temporary password (8+ characters).", "step3": "Share the credentials securely — they can change the password from their profile once signed in." }, "git": { "step1": "Add the person as a collaborator of the content repository (write access = editor, admin / maintainer = admin).", "step2": "They create their own personal access token on GitHub / GitLab.", "step3": "They open the admin and sign in with that token — their profile is created here automatically." } }, "addUserModal": { "title": "Add a new team member", "intro": "Creates the account directly in the Flexweg SQLite Auth database. The new user defaults to the editor role; promote them from the list below if they need admin access.", "submit": "Create user", "submitting": "Creating…" }, "actions": { "editProfile": "Edit profile", "promote": "Promote to admin", "demote": "Demote to editor", "disable": "Disable", "enable": "Enable", "delete": "Delete record" }, "descriptionGit": "Team members are the people with write access to the content repository. They appear here after their first sign-in; their role follows their repository permissions.", "descriptionLocal": "This admin runs in single-user mode: content is stored in this browser and there are no accounts.", "descriptionSqliteFile": "No user accounts with this backend: anyone who can open the admin can edit. Protect the admin folder at your hosting level. Author profiles below are informational." };
const firestoreSetup$6 = { "title": "Firestore setup needed", "intro": "The post and page list pages need a couple of Firestore composite indexes to query efficiently. They have to be created manually — Firebase reserves index creation for project admins.", "checking": "Checking your Firestore indexes…", "missingCount_one": "{{count}} index missing:", "missingCount_other": "{{count}} indexes missing:", "openConsole": "Open Firebase Console to create", "noUrl": "Couldn't extract the auto-suggest URL — see the README for the gcloud command.", "howItWorks": "How this works", "step1": "Click the link for each missing index — Firebase Console opens with the index definition pre-filled.", "step2": 'Click "Create" and wait 1–5 minutes for the index to build (status badge in the console).', "step3": "Come back here and click Retry. Once both queries succeed, the admin loads.", "retry": "Retry", "retrying": "Retrying…", "buildHint": "Indexes can take up to a few minutes to build after creation.", "allReady": "All indexes ready.", "unexpectedTitle": "Couldn't reach Firestore", "unexpectedHint": "Check your network connection and Firestore rules. If you just created the indexes, wait a moment for them to finish building, then retry." };
const errors$6 = { "appError": "Application error", "loadAccountFailed": "Could not load your account", "loadAccountHint": "If the problem persists, sign out and try again.", "accountDisabled": "Account disabled", "accountDisabledMessage": "Your access to this CMS has been disabled. Contact your administrator.", "firebaseNotConfigured": "Firebase is not configured", "firebaseEnvMissing": "The following env variables are missing:\n{{vars}}\n\nCopy .env.example to .env, fill in your Firebase project credentials, and restart the dev server.", "adminEmailNotConfigured": "Admin email is not configured", "adminEmailMessage": "VITE_ADMIN_EMAIL is missing in .env. Set it to the email of the bootstrap administrator.", "consoleHint": "Check the browser console and your .env configuration. See the README for setup instructions." };
const identity$6 = { "brandTitle": "AgentCMS", "brandSubtitle": "Static publisher", "login": { "heading": "Sign in", "intro": "Use the email and password your admin shared with you.", "submit": "Sign in", "submitting": "Signing in…" }, "fields": { "name": "Display name (optional)", "namePlaceholder": "Jane Doe", "email": "Email", "password": "Password", "passwordHint": "At least 8 characters." }, "footer": "New accounts are created by an admin from the Users page.", "errors": { "invalidEmail": "Please enter a valid email address.", "missingPassword": "Password is required.", "passwordTooShort": "Password must be at least 8 characters." } };
const setup$6 = /* @__PURE__ */ JSON.parse(`{"title":"Welcome to AgentCMS","subtitle":"First-time setup","intro":"Fill in your Firebase credentials, the bootstrap administrator account, and your Flexweg API key. The values are validated, written to your project (Firestore + a config.js file on Flexweg), and the admin reloads into the normal sign-in flow. You only do this once.","introFirebase":"Step 1 — Firebase. Fill in your Firebase project credentials and the bootstrap administrator account. We'll sign in, verify the email, and check that your Firestore rules pin this admin before continuing to the Flexweg step.","introFlexweg":"Step 2 — Flexweg. Fill in your Flexweg API key and site URL. We'll test the API, save the configuration to Firestore, upload config.js to your site, and sync theme assets.","continueToFlexweg":"Validate Firebase & continue","stepper":{"terms":"Terms","backend":"Backend","firebase":"Firebase","flexweg":"Flexweg","sqlite":"SQLite","docstore":"Content & publishing","data":"Data","hosting":"Hosting","install":"Install"},"backend":{"title":"Choose a data backend","intro":"Pick where the CMS will store your posts, pages, users and settings. You can switch later from the Settings page (data is not migrated).","sqliteTitle":"Flexweg SQLite (recommended)","sqliteHint":"All data stays on your Flexweg site as a SQLite file. No external service. Auth is provided by Flexweg's SQLite API.","firebaseTitle":"Firebase","firebaseHint":"Use a Firebase project for Firestore + Auth. Free under the Spark plan. Real-time updates via onSnapshot.","continue":"Continue","markdownGitTitle":"Markdown files in a Git repository","markdownGitHint":"Posts as .md files on GitHub / GitLab (or a local clone). Each editor signs in with their own access token; every change is a commit. No database, works with several editors and machines.","localTitle":"This browser only","localHint":"Single user, no login, nothing to set up. Content stays in this browser (export it from Settings). Best for an admin running on your own computer."},"sqlite":{"heading":"Connect your Flexweg site","intro":"We'll use your master Flexweg API key ONCE to create a scoped token for the SQLite database. After install, the master key is discarded and only the scoped token (limited to this one SQLite file) is stored.","apiKeyHint":"Master Flexweg API key. Used only to install — never stored after.","detectedFromUrl":"Detected from URL","advanced":"Advanced settings (Site URL, SQLite path…)","pathHint":"Where the SQLite file lives on your Flexweg site. Folders are created automatically.","adminHeading":"Admin account","adminIntro":"Create the first user — this account gets admin rights automatically. Subsequent members are onboarded from the Users page once you're signed in.","passwordHint":"At least 8 characters.","submit":"Install SQLite database"},"terms":{"title":"Terms of use","intro":"Please read and accept the terms below before using AgentCMS. They are written in plain language to be quick to read.","section1":{"title":"1. Free service","body":"AgentCMS is provided to you free of charge by Flexweg. You can use it without limits with your Flexweg hosting — Flexweg will never bill you for using the CMS itself. Standard charges for your Flexweg hosting plan and your Firebase plan still apply, on the respective accounts you own."},"section2":{"title":"2. Provided as-is, no warranty","body":"The CMS is provided as-is. We work to keep it stable and improve it over time, but we cannot guarantee it will be free of bugs, defects or interruptions. Use it with the same caution you would any tool you didn't write yourself: keep backups of important content."},"section3":{"title":"3. Your content, your responsibility","body":"You are solely responsible for the content you publish through the CMS — text, images, videos, forms, code embeds, and any other media. You must comply with applicable law in your jurisdiction (and in the jurisdictions you target), copyright, image and personality rights, personal data protection rules, and any third-party terms (e.g. embedded fonts or videos). Flexweg is not responsible for content published by users of the CMS."},"section4":{"title":"4. Your Firebase account, your security","body":"The CMS stores its data in your own Firebase project. You are responsible for securing that project: choose a strong password for the bootstrap admin account, set up Firestore security rules as documented, rotate your API keys when needed, and review who has access. Flexweg cannot be held responsible for unauthorised access, data leaks, hacks or losses caused by misconfiguration or compromise of your Firebase account."},"section5":{"title":"5. Limitation of liability","body":"Flexweg cannot be held responsible for any loss of revenue, loss of data, loss of business opportunity, or any direct or indirect damages arising from the use, misuse, or unavailability of the CMS. Where applicable law requires Flexweg to assume some liability for the CMS, that liability is limited to the amount actually paid to Flexweg for the CMS over the past 12 months — which is zero, since the CMS is free."},"section6":{"title":"6. Your data stays yours","body":"Content you create with the CMS is stored in your own Firebase project (text, settings, media metadata) and on your own Flexweg hosting (the published HTML, images, theme assets). The CMS itself does not transmit your content to any third-party service. Plugins or themes you choose to enable may have their own behaviour — review what they do before activating them."},"section7":{"title":"7. Fair use","body":"Use of the CMS for unlawful, fraudulent, or harmful activities, or in ways that breach Flexweg's general terms of use, may result in suspension of your Flexweg hosting access. We may also update these CMS terms over time; significant changes will be communicated through the admin or via email."},"accept":"I have read and accept the Terms of use.","continue":"Continue to configuration","back":"Back"},"sections":{"firebase":"Firebase","admin":"Bootstrap administrator","flexweg":"Flexweg API"},"help":{"firebase":"Find these values in Firebase Console → Project settings → General → Your apps → SDK setup and configuration.","admin":"Use an existing user from Firebase Authentication. Anyone signing in with this email is treated as admin and bypasses the user-record check. Create the user via Firebase Console → Authentication if it doesn't exist yet.","flexweg":"Generate a permanent API key in your Flexweg account → API. The site URL is the public address of your Flexweg site (e.g. https://your-site.flexweg.com).","flexwegApiKeyHint":"Get your API key from your Flexweg account settings.","flexwegApiKeyLink":"Open account settings"},"fields":{"apiKey":"API key","authDomain":"Auth domain","projectId":"Project ID","storageBucket":"Storage bucket","messagingSenderId":"Messaging sender ID","appId":"App ID","adminEmail":"Email","adminPassword":"Password","flexwegApiKey":"API key","flexwegSiteUrl":"Site URL","flexwegApiBaseUrl":"API base URL","sqlitePath":"SQLite path"},"submit":"Save & continue","submitting":"Setting up…","success":"Setup complete!","reloadingHint":"Reloading the admin in a moment — sit tight.","footer":"These values are saved on your project (Firestore + Flexweg). They are not sent anywhere else.","steps":{"signInFirebase":"Signing in to Firebase…","testFlexweg":"Testing Flexweg API…","writeFirestore":"Saving configuration…","uploadConfig":"Uploading config.js to Flexweg…","syncThemes":"Syncing theme assets to Flexweg…","sqliteInstall":"Creating scoped SQLite token…","sqliteRegisterAdmin":"Registering the admin account…","sqliteSchema":"Bootstrapping SQLite schema…"},"stepsDone":{"sqliteInstall":"Scoped SQLite token issued","sqliteRegisterAdmin":"Admin registered and signed in","sqliteSchema":"SQLite schema ready"},"errors":{"missingFields":"Please fill every field.","rootDeploymentTitle":"The admin must live in a subfolder, not at the site root.","rootDeploymentHint":"Move the admin files (index.html, config.js, runtime/, …) into a subfolder on Flexweg — for example /admin/ or any random name like /erf34f654GH3/ for obscurity. Then reload the admin from that subfolder URL and re-run the setup.","firebaseAuthGeneric":"Could not sign in to Firebase.","firebaseAuthInvalidCredential":"Firebase rejected the email + password combination.","firebaseAuthInvalidCredentialHint":"Modern Firebase projects ship with email-enumeration protection on, which returns the same error whether the password is wrong, the user doesn't exist, or the user signs in with a different provider. Things to check:\\n• Re-enter the password — copy/paste from a password manager to rule out typos. Minimum length is 6 characters.\\n• Open Firebase Console → Authentication → Users and confirm the email exists. Check the 'Providers' column: if it shows only Google (or another provider) and not 'Email/Password', set or reset the password from the user's row menu (⋮ → Reset password).\\n• Verify the email spelling matches exactly what's stored in Firebase.","firebaseAuthUserNotFound":"No Firebase user with this email. Create one in Firebase Console → Authentication → Users first.","firebaseAuthInvalidEmail":"The admin email is not a valid email address.","firebaseInvalidApiKey":"The Firebase API key is invalid. Double-check the value from Firebase Console.","firebaseNetwork":"Network error while signing in to Firebase. Check your connection.","firebaseTooManyRequests":"Too many sign-in attempts. Try again in a moment or reset the password from Firebase Console.","firebaseOperationNotAllowed":"Email/password sign-in is not enabled on this Firebase project. Open Firebase Console → Authentication → Sign-in method and enable the Email/Password provider.","firebaseUserDisabled":"This Firebase user account is disabled. Re-enable it from Firebase Console → Authentication → Users.","wrongAdminEmail":"The Firebase account you signed in with does not match the admin email you typed. Try again.","rulesNotPinnedTitle":"Firestore rules don't recognize you as bootstrap admin yet.","rulesNotPinnedHint":"Open Firebase Console → Firestore → Rules and replace the value of \`bootstrapAdminEmail()\` with: {{email}} — then click Publish. The rules template in the README ships with a \`you@example.com\` placeholder that must be replaced with your real admin email. After publishing the updated rules, click Submit here again.","flexwegAuth":"Flexweg API key rejected. Check the value from your Flexweg account → API.","flexwegNetwork":"Network error while contacting Flexweg. Check the API base URL and your connection.","flexwegHttp":"Flexweg API error ({{status}}): {{detail}}","firestoreRulesTitle":"Firestore rejected the configuration write.","firestoreRulesHint":"Open Firebase Console → Firestore → Rules and make sure the bootstrap admin email is set to '{{email}}'. The README has a copy-pastable rules template.","firestoreOther":"Firestore write failed","uploadFailed":"Could not upload config.js to Flexweg","generic":"Something went wrong."},"docstore":{"contentTitle":"Content repository","contentIntro":"Where your posts, pages and settings are stored as Markdown + JSON files. An empty repository is fine — the CMS creates the files.","provider":"Repository","localClone":"Local folder (git clone)","localCloneHint":"Pick the folder of your clone. Sync it with your usual git client — the CMS reads and writes files, it doesn't run git.","contentDir":"Content folder in the repo","privateRepo":"Use a private repository: drafts are stored there.","folderRequired":"Choose the content folder first.","checking":"Checking repository access…","publishIntro":"Where the generated site is published. You can change it later in Settings.","existingSite":"This repository is already set up — the site keeps publishing to: {{target}}. You can change it later in Settings (secret keys, if any, must be entered again there).","install":"Install","steps":{"config":"Saving configuration…","content":"Loading content…","target":"Saving publish target…","testTarget":"Testing the publish target…"},"doneTitle":"All set!","doneBody":"The configuration is saved in this browser. To spare other editors this setup, download config.js and replace the one in the admin folder of your hosting.","downloadConfig":"Download config.js","open":"Open the admin","footer":"Content stays in your repository or in this browser; access tokens never leave this browser."},"data":{"title":"1. Where do you store your data?","intro":"Your posts, pages, users and settings — the admin's own data. This is independent from where the public site is hosted (next step).","localNote":"Nothing to configure: content is stored in this browser. Export it from Settings to back it up or move it later.","options":{"sqlite-file":{"title":"SQLite","hint":"A SQLite database stored on the hosting you choose in the next step (Flexweg, your server, S3, Git…). No user accounts — or Flexweg's SQLite service with accounts if you host on Flexweg."},"flexweg-sqlite":{"title":"SQLite (Flexweg service)","hint":"A SQLite database run by Flexweg's service, with built-in user accounts. Needs a Flexweg account, wherever the site is hosted."},"firebase":{"title":"Firebase","hint":"Firestore + Firebase Auth in your Google project. Real-time, free Spark plan."},"markdown-git":{"title":"Markdown files in Git","hint":"Posts as .md files in a GitHub / GitLab repo (or a local clone). Each editor uses their own token; every change is a commit."},"local":{"title":"This browser","hint":"Single user, no login, nothing to set up. Ideal for an admin running on your computer."}}},"hosting":{"title":"2. Where is the site published?","intro":"Where the generated static site (HTML, CSS, images) is uploaded each time you publish. You can change it later in Settings.","existing":"This content repository already publishes to the target below. Keep it or pick another one."},"install":{"title":"3. Install","intro":"Check the summary, then install.","data":"Data","hosting":"Hosting","saveTarget":"Saving the publish target…","noteConfigJs":"The admin configuration (config.js) is uploaded next to the admin on Flexweg when possible; otherwise you'll be offered to download it.","noteLocalConfig":"The configuration is saved in this browser; you'll be offered config.js to put in the admin folder so other editors skip this setup."},"sqliteFile":{"security":"No user accounts: anyone who can open this admin can edit the content — protect the admin folder at your hosting level. The database file is served like any other file: keep it encrypted, or store it in a separate private location.","intro":"Where the database file is stored. It is read and saved by this admin through the same connectors as the hosting.","path":"Database file path","pathHint":"Created on first save if it doesn't exist yet. With a Git repository, every save is a commit — prefer a repository or branch that doesn't trigger a site build.","existing":"existing database","new":"new database","dataNote":"Nothing to configure here: the database will be stored on the hosting you choose in the next step.","heading":"SQLite database","flexwegService":"Use Flexweg's SQLite service","flexwegServiceHint":"The database is run by Flexweg and comes with built-in user accounts (email + password). Otherwise it is a plain file on this hosting, without accounts.","summaryFile":"File {{path}} on this hosting","summaryService":"Flexweg SQLite service ({{path}})","encrypt":"Encrypt the database","encryptHint":"Recommended on a public hosting: the file is unreadable without the passphrase. Each new browser asks for it once.","passphrase":"Passphrase","passphraseHint":"Save it in your password manager now: without it, nobody can open the database — not even you.","copy":"Copy","copied":"Copied","generate":"New","passphraseTooShort":"The passphrase must be at least 12 characters long.","existingEncrypted":"An encrypted database already exists at this path: enter its passphrase.","separate":"Store the database in a separate private location","separateHint":"E.g. a private S3 / R2 bucket or a private Git repository: the database is then never served by the public site.","summaryEncrypted":"encrypted","summaryLocation":"stored in {{location}}","locationLabel":"Database location","gitBranchNote":"The database is kept on the branch {{branch}} of this repository, which is never published: saving content doesn't rebuild the site.","summaryBranch":"on branch {{branch}}"},"adminHosting":{"deploying":"Copying the admin to the site…","label":"Also host the admin on this site","hint":"The admin is copied to {{url}} with its config.js (no secrets inside) — every editor can then open it there. Each editor still signs in with their own access.","folder":"Admin folder","alreadyHere":"This admin already runs from this site: its config.js will be updated in place.","doneBody":"The admin is now on your site. On GitHub Pages, enable Pages for the repository first if it isn't yet (Settings → Pages), then open it:","open":"Open the online admin","continueHere":"Continue in this admin"}}`);
const flexweg$6 = { "actions": { "upload": "Uploading file", "delete": "Deleting file", "rename": "Renaming file", "get": "Reading file", "list": "Listing files", "createFolder": "Creating folder", "renameFolder": "Renaming folder", "deleteFolder": "Deleting folder", "storageLimits": "Reading storage limits", "commit": "Publishing changes" }, "errors": { "configMissing": "The publish target is not configured. Set it up in admin Settings before publishing.", "network": "{{action}}: network error or CORS blocked. Check your connection.", "auth": "{{action}}: authentication failed. Check the publish target credentials in Settings.", "notFound": "{{action}}: target not found on the publish target.", "tooLarge": "{{action}}: file too large for the publish target.", "rateLimited": "{{action}}: too many requests, please retry in a moment.", "serverError": "{{action}}: publish target server error ({{status}}). Please retry.", "generic": "{{action}} failed ({{status}}){{detail}}.", "unsupported": '{{action}}: not supported by the "{{connector}}" publish target.', "unknownConnector": 'Unknown publish target "{{connector}}". Check Settings → Publish target.', "folderAccess": "No access to the local folder. Open Settings → Publish target and click “Reconnect folder”." } };
const publish$6 = { "log": { "rendering": "Rendering page…", "uploading": "Uploading {{path}}…", "deleting": "Deleting {{path}}…", "regenerating": "Regenerating listings…", "skipped": "Skipped {{path}} (no changes)", "done": "Published to {{url}}", "failed": "Failed: {{error}}" } };
const docstore$6 = { "errors": { "notConnected": "Not connected to the content repository. Sign in again with your access token.", "conflict": "Someone else changed this item in the meantime. Their version is now shown — re-apply your change.", "sqliteUnsupported": `The "{{connector}}" target can't store a database file.` } };
const connectors$6 = { "target": "Publish target", "settingsTitle": "Publish target", "settingsHelp": "Where the rendered site is uploaded when you publish. Credentials are stored with your content backend (or kept in this browser for Git content repositories) and are readable by every admin.", "saved": "Publish target saved. Run Regenerate → Everything to publish the whole site to the new target.", "test": "Test connection", "testOk": "Connection OK", "testFailed": "Connection failed", "names": { "flexweg": "Flexweg", "git-pages": "Git repository (GitHub Pages, Cloudflare Pages, GitLab Pages…)", "s3": "S3-compatible bucket (AWS S3, Cloudflare R2, Backblaze B2, OVH…)", "php-bridge": "Your own server (PHP bridge)", "browser-mirror": "Download as ZIP", "local-folder": "Local folder on this computer" }, "hints": { "flexweg": "Uploads through the Flexweg Files API.", "git-pages": "Each publish is one commit to the repo; the host rebuilds the site from it.", "s3": "Needs a CORS rule on the bucket allowing this admin's origin, and website hosting (or a CDN) to serve index.html files.", "php-bridge": "Upload external/bridges/php/flexweg-bridge.php to your server, set its API key, then fill in its URL here.", "browser-mirror": "The site is kept in this browser; download the ZIP and upload it anywhere by hand.", "local-folder": "Writes the site straight into a folder (Chrome / Edge). Serve it locally or push it with your own tools." }, "fields": { "flexweg": { "apiKey": "API key", "siteUrl": "Site URL", "apiBaseUrl": "API base URL" }, "git-pages": { "host": "Hosting", "provider": "Git provider", "owner": "Owner (user or organisation)", "repo": "Repository", "project": "Project path", "branch": "Branch", "dir": "Folder in the repo", "token": "Access token", "siteUrl": "Public site URL", "apiBaseUrl": "API URL (self-hosted only)" }, "s3": { "endpoint": "Endpoint", "region": "Region", "bucket": "Bucket", "prefix": "Key prefix (optional)", "accessKeyId": "Access key ID", "secretAccessKey": "Secret access key", "siteUrl": "Public site URL", "forcePathStyle": "Path-style URLs (MinIO, R2, most compatibles)", "publicRead": "Make uploaded files public (public-read ACL) — for buckets not made public by a bucket policy (OVHcloud, Scaleway…). Leave off on AWS buckets that enforce bucket-owner ownership." }, "php-bridge": { "apiBaseUrl": "Bridge URL", "apiKey": "Bridge API key", "siteUrl": "Public site URL" }, "browser-mirror": { "siteUrl": "Public site URL (optional)" }, "local-folder": { "siteUrl": "URL the folder is served at (optional)" } }, "help": { "flexweg": { "apiKey": "Generated from your Flexweg account → API." }, "git-pages": { "host": "Cloudflare Pages: connect the project to this repo with no build command and the output folder below. Works with private repos.", "dir": 'Leave empty for the repo root. GitHub Pages: "" or "docs". GitLab Pages: "public".', "token": "Fine-grained token on this repo with Contents: read & write (GitHub) — add Pages: read & write to let the CMS switch GitHub Pages on — or a token with the api scope (GitLab). Leave empty to use each editor's own token when content is on the same provider.", "siteUrl": "e.g. https://user.github.io/repo — a sub-folder URL is fine, links are adjusted automatically." }, "s3": { "endpoint": "Leave empty for AWS (built from the region). R2: https://<account-id>.r2.cloudflarestorage.com", "siteUrl": "The bucket website URL or your CDN domain." }, "php-bridge": { "apiBaseUrl": "The full URL of flexweg-bridge.php on your server (HTTPS)." }, "browser-mirror": { "siteUrl": "Where you will upload the ZIP — used for absolute URLs (sitemaps, RSS, media)." }, "local-folder": { "siteUrl": "e.g. http://localhost:8080 when a local web server serves the folder." } }, "options": { "github-pages": "GitHub Pages", "cloudflare-pages": "Cloudflare Pages (connected to the repo)", "gitlab-pages": "GitLab Pages", "other": "Other (Netlify, Vercel, server git pull…)", "github": "GitHub", "gitlab": "GitLab" }, "folder": { "choose": "Choose folder…", "change": "Change folder…", "reconnect": "Reconnect folder", "unsupported": "This browser can't write to local folders. Use Chrome or Edge." }, "mirror": { "download": "Download site (ZIP)", "count": "{{count}} files in this browser" }, "adminHosting": { "title": "Admin on this site", "help": "Copy this admin to the publish target (first deployment, or update after a new version). Its config.js holds no secrets.", "deploy": "Deploy / update the admin", "deployed": "Admin deployed ({{count}} files) — {{url}}" }, "pages": { "enabled": "GitHub Pages enabled for this repository — the site will be online in about a minute.", "enableHint": 'Publish succeeded. To put the site online, enable GitHub Pages for {{repo}}: Settings → Pages → Deploy from a branch → {{branch}} / {{folder}}. (Or give the token the "Pages: read and write" permission and the CMS will do it.)' }, "siteUrl": { "mismatch": "The site's public URL (Settings → Site) is {{site}}, but this target serves the site at {{target}}. Links, CSS and sitemaps follow the site URL — they will be wrong on this hosting.", "use": "Use {{url}} for the site", "updated": "Site URL updated. Run Regenerate → Everything to republish the pages with the new links." } };
const gitAccess$6 = { "heading": "Connect to the content repository", "tokenIntro": "Content is stored in the {{provider}} repository {{repo}}. Sign in with your own personal access token — your repository permissions decide your role (write access = editor, admin / maintainer = admin).", "token": "Personal access token", "tokenHelpGithub": "Fine-grained token, access to this repository only, permission Contents: read and write.", "tokenHelpGitlab": "Token with the api scope, Developer role or higher on this project.", "createToken": "Create a token", "connect": "Connect", "tokenStorage": "The token is kept in this browser only. Signing out forgets it.", "failed": "This token can't write to the repository (invalid, expired, or read-only). Check its permissions.", "folderIntro": "Content is stored in a folder on this computer (typically a git clone you sync with your own git client). Grant this browser access to it — browsers ask again after every reload.", "openFolder": "Open content folder" };
const hosting$6 = { "flexweg": { "title": "Flexweg", "short": "Flexweg hosting", "hint": "Uploads through the Flexweg Files API. API key from your Flexweg account." }, "github-pages": { "title": "GitHub Pages", "short": "Free, from a GitHub repo", "hint": "Each publish is one commit to the repo; GitHub Pages serves it. Settings → Pages → Deploy from a branch. Public repos on the free plan." }, "cloudflare-pages": { "title": "Cloudflare Pages", "short": "Free, private repos OK", "hint": "The CMS commits the site to a GitHub / GitLab repo; connect a Cloudflare Pages project to it (no build command, output folder = the folder below)." }, "gitlab-pages": { "title": "GitLab Pages", "short": "Free, from a GitLab repo", "hint": "Each publish is one commit; the CMS adds a minimal .gitlab-ci.yml that publishes the public/ folder." }, "git-other": { "title": "Netlify, Vercel…", "short": "Any host that deploys a repo", "hint": "The CMS commits the site to a Git repo; connect your host (Netlify, Vercel, a server running git pull…) to that repo." }, "s3": { "title": "S3 / R2 / B2…", "short": "Object storage bucket", "hint": "AWS S3, Cloudflare R2, Backblaze B2, OVH, Scaleway, MinIO… Needs a CORS rule on the bucket and website hosting or a CDN in front." }, "own-server": { "title": "Your own server (FTP / SFTP)", "short": "Shared hosting, VPS…", "hint": "Browsers can't speak FTP or SFTP: upload the PHP bridge (external/bridges/php/flexweg-bridge.php) once with your FTP client, set its API key, then fill in its URL here. Works on any PHP host." }, "local-folder": { "title": "Local folder", "short": "On this computer", "hint": "Writes the site into a folder of this computer (Chrome / Edge). Serve it locally or push it with your own tools." }, "zip": { "title": "Download as ZIP", "short": "Upload it by hand", "hint": "The site is kept in this browser; download a ZIP from Settings and upload it anywhere (Netlify Drop, FTP client…)." } };
const sqliteAccess$6 = { "heading": "Connect to the database", "intro": "This admin stores its content in {{path}}. Enter the access credentials for this browser.", "storage": "Credentials are kept in this browser only. Signing out forgets them.", "passphrase": "Database passphrase", "passphraseHint": "The database is encrypted. Enter the passphrase chosen at install (kept in this browser only).", "passphraseWrong": "Wrong passphrase: the database could not be opened.", "passphraseMissing": "Enter the database passphrase." };
const en = {
  common: common$6,
  auth: auth$6,
  nav: nav$6,
  dashboard: dashboard$6,
  posts: posts$6,
  pages: pages$6,
  taxonomies: taxonomies$6,
  media: media$6,
  themes: themes$6,
  plugins: plugins$6,
  externalInstall: externalInstall$6,
  externalLoader: externalLoader$6,
  menus: menus$6,
  settings: settings$6,
  users: users$6,
  firestoreSetup: firestoreSetup$6,
  errors: errors$6,
  identity: identity$6,
  setup: setup$6,
  flexweg: flexweg$6,
  publish: publish$6,
  docstore: docstore$6,
  connectors: connectors$6,
  gitAccess: gitAccess$6,
  hosting: hosting$6,
  sqliteAccess: sqliteAccess$6
};
const common$5 = { "save": "Enregistrer", "saving": "Enregistrement…", "saved": "Enregistré", "cancel": "Annuler", "delete": "Supprimer", "deleting": "Suppression…", "edit": "Modifier", "create": "Créer", "search": "Rechercher", "loading": "Chargement…", "yes": "Oui", "no": "Non", "confirm": "Confirmer", "back": "Retour", "next": "Suivant", "previous": "Précédent", "close": "Fermer", "all": "Tous", "none": "Aucun", "actions": "Actions", "name": "Nom", "slug": "Slug", "description": "Description", "status": "Statut", "createdAt": "Créé le", "updatedAt": "Mis à jour", "publishedAt": "Publié le", "language": "Langue", "darkMode": "Mode sombre", "lightMode": "Mode clair", "signOut": "Déconnexion", "administrator": "Administrateur", "editor": "Éditeur", "appName": "AgentCMS" };
const auth$5 = { "signIn": "Connexion", "signingIn": "Connexion…", "email": "Email", "password": "Mot de passe", "emailPlaceholder": "vous@entreprise.com", "passwordPlaceholder": "••••••••", "forgotPassword": "Mot de passe oublié ?", "resetEmailSent": "Email de réinitialisation envoyé à {{email}}.", "enterEmailFirst": "Saisissez d'abord votre email, puis cliquez sur réinitialiser.", "emailPasswordRequired": "Email et mot de passe requis.", "signInSubtitle": "Utilisez votre email professionnel et votre mot de passe.", "footer": "Les demandes de compte passent par votre administrateur.", "errors": { "invalidEmail": "Adresse email invalide.", "invalidCredentials": "Email ou mot de passe invalide.", "tooManyRequests": "Trop de tentatives. Réessayez plus tard ou réinitialisez votre mot de passe.", "userDisabled": "Ce compte a été désactivé.", "networkFailed": "Erreur réseau. Vérifiez votre connexion.", "generic": "Échec de l'authentification." } };
const nav$5 = { "openMenu": "Ouvrir le menu", "closeMenu": "Fermer le menu", "dashboard": "Tableau de bord", "posts": "Articles", "pages": "Pages", "taxonomies": "Catégories & Tags", "media": "Médias", "themes": "Thèmes", "themeSettings": "Réglages du thème", "plugins": "Plugins", "menus": "Menus", "users": "Utilisateurs", "settings": "Réglages" };
const dashboard$5 = { "title": "Tableau de bord", "welcome": "Bienvenue, {{email}}.", "stats": { "totalPosts": "Articles", "totalPages": "Pages", "online": "En ligne", "drafts": "Brouillons" } };
const posts$5 = { "title": "Articles", "newPost": "Nouvel article", "noPosts": "Aucun article. Créez le premier pour commencer.", "noPostsInFilter": "Aucun article ne correspond au filtre courant.", "search": { "placeholder": "Rechercher des articles…", "clear": "Effacer la recherche", "noResults": "Aucun article ne correspond à votre recherche." }, "pagination": { "previous": "Précédent", "next": "Suivant", "showing": "Affichage {{from}}–{{to}} sur {{total}}", "pageOf": "Page {{page}} sur {{total}}" }, "bulk": { "selectedCount_one": "{{count}} sélectionné", "selectedCount_other": "{{count}} sélectionnés", "selectPage_one": "Sélectionner {{count}} sur cette page", "selectPage_other": "Sélectionner les {{count}} de cette page", "deselectPage": "Désélectionner la page", "allOnPageSelected_one": "{{count}} sur cette page sélectionné.", "allOnPageSelected_other": "Les {{count}} de cette page sont sélectionnés.", "selectAllMatching_one": "Sélectionner l'article correspondant", "selectAllMatching_other": "Sélectionner les {{count}} articles correspondants", "allMatchingSelected_one": "L'article correspondant est sélectionné.", "allMatchingSelected_other": "Les {{count}} articles correspondants sont sélectionnés.", "selectOne": "Sélectionner « {{title}} »", "publish": "Publier ({{count}})", "publishing": "Publication…", "publishedCount": "{{ok}} publié(s), {{failed}} échec(s).", "unpublish": "Dépublier ({{count}})", "unpublishing": "Dépublication…", "unpublishedCount": "{{ok}} dépublié(s), {{failed}} échec(s).", "delete": "Supprimer", "deleting": "Suppression…", "deletedCount": "{{ok}} supprimé(s), {{failed}} échec(s).", "confirmDelete_one": "Supprimer {{count}} article ? Cette action dépublie de Flexweg et ne peut pas être annulée.", "confirmDelete_other": "Supprimer {{count}} articles ? Cette action dépublie de Flexweg et ne peut pas être annulée.", "noDraftSelected": "Aucun article en brouillon sélectionné.", "noOnlineSelected": "Aucun article en ligne sélectionné.", "clear": "Effacer la sélection" }, "filters": { "all": "Tous", "draft": "Brouillon", "online": "En ligne" }, "fields": { "title": "Titre", "slug": "Slug", "excerpt": "Extrait", "content": "Contenu", "category": "Catégorie", "tags": "Tags", "heroImage": "Image d'en-tête", "seoTitle": "Titre SEO", "seoDescription": "Description SEO", "createdAt": "Date de création", "updatedAt": "Dernière mise à jour", "publishedAt": "Date de publication" }, "edit": { "newTitle": "Nouvel article", "editTitle": "Modifier l'article", "saved": "Enregistré.", "savedAndRepublished": "Enregistré et republié.", "saveFailed": "Échec de l'enregistrement.", "saveAndRepublish": "Enregistrer & republier", "draftSaved": "Brouillon enregistré.", "slugCollision": { "post": "Cette URL est déjà utilisée par l'article : « {{label}} ».", "page": "Cette URL est déjà utilisée par la page : « {{label}} ».", "category": "Cette URL est déjà utilisée par la catégorie : « {{label}} »." }, "publish": "Publier", "unpublish": "Dépublier", "publishing": "Publication…", "unpublishing": "Dépublication…", "titlePlaceholder": "Ajouter un titre", "permalink": "Permalien", "slugFormatHint": "Minuscules ASCII séparées par des tirets uniquement.", "slugAutoSuffixed": "Suffixe ajouté car « {{base}} » est déjà utilisé par {{owner}}.", "slugAutoSuffixedOwner": { "post": "le post : « {{label}} »", "page": "la page : « {{label}} »", "category": "la catégorie : « {{label}} »" }, "saveBlocked": { "titleRequired": "Ajoutez un titre avant d'enregistrer.", "slugRequired": "Un titre et un slug d'URL sont requis pour enregistrer.", "slugInvalid": "Format de slug invalide (minuscules ASCII + tirets).", "slugCollision": "Résolvez le conflit d'URL avant d'enregistrer." }, "viewPublished": "Voir", "confirmDelete": "Supprimer cet élément ?", "inspector": { "document": "Document", "block": "Bloc", "blockEmpty": "Sélectionnez un bloc dans l'éditeur pour voir ses options.", "publishing": "Publication", "permalink": "Permalien", "categories": "Catégories & tags", "featured": "Image à la une", "seo": "SEO", "excerpt": "Extrait", "dates": "Dates" }, "blocks": { "addBlock": "Ajouter un bloc", "transform": "Transformer en", "moveUp": "Déplacer vers le haut", "moveDown": "Déplacer vers le bas", "duplicate": "Dupliquer", "remove": "Supprimer le bloc", "paragraph": "Paragraphe", "heading2": "Titre 2", "heading3": "Titre 3", "bulletList": "Liste à puces", "orderedList": "Liste numérotée", "blockquote": "Citation", "codeBlock": "Code", "image": "Image", "horizontalRule": "Séparateur", "categories": { "text": "Texte", "media": "Médias", "layout": "Mise en page", "embed": "Intégrations", "advanced": "Avancé" }, "noSettings": "Ce bloc n'a pas de réglages.", "noSelection": "Sélectionnez un bloc dans l'éditeur pour voir ses options.", "slash": { "noResults": "Aucun bloc ne correspond." } } }, "status": { "draft": "Brouillon", "online": "En ligne" }, "preview": { "title": "Aperçu", "rendering": "Génération de l'aperçu…", "error": "Échec de l'aperçu : {{error}}", "viewports": { "mobile": "Mobile", "tablet": "Tablette", "desktop": "Bureau" } } };
const pages$5 = { "title": "Pages", "newPage": "Nouvelle page", "noPages": "Aucune page.", "homeBadge": "Accueil", "homeBadgeTooltip": "Utilisée comme page d'accueil du site" };
const taxonomies$5 = { "title": "Catégories & Tags", "categories": "Catégories", "tags": "Tags", "newCategory": "Nouvelle catégorie", "newTag": "Nouveau tag", "noCategories": "Aucune catégorie.", "noTags": "Aucun tag.", "slugCollision": "Ce slug est déjà utilisé par « {{label}} ».", "seo": { "button": "SEO", "buttonTitle": "Modifier les balises SEO", "title": "Balises SEO", "subtitle": "Titre et description personnalisés pour la page d'archive « {{name}} ».", "metaTitle": "Titre meta", "metaTitleHint": "Utilisé comme balise <title>. Valeur par défaut : le nom du terme.", "metaDescription": "Description meta", "metaDescriptionHint": "Utilisée comme méta-description de la page. Valeur par défaut : la description du terme." } };
const media$5 = { "title": "Médiathèque", "upload": "Téléverser", "uploading": "Téléversement…", "finalizing": "Finalisation…", "uploadFailed": "Échec du téléversement", "retry": "Réessayer", "noMedia": "Aucun média.", "alt": "Texte alternatif", "caption": "Légende", "filename": "Nom du fichier", "size": "Taille", "type": "Type" };
const themes$5 = { "title": "Thèmes", "active": "Actif", "activate": "Activer", "installExternal": "Installer un thème", "uninstallDisabledTitle": "Activez un autre thème avant de désinstaller celui-ci.", "syncAssets": "Synchroniser le thème", "regenerateSite": "Régénérer le site", "regenerating": "Régénération…", "regenerate": { "button": "Régénérer", "running": "En cours…", "groupBuiltins": "Site", "groupPlugins": "Plugins", "home": "Page d'accueil uniquement", "homeHelp": "Régénère index.html seulement — l'option la plus rapide.", "allHtml": "Toutes les pages HTML", "allHtmlHelp": "Tous les posts, pages, archives et listings — plus les snapshots menu / posts / authors JSON.", "repair": "Réparer les URLs", "repairHelp": "Recalcule l'URL canonique de chaque post en ligne et déplace les fichiers qui ont atterri au mauvais endroit. Utile après un import effectué avant que les termes ne soient synchronisés.", "assets": "Assets du thème", "assetsHelp": "Envoie le CSS et les scripts du thème actif vers /theme-assets/.", "everything": "Tout", "everythingHelp": "Assets thème + tous les HTML + chaque sortie plugin. Option la plus lente.", "noPluginTargets": "Aucune régénération de plugin — activez un plugin qui supporte la régénération." }, "confirmSwitch": { "title": "Passer à {{theme}} ?", "body": "Le changement de thème nécessite de re-pousser les assets du thème et de régénérer toutes les pages publiées pour que le nouveau look se propage partout. Cela peut prendre un moment.", "confirm": "Changer & régénérer", "cancel": "Annuler" } };
const plugins$5 = { "title": "Plugins", "enabled": "Activé", "disabled": "Désactivé", "enable": "Activer", "disable": "Désactiver", "configure": "Configurer", "author": "auteur", "learnMore": "En savoir plus", "mustUseBadge": "Indispensable", "installExternal": "Installer un plugin", "tabs": { "regular": "Plugins", "mustUse": "Indispensables" } };
const externalInstall$5 = { "titlePlugin": "Installer un plugin", "titleTheme": "Installer un thème", "labelPlugin": "plugin", "labelTheme": "thème", "intro": "Déposez un fichier ZIP contenant un bundle de {{label}} (manifest.json + bundle.js à la racine). Le {{label}} sera uploadé sur votre site Flexweg et enregistré après un rechargement. Ré-uploader un ZIP avec le même id de manifest met à jour l'entrée existante en place — pas besoin de désinstaller.", "zipField": "Fichier ZIP du bundle", "install": "Installer", "installing": "Installation…", "installSuccess": "{{name}} installé ({{count}} fichiers uploadés). Rechargement…", "upgradeSuccess": "{{name}} mis à jour de v{{previousVersion}} à v{{newVersion}} ({{count}} fichiers uploadés). Rechargement…", "installedTitle": "Déjà installé", "bundledDefaultsTitle": "Plugins/thèmes bundlés disponibles", "bundledDefaultsHint": "{{count}} plugin/thème bundlé est actuellement désinstallé. Restaurez-les pour récupérer ce qui était livré avec cette version de l'admin.", "bundledDefaultsRestore": "Restaurer", "bundledDefaultsRestored": "{{plugins}} plugin(s) et {{themes}} thème(s) restaurés. Rechargement…", "uninstall": "Désinstaller", "uninstallSuccess": "{{id}} désinstallé. Rechargement…", "confirmUninstall": "Désinstaller {{id}} ? Les fichiers seront supprimés de Flexweg.", "errors": { "no-manifest": "Le ZIP n'a pas de manifest.json à sa racine.", "invalid-manifest": "Le manifest.json est invalide (champ requis manquant ou JSON cassé).", "incompatible-api": "Le bundle a été buildé pour une version d'API runtime incompatible.", "no-bundle": "Le ZIP ne contient pas le fichier d'entrée déclaré dans le manifest.", "fetch-manifest": "Impossible de lire le external.json actuel sur Flexweg.", "upload-failed": "Échec de l'upload — vérifiez votre clé API Flexweg et votre connexion." } };
const externalLoader$5 = { "someFailed": "{{count}} bundle(s) externe(s) ont échoué au chargement. Voir la console du navigateur." };
const menus$5 = { "title": "Menus", "header": "Menu d'en-tête", "footer": "Menu de pied de page", "label": "Libellé", "saveAndPublish": "Enregistrer & générer", "discard": "Annuler", "saved": "Menus enregistrés et publiés.", "saveFailed": "Impossible d'enregistrer les menus.", "unsavedChanges": "Modifications non enregistrées." };
const settings$5 = { "title": "Réglages", "tabs": { "general": "Général" }, "site": { "title": "Site", "siteTitle": "Titre du site", "siteDescription": "Description du site", "siteLanguage": "Langue du site", "siteLanguageHelp": `Code BCP-47 (ex. en, fr-CA) injecté dans <html lang="…"> de chaque page publiée. Le préfixe est utilisé pour résoudre la langue des libellés sitemap / RSS et des chaînes intégrées au thème ; les locales non supportées retombent sur l'anglais.`, "siteLanguageResolved": "Les traductions utiliseront : {{label}}", "baseUrl": "URL publique du site", "postsPerPage": "Articles par page", "homeMode": "Contenu de la page d'accueil", "homeLatest": "Derniers articles", "homeStatic": "Page statique", "homePage": "Page d'accueil", "discourageIndexing": "Décourager les moteurs de recherche d'indexer ce site", "discourageIndexingHelp": "Si activé, chaque page publiée porte une balise meta noindex/nofollow et le robots.txt interdit tous les robots. Reproduit le comportement de WordPress — utile pour les sites de préproduction ou les revues avant lancement. Les moteurs qui respectent la directive n'indexeront pas le site.", "discourageRegenerateHint": "Réglage d'indexation sauvegardé. Cliquez sur « Tout régénérer » dans Thèmes pour appliquer le changement à toutes les pages publiées et au robots.txt." }, "flexweg": { "title": "API Flexweg", "apiKey": "Clé API", "apiKeyHelp": "Générée depuis votre compte Flexweg → API.", "siteUrl": "URL du site", "siteUrlHelp": "URL publique de votre site Flexweg sans slash final.", "apiBaseUrl": "URL de base de l'API", "storageHelpFirebase": "Stockée dans Firestore (config/flexweg). Lecture par tout membre connecté, écriture admin uniquement.", "storageHelpSqlite": "Stockée dans la table SQLite locale config. Lecture par tout membre connecté, écriture admin uniquement." }, "backend": { "title": "Backend de données", "active": "Backend actif :", "switchButton": "Changer de backend…", "confirmTitle": "Les données actuelles seront perdues.", "confirmBody": "Le basculement efface la configuration en mémoire et recharge sur le formulaire de configuration. Le nouveau backend démarre vide — les données du backend précédent restent où elles sont (dans Firestore ou en tant que fichier .sqlite sur Flexweg), mais le CMS ne les lira plus jusqu'au prochain basculement.", "confirmYes": "Oui, changer de backend", "downloadBackup": "Télécharger une sauvegarde du fichier .sqlite", "downloadBackupHelp": "à faire avant de changer de backend.", "markdownGit": "Markdown — {{source}}", "localFolder": "dossier local", "localBrowser": "Ce navigateur (local, un seul utilisateur)", "sqliteFile": "Fichier SQLite — {{location}}" }, "performance": { "title": "Performance", "help": "Comment l'admin charge articles et pages. Le mode par défaut fonctionne sur le plan gratuit de Firestore sans configuration ; le mode paginé est destiné aux très gros sites et exige une création d'index ponctuelle.", "mode": "Mode de chargement", "modeGlobal": "Standard (aucune configuration requise)", "modePaginated": "Pagination côté serveur (index Firestore requis)", "globalHelp": "Charge toute la collection d'articles dans une subscription temps réel. Tri, filtre et recherche se font en mémoire. Recommandé pour les sites de moins de ~5 000 articles.", "paginatedHelp": "Subscriptions paginées par curseur, une page à la fois. Exige des index composites Firestore — voir README. Recommandé pour les très gros sites.", "savedReload": "Enregistré. Rechargez l'admin pour appliquer le nouveau mode." }, "editor": { "title": "Éditeur", "help": "Typographie utilisée dans l'éditeur d'articles / pages. Indépendante du thème public.", "fontFamily": "Police", "bodySize": "Taille du corps", "h1Size": "Taille H1", "h2Size": "Taille H2", "h3Size": "Taille H3", "sizeHelp": "Longueur CSS, ex. 16px ou 1rem. Laisser vide pour la valeur par défaut.", "reset": "Réinitialiser" }, "profile": { "title": "Profil", "adminLocale": "Langue de l'administration", "adminLocaleHelp": "Langue utilisée par l'interface d'administration. Sauvegardée dans votre profil.", "firstName": "Prénom", "lastName": "Nom", "headline": "Titre", "headlinePlaceholder": "ex. Journaliste, Rédacteur en chef…", "headlineHelp": "Affiché publiquement sous votre nom dans les cartes auteur et sur votre page d'archive.", "bio": "Biographie", "bioPlaceholder": "Un court paragraphe affiché sur votre page d'auteur et sous vos articles.", "bioHelp": "Visible sur le site public dans la barre latérale d'auteur et la page d'archive d'auteur.", "socials": "Profils sociaux", "socialsHelp": "Renseignez les URL des profils à exposer publiquement, puis cochez « Afficher » pour ceux que vous voulez rendre visibles. Les URL vides sont ignorées.", "socialsShow": "Afficher", "socialsShowHelp": "Bascule la visibilité de ce réseau sur le site public.", "avatar": "Photo de profil", "avatarHelp": "Choisissez une image dans votre médiathèque. Les images carrées rendent le mieux.", "pickAvatar": "Choisir depuis la médiathèque", "changeAvatar": "Changer l'image", "removeAvatar": "Retirer", "save": "Enregistrer le profil" }, "transfer": { "title": "Déplacer ou sauvegarder le contenu", "help": "Exportez tout (articles, pages, catégories, métadonnées des médias, profils, réglages) dans un seul fichier JSON. Sur un backend Markdown ou local, vous pouvez importer un tel fichier en conservant les identifiants — c'est la façon de migrer depuis Firebase ou SQLite. Les fichiers médias et les clés secrètes ne sont pas inclus.", "export": "Exporter le contenu (JSON)", "import": "Importer du contenu…", "modeMerge": "Fusionner (écrase les mêmes identifiants)", "modeReplace": "Remplacer les collections importées", "replaceConfirm": "Le mode Remplacer supprime tous les éléments existants des collections présentes dans le fichier avant l'import. Continuer ?", "invalidFile": "Ce fichier n'est pas un export de contenu AgentCMS.", "imported": "{{posts}} articles/pages, {{terms}} termes et {{media}} médias importés. Lancez Régénérer → Tout pour les publier." }, "encryption": { "title": "Chiffrement de la base :", "on": "activé", "off": "désactivé", "onHelp": "Le fichier de la base est illisible sans la phrase secrète. La changer ré-enregistre le fichier avec une nouvelle clé ; les autres navigateurs demanderont la nouvelle phrase.", "offHelp": "Le fichier de la base est lisible par quiconque peut le télécharger (un hébergement statique le sert comme n'importe quelle page). Chiffrez-le avec une phrase secrète.", "enable": "Chiffrer la base…", "change": "Changer la phrase secrète…", "savedConfirm": "J'ai enregistré cette phrase dans mon gestionnaire de mots de passe — sans elle, le contenu ne peut pas être ouvert.", "enableConfirm": "Chiffrer maintenant", "changeConfirm": "Changer la phrase", "done": "Base ré-enregistrée avec la nouvelle phrase secrète." } };
const users$5 = { "title": "Utilisateurs", "noUsers": "Aucun utilisateur.", "role": "Rôle", "disabled": "Désactivé", "editProfileTitle": "Modifier le profil — {{email}}", "profileSaved": "Profil enregistré.", "descriptionFirebase": "Gérez votre équipe. Les nouveaux comptes sont créés depuis la Firebase Console, puis miroir-rés ici à la première connexion.", "descriptionSqlite": "Gérez votre équipe. Utilisez le bouton +Ajouter ci-dessous pour créer des comptes directement.", "addUser": "Ajouter un utilisateur", "addUserSuccess": "{{email}} ajouté.", "removeConfirmFirebase": "Supprimer la fiche de {{email}} ? Cela retire son profil + son rôle du CMS. Pour révoquer son accès, supprimez aussi le compte dans la Firebase Console.", "removeConfirmSqlite": "Supprimer définitivement {{email}} ? Cela révoque son accès ET retire son profil + son rôle. Action irréversible.", "empty": { "title": "Aucun membre pour l'instant", "descriptionFirebase": "Créez le premier compte dans la Firebase Console, puis connectez-vous ici une fois pour enregistrer le profil.", "descriptionSqlite": "Cliquez sur +Ajouter ci-dessus pour inviter le premier membre." }, "help": { "title": "Comment ajouter un nouveau membre", "bootstrapLine": "L'admin initial (toujours admin complet) est :", "firebase": { "step1": "Ouvrez la Firebase Console → Authentication → Add user.", "step2": "Définissez un email et un mot de passe, transmettez-les au nouveau membre.", "step3": "Demandez-lui de se connecter ici une fois — son profil apparaît dans la liste et vous pouvez gérer son rôle et ses détails." }, "sqlite": { "step1": "Cliquez sur le bouton +Ajouter ci-dessus.", "step2": "Saisissez son email et un mot de passe temporaire (8+ caractères).", "step3": "Partagez les identifiants de manière sécurisée — il pourra changer son mot de passe depuis son profil une fois connecté." }, "git": { "step1": "Ajoutez la personne comme collaborateur du dépôt de contenu (écriture = éditeur, admin / maintainer = admin).", "step2": "Elle crée son propre jeton d'accès personnel sur GitHub / GitLab.", "step3": "Elle ouvre l'admin et se connecte avec ce jeton — son profil est créé ici automatiquement." } }, "addUserModal": { "title": "Ajouter un nouveau membre", "intro": "Crée le compte directement dans la base d'auth SQLite Flexweg. Le nouvel utilisateur est éditeur par défaut ; promouvez-le depuis la liste s'il lui faut un accès admin.", "submit": "Créer l'utilisateur", "submitting": "Création…" }, "actions": { "editProfile": "Modifier le profil", "promote": "Promouvoir admin", "demote": "Rétrograder éditeur", "disable": "Désactiver", "enable": "Activer", "delete": "Supprimer" }, "descriptionGit": "Les membres de l'équipe sont les personnes ayant un accès en écriture au dépôt de contenu. Ils apparaissent ici après leur première connexion ; leur rôle suit leurs droits sur le dépôt.", "descriptionLocal": "Cet admin fonctionne en mode mono-utilisateur : le contenu est stocké dans ce navigateur et il n'y a pas de comptes.", "descriptionSqliteFile": "Pas de comptes utilisateurs avec ce backend : toute personne qui peut ouvrir l'admin peut modifier. Protégez le dossier de l'admin au niveau de l'hébergement. Les profils d'auteurs ci-dessous sont informatifs." };
const firestoreSetup$5 = { "title": "Configuration Firestore requise", "intro": "Les pages de listing posts/pages ont besoin de quelques index composites Firestore pour fonctionner. Ils doivent être créés manuellement — Firebase réserve cette opération aux admins du projet.", "checking": "Vérification de vos index Firestore…", "missingCount_one": "{{count}} index manquant :", "missingCount_other": "{{count}} index manquants :", "openConsole": "Ouvrir Firebase Console pour créer", "noUrl": "URL d'auto-suggestion introuvable — voir le README pour la commande gcloud.", "howItWorks": "Comment ça marche", "step1": "Cliquez sur le lien de chaque index manquant — Firebase Console ouvre avec la définition pré-remplie.", "step2": "Cliquez sur « Create » et attendez 1 à 5 minutes la construction de l'index (statut dans la console).", "step3": "Revenez ici et cliquez sur Réessayer. Une fois les deux queries OK, l'admin se charge.", "retry": "Réessayer", "retrying": "Vérification…", "buildHint": "La construction d'un index peut prendre quelques minutes après création.", "allReady": "Tous les index sont prêts.", "unexpectedTitle": "Impossible de joindre Firestore", "unexpectedHint": "Vérifiez votre connexion et les règles Firestore. Si vous venez de créer les index, attendez la fin de leur construction puis réessayez." };
const errors$5 = { "appError": "Erreur applicative", "loadAccountFailed": "Impossible de charger votre compte", "loadAccountHint": "Si le problème persiste, déconnectez-vous puis réessayez.", "accountDisabled": "Compte désactivé", "accountDisabledMessage": "Votre accès au CMS a été désactivé. Contactez votre administrateur.", "firebaseNotConfigured": "Firebase n'est pas configuré", "firebaseEnvMissing": "Les variables d'environnement suivantes sont manquantes :\n{{vars}}\n\nCopiez .env.example vers .env, renseignez vos identifiants Firebase, puis relancez le serveur de dev.", "adminEmailNotConfigured": "Email administrateur non configuré", "adminEmailMessage": "VITE_ADMIN_EMAIL est manquant dans .env. Renseignez l'email de l'administrateur initial.", "consoleHint": "Consultez la console du navigateur et votre .env. Voir le README pour la configuration." };
const identity$5 = { "brandTitle": "AgentCMS", "brandSubtitle": "Publication statique", "login": { "heading": "Connexion", "intro": "Utilisez l'email et le mot de passe transmis par votre administrateur.", "submit": "Se connecter", "submitting": "Connexion…" }, "fields": { "name": "Nom affiché (optionnel)", "namePlaceholder": "Jane Doe", "email": "Email", "password": "Mot de passe", "passwordHint": "Au moins 8 caractères." }, "footer": "Les nouveaux comptes sont créés par un administrateur depuis la page Utilisateurs.", "errors": { "invalidEmail": "Veuillez entrer une adresse email valide.", "missingPassword": "Le mot de passe est requis.", "passwordTooShort": "Le mot de passe doit faire au moins 8 caractères." } };
const setup$5 = /* @__PURE__ */ JSON.parse(`{"title":"Bienvenue sur AgentCMS","subtitle":"Configuration initiale","intro":"Renseignez vos identifiants Firebase, le compte administrateur initial, et votre clé API Flexweg. Les valeurs sont validées, sauvegardées sur votre projet (Firestore + un fichier config.js sur Flexweg), puis l'admin recharge sur le flux de connexion habituel. Vous ne le faites qu'une seule fois.","introFirebase":"Étape 1 — Firebase. Renseignez les identifiants de votre projet Firebase et le compte administrateur bootstrap. Nous vérifions la connexion, l'email et que vos règles Firestore reconnaissent cet admin avant de passer à l'étape Flexweg.","introFlexweg":"Étape 2 — Flexweg. Renseignez votre clé API Flexweg et l'URL du site. Nous testons l'API, sauvegardons la configuration dans Firestore, uploadons config.js sur votre site et synchronisons les assets de thème.","continueToFlexweg":"Valider Firebase et continuer","stepper":{"terms":"CGU","backend":"Backend","firebase":"Firebase","flexweg":"Flexweg","sqlite":"SQLite","docstore":"Contenu et publication","data":"Données","hosting":"Hébergement","install":"Installation"},"backend":{"title":"Choisir le backend de données","intro":"Choisissez où le CMS stockera vos articles, pages, utilisateurs et paramètres. Vous pourrez changer plus tard depuis les Paramètres (les données ne sont pas migrées).","sqliteTitle":"Flexweg SQLite (recommandé)","sqliteHint":"Toutes les données restent sur votre site Flexweg sous forme de fichier SQLite. Aucun service externe. L'auth est fournie par l'API SQLite Flexweg.","firebaseTitle":"Firebase","firebaseHint":"Utilisez un projet Firebase pour Firestore + Auth. Gratuit avec le plan Spark. Mises à jour temps réel via onSnapshot.","continue":"Continuer","markdownGitTitle":"Fichiers Markdown dans un dépôt Git","markdownGitHint":"Les articles sont des fichiers .md sur GitHub / GitLab (ou un clone local). Chaque éditeur se connecte avec son propre jeton ; chaque modification est un commit. Pas de base de données, fonctionne à plusieurs et sur plusieurs postes.","localTitle":"Ce navigateur uniquement","localHint":"Un seul utilisateur, sans connexion, rien à configurer. Le contenu reste dans ce navigateur (exportez-le depuis les Réglages). Idéal pour un admin qui tourne sur votre ordinateur."},"sqlite":{"heading":"Connecter votre site Flexweg","intro":"Nous utiliserons votre clé API maître Flexweg UNE SEULE FOIS pour créer un token limité à la base SQLite. Après l'installation, la clé maître est jetée et seul le token limité (à ce seul fichier SQLite) est stocké.","apiKeyHint":"Clé API maître Flexweg. Utilisée uniquement pour l'installation — jamais stockée après.","detectedFromUrl":"Détecté depuis l'URL","advanced":"Réglages avancés (URL du site, chemin SQLite…)","pathHint":"Emplacement du fichier SQLite sur votre site Flexweg. Les dossiers sont créés automatiquement.","adminHeading":"Compte administrateur","adminIntro":"Créez le premier utilisateur — ce compte obtient automatiquement les droits d'admin. Les membres suivants sont créés depuis la page Utilisateurs une fois connecté.","passwordHint":"Au moins 8 caractères.","submit":"Installer la base SQLite"},"terms":{"title":"Conditions générales d'utilisation","intro":"Merci de lire et d'accepter les conditions ci-dessous avant d'utiliser AgentCMS. Elles sont rédigées en langage clair pour être rapides à lire.","section1":{"title":"1. Service gratuit","body":"AgentCMS est mis à votre disposition gratuitement par Flexweg. Vous pouvez l'utiliser sans limite avec votre hébergement Flexweg — Flexweg ne vous facturera jamais l'utilisation du CMS lui-même. Les frais habituels de votre offre d'hébergement Flexweg et de votre plan Firebase restent applicables, chacun sur le compte concerné."},"section2":{"title":"2. Service fourni « en l'état », sans garantie","body":"Le CMS est fourni en l'état. Nous travaillons à le garder stable et à l'améliorer dans le temps, mais nous ne pouvons garantir qu'il sera exempt de bugs, de défauts ou d'interruptions. Utilisez-le avec la même prudence qu'un outil que vous n'avez pas écrit vous-même : conservez des sauvegardes de vos contenus importants."},"section3":{"title":"3. Vos contenus, votre responsabilité","body":"Vous êtes seul responsable des contenus que vous publiez via le CMS — textes, images, vidéos, formulaires, intégrations de code, et tout autre média. Vous devez respecter la loi applicable dans votre juridiction (et dans celles que vous ciblez), les droits d'auteur, les droits à l'image et à la personnalité, les règles de protection des données personnelles, ainsi que les conditions de tout service tiers utilisé (polices intégrées, vidéos, etc.). Flexweg n'est pas responsable des contenus publiés par les utilisateurs du CMS."},"section4":{"title":"4. Votre compte Firebase, votre sécurité","body":"Le CMS stocke ses données dans votre propre projet Firebase. Vous êtes responsable de la sécurité de ce projet : choisissez un mot de passe robuste pour le compte administrateur initial, configurez les règles Firestore comme documenté, faites tourner vos clés API si nécessaire, et contrôlez qui y a accès. Flexweg ne pourra en aucun cas être tenu responsable d'un accès non autorisé, d'une fuite de données, d'un piratage ou d'une perte résultant d'une mauvaise configuration ou d'une compromission de votre compte Firebase."},"section5":{"title":"5. Limitation de responsabilité","body":"Flexweg ne pourra être tenu responsable d'aucune perte de revenus, perte de données, perte d'opportunité commerciale, ni d'aucun dommage direct ou indirect lié à l'utilisation, au mauvais usage ou à l'indisponibilité du CMS. Lorsque la loi applicable impose à Flexweg une responsabilité, celle-ci est limitée au montant effectivement payé à Flexweg pour le CMS au cours des 12 derniers mois — soit zéro, le CMS étant gratuit."},"section6":{"title":"6. Vos données restent les vôtres","body":"Les contenus que vous créez avec le CMS sont stockés dans votre propre projet Firebase (textes, réglages, métadonnées des médias) et sur votre propre hébergement Flexweg (HTML publié, images, assets de thème). Le CMS lui-même ne transmet vos contenus à aucun service tiers. Les plugins ou thèmes que vous choisissez d'activer peuvent avoir leur propre comportement — vérifiez ce qu'ils font avant de les activer."},"section7":{"title":"7. Bon usage","body":"L'utilisation du CMS pour des activités illégales, frauduleuses ou nuisibles, ou contraires aux conditions générales d'utilisation de Flexweg, peut entraîner la suspension de votre accès à l'hébergement Flexweg. Nous pouvons également mettre à jour les présentes conditions ; les changements significatifs seront communiqués via l'admin ou par email."},"accept":"J'ai lu et j'accepte les CGU.","continue":"Continuer vers la configuration","back":"Retour"},"sections":{"firebase":"Firebase","admin":"Administrateur initial","flexweg":"API Flexweg"},"help":{"firebase":"Retrouvez ces valeurs dans Firebase Console → Paramètres du projet → Général → Vos applications → Configuration du SDK.","admin":"Utilisez un utilisateur existant dans Firebase Authentication. Toute personne se connectant avec cet email est traitée comme administrateur et n'a pas besoin d'enregistrement utilisateur. Créez l'utilisateur via Firebase Console → Authentication s'il n'existe pas.","flexweg":"Générez une clé API permanente dans votre compte Flexweg → API. L'URL du site est l'adresse publique de votre site Flexweg (ex. https://votre-site.flexweg.com).","flexwegApiKeyHint":"Récupérez votre clé API depuis vos paramètres de compte Flexweg.","flexwegApiKeyLink":"Ouvrir les paramètres du compte"},"fields":{"apiKey":"Clé API","authDomain":"Domaine d'authentification","projectId":"ID du projet","storageBucket":"Bucket de stockage","messagingSenderId":"ID expéditeur de messagerie","appId":"ID de l'application","adminEmail":"Email","adminPassword":"Mot de passe","flexwegApiKey":"Clé API","flexwegSiteUrl":"URL du site","flexwegApiBaseUrl":"URL de base de l'API","sqlitePath":"Chemin SQLite"},"submit":"Enregistrer et continuer","submitting":"Configuration…","success":"Configuration terminée !","reloadingHint":"Rechargement de l'admin dans un instant — patientez.","footer":"Ces valeurs sont enregistrées sur votre projet (Firestore + Flexweg). Elles ne sont envoyées nulle part ailleurs.","steps":{"signInFirebase":"Connexion à Firebase…","testFlexweg":"Test de l'API Flexweg…","writeFirestore":"Sauvegarde de la configuration…","uploadConfig":"Upload de config.js sur Flexweg…","syncThemes":"Synchronisation des assets de thème sur Flexweg…","sqliteInstall":"Création du token SQLite limité…","sqliteRegisterAdmin":"Enregistrement du compte admin…","sqliteSchema":"Initialisation du schéma SQLite…"},"stepsDone":{"sqliteInstall":"Token SQLite limité créé","sqliteRegisterAdmin":"Admin enregistré et connecté","sqliteSchema":"Schéma SQLite prêt"},"errors":{"missingFields":"Veuillez remplir tous les champs.","rootDeploymentTitle":"L'admin doit être dans un sous-dossier, pas à la racine du site.","rootDeploymentHint":"Déplacez les fichiers de l'admin (index.html, config.js, runtime/, …) dans un sous-dossier sur Flexweg — par exemple /admin/ ou un nom aléatoire comme /erf34f654GH3/ pour plus de discrétion. Puis rechargez l'admin depuis l'URL du sous-dossier et relancez la configuration.","firebaseAuthGeneric":"Impossible de se connecter à Firebase.","firebaseAuthInvalidCredential":"Firebase a refusé la combinaison email + mot de passe.","firebaseAuthInvalidCredentialHint":"Les projets Firebase récents activent par défaut la protection contre l'énumération d'emails, qui renvoie la même erreur que le mot de passe soit incorrect, que l'utilisateur n'existe pas, ou qu'il se connecte avec un autre fournisseur. À vérifier :\\n• Re-saisis le mot de passe — fais un copier/coller depuis un gestionnaire de mots de passe pour éliminer toute faute de frappe. Le minimum est 6 caractères.\\n• Ouvre Firebase Console → Authentication → Users et vérifie que l'email existe. Regarde la colonne « Providers » : si elle n'affiche que Google (ou un autre fournisseur) sans « Email/Password », définis ou réinitialise le mot de passe via le menu de la ligne (⋮ → Réinitialiser le mot de passe).\\n• Vérifie que l'orthographe de l'email correspond exactement à ce qui est stocké dans Firebase.","firebaseAuthUserNotFound":"Aucun utilisateur Firebase avec cet email. Créez-le d'abord dans Firebase Console → Authentication → Users.","firebaseAuthInvalidEmail":"L'email administrateur n'est pas une adresse valide.","firebaseInvalidApiKey":"La clé API Firebase est invalide. Vérifiez la valeur dans Firebase Console.","firebaseNetwork":"Erreur réseau lors de la connexion à Firebase. Vérifiez votre connexion.","firebaseTooManyRequests":"Trop de tentatives de connexion. Réessayez dans un instant ou réinitialisez le mot de passe depuis Firebase Console.","firebaseOperationNotAllowed":"L'authentification email/mot de passe n'est pas activée sur ce projet Firebase. Ouvrez Firebase Console → Authentication → Sign-in method et activez le fournisseur Email/Password.","firebaseUserDisabled":"Ce compte utilisateur Firebase est désactivé. Réactivez-le depuis Firebase Console → Authentication → Users.","wrongAdminEmail":"Le compte Firebase auquel vous vous êtes connecté ne correspond pas à l'email admin saisi. Réessayez.","rulesNotPinnedTitle":"Les règles Firestore ne vous reconnaissent pas comme bootstrap admin.","rulesNotPinnedHint":"Ouvrez Firebase Console → Firestore → Règles et remplacez la valeur de \`bootstrapAdminEmail()\` par : {{email}} — puis cliquez sur Publier. Le template de règles du README contient un placeholder \`you@example.com\` qui doit être remplacé par votre vrai email admin. Une fois les règles publiées, cliquez à nouveau sur Soumettre ici.","flexwegAuth":"Clé API Flexweg refusée. Vérifiez la valeur dans votre compte Flexweg → API.","flexwegNetwork":"Erreur réseau lors du contact avec Flexweg. Vérifiez l'URL de base de l'API et votre connexion.","flexwegHttp":"Erreur API Flexweg ({{status}}) : {{detail}}","firestoreRulesTitle":"Firestore a refusé l'écriture de la configuration.","firestoreRulesHint":"Ouvrez Firebase Console → Firestore → Règles et vérifiez que l'email admin de bootstrap est bien '{{email}}'. Le README contient un modèle de règles à copier-coller.","firestoreOther":"Échec de l'écriture Firestore","uploadFailed":"Impossible d'uploader config.js sur Flexweg","generic":"Une erreur s'est produite."},"docstore":{"contentTitle":"Dépôt de contenu","contentIntro":"Là où vos articles, pages et réglages sont stockés en fichiers Markdown + JSON. Un dépôt vide convient — le CMS crée les fichiers.","provider":"Dépôt","localClone":"Dossier local (clone git)","localCloneHint":"Choisissez le dossier de votre clone. Synchronisez-le avec votre client git habituel — le CMS lit et écrit les fichiers, il n'exécute pas git.","contentDir":"Dossier du contenu dans le dépôt","privateRepo":"Utilisez un dépôt privé : les brouillons y sont stockés.","folderRequired":"Choisissez d'abord le dossier de contenu.","checking":"Vérification de l'accès au dépôt…","publishIntro":"Là où le site généré est publié. Modifiable plus tard dans les Réglages.","existingSite":"Ce dépôt est déjà configuré — le site continue d'être publié sur : {{target}}. Modifiable plus tard dans les Réglages (les clés secrètes éventuelles doivent y être ressaisies).","install":"Installer","steps":{"config":"Enregistrement de la configuration…","content":"Chargement du contenu…","target":"Enregistrement de la cible de publication…","testTarget":"Test de la cible de publication…"},"doneTitle":"C'est prêt !","doneBody":"La configuration est enregistrée dans ce navigateur. Pour éviter cette étape aux autres éditeurs, téléchargez config.js et remplacez celui du dossier admin de votre hébergement.","downloadConfig":"Télécharger config.js","open":"Ouvrir l'admin","footer":"Le contenu reste dans votre dépôt ou dans ce navigateur ; les jetons d'accès ne quittent jamais ce navigateur."},"data":{"title":"1. Où stocker vos données ?","intro":"Vos articles, pages, utilisateurs et réglages — les données de l'admin. C'est indépendant de l'endroit où le site public est hébergé (étape suivante).","localNote":"Rien à configurer : le contenu est stocké dans ce navigateur. Exportez-le depuis les Réglages pour le sauvegarder ou le déplacer plus tard.","options":{"sqlite-file":{"title":"SQLite","hint":"Une base SQLite stockée sur l'hébergement choisi à l'étape suivante (Flexweg, votre serveur, S3, Git…). Sans comptes utilisateurs — ou le service SQLite de Flexweg, avec comptes, si vous hébergez sur Flexweg."},"flexweg-sqlite":{"title":"SQLite (service Flexweg)","hint":"Une base SQLite gérée par le service Flexweg, avec comptes utilisateurs intégrés. Nécessite un compte Flexweg, quel que soit l'hébergement du site."},"firebase":{"title":"Firebase","hint":"Firestore + Firebase Auth dans votre projet Google. Temps réel, plan Spark gratuit."},"markdown-git":{"title":"Fichiers Markdown dans Git","hint":"Les articles sont des fichiers .md dans un dépôt GitHub / GitLab (ou un clone local). Chaque éditeur utilise son propre jeton ; chaque modification est un commit."},"local":{"title":"Ce navigateur","hint":"Un seul utilisateur, sans connexion, rien à configurer. Idéal pour un admin qui tourne sur votre ordinateur."}}},"hosting":{"title":"2. Où publier le site ?","intro":"Là où le site statique généré (HTML, CSS, images) est envoyé à chaque publication. Modifiable plus tard dans les Réglages.","existing":"Ce dépôt de contenu publie déjà sur la cible ci-dessous. Gardez-la ou choisissez-en une autre."},"install":{"title":"3. Installation","intro":"Vérifiez le récapitulatif, puis installez.","data":"Données","hosting":"Hébergement","saveTarget":"Enregistrement de la cible de publication…","noteConfigJs":"La configuration de l'admin (config.js) est envoyée à côté de l'admin sur Flexweg quand c'est possible ; sinon, vous pourrez la télécharger.","noteLocalConfig":"La configuration est enregistrée dans ce navigateur ; vous pourrez télécharger config.js à placer dans le dossier admin pour éviter cette étape aux autres éditeurs."},"sqliteFile":{"security":"Pas de comptes utilisateurs : toute personne qui peut ouvrir cet admin peut modifier le contenu — protégez le dossier de l'admin au niveau de l'hébergement. Le fichier de base est servi comme n'importe quel fichier : gardez-le chiffré, ou stockez-le dans un emplacement privé séparé.","intro":"Là où le fichier de base est stocké. Il est lu et enregistré par cet admin via les mêmes connecteurs que l'hébergement.","path":"Chemin du fichier de base","pathHint":"Créé au premier enregistrement s'il n'existe pas encore. Avec un dépôt Git, chaque enregistrement est un commit — préférez un dépôt ou une branche qui ne déclenche pas de build du site.","existing":"base existante","new":"nouvelle base","dataNote":"Rien à configurer ici : la base sera stockée sur l'hébergement choisi à l'étape suivante.","heading":"Base de données SQLite","flexwegService":"Utiliser le service SQLite de Flexweg","flexwegServiceHint":"La base est gérée par Flexweg et dispose de comptes utilisateurs intégrés (e-mail + mot de passe). Sinon, c'est un simple fichier sur cet hébergement, sans comptes.","summaryFile":"Fichier {{path}} sur cet hébergement","summaryService":"Service SQLite de Flexweg ({{path}})","encrypt":"Chiffrer la base","encryptHint":"Recommandé sur un hébergement public : le fichier est illisible sans la phrase secrète. Chaque nouveau navigateur la demande une fois.","passphrase":"Phrase secrète","passphraseHint":"Enregistrez-la maintenant dans votre gestionnaire de mots de passe : sans elle, personne ne peut ouvrir la base, pas même vous.","copy":"Copier","copied":"Copiée","generate":"Nouvelle","passphraseTooShort":"La phrase secrète doit faire au moins 12 caractères.","existingEncrypted":"Une base chiffrée existe déjà à cet emplacement : saisissez sa phrase secrète.","separate":"Stocker la base dans un emplacement privé séparé","separateHint":"Par ex. un bucket S3 / R2 privé ou un dépôt Git privé : la base n'est alors jamais servie par le site public.","summaryEncrypted":"chiffrée","summaryLocation":"stockée dans {{location}}","locationLabel":"Emplacement de la base","gitBranchNote":"La base est conservée sur la branche {{branch}} de ce dépôt, qui n'est jamais publiée : enregistrer un contenu ne relance pas la construction du site.","summaryBranch":"sur la branche {{branch}}"},"adminHosting":{"deploying":"Copie de l'admin sur le site…","label":"Héberger aussi l'admin sur ce site","hint":"L'admin est copié dans {{url}} avec son config.js (aucun secret dedans) — chaque éditeur pourra l'ouvrir là. Chacun se connecte toujours avec ses propres accès.","folder":"Dossier de l'admin","alreadyHere":"Cet admin tourne déjà depuis ce site : son config.js sera mis à jour sur place.","doneBody":"L'admin est maintenant sur votre site. Sur GitHub Pages, activez d'abord Pages pour le dépôt si ce n'est pas fait (Settings → Pages), puis ouvrez-le :","open":"Ouvrir l'admin en ligne","continueHere":"Continuer dans cet admin"}}`);
const flexweg$5 = { "actions": { "upload": "Upload du fichier", "delete": "Suppression du fichier", "rename": "Renommage du fichier", "get": "Lecture du fichier", "list": "Listing des fichiers", "createFolder": "Création du dossier", "renameFolder": "Renommage du dossier", "deleteFolder": "Suppression du dossier", "storageLimits": "Lecture des quotas de stockage", "commit": "Publication des modifications" }, "errors": { "configMissing": "La cible de publication n'est pas configurée. Configurez-la dans les Réglages avant de publier.", "network": "{{action}} : erreur réseau ou CORS bloqué. Vérifiez votre connexion.", "auth": "{{action}} : authentification échouée. Vérifiez les identifiants de la cible de publication dans les Réglages.", "notFound": "{{action}} : la cible est introuvable sur la cible de publication.", "tooLarge": "{{action}} : fichier trop volumineux pour la cible de publication.", "rateLimited": "{{action}} : trop de requêtes, veuillez réessayer dans un instant.", "serverError": "{{action}} : erreur serveur de la cible de publication ({{status}}). Veuillez réessayer.", "generic": "{{action}} a échoué ({{status}}){{detail}}.", "unsupported": "{{action}} : non pris en charge par la cible de publication « {{connector}} ».", "unknownConnector": "Cible de publication inconnue « {{connector}} ». Vérifiez Réglages → Cible de publication.", "folderAccess": "Pas d'accès au dossier local. Ouvrez Réglages → Cible de publication et cliquez sur « Reconnecter le dossier »." } };
const publish$5 = { "log": { "rendering": "Rendu de la page…", "uploading": "Upload de {{path}}…", "deleting": "Suppression de {{path}}…", "regenerating": "Régénération des listings…", "skipped": "{{path}} ignoré (aucun changement)", "done": "Publié sur {{url}}", "failed": "Échec : {{error}}" } };
const docstore$5 = { "errors": { "notConnected": "Non connecté au dépôt de contenu. Reconnectez-vous avec votre jeton d'accès.", "conflict": "Quelqu'un d'autre a modifié cet élément entre-temps. Sa version est maintenant affichée — réappliquez votre modification.", "sqliteUnsupported": "La cible « {{connector}} » ne peut pas stocker de fichier de base." } };
const connectors$5 = { "target": "Cible de publication", "settingsTitle": "Cible de publication", "settingsHelp": "Là où le site rendu est envoyé lors d'une publication. Les identifiants sont stockés avec votre backend de contenu (ou gardés dans ce navigateur pour les dépôts Git de contenu) et lisibles par tous les admins.", "saved": "Cible de publication enregistrée. Lancez Régénérer → Tout pour publier le site complet sur la nouvelle cible.", "test": "Tester la connexion", "testOk": "Connexion OK", "testFailed": "Échec de la connexion", "names": { "flexweg": "Flexweg", "git-pages": "Dépôt Git (GitHub Pages, Cloudflare Pages, GitLab Pages…)", "s3": "Bucket compatible S3 (AWS S3, Cloudflare R2, Backblaze B2, OVH…)", "php-bridge": "Votre propre serveur (bridge PHP)", "browser-mirror": "Télécharger en ZIP", "local-folder": "Dossier local sur cet ordinateur" }, "hints": { "flexweg": "Envoi via l'API Files de Flexweg.", "git-pages": "Chaque publication est un commit dans le dépôt ; l'hébergeur reconstruit le site à partir de lui.", "s3": "Nécessite une règle CORS sur le bucket autorisant l'origine de cet admin, et l'hébergement de site (ou un CDN) pour servir les index.html.", "php-bridge": "Déposez external/bridges/php/flexweg-bridge.php sur votre serveur, définissez sa clé d'API, puis renseignez son URL ici.", "browser-mirror": "Le site est conservé dans ce navigateur ; téléchargez le ZIP et déposez-le où vous voulez.", "local-folder": "Écrit le site directement dans un dossier (Chrome / Edge). Servez-le en local ou poussez-le avec vos outils." }, "fields": { "flexweg": { "apiKey": "Clé d'API", "siteUrl": "URL du site", "apiBaseUrl": "URL de base de l'API" }, "git-pages": { "host": "Hébergement", "provider": "Fournisseur Git", "owner": "Propriétaire (utilisateur ou organisation)", "repo": "Dépôt", "project": "Chemin du projet", "branch": "Branche", "dir": "Dossier dans le dépôt", "token": "Jeton d'accès", "siteUrl": "URL publique du site", "apiBaseUrl": "URL de l'API (auto-hébergé uniquement)" }, "s3": { "endpoint": "Endpoint", "region": "Région", "bucket": "Bucket", "prefix": "Préfixe des clés (optionnel)", "accessKeyId": "ID de clé d'accès", "secretAccessKey": "Clé d'accès secrète", "siteUrl": "URL publique du site", "forcePathStyle": "URL de type chemin (MinIO, R2, la plupart des compatibles)", "publicRead": "Rendre les fichiers publics (ACL public-read) — pour les buckets qui ne sont pas publics via une politique (OVHcloud, Scaleway…). À laisser décoché sur les buckets AWS qui imposent « bucket owner enforced »." }, "php-bridge": { "apiBaseUrl": "URL du bridge", "apiKey": "Clé d'API du bridge", "siteUrl": "URL publique du site" }, "browser-mirror": { "siteUrl": "URL publique du site (optionnel)" }, "local-folder": { "siteUrl": "URL où le dossier est servi (optionnel)" } }, "help": { "flexweg": { "apiKey": "Générée depuis votre compte Flexweg → API." }, "git-pages": { "host": "Cloudflare Pages : reliez le projet à ce dépôt sans commande de build, avec le dossier de sortie ci-dessous. Fonctionne avec les dépôts privés.", "dir": 'Laissez vide pour la racine. GitHub Pages : "" ou "docs". GitLab Pages : "public".', "token": "Jeton fine-grained sur ce dépôt avec Contents : lecture/écriture (GitHub) — ajoutez Pages : lecture/écriture pour que le CMS active GitHub Pages — ou jeton avec le scope api (GitLab). Laissez vide pour utiliser le jeton de chaque éditeur quand le contenu est chez le même fournisseur.", "siteUrl": "ex. https://user.github.io/repo — une URL avec sous-dossier fonctionne, les liens sont ajustés automatiquement." }, "s3": { "endpoint": "Laissez vide pour AWS (déduit de la région). R2 : https://<account-id>.r2.cloudflarestorage.com", "siteUrl": "L'URL d'hébergement du bucket ou votre domaine CDN." }, "php-bridge": { "apiBaseUrl": "L'URL complète de flexweg-bridge.php sur votre serveur (HTTPS)." }, "browser-mirror": { "siteUrl": "Là où vous déposerez le ZIP — sert aux URL absolues (sitemaps, RSS, médias)." }, "local-folder": { "siteUrl": "ex. http://localhost:8080 quand un serveur web local sert le dossier." } }, "options": { "github-pages": "GitHub Pages", "cloudflare-pages": "Cloudflare Pages (relié au dépôt)", "gitlab-pages": "GitLab Pages", "other": "Autre (Netlify, Vercel, git pull serveur…)", "github": "GitHub", "gitlab": "GitLab" }, "folder": { "choose": "Choisir un dossier…", "change": "Changer de dossier…", "reconnect": "Reconnecter le dossier", "unsupported": "Ce navigateur ne peut pas écrire dans un dossier local. Utilisez Chrome ou Edge." }, "mirror": { "download": "Télécharger le site (ZIP)", "count": "{{count}} fichiers dans ce navigateur" }, "adminHosting": { "title": "Admin sur ce site", "help": "Copie cet admin sur la cible de publication (premier déploiement, ou mise à jour après une nouvelle version). Son config.js ne contient aucun secret.", "deploy": "Déployer / mettre à jour l'admin", "deployed": "Admin déployé ({{count}} fichiers) — {{url}}" }, "pages": { "enabled": "GitHub Pages activé pour ce dépôt — le site sera en ligne dans une minute environ.", "enableHint": "Publication réussie. Pour mettre le site en ligne, activez GitHub Pages pour {{repo}} : Settings → Pages → Deploy from a branch → {{branch}} / {{folder}}. (Ou donnez au jeton la permission « Pages : read and write » et le CMS le fera.)" }, "siteUrl": { "mismatch": "L'URL publique du site (Réglages → Site) est {{site}}, mais cette cible sert le site à {{target}}. Les liens, le CSS et les sitemaps suivent l'URL du site — ils seront faux sur cet hébergement.", "use": "Utiliser {{url}} pour le site", "updated": "URL du site mise à jour. Lancez Régénérer → Tout pour republier les pages avec les nouveaux liens." } };
const gitAccess$5 = { "heading": "Connexion au dépôt de contenu", "tokenIntro": "Le contenu est stocké dans le dépôt {{provider}} {{repo}}. Connectez-vous avec votre propre jeton d'accès personnel — vos droits sur le dépôt déterminent votre rôle (écriture = éditeur, admin / maintainer = admin).", "token": "Jeton d'accès personnel", "tokenHelpGithub": "Jeton fine-grained, limité à ce dépôt, permission Contents : lecture et écriture.", "tokenHelpGitlab": "Jeton avec le scope api, rôle Developer ou plus sur ce projet.", "createToken": "Créer un jeton", "connect": "Se connecter", "tokenStorage": "Le jeton est conservé dans ce navigateur uniquement. La déconnexion l'efface.", "failed": "Ce jeton ne permet pas d'écrire dans le dépôt (invalide, expiré ou en lecture seule). Vérifiez ses permissions.", "folderIntro": "Le contenu est stocké dans un dossier de cet ordinateur (en général un clone git que vous synchronisez avec votre client git). Autorisez ce navigateur à y accéder — il redemande l'accès après chaque rechargement.", "openFolder": "Ouvrir le dossier de contenu" };
const hosting$5 = { "flexweg": { "title": "Flexweg", "short": "Hébergement Flexweg", "hint": "Envoi via l'API Files de Flexweg. Clé d'API depuis votre compte Flexweg." }, "github-pages": { "title": "GitHub Pages", "short": "Gratuit, depuis un dépôt GitHub", "hint": "Chaque publication est un commit dans le dépôt ; GitHub Pages le sert. Settings → Pages → Deploy from a branch. Dépôts publics sur le plan gratuit." }, "cloudflare-pages": { "title": "Cloudflare Pages", "short": "Gratuit, dépôts privés OK", "hint": "Le CMS commite le site dans un dépôt GitHub / GitLab ; reliez-y un projet Cloudflare Pages (sans commande de build, dossier de sortie = le dossier ci-dessous)." }, "gitlab-pages": { "title": "GitLab Pages", "short": "Gratuit, depuis un dépôt GitLab", "hint": "Chaque publication est un commit ; le CMS ajoute un .gitlab-ci.yml minimal qui publie le dossier public/." }, "git-other": { "title": "Netlify, Vercel…", "short": "Tout hébergeur qui déploie un dépôt", "hint": "Le CMS commite le site dans un dépôt Git ; reliez votre hébergeur (Netlify, Vercel, serveur avec git pull…) à ce dépôt." }, "s3": { "title": "S3 / R2 / B2…", "short": "Bucket de stockage objet", "hint": "AWS S3, Cloudflare R2, Backblaze B2, OVH, Scaleway, MinIO… Nécessite une règle CORS sur le bucket et l'hébergement de site ou un CDN devant." }, "own-server": { "title": "Votre serveur (FTP / SFTP)", "short": "Mutualisé, VPS…", "hint": "Un navigateur ne sait pas parler FTP ni SFTP : déposez une fois le bridge PHP (external/bridges/php/flexweg-bridge.php) avec votre client FTP, définissez sa clé d'API, puis renseignez son URL ici. Fonctionne sur tout hébergement PHP." }, "local-folder": { "title": "Dossier local", "short": "Sur cet ordinateur", "hint": "Écrit le site dans un dossier de cet ordinateur (Chrome / Edge). Servez-le en local ou poussez-le avec vos outils." }, "zip": { "title": "Télécharger en ZIP", "short": "À déposer à la main", "hint": "Le site est conservé dans ce navigateur ; téléchargez un ZIP depuis les Réglages et déposez-le où vous voulez (Netlify Drop, client FTP…)." } };
const sqliteAccess$5 = { "heading": "Connexion à la base de données", "intro": "Cet admin stocke son contenu dans {{path}}. Saisissez les identifiants d'accès pour ce navigateur.", "storage": "Les identifiants sont conservés dans ce navigateur uniquement. La déconnexion les efface.", "passphrase": "Phrase secrète de la base", "passphraseHint": "La base est chiffrée. Saisissez la phrase secrète choisie à l'installation (conservée dans ce navigateur uniquement).", "passphraseWrong": "Phrase secrète incorrecte : la base n'a pas pu être ouverte.", "passphraseMissing": "Saisissez la phrase secrète de la base." };
const fr = {
  common: common$5,
  auth: auth$5,
  nav: nav$5,
  dashboard: dashboard$5,
  posts: posts$5,
  pages: pages$5,
  taxonomies: taxonomies$5,
  media: media$5,
  themes: themes$5,
  plugins: plugins$5,
  externalInstall: externalInstall$5,
  externalLoader: externalLoader$5,
  menus: menus$5,
  settings: settings$5,
  users: users$5,
  firestoreSetup: firestoreSetup$5,
  errors: errors$5,
  identity: identity$5,
  setup: setup$5,
  flexweg: flexweg$5,
  publish: publish$5,
  docstore: docstore$5,
  connectors: connectors$5,
  gitAccess: gitAccess$5,
  hosting: hosting$5,
  sqliteAccess: sqliteAccess$5
};
const common$4 = { "save": "Speichern", "saving": "Speichert…", "saved": "Gespeichert", "cancel": "Abbrechen", "delete": "Löschen", "deleting": "Wird gelöscht…", "edit": "Bearbeiten", "create": "Erstellen", "search": "Suchen", "loading": "Lädt…", "yes": "Ja", "no": "Nein", "confirm": "Bestätigen", "back": "Zurück", "next": "Weiter", "previous": "Vorherige", "close": "Schließen", "all": "Alle", "none": "Keine", "actions": "Aktionen", "name": "Name", "slug": "Slug", "description": "Beschreibung", "status": "Status", "createdAt": "Erstellt", "updatedAt": "Aktualisiert", "publishedAt": "Veröffentlicht", "language": "Sprache", "darkMode": "Dunkelmodus", "lightMode": "Hellmodus", "signOut": "Abmelden", "administrator": "Administrator", "editor": "Redakteur", "appName": "AgentCMS" };
const auth$4 = { "signIn": "Anmelden", "signingIn": "Anmeldung läuft…", "email": "E-Mail", "password": "Passwort", "emailPlaceholder": "sie@firma.com", "passwordPlaceholder": "••••••••", "forgotPassword": "Passwort vergessen?", "resetEmailSent": "E-Mail zum Zurücksetzen des Passworts wurde an {{email}} gesendet.", "enterEmailFirst": "Geben Sie zuerst Ihre E-Mail-Adresse oben ein und klicken Sie dann auf Zurücksetzen.", "emailPasswordRequired": "E-Mail und Passwort sind erforderlich.", "signInSubtitle": "Verwenden Sie Ihre Geschäfts-E-Mail und Ihr Passwort.", "footer": "Kontoanfragen erfolgen über Ihren Administrator.", "errors": { "invalidEmail": "Ungültige E-Mail-Adresse.", "invalidCredentials": "Ungültige E-Mail-Adresse oder ungültiges Passwort.", "tooManyRequests": "Zu viele Versuche. Versuchen Sie es später erneut oder setzen Sie Ihr Passwort zurück.", "userDisabled": "Dieses Konto wurde deaktiviert.", "networkFailed": "Netzwerkfehler. Überprüfen Sie Ihre Verbindung.", "generic": "Authentifizierung fehlgeschlagen." } };
const nav$4 = { "openMenu": "Menü öffnen", "closeMenu": "Menü schließen", "dashboard": "Übersicht", "posts": "Artikel", "pages": "Seiten", "taxonomies": "Kategorien & Schlagwörter", "media": "Medien", "themes": "Themes", "themeSettings": "Theme-Einstellungen", "plugins": "Plugins", "menus": "Menüs", "users": "Benutzer", "settings": "Einstellungen" };
const dashboard$4 = { "title": "Übersicht", "welcome": "Willkommen zurück, {{email}}.", "stats": { "totalPosts": "Artikel", "totalPages": "Seiten", "online": "Online", "drafts": "Entwürfe" } };
const posts$4 = { "title": "Artikel", "newPost": "Neuer Artikel", "noPosts": "Noch keine Artikel. Erstellen Sie Ihren ersten Artikel, um zu beginnen.", "noPostsInFilter": "Keine Artikel entsprechen dem aktuellen Filter.", "search": { "placeholder": "Artikel suchen…", "clear": "Suche leeren", "noResults": "Keine Artikel entsprechen Ihrer Suche." }, "pagination": { "previous": "Zurück", "next": "Weiter", "showing": "Zeige {{from}}–{{to}} von {{total}}", "pageOf": "Seite {{page}} von {{total}}" }, "bulk": { "selectedCount_one": "{{count}} ausgewählt", "selectedCount_other": "{{count}} ausgewählt", "selectPage_one": "{{count}} auf dieser Seite auswählen", "selectPage_other": "Alle {{count}} auf dieser Seite auswählen", "deselectPage": "Seite abwählen", "allOnPageSelected_one": "{{count}} auf dieser Seite ausgewählt.", "allOnPageSelected_other": "Alle {{count}} auf dieser Seite ausgewählt.", "selectAllMatching_one": "Den passenden Artikel auswählen", "selectAllMatching_other": "Alle {{count}} passenden Artikel auswählen", "allMatchingSelected_one": "Der passende Artikel ist ausgewählt.", "allMatchingSelected_other": "Alle {{count}} passenden Artikel sind ausgewählt.", "selectOne": '„{{title}}" auswählen', "publish": "Veröffentlichen ({{count}})", "publishing": "Wird veröffentlicht…", "publishedCount": "{{ok}} veröffentlicht, {{failed}} fehlgeschlagen.", "unpublish": "Zurückziehen ({{count}})", "unpublishing": "Wird zurückgezogen…", "unpublishedCount": "{{ok}} zurückgezogen, {{failed}} fehlgeschlagen.", "delete": "Löschen", "deleting": "Wird gelöscht…", "deletedCount": "{{ok}} gelöscht, {{failed}} fehlgeschlagen.", "confirmDelete_one": "{{count}} Artikel löschen? Damit wird er von Flexweg zurückgezogen und kann nicht wiederhergestellt werden.", "confirmDelete_other": "{{count}} Artikel löschen? Damit werden sie von Flexweg zurückgezogen und können nicht wiederhergestellt werden.", "noDraftSelected": "Keine Entwürfe ausgewählt.", "noOnlineSelected": "Keine veröffentlichten Artikel ausgewählt.", "clear": "Auswahl leeren" }, "filters": { "all": "Alle", "draft": "Entwurf", "online": "Online" }, "fields": { "title": "Titel", "slug": "Slug", "excerpt": "Auszug", "content": "Inhalt", "category": "Kategorie", "tags": "Schlagwörter", "heroImage": "Beitragsbild", "seoTitle": "SEO-Titel", "seoDescription": "SEO-Beschreibung", "createdAt": "Erstellt am", "updatedAt": "Zuletzt aktualisiert", "publishedAt": "Veröffentlicht am" }, "edit": { "newTitle": "Neuer Artikel", "editTitle": "Artikel bearbeiten", "saved": "Gespeichert.", "savedAndRepublished": "Gespeichert und neu veröffentlicht.", "saveFailed": "Speichern fehlgeschlagen.", "saveAndRepublish": "Speichern & neu veröffentlichen", "draftSaved": "Entwurf gespeichert.", "slugCollision": { "post": 'Diese URL wird bereits vom Artikel verwendet: "{{label}}".', "page": 'Diese URL wird bereits von der Seite verwendet: "{{label}}".', "category": 'Diese URL wird bereits von der Kategorie verwendet: "{{label}}".' }, "publish": "Veröffentlichen", "unpublish": "Zurückziehen", "publishing": "Veröffentlicht…", "unpublishing": "Wird zurückgezogen…", "titlePlaceholder": "Titel hinzufügen", "permalink": "Permalink", "slugFormatHint": "Nur Kleinbuchstaben, ASCII, Bindestriche.", "slugAutoSuffixed": 'Suffix hinzugefügt, da "{{base}}" bereits von {{owner}} verwendet wird.', "slugAutoSuffixedOwner": { "post": 'Beitrag: "{{label}}"', "page": 'Seite: "{{label}}"', "category": 'Kategorie: "{{label}}"' }, "saveBlocked": { "titleRequired": "Fügen Sie vor dem Speichern einen Titel hinzu.", "slugRequired": "Ein Titel und ein URL-Slug sind zum Speichern erforderlich.", "slugInvalid": "Ungültiges Slug-Format (Kleinbuchstaben ASCII + Bindestriche).", "slugCollision": "Lösen Sie den URL-Konflikt vor dem Speichern." }, "viewPublished": "Ansehen", "confirmDelete": "Diesen Eintrag löschen?", "inspector": { "document": "Dokument", "block": "Block", "blockEmpty": "Wählen Sie einen Block im Editor, um seine Optionen anzuzeigen.", "publishing": "Veröffentlichung", "permalink": "Permalink", "categories": "Kategorien & Schlagwörter", "featured": "Beitragsbild", "seo": "SEO", "excerpt": "Auszug", "dates": "Datumsangaben" }, "blocks": { "addBlock": "Block hinzufügen", "transform": "Umwandeln in", "moveUp": "Nach oben verschieben", "moveDown": "Nach unten verschieben", "duplicate": "Duplizieren", "remove": "Block löschen", "paragraph": "Absatz", "heading2": "Überschrift 2", "heading3": "Überschrift 3", "bulletList": "Aufzählung", "orderedList": "Nummerierte Liste", "blockquote": "Zitat", "codeBlock": "Code", "image": "Bild", "horizontalRule": "Trenner", "categories": { "text": "Text", "media": "Medien", "layout": "Layout", "embed": "Einbettungen", "advanced": "Erweitert" }, "noSettings": "Dieser Block hat keine Einstellungen.", "noSelection": "Wählen Sie einen Block im Editor, um seine Optionen anzuzeigen.", "slash": { "noResults": "Kein passender Block." } } }, "status": { "draft": "Entwurf", "online": "Online" }, "preview": { "title": "Vorschau", "rendering": "Vorschau wird gerendert…", "error": "Vorschau fehlgeschlagen: {{error}}", "viewports": { "mobile": "Mobil", "tablet": "Tablet", "desktop": "Desktop" } } };
const pages$4 = { "title": "Seiten", "newPage": "Neue Seite", "noPages": "Noch keine Seiten.", "homeBadge": "Startseite", "homeBadgeTooltip": "Wird als Startseite der Website verwendet" };
const taxonomies$4 = { "title": "Kategorien & Schlagwörter", "categories": "Kategorien", "tags": "Schlagwörter", "newCategory": "Neue Kategorie", "newTag": "Neues Schlagwort", "noCategories": "Noch keine Kategorien.", "noTags": "Noch keine Schlagwörter.", "slugCollision": 'Dieser Slug wird bereits von "{{label}}" verwendet.', "seo": { "button": "SEO", "buttonTitle": "SEO-Meta-Tags bearbeiten", "title": "SEO-Meta-Tags", "subtitle": 'Eigener Titel und Beschreibung für die Archivseite "{{name}}".', "metaTitle": "Meta-Titel", "metaTitleHint": "Wird als Seiten-<title> verwendet. Standard: der Name des Begriffs.", "metaDescription": "Meta-Beschreibung", "metaDescriptionHint": "Wird als Meta-Beschreibung der Seite verwendet. Standard: die Beschreibung des Begriffs." } };
const media$4 = { "title": "Medienbibliothek", "upload": "Hochladen", "uploading": "Lädt hoch…", "finalizing": "Wird abgeschlossen…", "uploadFailed": "Hochladen fehlgeschlagen", "retry": "Erneut versuchen", "noMedia": "Noch keine Medien.", "alt": "Alt-Text", "caption": "Bildunterschrift", "filename": "Dateiname", "size": "Größe", "type": "Typ" };
const themes$4 = { "title": "Themes", "active": "Aktiv", "activate": "Aktivieren", "installExternal": "Theme installieren", "uninstallDisabledTitle": "Wechseln Sie zu einem anderen Theme, bevor Sie dieses deinstallieren.", "syncAssets": "Theme-Assets synchronisieren", "regenerateSite": "Website neu generieren", "regenerating": "Generiert neu…", "regenerate": { "button": "Neu generieren", "running": "Wird ausgeführt…", "groupBuiltins": "Website", "groupPlugins": "Plugins", "home": "Nur Startseite", "homeHelp": "Generiert nur index.html neu — schnellste Option.", "allHtml": "Alle HTML-Seiten", "allHtmlHelp": "Alle Beiträge, Seiten, Archive und Listen — plus Menu / Posts / Authors JSON-Snapshots.", "repair": "URLs reparieren", "repairHelp": "Berechnet die kanonische URL jedes veröffentlichten Beitrags neu und verschiebt Dateien, die unter der falschen URL gelandet sind. Nützlich nach einem Import, der vor der Synchronisierung der Begriffe lief.", "assets": "Theme-Assets", "assetsHelp": "Lädt CSS + Begleit-Skripte des aktiven Themes nach /theme-assets/ hoch.", "everything": "Alles", "everythingHelp": "Theme-Assets + alle HTML + jede Plugin-Ausgabe. Langsamste Option.", "noPluginTargets": "Keine Plugin-Neugenerierungen — aktivieren Sie ein Plugin, das Neugenerieren unterstützt." }, "confirmSwitch": { "title": "Zu {{theme}} wechseln?", "body": "Beim Theme-Wechsel müssen die Theme-Assets erneut hochgeladen und alle veröffentlichten Seiten neu generiert werden, damit das neue Aussehen überall greift. Das kann einen Moment dauern.", "confirm": "Wechseln & neu generieren", "cancel": "Abbrechen" } };
const plugins$4 = { "title": "Plugins", "enabled": "Aktiviert", "disabled": "Deaktiviert", "enable": "Aktivieren", "disable": "Deaktivieren", "configure": "Konfigurieren", "author": "Autor", "learnMore": "Mehr erfahren", "mustUseBadge": "Pflicht", "installExternal": "Plugin installieren", "tabs": { "regular": "Plugins", "mustUse": "Pflicht-Plugins" } };
const externalInstall$4 = { "titlePlugin": "Plugin installieren", "titleTheme": "Theme installieren", "labelPlugin": "Plugin", "labelTheme": "Theme", "intro": "Ziehen Sie eine ZIP-Datei mit einem {{label}}-Bundle hierher (manifest.json + bundle.js im ZIP-Root). Das {{label}} wird auf Ihre Flexweg-Site hochgeladen und nach einem Neuladen registriert. Ein erneuter Upload eines ZIP mit derselben Manifest-ID aktualisiert den vorhandenen Eintrag direkt — keine Deinstallation nötig.", "zipField": "Bundle-ZIP-Datei", "install": "Installieren", "installing": "Installiert…", "installSuccess": "{{name}} installiert ({{count}} Dateien hochgeladen). Lädt neu…", "upgradeSuccess": "{{name}} von v{{previousVersion}} auf v{{newVersion}} aktualisiert ({{count}} Dateien hochgeladen). Lädt neu…", "installedTitle": "Bereits installiert", "bundledDefaultsTitle": "Mitgelieferte Standard-Plugins/Themes verfügbar", "bundledDefaultsHint": "{{count}} mitgeliefertes Plugin/Theme ist derzeit deinstalliert. Stellen Sie sie wieder her, um den Auslieferungszustand dieser Admin-Version wiederherzustellen.", "bundledDefaultsRestore": "Wiederherstellen", "bundledDefaultsRestored": "{{plugins}} Plugin(s) und {{themes}} Theme(s) wiederhergestellt. Lädt neu…", "uninstall": "Deinstallieren", "uninstallSuccess": "{{id}} deinstalliert. Lädt neu…", "confirmUninstall": "{{id}} deinstallieren? Die Dateien werden von Flexweg gelöscht.", "errors": { "no-manifest": "Im ZIP fehlt manifest.json im Root.", "invalid-manifest": "manifest.json ist ungültig (fehlende Pflichtfelder oder kein gültiges JSON).", "incompatible-api": "Das Bundle wurde gegen eine inkompatible Runtime-API-Version gebaut.", "no-bundle": "Das ZIP enthält die im Manifest deklarierte Einstiegsdatei nicht.", "fetch-manifest": "Die aktuelle external.json auf Flexweg konnte nicht gelesen werden.", "upload-failed": "Upload fehlgeschlagen — prüfen Sie Ihren Flexweg-API-Schlüssel und Ihre Verbindung." } };
const externalLoader$4 = { "someFailed": "{{count}} externe(s) Bundle(s) konnten nicht geladen werden. Siehe Browser-Konsole." };
const menus$4 = { "title": "Menüs", "header": "Kopfzeilen-Menü", "footer": "Fußzeilen-Menü", "label": "Beschriftung", "saveAndPublish": "Speichern & generieren", "discard": "Verwerfen", "saved": "Menüs gespeichert und veröffentlicht.", "saveFailed": "Menüs konnten nicht gespeichert werden.", "unsavedChanges": "Sie haben ungespeicherte Änderungen." };
const settings$4 = { "title": "Einstellungen", "tabs": { "general": "Allgemein" }, "site": { "title": "Website", "siteTitle": "Website-Titel", "siteDescription": "Website-Beschreibung", "siteLanguage": "Website-Sprache", "siteLanguageHelp": 'BCP-47-Tag (z. B. en, fr-CA), der auf jeder veröffentlichten Seite in <html lang="…"> eingefügt wird. Der Präfix wird mit den unterstützten Übersetzungslocales für Sitemap-/RSS-Labels und im Theme eingebaute Texte abgeglichen; nicht unterstützte Locales fallen auf Englisch zurück.', "siteLanguageResolved": "Übersetzungen verwenden: {{label}}", "baseUrl": "Öffentliche Website-URL", "postsPerPage": "Artikel pro Seite", "homeMode": "Startseiten-Inhalt", "homeLatest": "Neueste Artikel", "homeStatic": "Statische Seite", "homePage": "Startseite", "discourageIndexing": "Suchmaschinen davon abhalten, diese Website zu indexieren", "discourageIndexingHelp": "Wenn aktiviert, erhält jede veröffentlichte Seite ein noindex/nofollow-Meta-Tag und robots.txt sperrt alle Crawler aus. Entspricht dem Verhalten von WordPress — nützlich für Staging-Websites oder Prüfungen vor dem Launch. Suchmaschinen, die die Anweisung respektieren, indexieren die Website nicht.", "discourageRegenerateHint": "Indexierungseinstellung gespeichert. Klicken Sie unter Themes auf „Alles neu generieren“, um die Änderung auf alle veröffentlichten Seiten und robots.txt anzuwenden." }, "flexweg": { "title": "Flexweg-API", "apiKey": "API-Schlüssel", "apiKeyHelp": "Erstellt in Ihrem Flexweg-Konto → API.", "siteUrl": "Website-URL", "siteUrlHelp": "Öffentliche URL Ihrer Flexweg-Website ohne abschließenden Schrägstrich.", "apiBaseUrl": "API-Basis-URL", "storageHelpFirebase": "In Firestore gespeichert (config/flexweg). Lesbar für jedes angemeldete Teammitglied, schreibbar nur für Administratoren.", "storageHelpSqlite": "In der lokalen SQLite-Tabelle config gespeichert. Lesbar für jedes angemeldete Teammitglied, schreibbar nur für Administratoren." }, "backend": { "title": "Daten-Backend", "active": "Aktives Backend:", "switchButton": "Backend wechseln…", "confirmTitle": "Alle aktuellen Daten gehen verloren.", "confirmBody": "Beim Wechsel wird die In-Browser-Konfiguration gelöscht und das Setup-Formular erneut geladen. Das neue Backend startet leer — die Daten des vorherigen Backends bleiben an Ort und Stelle (in Firestore oder als .sqlite-Datei auf Flexweg), aber das CMS liest sie erst wieder, wenn Sie zurückwechseln.", "confirmYes": "Ja, Backend wechseln", "downloadBackup": "Backup der .sqlite-Datei herunterladen", "downloadBackupHelp": "vor dem Wechsel des Backends durchführen.", "markdownGit": "Markdown — {{source}}", "localFolder": "lokaler Ordner", "localBrowser": "Dieser Browser (lokal, ein Benutzer)", "sqliteFile": "SQLite-Datei — {{location}}" }, "performance": { "title": "Leistung", "help": "Wie das Admin-Backend Beiträge und Seiten lädt. Der Standardmodus funktioniert auf dem kostenlosen Firestore-Plan ohne Setup; der paginierte Modus ist für sehr große Sites und erfordert eine einmalige Index-Einrichtung.", "mode": "Lademodus", "modeGlobal": "Standard (keine Einrichtung erforderlich)", "modePaginated": "Serverseitige Paginierung (Firestore-Indizes erforderlich)", "globalHelp": "Lädt die gesamte Posts-Sammlung in einem Live-Abonnement. Sortierung, Filter und Suche im Speicher. Empfohlen für Sites mit weniger als ~5 000 Beiträgen.", "paginatedHelp": "Cursor-paginierte Abonnements, eine Seite gleichzeitig. Erfordert zusammengesetzte Firestore-Indizes — siehe README. Empfohlen für sehr große Sites.", "savedReload": "Gespeichert. Lade das Admin neu, um den neuen Modus anzuwenden." }, "editor": { "title": "Editor", "help": "Typografie für den Artikel-/Seiten-Editor. Unabhängig vom öffentlichen Theme.", "fontFamily": "Schriftfamilie", "bodySize": "Textgröße", "h1Size": "H1-Größe", "h2Size": "H2-Größe", "h3Size": "H3-Größe", "sizeHelp": "CSS-Länge, z. B. 16px oder 1rem. Leer lassen für Standard.", "reset": "Auf Standard zurücksetzen" }, "profile": { "title": "Profil", "adminLocale": "Admin-Sprache", "adminLocaleHelp": "Sprache, die von der Admin-Oberfläche verwendet wird. Im Profil gespeichert.", "firstName": "Vorname", "lastName": "Nachname", "headline": "Titel", "headlinePlaceholder": "z. B. Journalist, Chefredakteur…", "headlineHelp": "Wird öffentlich unter Ihrem Namen in Autorenkarten und auf Ihrer Archivseite angezeigt.", "bio": "Biografie", "bioPlaceholder": "Ein kurzer Absatz, der auf Ihrer Autorenseite und unter Ihren Artikeln angezeigt wird.", "bioHelp": "Sichtbar auf der öffentlichen Website in der Autoren-Seitenleiste und auf der Autoren-Archivseite.", "socials": "Soziale Profile", "socialsHelp": 'Geben Sie die URLs der Profile ein, die Sie auf der öffentlichen Website zeigen möchten, und aktivieren Sie „Anzeigen" für die sichtbaren. Leere URLs werden ignoriert.', "socialsShow": "Anzeigen", "socialsShowHelp": "Schaltet die Sichtbarkeit dieses Netzwerks auf der öffentlichen Website um.", "avatar": "Profilbild", "avatarHelp": "Wählen Sie ein Bild aus Ihrer Medienbibliothek. Quadratische Bilder werden am besten dargestellt.", "pickAvatar": "Aus Medien auswählen", "changeAvatar": "Bild ändern", "removeAvatar": "Entfernen", "save": "Profil speichern" }, "transfer": { "title": "Inhalte verschieben oder sichern", "help": "Exportieren Sie alles (Beiträge, Seiten, Kategorien, Medien-Metadaten, Profile, Einstellungen) als eine JSON-Datei. Bei einem Markdown- oder lokalen Backend können Sie eine solche Datei importieren, wobei die IDs erhalten bleiben — so migrieren Sie von Firebase oder SQLite. Mediendateien und geheime Schlüssel sind nicht enthalten.", "export": "Inhalte exportieren (JSON)", "import": "Inhalte importieren…", "modeMerge": "Zusammenführen (gleiche IDs überschreiben)", "modeReplace": "Importierte Sammlungen ersetzen", "replaceConfirm": "Der Ersetzen-Modus löscht vor dem Import alle vorhandenen Einträge der in der Datei enthaltenen Sammlungen. Fortfahren?", "invalidFile": "Diese Datei ist kein Inhaltsexport von AgentCMS.", "imported": "{{posts}} Beiträge/Seiten, {{terms}} Begriffe und {{media}} Medien importiert. Führen Sie Neu generieren → Alles aus, um sie zu veröffentlichen." }, "encryption": { "title": "Datenbankverschlüsselung:", "on": "an", "off": "aus", "onHelp": "Die Datenbankdatei ist ohne Passphrase unlesbar. Eine Änderung speichert die Datei mit neuem Schlüssel; andere Browser fragen nach der neuen Passphrase.", "offHelp": "Die Datenbankdatei ist für jeden lesbar, der sie herunterladen kann (ein statisches Hosting liefert sie wie jede Seite aus). Verschlüssele sie mit einer Passphrase.", "enable": "Datenbank verschlüsseln…", "change": "Passphrase ändern…", "savedConfirm": "Ich habe diese Passphrase in meinem Passwort-Manager gespeichert — ohne sie lässt sich der Inhalt nicht öffnen.", "enableConfirm": "Jetzt verschlüsseln", "changeConfirm": "Passphrase ändern", "done": "Datenbank mit der neuen Passphrase gespeichert." } };
const users$4 = { "title": "Benutzer", "noUsers": "Noch keine Benutzer.", "role": "Rolle", "disabled": "Deaktiviert", "editProfileTitle": "Profil bearbeiten — {{email}}", "profileSaved": "Profil gespeichert.", "descriptionFirebase": "Verwalten Sie Ihr Team. Neue Konten werden in der Firebase Console angelegt und beim ersten Login hier gespiegelt.", "descriptionSqlite": "Verwalten Sie Ihr Team. Nutzen Sie unten den Knopf +Benutzer hinzufügen, um Konten direkt anzulegen.", "addUser": "Benutzer hinzufügen", "addUserSuccess": "{{email}} hinzugefügt.", "removeConfirmFirebase": "Datensatz von {{email}} löschen? Damit werden Profil und Rolle aus dem CMS entfernt. Um den Login-Zugang zu entziehen, löschen Sie das Konto zusätzlich in der Firebase Console.", "removeConfirmSqlite": "{{email}} dauerhaft löschen? Damit wird der Login-Zugang entzogen UND Profil sowie Rolle entfernt. Diese Aktion kann nicht rückgängig gemacht werden.", "empty": { "title": "Noch keine Teammitglieder", "descriptionFirebase": "Legen Sie das erste Konto in der Firebase Console an und melden Sie sich hier einmal an, um das Profil zu registrieren.", "descriptionSqlite": "Klicken Sie oben auf +Benutzer hinzufügen, um das erste Teammitglied einzuladen." }, "help": { "title": "So fügen Sie ein neues Teammitglied hinzu", "bootstrapLine": "Der Bootstrap-Admin (immer voller Zugriff) ist:", "firebase": { "step1": "Öffnen Sie Firebase Console → Authentication → Add user.", "step2": "Legen Sie E-Mail und Passwort fest und übermitteln Sie diese dem neuen Mitglied.", "step3": "Bitten Sie es, sich hier einmal anzumelden — das Profil erscheint in der Liste oben und Sie können Rolle und Details bearbeiten." }, "sqlite": { "step1": "Klicken Sie oben auf den Knopf +Benutzer hinzufügen.", "step2": "Geben Sie die E-Mail und ein temporäres Passwort (mindestens 8 Zeichen) ein.", "step3": "Teilen Sie die Zugangsdaten sicher mit — das Passwort kann nach dem Login aus dem Profil heraus geändert werden." }, "git": { "step1": "Fügen Sie die Person als Mitwirkende des Content-Repositorys hinzu (Schreibzugriff = Redakteur, Admin / Maintainer = Admin).", "step2": "Die Person erstellt ihr eigenes persönliches Zugriffstoken auf GitHub / GitLab.", "step3": "Sie öffnet den Admin-Bereich und meldet sich mit diesem Token an — ihr Profil wird hier automatisch angelegt." } }, "addUserModal": { "title": "Neues Teammitglied hinzufügen", "intro": "Legt das Konto direkt in der Flexweg SQLite Auth-Datenbank an. Der neue Benutzer erhält standardmäßig die Editor-Rolle; befördern Sie ihn aus der Liste unten, wenn er Admin-Zugriff benötigt.", "submit": "Benutzer anlegen", "submitting": "Wird angelegt…" }, "actions": { "editProfile": "Profil bearbeiten", "promote": "Zum Administrator befördern", "demote": "Auf Redakteur herabstufen", "disable": "Deaktivieren", "enable": "Aktivieren", "delete": "Datensatz löschen" }, "descriptionGit": "Teammitglieder sind die Personen mit Schreibzugriff auf das Content-Repository. Sie erscheinen hier nach ihrer ersten Anmeldung; ihre Rolle richtet sich nach ihren Repository-Berechtigungen.", "descriptionLocal": "Dieser Admin läuft im Einzelbenutzermodus: Inhalte werden in diesem Browser gespeichert und es gibt keine Konten.", "descriptionSqliteFile": "Keine Benutzerkonten mit diesem Backend: Jeder, der den Admin öffnen kann, kann bearbeiten. Schützen Sie den Admin-Ordner auf Ebene Ihres Hostings. Die Autorenprofile unten dienen nur zur Information." };
const firestoreSetup$4 = { "title": "Firestore-Setup erforderlich", "intro": "Die Artikel- und Seiten-Listenseiten benötigen einige Firestore-Composite-Indexes für effiziente Abfragen. Diese müssen manuell erstellt werden — Firebase reserviert die Index-Erstellung für Projekt-Admins.", "checking": "Firestore-Indexes werden geprüft…", "missingCount_one": "{{count}} Index fehlt:", "missingCount_other": "{{count}} Indexes fehlen:", "openConsole": "Firebase Console zum Erstellen öffnen", "noUrl": "Auto-Vorschlag-URL nicht extrahierbar — siehe README für den gcloud-Befehl.", "howItWorks": "Wie es funktioniert", "step1": "Klicken Sie für jeden fehlenden Index auf den Link — Firebase Console öffnet sich mit der vorausgefüllten Index-Definition.", "step2": 'Klicken Sie auf „Create" und warten Sie 1–5 Minuten, bis der Index aufgebaut ist (Status in der Console).', "step3": "Kommen Sie zurück und klicken Sie auf Wiederholen. Sobald beide Abfragen erfolgreich sind, lädt der Admin.", "retry": "Wiederholen", "retrying": "Wiederholt…", "buildHint": "Der Aufbau eines Indexes kann nach der Erstellung einige Minuten dauern.", "allReady": "Alle Indexes bereit.", "unexpectedTitle": "Firestore nicht erreichbar", "unexpectedHint": "Prüfen Sie Ihre Verbindung und die Firestore-Regeln. Wenn Sie die Indexes gerade erstellt haben, warten Sie auf den Abschluss des Aufbaus und versuchen Sie es erneut." };
const errors$4 = { "appError": "Anwendungsfehler", "loadAccountFailed": "Konto konnte nicht geladen werden", "loadAccountHint": "Wenn das Problem weiterhin besteht, melden Sie sich ab und versuchen Sie es erneut.", "accountDisabled": "Konto deaktiviert", "accountDisabledMessage": "Ihr Zugriff auf dieses CMS wurde deaktiviert. Wenden Sie sich an Ihren Administrator.", "firebaseNotConfigured": "Firebase ist nicht konfiguriert", "firebaseEnvMissing": "Die folgenden Umgebungsvariablen fehlen:\n{{vars}}\n\nKopieren Sie .env.example nach .env, tragen Sie Ihre Firebase-Projektdaten ein und starten Sie den Dev-Server neu.", "adminEmailNotConfigured": "Admin-E-Mail ist nicht konfiguriert", "adminEmailMessage": "VITE_ADMIN_EMAIL fehlt in .env. Setzen Sie sie auf die E-Mail-Adresse des Bootstrap-Administrators.", "consoleHint": "Überprüfen Sie die Browser-Konsole und Ihre .env-Konfiguration. Siehe README für Setup-Anweisungen." };
const identity$4 = { "brandTitle": "AgentCMS", "brandSubtitle": "Statischer Publisher", "login": { "heading": "Anmelden", "intro": "Verwenden Sie die E-Mail-Adresse und das Passwort, die Ihr Administrator Ihnen mitgeteilt hat.", "submit": "Anmelden", "submitting": "Anmeldung läuft…" }, "fields": { "name": "Anzeigename (optional)", "namePlaceholder": "Erika Mustermann", "email": "E-Mail", "password": "Passwort", "passwordHint": "Mindestens 8 Zeichen." }, "footer": "Neue Konten werden von einem Administrator über die Benutzerseite angelegt.", "errors": { "invalidEmail": "Bitte geben Sie eine gültige E-Mail-Adresse ein.", "missingPassword": "Passwort ist erforderlich.", "passwordTooShort": "Das Passwort muss mindestens 8 Zeichen lang sein." } };
const setup$4 = /* @__PURE__ */ JSON.parse('{"title":"Willkommen bei AgentCMS","subtitle":"Erstkonfiguration","intro":"Geben Sie Ihre Firebase-Zugangsdaten, das Bootstrap-Administratorkonto und Ihren Flexweg-API-Schlüssel ein. Die Werte werden geprüft, in Ihrem Projekt gespeichert (Firestore + eine config.js-Datei auf Flexweg), und die Admin-Oberfläche lädt im normalen Anmeldeablauf neu. Sie machen das nur einmal.","introFirebase":"Schritt 1 — Firebase. Geben Sie Ihre Firebase-Projektdaten und das Bootstrap-Administratorkonto ein. Wir melden Sie an, prüfen die E-Mail und ob Ihre Firestore-Regeln diesen Admin pinnen, bevor wir zum Flexweg-Schritt weitergehen.","introFlexweg":"Schritt 2 — Flexweg. Geben Sie Ihren Flexweg-API-Schlüssel und die Site-URL ein. Wir testen die API, speichern die Konfiguration in Firestore, laden config.js auf Ihre Site hoch und synchronisieren die Theme-Assets.","continueToFlexweg":"Firebase prüfen und fortfahren","stepper":{"terms":"AGB","backend":"Backend","firebase":"Firebase","flexweg":"Flexweg","sqlite":"SQLite","docstore":"Inhalte & Veröffentlichung","data":"Daten","hosting":"Hosting","install":"Installation"},"backend":{"title":"Daten-Backend wählen","intro":"Wählen Sie, wo das CMS Ihre Beiträge, Seiten, Benutzer und Einstellungen speichert. Sie können später über die Einstellungen wechseln (Daten werden nicht migriert).","sqliteTitle":"Flexweg SQLite (empfohlen)","sqliteHint":"Alle Daten verbleiben auf Ihrer Flexweg-Site als SQLite-Datei. Kein externer Dienst. Auth wird von der Flexweg SQLite-API bereitgestellt.","firebaseTitle":"Firebase","firebaseHint":"Verwenden Sie ein Firebase-Projekt für Firestore + Auth. Kostenlos im Spark-Plan. Echtzeit-Updates per onSnapshot.","continue":"Weiter","markdownGitTitle":"Markdown-Dateien in einem Git-Repository","markdownGitHint":"Beiträge als .md-Dateien auf GitHub / GitLab (oder in einem lokalen Klon). Jeder Redakteur meldet sich mit seinem eigenen Zugriffstoken an; jede Änderung ist ein Commit. Keine Datenbank, funktioniert mit mehreren Redakteuren und Rechnern.","localTitle":"Nur dieser Browser","localHint":"Ein Benutzer, keine Anmeldung, nichts einzurichten. Inhalte bleiben in diesem Browser (Export über die Einstellungen). Ideal für einen Admin, der auf Ihrem eigenen Computer läuft."},"sqlite":{"heading":"Verbinden Sie Ihre Flexweg-Site","intro":"Wir verwenden Ihren Flexweg-Master-API-Schlüssel EINMAL, um ein Token mit eingeschränktem Geltungsbereich für die SQLite-Datenbank zu erzeugen. Nach der Installation wird der Master-Schlüssel verworfen und nur das beschränkte Token (auf diese eine SQLite-Datei begrenzt) gespeichert.","apiKeyHint":"Flexweg-Master-API-Schlüssel. Wird nur zur Installation verwendet — danach nie gespeichert.","detectedFromUrl":"Aus URL erkannt","advanced":"Erweiterte Einstellungen (Site-URL, SQLite-Pfad…)","pathHint":"Wo die SQLite-Datei auf Ihrer Flexweg-Site liegt. Ordner werden automatisch erstellt.","adminHeading":"Administratorkonto","adminIntro":"Legen Sie den ersten Benutzer an — dieses Konto erhält automatisch Admin-Rechte. Weitere Mitglieder werden nach der Anmeldung über die Benutzerseite onboardet.","passwordHint":"Mindestens 8 Zeichen.","submit":"SQLite-Datenbank installieren"},"terms":{"title":"Nutzungsbedingungen","intro":"Bitte lesen und akzeptieren Sie die folgenden Bedingungen, bevor Sie AgentCMS verwenden. Sie sind in einfacher Sprache verfasst, um schnell lesbar zu sein.","section1":{"title":"1. Kostenloser Service","body":"AgentCMS wird Ihnen von Flexweg kostenlos zur Verfügung gestellt. Sie können es ohne Einschränkungen mit Ihrem Flexweg-Hosting nutzen — Flexweg wird Ihnen die Nutzung des CMS selbst niemals in Rechnung stellen. Die üblichen Gebühren Ihres Flexweg-Hosting-Plans und Ihres Firebase-Plans bleiben weiterhin anwendbar, jeweils auf dem entsprechenden Konto."},"section2":{"title":"2. Bereitstellung „wie besehen“, ohne Garantie","body":"Das CMS wird wie besehen bereitgestellt. Wir arbeiten daran, es stabil zu halten und im Laufe der Zeit zu verbessern, können jedoch nicht garantieren, dass es frei von Bugs, Mängeln oder Unterbrechungen ist. Verwenden Sie es mit derselben Vorsicht wie bei jedem Tool, das Sie nicht selbst geschrieben haben: Bewahren Sie Backups wichtiger Inhalte auf."},"section3":{"title":"3. Ihre Inhalte, Ihre Verantwortung","body":"Sie sind allein verantwortlich für die Inhalte, die Sie über das CMS veröffentlichen — Texte, Bilder, Videos, Formulare, Code-Einbettungen und alle anderen Medien. Sie müssen das anwendbare Recht in Ihrer Jurisdiktion (und in den von Ihnen anvisierten Jurisdiktionen) einhalten, ebenso wie Urheberrechte, Bild- und Persönlichkeitsrechte, Datenschutzbestimmungen sowie die Bedingungen jeglicher Drittanbieterdienste (z. B. eingebettete Schriften oder Videos). Flexweg ist nicht verantwortlich für die von den Nutzern des CMS veröffentlichten Inhalte."},"section4":{"title":"4. Ihr Firebase-Konto, Ihre Sicherheit","body":"Das CMS speichert seine Daten in Ihrem eigenen Firebase-Projekt. Sie sind für die Sicherheit dieses Projekts verantwortlich: Wählen Sie ein starkes Passwort für das Bootstrap-Administratorkonto, konfigurieren Sie die Firestore-Sicherheitsregeln wie dokumentiert, rotieren Sie Ihre API-Schlüssel bei Bedarf und prüfen Sie, wer Zugriff hat. Flexweg kann in keinem Fall für unbefugten Zugriff, Datenlecks, Hacks oder Verluste haftbar gemacht werden, die durch Fehlkonfiguration oder Kompromittierung Ihres Firebase-Kontos entstehen."},"section5":{"title":"5. Haftungsbeschränkung","body":"Flexweg kann nicht haftbar gemacht werden für Einnahmeverluste, Datenverluste, entgangene Geschäftsmöglichkeiten oder direkte oder indirekte Schäden, die aus der Nutzung, dem Missbrauch oder der Nichtverfügbarkeit des CMS entstehen. Soweit das anwendbare Recht eine Haftung von Flexweg vorschreibt, ist diese auf den Betrag beschränkt, der tatsächlich in den letzten 12 Monaten an Flexweg für das CMS gezahlt wurde — also null, da das CMS kostenlos ist."},"section6":{"title":"6. Ihre Daten bleiben bei Ihnen","body":"Inhalte, die Sie mit dem CMS erstellen, werden in Ihrem eigenen Firebase-Projekt (Texte, Einstellungen, Medienmetadaten) und auf Ihrem eigenen Flexweg-Hosting (veröffentlichtes HTML, Bilder, Theme-Assets) gespeichert. Das CMS selbst übermittelt Ihre Inhalte an keinen Drittanbieterdienst. Plugins oder Themes, die Sie aktivieren, können ihr eigenes Verhalten haben — prüfen Sie, was sie tun, bevor Sie sie aktivieren."},"section7":{"title":"7. Faire Nutzung","body":"Die Nutzung des CMS für rechtswidrige, betrügerische oder schädliche Aktivitäten oder auf eine Weise, die gegen die allgemeinen Nutzungsbedingungen von Flexweg verstößt, kann zur Sperrung Ihres Zugriffs auf das Flexweg-Hosting führen. Wir können diese CMS-Bedingungen auch im Laufe der Zeit aktualisieren; wesentliche Änderungen werden über das Admin-Panel oder per E-Mail kommuniziert."},"accept":"Ich habe die Nutzungsbedingungen gelesen und akzeptiere sie.","continue":"Weiter zur Konfiguration","back":"Zurück"},"sections":{"firebase":"Firebase","admin":"Bootstrap-Administrator","flexweg":"Flexweg-API"},"help":{"firebase":"Diese Werte finden Sie in Firebase Console → Projekteinstellungen → Allgemein → Ihre Apps → SDK-Setup und Konfiguration.","admin":"Verwenden Sie einen vorhandenen Benutzer aus Firebase Authentication. Wer sich mit dieser E-Mail anmeldet, wird als Administrator behandelt und umgeht die Benutzerdatensatz-Prüfung. Erstellen Sie den Benutzer bei Bedarf über Firebase Console → Authentication.","flexweg":"Erstellen Sie einen permanenten API-Schlüssel in Ihrem Flexweg-Konto → API. Die Site-URL ist die öffentliche Adresse Ihrer Flexweg-Site (z. B. https://ihre-site.flexweg.com).","flexwegApiKeyHint":"Ihren API-Schlüssel finden Sie in Ihren Flexweg-Kontoeinstellungen.","flexwegApiKeyLink":"Kontoeinstellungen öffnen"},"fields":{"apiKey":"API-Schlüssel","authDomain":"Auth-Domain","projectId":"Projekt-ID","storageBucket":"Storage-Bucket","messagingSenderId":"Messaging-Absender-ID","appId":"App-ID","adminEmail":"E-Mail","adminPassword":"Passwort","flexwegApiKey":"API-Schlüssel","flexwegSiteUrl":"Site-URL","flexwegApiBaseUrl":"API-Basis-URL","sqlitePath":"SQLite-Pfad"},"submit":"Speichern und fortfahren","submitting":"Konfiguration läuft…","success":"Setup abgeschlossen!","reloadingHint":"Die Admin-Oberfläche wird gleich neu geladen — bitte warten.","footer":"Diese Werte werden in Ihrem Projekt gespeichert (Firestore + Flexweg). Sie werden nirgendwo anders gesendet.","steps":{"signInFirebase":"Anmeldung bei Firebase…","testFlexweg":"Flexweg-API wird getestet…","writeFirestore":"Konfiguration wird gespeichert…","uploadConfig":"config.js wird zu Flexweg hochgeladen…","syncThemes":"Theme-Assets werden zu Flexweg synchronisiert…","sqliteInstall":"Beschränktes SQLite-Token wird erstellt…","sqliteRegisterAdmin":"Admin-Konto wird registriert…","sqliteSchema":"SQLite-Schema wird initialisiert…"},"stepsDone":{"sqliteInstall":"Beschränktes SQLite-Token ausgestellt","sqliteRegisterAdmin":"Admin registriert und angemeldet","sqliteSchema":"SQLite-Schema bereit"},"errors":{"missingFields":"Bitte füllen Sie alle Felder aus.","rootDeploymentTitle":"Die Admin-Oberfläche muss in einem Unterordner liegen, nicht im Stammverzeichnis der Site.","rootDeploymentHint":"Verschieben Sie die Admin-Dateien (index.html, config.js, runtime/, …) in einen Unterordner auf Flexweg — zum Beispiel /admin/ oder einen zufälligen Namen wie /erf34f654GH3/ aus Tarngründen. Laden Sie die Admin-Oberfläche dann von der URL des Unterordners neu und führen Sie das Setup erneut aus.","firebaseAuthGeneric":"Anmeldung bei Firebase fehlgeschlagen.","firebaseAuthInvalidCredential":"Firebase hat die Kombination aus E-Mail und Passwort abgelehnt.","firebaseAuthInvalidCredentialHint":"Neuere Firebase-Projekte aktivieren standardmäßig den Schutz vor E-Mail-Aufzählung, der denselben Fehler zurückgibt, egal ob das Passwort falsch ist, der Benutzer nicht existiert oder sich mit einem anderen Anbieter anmeldet. Zu prüfen:\\n• Geben Sie das Passwort erneut ein — kopieren/einfügen aus einem Passwortmanager, um Tippfehler auszuschließen. Mindestlänge sind 6 Zeichen.\\n• Öffnen Sie Firebase Console → Authentication → Users und bestätigen Sie, dass die E-Mail existiert. Prüfen Sie die Spalte „Providers“: Wird nur Google (oder ein anderer Anbieter) ohne „Email/Password“ angezeigt, setzen oder zurücksetzen Sie das Passwort über das Zeilenmenü (⋮ → Passwort zurücksetzen).\\n• Prüfen Sie, dass die Schreibweise der E-Mail exakt mit dem in Firebase gespeicherten Wert übereinstimmt.","firebaseAuthUserNotFound":"Kein Firebase-Benutzer mit dieser E-Mail. Legen Sie zunächst einen in Firebase Console → Authentication → Users an.","firebaseAuthInvalidEmail":"Die Admin-E-Mail ist keine gültige E-Mail-Adresse.","firebaseInvalidApiKey":"Der Firebase-API-Schlüssel ist ungültig. Prüfen Sie den Wert in der Firebase Console.","firebaseNetwork":"Netzwerkfehler bei der Anmeldung bei Firebase. Prüfen Sie Ihre Verbindung.","firebaseTooManyRequests":"Zu viele Anmeldeversuche. Bitte versuchen Sie es später erneut oder setzen Sie das Passwort über Firebase Console zurück.","firebaseOperationNotAllowed":"Die Anmeldung per E-Mail/Passwort ist in diesem Firebase-Projekt nicht aktiviert. Öffnen Sie Firebase Console → Authentication → Sign-in method und aktivieren Sie den Email/Password-Anbieter.","firebaseUserDisabled":"Dieses Firebase-Benutzerkonto ist deaktiviert. Aktivieren Sie es über Firebase Console → Authentication → Users wieder.","wrongAdminEmail":"Das Firebase-Konto, mit dem Sie sich angemeldet haben, stimmt nicht mit der eingegebenen Admin-E-Mail überein. Bitte erneut versuchen.","rulesNotPinnedTitle":"Die Firestore-Regeln erkennen Sie noch nicht als Bootstrap-Admin.","rulesNotPinnedHint":"Öffnen Sie Firebase Console → Firestore → Rules und ersetzen Sie den Wert von `bootstrapAdminEmail()` durch: {{email}} — klicken Sie dann auf Veröffentlichen. Die Regelvorlage im README enthält einen Platzhalter `you@example.com`, der durch Ihre tatsächliche Admin-E-Mail ersetzt werden muss. Nachdem die aktualisierten Regeln veröffentlicht sind, klicken Sie hier erneut auf Absenden.","flexwegAuth":"Flexweg-API-Schlüssel abgelehnt. Prüfen Sie den Wert in Ihrem Flexweg-Konto → API.","flexwegNetwork":"Netzwerkfehler beim Kontakt mit Flexweg. Prüfen Sie die API-Basis-URL und Ihre Verbindung.","flexwegHttp":"Flexweg-API-Fehler ({{status}}): {{detail}}","firestoreRulesTitle":"Firestore hat das Schreiben der Konfiguration abgelehnt.","firestoreRulesHint":"Öffnen Sie Firebase Console → Firestore → Regeln und stellen Sie sicher, dass die Bootstrap-Admin-E-Mail auf \'{{email}}\' gesetzt ist. Im README finden Sie eine kopierfertige Regelvorlage.","firestoreOther":"Firestore-Schreibvorgang fehlgeschlagen","uploadFailed":"config.js konnte nicht zu Flexweg hochgeladen werden","generic":"Etwas ist schiefgelaufen."},"docstore":{"contentTitle":"Content-Repository","contentIntro":"Hier werden Ihre Beiträge, Seiten und Einstellungen als Markdown- + JSON-Dateien gespeichert. Ein leeres Repository ist in Ordnung — das CMS legt die Dateien an.","provider":"Repository","localClone":"Lokaler Ordner (git-Klon)","localCloneHint":"Wählen Sie den Ordner Ihres Klons. Synchronisieren Sie ihn mit Ihrem gewohnten git-Client — das CMS liest und schreibt Dateien, es führt kein git aus.","contentDir":"Inhaltsordner im Repository","privateRepo":"Verwenden Sie ein privates Repository: Entwürfe werden dort gespeichert.","folderRequired":"Wählen Sie zuerst den Inhaltsordner.","checking":"Repository-Zugriff wird geprüft…","publishIntro":"Wohin die generierte Website veröffentlicht wird. Sie können dies später in den Einstellungen ändern.","existingSite":"Dieses Repository ist bereits eingerichtet — die Website wird weiterhin veröffentlicht nach: {{target}}. Sie können dies später in den Einstellungen ändern (eventuelle geheime Schlüssel müssen dort erneut eingegeben werden).","install":"Installieren","steps":{"config":"Konfiguration wird gespeichert…","content":"Inhalte werden geladen…","target":"Veröffentlichungsziel wird gespeichert…","testTarget":"Veröffentlichungsziel wird getestet…"},"doneTitle":"Alles bereit!","doneBody":"Die Konfiguration ist in diesem Browser gespeichert. Um anderen Redakteuren diese Einrichtung zu ersparen, laden Sie config.js herunter und ersetzen Sie die Datei im Admin-Ordner Ihres Hostings.","downloadConfig":"config.js herunterladen","open":"Admin öffnen","footer":"Die Inhalte bleiben in Ihrem Repository oder in diesem Browser; Zugriffstoken verlassen diesen Browser nie."},"data":{"title":"1. Wo speichern Sie Ihre Daten?","intro":"Ihre Beiträge, Seiten, Benutzer und Einstellungen — die eigenen Daten des Admins. Dies ist unabhängig davon, wo die öffentliche Website gehostet wird (nächster Schritt).","localNote":"Nichts zu konfigurieren: Die Inhalte werden in diesem Browser gespeichert. Exportieren Sie sie in den Einstellungen, um sie zu sichern oder später umzuziehen.","options":{"sqlite-file":{"title":"SQLite","hint":"Eine SQLite-Datenbank, gespeichert auf dem Hosting, das Sie im nächsten Schritt wählen (Flexweg, Ihr Server, S3, Git…). Ohne Benutzerkonten — oder der SQLite-Dienst von Flexweg mit Konten, wenn Sie bei Flexweg hosten."},"flexweg-sqlite":{"title":"SQLite (Flexweg-Dienst)","hint":"Eine SQLite-Datenbank, betrieben vom Flexweg-Dienst, mit integrierten Benutzerkonten. Erfordert ein Flexweg-Konto, unabhängig davon, wo die Website gehostet wird."},"firebase":{"title":"Firebase","hint":"Firestore + Firebase Auth in Ihrem Google-Projekt. Echtzeit, kostenloser Spark-Tarif."},"markdown-git":{"title":"Markdown-Dateien in Git","hint":"Beiträge als .md-Dateien in einem GitHub- / GitLab-Repository (oder einem lokalen Klon). Jeder Redakteur verwendet sein eigenes Token; jede Änderung ist ein Commit."},"local":{"title":"Dieser Browser","hint":"Ein Benutzer, keine Anmeldung, nichts einzurichten. Ideal für einen Admin, der auf Ihrem Computer läuft."}}},"hosting":{"title":"2. Wo wird die Website veröffentlicht?","intro":"Wohin die generierte statische Website (HTML, CSS, Bilder) bei jeder Veröffentlichung hochgeladen wird. Sie können dies später in den Einstellungen ändern.","existing":"Dieses Content-Repository veröffentlicht bereits auf das untenstehende Ziel. Behalten Sie es oder wählen Sie ein anderes."},"install":{"title":"3. Installation","intro":"Prüfen Sie die Zusammenfassung und installieren Sie dann.","data":"Daten","hosting":"Hosting","saveTarget":"Veröffentlichungsziel wird gespeichert…","noteConfigJs":"Die Admin-Konfiguration (config.js) wird nach Möglichkeit neben den Admin auf Flexweg hochgeladen; andernfalls wird Ihnen angeboten, sie herunterzuladen.","noteLocalConfig":"Die Konfiguration wird in diesem Browser gespeichert; Ihnen wird config.js zum Ablegen im Admin-Ordner angeboten, damit andere Redakteure diese Einrichtung überspringen."},"sqliteFile":{"security":"Keine Benutzerkonten: Wer dieses Admin öffnen kann, kann den Inhalt bearbeiten — schütze den Admin-Ordner auf Ebene deines Hostings. Die Datenbankdatei wird wie jede andere Datei ausgeliefert: Halte sie verschlüsselt oder speichere sie an einem separaten privaten Ort.","intro":"Wo die Datenbankdatei gespeichert wird. Dieser Admin liest und speichert sie über dieselben Konnektoren wie das Hosting.","path":"Pfad der Datenbankdatei","pathHint":"Wird beim ersten Speichern angelegt, falls sie noch nicht existiert. Bei einem Git-Repository ist jedes Speichern ein Commit — verwenden Sie besser ein Repository oder einen Branch, der keinen Website-Build auslöst.","existing":"bestehende Datenbank","new":"neue Datenbank","dataNote":"Hier ist nichts zu konfigurieren: Die Datenbank wird auf dem Hosting gespeichert, das Sie im nächsten Schritt wählen.","heading":"SQLite-Datenbank","flexwegService":"Den SQLite-Dienst von Flexweg verwenden","flexwegServiceHint":"Die Datenbank wird von Flexweg betrieben und bringt integrierte Benutzerkonten mit (E-Mail + Passwort). Andernfalls ist sie eine einfache Datei auf diesem Hosting, ohne Konten.","summaryFile":"Datei {{path}} auf diesem Hosting","summaryService":"SQLite-Dienst von Flexweg ({{path}})","encrypt":"Datenbank verschlüsseln","encryptHint":"Empfohlen bei öffentlichem Hosting: Ohne Passphrase ist die Datei unlesbar. Jeder neue Browser fragt einmal danach.","passphrase":"Passphrase","passphraseHint":"Speichere sie jetzt in deinem Passwort-Manager: Ohne sie kann niemand die Datenbank öffnen — auch du nicht.","copy":"Kopieren","copied":"Kopiert","generate":"Neu","passphraseTooShort":"Die Passphrase muss mindestens 12 Zeichen lang sein.","existingEncrypted":"An diesem Pfad gibt es bereits eine verschlüsselte Datenbank: Gib ihre Passphrase ein.","separate":"Datenbank an einem separaten privaten Ort speichern","separateHint":"Z. B. ein privater S3- / R2-Bucket oder ein privates Git-Repository: Die Datenbank wird dann nie von der öffentlichen Website ausgeliefert.","summaryEncrypted":"verschlüsselt","summaryLocation":"gespeichert in {{location}}","locationLabel":"Speicherort der Datenbank","gitBranchNote":"Die Datenbank liegt im Branch {{branch}} dieses Repositorys, der nie veröffentlicht wird: Speichern von Inhalten baut die Website nicht neu.","summaryBranch":"im Branch {{branch}}"},"adminHosting":{"deploying":"Admin wird auf die Website kopiert…","label":"Admin auch auf dieser Website hosten","hint":"Der Admin wird mit seiner config.js (ohne Geheimnisse) nach {{url}} kopiert — jeder Redakteur kann ihn dann dort öffnen. Jeder Redakteur meldet sich weiterhin mit seinem eigenen Zugang an.","folder":"Admin-Ordner","alreadyHere":"Dieser Admin läuft bereits von dieser Website aus: Seine config.js wird direkt aktualisiert.","doneBody":"Der Admin ist jetzt auf Ihrer Website. Aktivieren Sie bei GitHub Pages zuerst Pages für das Repository, falls noch nicht geschehen (Settings → Pages), und öffnen Sie ihn dann:","open":"Online-Admin öffnen","continueHere":"In diesem Admin fortfahren"}}');
const flexweg$4 = { "actions": { "upload": "Datei wird hochgeladen", "delete": "Datei wird gelöscht", "rename": "Datei wird umbenannt", "get": "Datei wird gelesen", "list": "Dateien werden aufgelistet", "createFolder": "Ordner wird erstellt", "renameFolder": "Ordner wird umbenannt", "deleteFolder": "Ordner wird gelöscht", "storageLimits": "Speichergrenzen werden abgerufen", "commit": "Änderungen veröffentlichen" }, "errors": { "configMissing": "Das Veröffentlichungsziel ist nicht konfiguriert. Richten Sie es vor dem Veröffentlichen in den Einstellungen ein.", "network": "{{action}}: Netzwerkfehler oder CORS blockiert. Überprüfen Sie Ihre Verbindung.", "auth": "{{action}}: Authentifizierung fehlgeschlagen. Prüfen Sie die Zugangsdaten des Veröffentlichungsziels in den Einstellungen.", "notFound": "{{action}}: Ziel auf dem Veröffentlichungsziel nicht gefunden.", "tooLarge": "{{action}}: Datei zu groß für das Veröffentlichungsziel.", "rateLimited": "{{action}}: Zu viele Anfragen, bitte in Kürze erneut versuchen.", "serverError": "{{action}}: Serverfehler des Veröffentlichungsziels ({{status}}). Bitte erneut versuchen.", "generic": "{{action}} fehlgeschlagen ({{status}}){{detail}}.", "unsupported": "{{action}}: wird vom Veröffentlichungsziel „{{connector}}“ nicht unterstützt.", "unknownConnector": "Unbekanntes Veröffentlichungsziel „{{connector}}“. Prüfen Sie Einstellungen → Veröffentlichungsziel.", "folderAccess": "Kein Zugriff auf den lokalen Ordner. Öffnen Sie Einstellungen → Veröffentlichungsziel und klicken Sie auf „Ordner neu verbinden“." } };
const publish$4 = { "log": { "rendering": "Seite wird gerendert…", "uploading": "{{path}} wird hochgeladen…", "deleting": "{{path}} wird gelöscht…", "regenerating": "Listings werden neu generiert…", "skipped": "{{path}} übersprungen (keine Änderungen)", "done": "Veröffentlicht unter {{url}}", "failed": "Fehlgeschlagen: {{error}}" } };
const docstore$4 = { "errors": { "notConnected": "Nicht mit dem Inhalts-Repository verbunden. Melden Sie sich erneut mit Ihrem Zugriffstoken an.", "conflict": "Jemand anderes hat dieses Element inzwischen geändert. Seine Version wird jetzt angezeigt — wenden Sie Ihre Änderung erneut an.", "sqliteUnsupported": "Das Ziel „{{connector}}“ kann keine Datenbankdatei speichern." } };
const connectors$4 = { "target": "Veröffentlichungsziel", "settingsTitle": "Veröffentlichungsziel", "settingsHelp": "Wohin die gerenderte Website beim Veröffentlichen hochgeladen wird. Zugangsdaten werden bei Ihrem Inhalts-Backend gespeichert (bzw. bei Git-Content-Repositorys in diesem Browser) und sind für alle Admins lesbar.", "saved": "Veröffentlichungsziel gespeichert. Führen Sie Neu generieren → Alles aus, um die gesamte Website auf dem neuen Ziel zu veröffentlichen.", "test": "Verbindung testen", "testOk": "Verbindung OK", "testFailed": "Verbindung fehlgeschlagen", "names": { "flexweg": "Flexweg", "git-pages": "Git-Repository (GitHub Pages, Cloudflare Pages, GitLab Pages…)", "s3": "S3-kompatibler Bucket (AWS S3, Cloudflare R2, Backblaze B2, OVH…)", "php-bridge": "Ihr eigener Server (PHP-Bridge)", "browser-mirror": "Als ZIP herunterladen", "local-folder": "Lokaler Ordner auf diesem Computer" }, "hints": { "flexweg": "Upload über die Flexweg Files API.", "git-pages": "Jede Veröffentlichung ist ein Commit im Repository; der Hoster baut die Website daraus neu.", "s3": "Erfordert eine CORS-Regel auf dem Bucket, die den Origin dieses Admins zulässt, sowie Website-Hosting (oder ein CDN), um index.html-Dateien auszuliefern.", "php-bridge": "Laden Sie external/bridges/php/flexweg-bridge.php auf Ihren Server hoch, legen Sie dessen API-Schlüssel fest und tragen Sie hier die URL ein.", "browser-mirror": "Die Website wird in diesem Browser gespeichert; laden Sie das ZIP herunter und laden Sie es von Hand an beliebiger Stelle hoch.", "local-folder": "Schreibt die Website direkt in einen Ordner (Chrome / Edge). Stellen Sie sie lokal bereit oder pushen Sie sie mit Ihren eigenen Tools." }, "fields": { "flexweg": { "apiKey": "API-Schlüssel", "siteUrl": "Website-URL", "apiBaseUrl": "API-Basis-URL" }, "git-pages": { "host": "Hosting", "provider": "Git-Anbieter", "owner": "Eigentümer (Benutzer oder Organisation)", "repo": "Repository", "project": "Projektpfad", "branch": "Branch", "dir": "Ordner im Repository", "token": "Zugriffstoken", "siteUrl": "Öffentliche Website-URL", "apiBaseUrl": "API-URL (nur selbst gehostet)" }, "s3": { "endpoint": "Endpoint", "region": "Region", "bucket": "Bucket", "prefix": "Schlüsselpräfix (optional)", "accessKeyId": "Access Key ID", "secretAccessKey": "Geheimer Zugriffsschlüssel", "siteUrl": "Öffentliche Website-URL", "forcePathStyle": "Pfad-basierte URLs (MinIO, R2, die meisten kompatiblen Dienste)", "publicRead": "Hochgeladene Dateien öffentlich machen (ACL public-read) — für Buckets, die nicht per Bucket-Policy öffentlich sind (OVHcloud, Scaleway…). Bei AWS-Buckets mit „Bucket owner enforced“ deaktiviert lassen." }, "php-bridge": { "apiBaseUrl": "Bridge-URL", "apiKey": "API-Schlüssel der Bridge", "siteUrl": "Öffentliche Website-URL" }, "browser-mirror": { "siteUrl": "Öffentliche Website-URL (optional)" }, "local-folder": { "siteUrl": "URL, unter der der Ordner bereitgestellt wird (optional)" } }, "help": { "flexweg": { "apiKey": "Wird in Ihrem Flexweg-Konto → API erzeugt." }, "git-pages": { "host": "Cloudflare Pages: Verbinden Sie das Projekt mit diesem Repository, ohne Build-Befehl und mit dem unten angegebenen Ausgabeordner. Funktioniert mit privaten Repositorys.", "dir": 'Leer lassen für das Stammverzeichnis des Repositorys. GitHub Pages: "" oder "docs". GitLab Pages: "public".', "token": "Fine-grained Token für dieses Repository mit Contents: read & write (GitHub) — fügen Sie Pages: read & write hinzu, damit das CMS GitHub Pages aktivieren kann — oder ein Token mit dem Scope api (GitLab). Leer lassen, um das eigene Zugriffstoken jedes Redakteurs zu verwenden, wenn die Inhalte beim selben Anbieter liegen.", "siteUrl": "z. B. https://user.github.io/repo — eine URL mit Unterordner ist in Ordnung, Links werden automatisch angepasst." }, "s3": { "endpoint": "Für AWS leer lassen (wird aus der Region gebildet). R2: https://<account-id>.r2.cloudflarestorage.com", "siteUrl": "Die Website-URL des Buckets oder Ihre CDN-Domain." }, "php-bridge": { "apiBaseUrl": "Die vollständige URL von flexweg-bridge.php auf Ihrem Server (HTTPS)." }, "browser-mirror": { "siteUrl": "Wohin Sie das ZIP hochladen werden — wird für absolute URLs verwendet (Sitemaps, RSS, Medien)." }, "local-folder": { "siteUrl": "z. B. http://localhost:8080, wenn ein lokaler Webserver den Ordner bereitstellt." } }, "options": { "github-pages": "GitHub Pages", "cloudflare-pages": "Cloudflare Pages (mit dem Repository verbunden)", "gitlab-pages": "GitLab Pages", "other": "Andere (Netlify, Vercel, git pull auf dem Server…)", "github": "GitHub", "gitlab": "GitLab" }, "folder": { "choose": "Ordner wählen…", "change": "Ordner ändern…", "reconnect": "Ordner erneut verbinden", "unsupported": "Dieser Browser kann nicht in lokale Ordner schreiben. Verwenden Sie Chrome oder Edge." }, "mirror": { "download": "Website herunterladen (ZIP)", "count": "{{count}} Dateien in diesem Browser" }, "adminHosting": { "title": "Admin auf dieser Website", "help": "Kopiert diesen Admin auf das Veröffentlichungsziel (Erstbereitstellung oder Aktualisierung nach einer neuen Version). Seine config.js enthält keine Geheimnisse.", "deploy": "Admin bereitstellen / aktualisieren", "deployed": "Admin bereitgestellt ({{count}} Dateien) — {{url}}" }, "pages": { "enabled": "GitHub Pages für dieses Repository aktiviert — die Website ist in etwa einer Minute online.", "enableHint": 'Veröffentlichung erfolgreich. Um die Website online zu stellen, aktivieren Sie GitHub Pages für {{repo}}: Settings → Pages → Deploy from a branch → {{branch}} / {{folder}}. (Oder geben Sie dem Token die Berechtigung "Pages: read and write", dann erledigt das CMS das für Sie.)' }, "siteUrl": { "mismatch": "Die öffentliche URL der Website (Einstellungen → Website) ist {{site}}, aber dieses Ziel stellt die Website unter {{target}} bereit. Links, CSS und Sitemaps folgen der Website-URL — sie sind auf diesem Hosting falsch.", "use": "{{url}} für die Website verwenden", "updated": "Website-URL aktualisiert. Führen Sie Neu generieren → Alles aus, um die Seiten mit den neuen Links erneut zu veröffentlichen." } };
const gitAccess$4 = { "heading": "Mit dem Content-Repository verbinden", "tokenIntro": "Die Inhalte liegen im {{provider}}-Repository {{repo}}. Melden Sie sich mit Ihrem eigenen persönlichen Zugriffstoken an — Ihre Repository-Berechtigungen bestimmen Ihre Rolle (Schreibzugriff = Redakteur, Admin / Maintainer = Admin).", "token": "Persönliches Zugriffstoken", "tokenHelpGithub": "Fine-grained Token, nur Zugriff auf dieses Repository, Berechtigung Contents: Lesen und Schreiben.", "tokenHelpGitlab": "Token mit dem api scope, Rolle Developer oder höher in diesem Projekt.", "createToken": "Token erstellen", "connect": "Verbinden", "tokenStorage": "Das Token wird nur in diesem Browser gespeichert. Beim Abmelden wird es gelöscht.", "failed": "Mit diesem Token kann nicht in das Repository geschrieben werden (ungültig, abgelaufen oder schreibgeschützt). Prüfen Sie seine Berechtigungen.", "folderIntro": "Die Inhalte liegen in einem Ordner auf diesem Computer (in der Regel ein git-Klon, den Sie mit Ihrem eigenen git-Client synchronisieren). Gewähren Sie diesem Browser Zugriff darauf — Browser fragen nach jedem Neuladen erneut.", "openFolder": "Inhaltsordner öffnen" };
const hosting$4 = { "flexweg": { "title": "Flexweg", "short": "Flexweg-Hosting", "hint": "Upload über die Flexweg Files API. API-Schlüssel aus Ihrem Flexweg-Konto." }, "github-pages": { "title": "GitHub Pages", "short": "Kostenlos, aus einem GitHub-Repository", "hint": "Jede Veröffentlichung ist ein Commit im Repository; GitHub Pages liefert es aus. Settings → Pages → Deploy from a branch. Öffentliche Repositories im kostenlosen Tarif." }, "cloudflare-pages": { "title": "Cloudflare Pages", "short": "Kostenlos, private Repositories möglich", "hint": "Das CMS committet die Website in ein GitHub- / GitLab-Repository; verbinden Sie ein Cloudflare-Pages-Projekt damit (kein Build-Befehl, Ausgabeordner = der Ordner unten)." }, "gitlab-pages": { "title": "GitLab Pages", "short": "Kostenlos, aus einem GitLab-Repository", "hint": "Jede Veröffentlichung ist ein Commit; das CMS fügt eine minimale .gitlab-ci.yml hinzu, die den Ordner public/ veröffentlicht." }, "git-other": { "title": "Netlify, Vercel…", "short": "Jeder Host, der ein Repository deployt", "hint": "Das CMS committet die Website in ein Git-Repository; verbinden Sie Ihren Host (Netlify, Vercel, einen Server mit git pull…) mit diesem Repository." }, "s3": { "title": "S3 / R2 / B2…", "short": "Object-Storage-Bucket", "hint": "AWS S3, Cloudflare R2, Backblaze B2, OVH, Scaleway, MinIO… Erfordert eine CORS-Regel auf dem Bucket sowie Website-Hosting oder ein vorgeschaltetes CDN." }, "own-server": { "title": "Ihr eigener Server (FTP / SFTP)", "short": "Shared Hosting, VPS…", "hint": "Browser können kein FTP oder SFTP: Laden Sie die PHP-Bridge (external/bridges/php/flexweg-bridge.php) einmalig mit Ihrem FTP-Client hoch, legen Sie ihren API-Schlüssel fest und tragen Sie dann hier ihre URL ein. Funktioniert auf jedem PHP-Host." }, "local-folder": { "title": "Lokaler Ordner", "short": "Auf diesem Computer", "hint": "Schreibt die Website in einen Ordner dieses Computers (Chrome / Edge). Stellen Sie sie lokal bereit oder übertragen Sie sie mit Ihren eigenen Tools." }, "zip": { "title": "Als ZIP herunterladen", "short": "Manuell hochladen", "hint": "Die Website wird in diesem Browser gespeichert; laden Sie in den Einstellungen ein ZIP herunter und laden Sie es beliebig hoch (Netlify Drop, FTP-Client…)." } };
const sqliteAccess$4 = { "heading": "Mit der Datenbank verbinden", "intro": "Dieser Admin speichert seine Inhalte in {{path}}. Geben Sie die Zugangsdaten für diesen Browser ein.", "storage": "Die Zugangsdaten werden nur in diesem Browser gespeichert. Beim Abmelden werden sie vergessen.", "passphrase": "Passphrase der Datenbank", "passphraseHint": "Die Datenbank ist verschlüsselt. Gib die bei der Installation gewählte Passphrase ein (wird nur in diesem Browser gespeichert).", "passphraseWrong": "Falsche Passphrase: Die Datenbank konnte nicht geöffnet werden.", "passphraseMissing": "Gib die Passphrase der Datenbank ein." };
const de = {
  common: common$4,
  auth: auth$4,
  nav: nav$4,
  dashboard: dashboard$4,
  posts: posts$4,
  pages: pages$4,
  taxonomies: taxonomies$4,
  media: media$4,
  themes: themes$4,
  plugins: plugins$4,
  externalInstall: externalInstall$4,
  externalLoader: externalLoader$4,
  menus: menus$4,
  settings: settings$4,
  users: users$4,
  firestoreSetup: firestoreSetup$4,
  errors: errors$4,
  identity: identity$4,
  setup: setup$4,
  flexweg: flexweg$4,
  publish: publish$4,
  docstore: docstore$4,
  connectors: connectors$4,
  gitAccess: gitAccess$4,
  hosting: hosting$4,
  sqliteAccess: sqliteAccess$4
};
const common$3 = { "save": "Guardar", "saving": "Guardando…", "saved": "Guardado", "cancel": "Cancelar", "delete": "Eliminar", "deleting": "Eliminando…", "edit": "Editar", "create": "Crear", "search": "Buscar", "loading": "Cargando…", "yes": "Sí", "no": "No", "confirm": "Confirmar", "back": "Atrás", "next": "Siguiente", "previous": "Anterior", "close": "Cerrar", "all": "Todos", "none": "Ninguno", "actions": "Acciones", "name": "Nombre", "slug": "Slug", "description": "Descripción", "status": "Estado", "createdAt": "Creado", "updatedAt": "Actualizado", "publishedAt": "Publicado", "language": "Idioma", "darkMode": "Modo oscuro", "lightMode": "Modo claro", "signOut": "Cerrar sesión", "administrator": "Administrador", "editor": "Editor", "appName": "AgentCMS" };
const auth$3 = { "signIn": "Iniciar sesión", "signingIn": "Iniciando sesión…", "email": "Correo electrónico", "password": "Contraseña", "emailPlaceholder": "tu@empresa.com", "passwordPlaceholder": "••••••••", "forgotPassword": "¿Olvidaste tu contraseña?", "resetEmailSent": "Correo de restablecimiento de contraseña enviado a {{email}}.", "enterEmailFirst": "Introduce primero tu correo arriba y luego haz clic en restablecer.", "emailPasswordRequired": "El correo y la contraseña son obligatorios.", "signInSubtitle": "Usa tu correo de trabajo y tu contraseña.", "footer": "Las solicitudes de cuenta se gestionan a través de tu administrador.", "errors": { "invalidEmail": "Dirección de correo no válida.", "invalidCredentials": "Correo o contraseña no válidos.", "tooManyRequests": "Demasiados intentos. Inténtalo más tarde o restablece tu contraseña.", "userDisabled": "Esta cuenta ha sido deshabilitada.", "networkFailed": "Error de red. Comprueba tu conexión.", "generic": "Error de autenticación." } };
const nav$3 = { "openMenu": "Abrir menú", "closeMenu": "Cerrar menú", "dashboard": "Panel", "posts": "Entradas", "pages": "Páginas", "taxonomies": "Categorías y etiquetas", "media": "Medios", "themes": "Temas", "themeSettings": "Ajustes del tema", "plugins": "Plugins", "menus": "Menús", "users": "Usuarios", "settings": "Ajustes" };
const dashboard$3 = { "title": "Panel", "welcome": "Bienvenido de nuevo, {{email}}.", "stats": { "totalPosts": "Entradas", "totalPages": "Páginas", "online": "En línea", "drafts": "Borradores" } };
const posts$3 = { "title": "Entradas", "newPost": "Nueva entrada", "noPosts": "Aún no hay entradas. Crea la primera para empezar.", "noPostsInFilter": "Ninguna entrada coincide con el filtro actual.", "search": { "placeholder": "Buscar entradas…", "clear": "Borrar búsqueda", "noResults": "Ninguna entrada coincide con tu búsqueda." }, "pagination": { "previous": "Anterior", "next": "Siguiente", "showing": "Mostrando {{from}}–{{to}} de {{total}}", "pageOf": "Página {{page}} de {{total}}" }, "bulk": { "selectedCount_one": "{{count}} seleccionada", "selectedCount_other": "{{count}} seleccionadas", "selectPage_one": "Seleccionar {{count}} en esta página", "selectPage_other": "Seleccionar las {{count}} de esta página", "deselectPage": "Deseleccionar página", "allOnPageSelected_one": "{{count}} en esta página seleccionada.", "allOnPageSelected_other": "Las {{count}} de esta página están seleccionadas.", "selectAllMatching_one": "Seleccionar la entrada coincidente", "selectAllMatching_other": "Seleccionar las {{count}} entradas coincidentes", "allMatchingSelected_one": "La entrada coincidente está seleccionada.", "allMatchingSelected_other": "Las {{count}} entradas coincidentes están seleccionadas.", "selectOne": "Seleccionar «{{title}}»", "publish": "Publicar ({{count}})", "publishing": "Publicando…", "publishedCount": "{{ok}} publicada(s), {{failed}} fallo(s).", "unpublish": "Despublicar ({{count}})", "unpublishing": "Despublicando…", "unpublishedCount": "{{ok}} despublicada(s), {{failed}} fallo(s).", "delete": "Eliminar", "deleting": "Eliminando…", "deletedCount": "{{ok}} eliminada(s), {{failed}} fallo(s).", "confirmDelete_one": "¿Eliminar {{count}} entrada? Se despublica de Flexweg y no se puede deshacer.", "confirmDelete_other": "¿Eliminar {{count}} entradas? Se despublican de Flexweg y no se puede deshacer.", "noDraftSelected": "Ninguna entrada en borrador seleccionada.", "noOnlineSelected": "Ninguna entrada en línea seleccionada.", "clear": "Borrar selección" }, "filters": { "all": "Todas", "draft": "Borrador", "online": "En línea" }, "fields": { "title": "Título", "slug": "Slug", "excerpt": "Extracto", "content": "Contenido", "category": "Categoría", "tags": "Etiquetas", "heroImage": "Imagen destacada", "seoTitle": "Título SEO", "seoDescription": "Descripción SEO", "createdAt": "Creado el", "updatedAt": "Última actualización", "publishedAt": "Publicado el" }, "edit": { "newTitle": "Nueva entrada", "editTitle": "Editar entrada", "saved": "Guardado.", "savedAndRepublished": "Guardado y republicado.", "saveFailed": "Error al guardar.", "saveAndRepublish": "Guardar y republicar", "draftSaved": "Borrador guardado.", "slugCollision": { "post": 'Esta URL ya la usa la entrada: "{{label}}".', "page": 'Esta URL ya la usa la página: "{{label}}".', "category": 'Esta URL ya la usa la categoría: "{{label}}".' }, "publish": "Publicar", "unpublish": "Despublicar", "publishing": "Publicando…", "unpublishing": "Despublicando…", "titlePlaceholder": "Añadir título", "permalink": "Enlace permanente", "slugFormatHint": "Solo minúsculas, ASCII, separadas por guiones.", "slugAutoSuffixed": 'Se añadió un sufijo porque "{{base}}" ya lo usa {{owner}}.', "slugAutoSuffixedOwner": { "post": 'publicación: "{{label}}"', "page": 'página: "{{label}}"', "category": 'categoría: "{{label}}"' }, "saveBlocked": { "titleRequired": "Añade un título antes de guardar.", "slugRequired": "Se requieren un título y un slug de URL para guardar.", "slugInvalid": "Formato de slug inválido (ASCII en minúsculas + guiones).", "slugCollision": "Resuelve el conflicto de URL antes de guardar." }, "viewPublished": "Ver", "confirmDelete": "¿Eliminar esta entrada?", "inspector": { "document": "Documento", "block": "Bloque", "blockEmpty": "Selecciona un bloque en el editor para ver sus opciones.", "publishing": "Publicación", "permalink": "Enlace permanente", "categories": "Categorías y etiquetas", "featured": "Imagen destacada", "seo": "SEO", "excerpt": "Extracto", "dates": "Fechas" }, "blocks": { "addBlock": "Añadir bloque", "transform": "Transformar a", "moveUp": "Mover arriba", "moveDown": "Mover abajo", "duplicate": "Duplicar", "remove": "Eliminar bloque", "paragraph": "Párrafo", "heading2": "Título 2", "heading3": "Título 3", "bulletList": "Lista con viñetas", "orderedList": "Lista numerada", "blockquote": "Cita", "codeBlock": "Código", "image": "Imagen", "horizontalRule": "Separador", "categories": { "text": "Texto", "media": "Medios", "layout": "Diseño", "embed": "Incrustaciones", "advanced": "Avanzado" }, "noSettings": "Este bloque no tiene ajustes.", "noSelection": "Selecciona un bloque en el editor para ver sus opciones.", "slash": { "noResults": "Ningún bloque coincide." } } }, "status": { "draft": "Borrador", "online": "En línea" }, "preview": { "title": "Vista previa", "rendering": "Generando vista previa…", "error": "Error en la vista previa: {{error}}", "viewports": { "mobile": "Móvil", "tablet": "Tableta", "desktop": "Escritorio" } } };
const pages$3 = { "title": "Páginas", "newPage": "Nueva página", "noPages": "Aún no hay páginas.", "homeBadge": "Inicio", "homeBadgeTooltip": "Se usa como página de inicio del sitio" };
const taxonomies$3 = { "title": "Categorías y etiquetas", "categories": "Categorías", "tags": "Etiquetas", "newCategory": "Nueva categoría", "newTag": "Nueva etiqueta", "noCategories": "Aún no hay categorías.", "noTags": "Aún no hay etiquetas.", "slugCollision": 'Este slug ya lo usa "{{label}}".', "seo": { "button": "SEO", "buttonTitle": "Editar metaetiquetas SEO", "title": "Metaetiquetas SEO", "subtitle": 'Título y descripción personalizados para la página de archivo de "{{name}}".', "metaTitle": "Meta título", "metaTitleHint": "Se usa como <title> de la página. Por defecto: el nombre del término.", "metaDescription": "Meta descripción", "metaDescriptionHint": "Se usa como meta descripción de la página. Por defecto: la descripción del término." } };
const media$3 = { "title": "Biblioteca de medios", "upload": "Subir", "uploading": "Subiendo…", "finalizing": "Finalizando…", "uploadFailed": "Error al subir", "retry": "Reintentar", "noMedia": "Aún no hay medios.", "alt": "Texto alternativo", "caption": "Pie de foto", "filename": "Nombre de archivo", "size": "Tamaño", "type": "Tipo" };
const themes$3 = { "title": "Temas", "active": "Activo", "activate": "Activar", "installExternal": "Instalar tema", "uninstallDisabledTitle": "Cambia a otro tema antes de desinstalar este.", "syncAssets": "Sincronizar recursos del tema", "regenerateSite": "Regenerar el sitio", "regenerating": "Regenerando…", "regenerate": { "button": "Regenerar", "running": "Ejecutando…", "groupBuiltins": "Sitio", "groupPlugins": "Plugins", "home": "Solo página de inicio", "homeHelp": "Regenera solo index.html — la opción más rápida.", "allHtml": "Todas las páginas HTML", "allHtmlHelp": "Cada entrada, página, archivo y listado — además de los snapshots menu / posts / authors JSON.", "repair": "Reparar URLs", "repairHelp": "Recalcula la URL canónica de cada publicación online y mueve los archivos que terminaron en la URL equivocada. Útil tras una importación realizada antes de que los términos se sincronizaran.", "assets": "Recursos del tema", "assetsHelp": "Sube el CSS y los scripts del tema activo a /theme-assets/.", "everything": "Todo", "everythingHelp": "Recursos del tema + todo HTML + cada salida de plugin. Opción más lenta.", "noPluginTargets": "Sin regeneraciones de plugin — activa un plugin que soporte regenerar." }, "confirmSwitch": { "title": "¿Cambiar a {{theme}}?", "body": "Cambiar de tema requiere volver a subir los recursos del tema y regenerar cada página publicada para que el nuevo aspecto se propague en todas partes. Puede tardar un momento.", "confirm": "Cambiar y regenerar", "cancel": "Cancelar" } };
const plugins$3 = { "title": "Plugins", "enabled": "Activado", "disabled": "Desactivado", "enable": "Activar", "disable": "Desactivar", "configure": "Configurar", "author": "autor", "learnMore": "Más información", "mustUseBadge": "Obligatorio", "installExternal": "Instalar plugin", "tabs": { "regular": "Plugins", "mustUse": "Obligatorios" } };
const externalInstall$3 = { "titlePlugin": "Instalar un plugin", "titleTheme": "Instalar un tema", "labelPlugin": "plugin", "labelTheme": "tema", "intro": "Suelta un archivo ZIP que contenga un bundle de {{label}} (manifest.json + bundle.js en la raíz del ZIP). El {{label}} se subirá a tu sitio Flexweg y se registrará tras una recarga. Volver a subir un ZIP con el mismo id de manifest actualiza la entrada existente en el sitio — no hace falta desinstalar.", "zipField": "Archivo ZIP del bundle", "install": "Instalar", "installing": "Instalando…", "installSuccess": "{{name}} instalado ({{count}} archivos subidos). Recargando…", "upgradeSuccess": "{{name}} actualizado de v{{previousVersion}} a v{{newVersion}} ({{count}} archivos subidos). Recargando…", "installedTitle": "Ya instalado", "bundledDefaultsTitle": "Plugins/temas incluidos disponibles", "bundledDefaultsHint": "{{count}} plugin/tema incluido está actualmente desinstalado. Restáuralos para recuperar lo que venía con esta versión del admin.", "bundledDefaultsRestore": "Restaurar", "bundledDefaultsRestored": "Restaurados {{plugins}} plugin(s) y {{themes}} tema(s). Recargando…", "uninstall": "Desinstalar", "uninstallSuccess": "{{id}} desinstalado. Recargando…", "confirmUninstall": "¿Desinstalar {{id}}? Los archivos se eliminarán de Flexweg.", "errors": { "no-manifest": "El ZIP no tiene manifest.json en la raíz.", "invalid-manifest": "manifest.json no es válido (falta algún campo obligatorio o no es JSON válido).", "incompatible-api": "El bundle se compiló contra una versión incompatible de la API runtime.", "no-bundle": "El ZIP no contiene el archivo de entrada declarado en el manifest.", "fetch-manifest": "No se pudo leer el external.json actual en Flexweg.", "upload-failed": "Falló la subida — revisa tu clave API de Flexweg y tu conexión." } };
const externalLoader$3 = { "someFailed": "{{count}} bundle(s) externo(s) no se pudieron cargar. Mira la consola del navegador." };
const menus$3 = { "title": "Menús", "header": "Menú de cabecera", "footer": "Menú de pie de página", "label": "Etiqueta", "saveAndPublish": "Guardar y generar", "discard": "Descartar", "saved": "Menús guardados y publicados.", "saveFailed": "No se pudieron guardar los menús.", "unsavedChanges": "Tienes cambios sin guardar." };
const settings$3 = { "title": "Ajustes", "tabs": { "general": "General" }, "site": { "title": "Sitio", "siteTitle": "Título del sitio", "siteDescription": "Descripción del sitio", "siteLanguage": "Idioma del sitio", "siteLanguageHelp": 'Etiqueta BCP-47 (p. ej. en, fr-CA) inyectada en <html lang="…"> de cada página publicada. El prefijo se compara con los locales de traducción soportados para los textos de sitemap / RSS y las cadenas integradas en el tema; los locales no soportados recurren al inglés.', "siteLanguageResolved": "Las traducciones usarán: {{label}}", "baseUrl": "URL pública del sitio", "postsPerPage": "Entradas por página", "homeMode": "Contenido de la página de inicio", "homeLatest": "Últimas entradas", "homeStatic": "Página estática", "homePage": "Página de inicio", "discourageIndexing": "Disuadir a los motores de búsqueda de indexar este sitio", "discourageIndexingHelp": "Si se activa, cada página publicada recibe una etiqueta meta noindex/nofollow y robots.txt bloquea a todos los rastreadores. Replica el comportamiento de WordPress — útil para sitios de staging o revisiones antes del lanzamiento. Los motores de búsqueda que respetan la directiva no indexarán el sitio.", "discourageRegenerateHint": "Ajuste de indexación guardado. Haz clic en «Regenerar todo» en Temas para aplicar el cambio a todas las páginas publicadas y a robots.txt." }, "flexweg": { "title": "API de Flexweg", "apiKey": "Clave API", "apiKeyHelp": "Generada desde tu cuenta Flexweg → API.", "siteUrl": "URL del sitio", "siteUrlHelp": "URL pública de tu sitio Flexweg sin barra final.", "apiBaseUrl": "URL base de la API", "storageHelpFirebase": "Almacenada en Firestore (config/flexweg). Lectura para cualquier miembro con sesión iniciada, escritura solo para administradores.", "storageHelpSqlite": "Almacenada en la tabla SQLite local config. Lectura para cualquier miembro con sesión iniciada, escritura solo para administradores." }, "backend": { "title": "Backend de datos", "active": "Backend activo:", "switchButton": "Cambiar de backend…", "confirmTitle": "Se perderán todos los datos actuales.", "confirmBody": "Cambiar borra la configuración del navegador y recarga el formulario de configuración. El nuevo backend empieza vacío — los datos del backend anterior siguen donde estaban (en Firestore o como un archivo .sqlite en Flexweg), pero el CMS no los leerá hasta que vuelvas a cambiar.", "confirmYes": "Sí, cambiar de backend", "downloadBackup": "Descargar una copia de seguridad del archivo .sqlite", "downloadBackupHelp": "hazlo antes de cambiar de backend.", "markdownGit": "Markdown — {{source}}", "localFolder": "carpeta local", "localBrowser": "Este navegador (local, un solo usuario)", "sqliteFile": "Archivo SQLite — {{location}}" }, "performance": { "title": "Rendimiento", "help": "Cómo el admin carga entradas y páginas. El modo por defecto funciona en el plan gratuito de Firestore sin configuración; el modo paginado es para sitios muy grandes y requiere crear índices una vez.", "mode": "Modo de carga", "modeGlobal": "Estándar (sin configuración)", "modePaginated": "Paginación del servidor (requiere índices de Firestore)", "globalHelp": "Carga toda la colección de entradas en una suscripción en vivo. Orden, filtros y búsqueda se hacen en memoria. Recomendado para sitios con menos de ~5 000 entradas.", "paginatedHelp": "Suscripciones paginadas por cursor, una página a la vez. Requiere índices compuestos de Firestore — ver README. Recomendado para sitios muy grandes.", "savedReload": "Guardado. Recarga el admin para aplicar el nuevo modo." }, "editor": { "title": "Editor", "help": "Tipografía usada dentro del editor de entradas/páginas. Independiente del tema público.", "fontFamily": "Familia tipográfica", "bodySize": "Tamaño del cuerpo", "h1Size": "Tamaño H1", "h2Size": "Tamaño H2", "h3Size": "Tamaño H3", "sizeHelp": "Longitud CSS, p. ej. 16px o 1rem. Deja vacío para el valor por defecto.", "reset": "Restablecer valores predeterminados" }, "profile": { "title": "Perfil", "adminLocale": "Idioma del admin", "adminLocaleHelp": "Idioma usado por la interfaz de administración. Guardado en tu perfil.", "firstName": "Nombre", "lastName": "Apellido", "headline": "Título", "headlinePlaceholder": "p. ej. Periodista, Redactor jefe…", "headlineHelp": "Se muestra públicamente bajo tu nombre en las tarjetas de autor y en tu página de archivo.", "bio": "Biografía", "bioPlaceholder": "Un párrafo corto que se muestra en tu página de autor y debajo de tus artículos.", "bioHelp": "Visible en el sitio público en la barra lateral de autor y en la página de archivo del autor.", "socials": "Perfiles sociales", "socialsHelp": "Añade las URL de los perfiles que quieres mostrar en el sitio público y marca «Mostrar» para los que deben ser visibles. Las URL vacías se ignoran.", "socialsShow": "Mostrar", "socialsShowHelp": "Activa la visibilidad de esta red en el sitio público.", "avatar": "Foto de perfil", "avatarHelp": "Elige una imagen de tu biblioteca de medios. Las imágenes cuadradas se muestran mejor.", "pickAvatar": "Elegir de medios", "changeAvatar": "Cambiar foto", "removeAvatar": "Eliminar", "save": "Guardar perfil" }, "transfer": { "title": "Mover o hacer copia de seguridad del contenido", "help": "Exporta todo (entradas, páginas, categorías, metadatos de medios, perfiles, ajustes) en un único archivo JSON. En un backend Markdown o local puedes importar ese archivo conservando los ids — así se migra desde Firebase o SQLite. Los archivos de medios y las claves secretas no se incluyen.", "export": "Exportar el contenido (JSON)", "import": "Importar contenido…", "modeMerge": "Combinar (sobrescribe los mismos ids)", "modeReplace": "Reemplazar las colecciones importadas", "replaceConfirm": "El modo Reemplazar elimina todos los elementos existentes de las colecciones presentes en el archivo antes de importar. ¿Continuar?", "invalidFile": "Este archivo no es una exportación de contenido de AgentCMS.", "imported": "Se han importado {{posts}} entradas/páginas, {{terms}} términos y {{media}} medios. Ejecuta Regenerar → Todo para publicarlos." }, "encryption": { "title": "Cifrado de la base:", "on": "activado", "off": "desactivado", "onHelp": "El archivo de la base es ilegible sin la frase de contraseña. Cambiarla vuelve a guardar el archivo con una nueva clave; los demás navegadores pedirán la nueva frase.", "offHelp": "Cualquiera que pueda descargar el archivo de la base puede leerlo (un hosting estático lo sirve como cualquier página). Cífralo con una frase de contraseña.", "enable": "Cifrar la base…", "change": "Cambiar la frase de contraseña…", "savedConfirm": "He guardado esta frase en mi gestor de contraseñas — sin ella no se puede abrir el contenido.", "enableConfirm": "Cifrar ahora", "changeConfirm": "Cambiar la frase", "done": "Base guardada de nuevo con la nueva frase de contraseña." } };
const users$3 = { "title": "Usuarios", "noUsers": "Aún no hay usuarios.", "role": "Rol", "disabled": "Deshabilitado", "editProfileTitle": "Editar perfil — {{email}}", "profileSaved": "Perfil guardado.", "descriptionFirebase": "Gestiona tu equipo. Las nuevas cuentas se crean en la Firebase Console y se replican aquí en el primer inicio de sesión.", "descriptionSqlite": "Gestiona tu equipo. Usa el botón +Añadir usuario más abajo para crear cuentas directamente.", "addUser": "Añadir usuario", "addUserSuccess": "{{email}} añadido.", "removeConfirmFirebase": "¿Eliminar la ficha de {{email}}? Se quita su perfil y rol del CMS. Para revocar el acceso, elimina además la cuenta en la Firebase Console.", "removeConfirmSqlite": "¿Eliminar permanentemente a {{email}}? Se revoca su acceso Y se quitan su perfil y rol. Esta acción no se puede deshacer.", "empty": { "title": "Aún no hay miembros del equipo", "descriptionFirebase": "Crea la primera cuenta en la Firebase Console y luego inicia sesión aquí una vez para registrar el perfil.", "descriptionSqlite": "Pulsa +Añadir usuario arriba para invitar al primer miembro." }, "help": { "title": "Cómo añadir un nuevo miembro al equipo", "bootstrapLine": "El admin inicial (siempre con acceso total) es:", "firebase": { "step1": "Abre la Firebase Console → Authentication → Add user.", "step2": "Pon un correo y una contraseña y envíalos al nuevo miembro.", "step3": "Pídele que inicie sesión aquí una vez — su perfil aparece en la lista de arriba y puedes editar su rol y sus datos." }, "sqlite": { "step1": "Pulsa el botón +Añadir usuario de arriba.", "step2": "Introduce su correo y una contraseña temporal (8+ caracteres).", "step3": "Comparte las credenciales de forma segura — podrá cambiar la contraseña desde su perfil una vez iniciada la sesión." }, "git": { "step1": "Añade a la persona como colaboradora del repositorio de contenido (escritura = editor, admin / maintainer = admin).", "step2": "La persona crea su propio token de acceso personal en GitHub / GitLab.", "step3": "Abre el admin e inicia sesión con ese token — su perfil se crea aquí automáticamente." } }, "addUserModal": { "title": "Añadir un nuevo miembro del equipo", "intro": "Crea la cuenta directamente en la base de datos Flexweg SQLite Auth. El nuevo usuario tiene rol de editor por defecto; promociónalo desde la lista de abajo si necesita acceso de admin.", "submit": "Crear usuario", "submitting": "Creando…" }, "actions": { "editProfile": "Editar perfil", "promote": "Promover a administrador", "demote": "Degradar a editor", "disable": "Deshabilitar", "enable": "Habilitar", "delete": "Eliminar registro" }, "descriptionGit": "Los miembros del equipo son las personas con acceso de escritura al repositorio de contenido. Aparecen aquí tras su primer inicio de sesión; su rol sigue sus permisos en el repositorio.", "descriptionLocal": "Este admin funciona en modo de un solo usuario: el contenido se guarda en este navegador y no hay cuentas.", "descriptionSqliteFile": "Sin cuentas de usuario con este backend: cualquiera que pueda abrir el admin puede editar. Protege la carpeta del admin desde tu alojamiento. Los perfiles de autor de abajo son informativos." };
const firestoreSetup$3 = { "title": "Configuración de Firestore necesaria", "intro": "Las páginas de listado de entradas y páginas necesitan algunos índices compuestos de Firestore para consultar eficientemente. Deben crearse manualmente — Firebase reserva la creación de índices a los administradores del proyecto.", "checking": "Verificando tus índices Firestore…", "missingCount_one": "{{count}} índice falta:", "missingCount_other": "{{count}} índices faltan:", "openConsole": "Abrir Firebase Console para crear", "noUrl": "No se pudo extraer la URL de autosugerencia — consulta el README para el comando gcloud.", "howItWorks": "Cómo funciona", "step1": "Haz clic en el enlace de cada índice faltante — Firebase Console se abre con la definición pre-rellenada.", "step2": "Pulsa «Create» y espera 1–5 minutos a que el índice se construya (estado en la consola).", "step3": "Vuelve aquí y pulsa Reintentar. Cuando ambas consultas tengan éxito, el admin se carga.", "retry": "Reintentar", "retrying": "Reintentando…", "buildHint": "Los índices pueden tardar unos minutos en construirse tras la creación.", "allReady": "Todos los índices están listos.", "unexpectedTitle": "No se puede acceder a Firestore", "unexpectedHint": "Verifica tu conexión y las reglas de Firestore. Si acabas de crear los índices, espera a que terminen y reintenta." };
const errors$3 = { "appError": "Error de la aplicación", "loadAccountFailed": "No se pudo cargar tu cuenta", "loadAccountHint": "Si el problema persiste, cierra sesión e inténtalo de nuevo.", "accountDisabled": "Cuenta deshabilitada", "accountDisabledMessage": "Tu acceso a este CMS ha sido deshabilitado. Contacta con tu administrador.", "firebaseNotConfigured": "Firebase no está configurado", "firebaseEnvMissing": "Faltan las siguientes variables de entorno:\n{{vars}}\n\nCopia .env.example a .env, rellena las credenciales de tu proyecto Firebase y reinicia el servidor de desarrollo.", "adminEmailNotConfigured": "El correo del admin no está configurado", "adminEmailMessage": "Falta VITE_ADMIN_EMAIL en .env. Establécelo con el correo del administrador inicial.", "consoleHint": "Revisa la consola del navegador y tu configuración .env. Consulta el README para las instrucciones de configuración." };
const identity$3 = { "brandTitle": "AgentCMS", "brandSubtitle": "Publicación estática", "login": { "heading": "Iniciar sesión", "intro": "Usa el correo y la contraseña que te ha facilitado tu administrador.", "submit": "Iniciar sesión", "submitting": "Iniciando sesión…" }, "fields": { "name": "Nombre a mostrar (opcional)", "namePlaceholder": "Juan Pérez", "email": "Correo electrónico", "password": "Contraseña", "passwordHint": "Al menos 8 caracteres." }, "footer": "Las nuevas cuentas las crea un administrador desde la página Usuarios.", "errors": { "invalidEmail": "Introduce una dirección de correo válida.", "missingPassword": "La contraseña es obligatoria.", "passwordTooShort": "La contraseña debe tener al menos 8 caracteres." } };
const setup$3 = /* @__PURE__ */ JSON.parse('{"title":"Bienvenido a AgentCMS","subtitle":"Configuración inicial","intro":"Introduce tus credenciales de Firebase, la cuenta del administrador inicial y tu clave API de Flexweg. Los valores se validan, se guardan en tu proyecto (Firestore + un archivo config.js en Flexweg) y el admin recarga al flujo de inicio de sesión normal. Solo tienes que hacerlo una vez.","introFirebase":"Paso 1 — Firebase. Introduce las credenciales de tu proyecto Firebase y la cuenta de administrador bootstrap. Iniciamos sesión, verificamos el correo y comprobamos que tus reglas de Firestore reconozcan a este admin antes de pasar al paso Flexweg.","introFlexweg":"Paso 2 — Flexweg. Introduce tu clave API Flexweg y la URL del sitio. Probamos la API, guardamos la configuración en Firestore, subimos config.js a tu sitio y sincronizamos los activos del tema.","continueToFlexweg":"Validar Firebase y continuar","stepper":{"terms":"Condiciones","backend":"Backend","firebase":"Firebase","flexweg":"Flexweg","sqlite":"SQLite","docstore":"Contenido y publicación","data":"Datos","hosting":"Hosting","install":"Instalación"},"backend":{"title":"Elige un backend de datos","intro":"Elige dónde el CMS guardará tus posts, páginas, usuarios y ajustes. Puedes cambiarlo luego desde Ajustes (los datos no se migran).","sqliteTitle":"Flexweg SQLite (recomendado)","sqliteHint":"Todos los datos se quedan en tu sitio Flexweg como un archivo SQLite. Sin servicio externo. La auth la proporciona la API SQLite de Flexweg.","firebaseTitle":"Firebase","firebaseHint":"Usa un proyecto Firebase para Firestore + Auth. Gratis con el plan Spark. Actualizaciones en tiempo real vía onSnapshot.","continue":"Continuar","markdownGitTitle":"Archivos Markdown en un repositorio Git","markdownGitHint":"Entradas como archivos .md en GitHub / GitLab (o un clon local). Cada editor inicia sesión con su propio token de acceso; cada cambio es un commit. Sin base de datos, funciona con varios editores y equipos.","localTitle":"Solo este navegador","localHint":"Un solo usuario, sin inicio de sesión, nada que configurar. El contenido se queda en este navegador (expórtalo desde Ajustes). Ideal para un admin que se ejecuta en tu propio ordenador."},"sqlite":{"heading":"Conecta tu sitio Flexweg","intro":"Usaremos tu clave API maestra de Flexweg UNA SOLA VEZ para crear un token con alcance limitado para la base de datos SQLite. Tras la instalación, la clave maestra se descarta y solo se almacena el token con alcance (limitado a este único archivo SQLite).","apiKeyHint":"Clave API maestra de Flexweg. Se usa solo para instalar — nunca se almacena después.","detectedFromUrl":"Detectado desde la URL","advanced":"Ajustes avanzados (URL del sitio, ruta SQLite…)","pathHint":"Dónde vive el archivo SQLite en tu sitio Flexweg. Las carpetas se crean automáticamente.","adminHeading":"Cuenta de administrador","adminIntro":"Crea el primer usuario — esta cuenta obtiene derechos de admin automáticamente. Los miembros siguientes se incorporan desde la página Usuarios una vez con sesión iniciada.","passwordHint":"Al menos 8 caracteres.","submit":"Instalar base de datos SQLite"},"terms":{"title":"Condiciones de uso","intro":"Por favor, lee y acepta las condiciones a continuación antes de utilizar AgentCMS. Están redactadas en lenguaje sencillo para que se lean rápido.","section1":{"title":"1. Servicio gratuito","body":"AgentCMS es una herramienta que Flexweg pone a tu disposición de forma gratuita. Puedes usarla sin límite con tu hosting Flexweg — Flexweg nunca te facturará por usar el CMS en sí. Las tarifas habituales de tu plan de hosting Flexweg y de tu plan Firebase siguen aplicándose, cada una en la cuenta correspondiente."},"section2":{"title":"2. Servicio «tal cual», sin garantía","body":"El CMS se proporciona tal cual. Trabajamos para mantenerlo estable y mejorarlo con el tiempo, pero no podemos garantizar que esté libre de errores, defectos o interrupciones. Úsalo con la misma precaución que cualquier herramienta que no hayas escrito tú mismo: mantén copias de seguridad de los contenidos importantes."},"section3":{"title":"3. Tus contenidos, tu responsabilidad","body":"Eres el único responsable de los contenidos que publicas a través del CMS — textos, imágenes, vídeos, formularios, integraciones de código y cualquier otro medio. Debes respetar la legislación aplicable en tu jurisdicción (y en las que te dirijas), los derechos de autor, los derechos de imagen y de personalidad, las normas de protección de datos personales y las condiciones de cualquier servicio de terceros que utilices (fuentes embebidas, vídeos, etc.). Flexweg no es responsable de los contenidos publicados por los usuarios del CMS."},"section4":{"title":"4. Tu cuenta de Firebase, tu seguridad","body":"El CMS almacena sus datos en tu propio proyecto Firebase. Eres responsable de la seguridad de ese proyecto: elige una contraseña robusta para la cuenta de administrador inicial, configura las reglas de seguridad de Firestore como se documenta, rota tus claves API cuando sea necesario y revisa quién tiene acceso. Flexweg no podrá en ningún caso ser responsabilizado por accesos no autorizados, fugas de datos, hackeos o pérdidas derivadas de una mala configuración o de un compromiso de tu cuenta Firebase."},"section5":{"title":"5. Limitación de responsabilidad","body":"Flexweg no podrá ser responsabilizado por ninguna pérdida de ingresos, pérdida de datos, pérdida de oportunidad comercial ni por ningún daño directo o indirecto derivado del uso, mal uso o falta de disponibilidad del CMS. Cuando la legislación aplicable obligue a Flexweg a asumir alguna responsabilidad, ésta se limita al importe efectivamente pagado a Flexweg por el CMS durante los últimos 12 meses — es decir, cero, ya que el CMS es gratuito."},"section6":{"title":"6. Tus datos siguen siendo tuyos","body":"Los contenidos que creas con el CMS se almacenan en tu propio proyecto Firebase (textos, ajustes, metadatos de los medios) y en tu propio hosting Flexweg (HTML publicado, imágenes, assets de tema). El CMS en sí no transmite tus contenidos a ningún servicio de terceros. Los plugins o temas que decidas activar pueden tener su propio comportamiento — revisa lo que hacen antes de activarlos."},"section7":{"title":"7. Uso correcto","body":"El uso del CMS para actividades ilegales, fraudulentas o nocivas, o de manera contraria a las condiciones generales de uso de Flexweg, puede provocar la suspensión de tu acceso al hosting Flexweg. También podemos actualizar estas condiciones del CMS con el tiempo; los cambios significativos se comunicarán a través del admin o por email."},"accept":"He leído y acepto las Condiciones de uso.","continue":"Continuar a la configuración","back":"Volver"},"sections":{"firebase":"Firebase","admin":"Administrador inicial","flexweg":"API de Flexweg"},"help":{"firebase":"Encuentra estos valores en Firebase Console → Configuración del proyecto → General → Tus apps → Configuración del SDK.","admin":"Usa un usuario existente de Firebase Authentication. Cualquiera que inicie sesión con este correo es tratado como administrador y se salta la comprobación del registro de usuario. Crea el usuario en Firebase Console → Authentication si aún no existe.","flexweg":"Genera una clave API permanente en tu cuenta Flexweg → API. La URL del sitio es la dirección pública de tu sitio Flexweg (p. ej. https://tu-sitio.flexweg.com).","flexwegApiKeyHint":"Obtén tu clave API desde la configuración de tu cuenta Flexweg.","flexwegApiKeyLink":"Abrir configuración de la cuenta"},"fields":{"apiKey":"Clave API","authDomain":"Dominio de autenticación","projectId":"ID del proyecto","storageBucket":"Bucket de almacenamiento","messagingSenderId":"ID de remitente de mensajería","appId":"ID de la app","adminEmail":"Correo","adminPassword":"Contraseña","flexwegApiKey":"Clave API","flexwegSiteUrl":"URL del sitio","flexwegApiBaseUrl":"URL base de la API","sqlitePath":"Ruta SQLite"},"submit":"Guardar y continuar","submitting":"Configurando…","success":"¡Configuración completada!","reloadingHint":"Se recargará el admin en un momento — espera un instante.","footer":"Estos valores se guardan en tu proyecto (Firestore + Flexweg). No se envían a ningún otro sitio.","steps":{"signInFirebase":"Iniciando sesión en Firebase…","testFlexweg":"Probando la API de Flexweg…","writeFirestore":"Guardando configuración…","uploadConfig":"Subiendo config.js a Flexweg…","syncThemes":"Sincronizando assets de tema con Flexweg…","sqliteInstall":"Creando token SQLite con alcance limitado…","sqliteRegisterAdmin":"Registrando la cuenta de admin…","sqliteSchema":"Inicializando el esquema SQLite…"},"stepsDone":{"sqliteInstall":"Token SQLite con alcance limitado emitido","sqliteRegisterAdmin":"Admin registrado y con sesión iniciada","sqliteSchema":"Esquema SQLite listo"},"errors":{"missingFields":"Por favor, rellena todos los campos.","rootDeploymentTitle":"El admin debe estar en una subcarpeta, no en la raíz del sitio.","rootDeploymentHint":"Mueve los archivos del admin (index.html, config.js, runtime/, …) a una subcarpeta en Flexweg — por ejemplo /admin/ o un nombre aleatorio como /erf34f654GH3/ para mayor discreción. Luego recarga el admin desde la URL de la subcarpeta y vuelve a ejecutar la configuración.","firebaseAuthGeneric":"No se pudo iniciar sesión en Firebase.","firebaseAuthInvalidCredential":"Firebase rechazó la combinación de correo y contraseña.","firebaseAuthInvalidCredentialHint":"Los proyectos de Firebase recientes activan por defecto la protección contra enumeración de correos, que devuelve el mismo error tanto si la contraseña es incorrecta, como si el usuario no existe o inicia sesión con otro proveedor. A comprobar:\\n• Vuelve a introducir la contraseña — copia y pega desde un gestor de contraseñas para descartar erratas. La longitud mínima es 6 caracteres.\\n• Abre Firebase Console → Authentication → Users y confirma que el correo existe. Revisa la columna «Providers»: si solo muestra Google (u otro proveedor) sin «Email/Password», establece o restablece la contraseña desde el menú de la fila (⋮ → Restablecer contraseña).\\n• Verifica que el correo coincida exactamente con lo que está almacenado en Firebase.","firebaseAuthUserNotFound":"No existe un usuario de Firebase con este correo. Créalo primero en Firebase Console → Authentication → Users.","firebaseAuthInvalidEmail":"El correo del administrador no es una dirección válida.","firebaseInvalidApiKey":"La clave API de Firebase no es válida. Verifica el valor en Firebase Console.","firebaseNetwork":"Error de red al iniciar sesión en Firebase. Verifica tu conexión.","firebaseTooManyRequests":"Demasiados intentos de inicio de sesión. Inténtalo más tarde o restablece la contraseña desde Firebase Console.","firebaseOperationNotAllowed":"El inicio de sesión con correo/contraseña no está activado en este proyecto Firebase. Abre Firebase Console → Authentication → Sign-in method y habilita el proveedor Email/Password.","firebaseUserDisabled":"Esta cuenta de usuario de Firebase está deshabilitada. Vuelve a habilitarla desde Firebase Console → Authentication → Users.","wrongAdminEmail":"La cuenta de Firebase con la que iniciaste sesión no coincide con el correo de admin que has escrito. Inténtalo de nuevo.","rulesNotPinnedTitle":"Las reglas de Firestore aún no te reconocen como admin bootstrap.","rulesNotPinnedHint":"Abre Firebase Console → Firestore → Reglas y sustituye el valor de `bootstrapAdminEmail()` por: {{email}} — luego haz clic en Publicar. La plantilla de reglas del README incluye un marcador `you@example.com` que debe sustituirse por tu correo de admin real. Una vez publicadas las nuevas reglas, vuelve a hacer clic en Enviar aquí.","flexwegAuth":"Clave API de Flexweg rechazada. Verifica el valor en tu cuenta Flexweg → API.","flexwegNetwork":"Error de red al contactar con Flexweg. Verifica la URL base de la API y tu conexión.","flexwegHttp":"Error de la API de Flexweg ({{status}}): {{detail}}","firestoreRulesTitle":"Firestore rechazó la escritura de la configuración.","firestoreRulesHint":"Abre Firebase Console → Firestore → Reglas y comprueba que el correo de admin de bootstrap está fijado en \'{{email}}\'. El README incluye una plantilla de reglas lista para copiar.","firestoreOther":"Falló la escritura en Firestore","uploadFailed":"No se pudo subir config.js a Flexweg","generic":"Algo salió mal."},"docstore":{"contentTitle":"Repositorio de contenido","contentIntro":"Donde se guardan tus entradas, páginas y ajustes como archivos Markdown + JSON. Un repositorio vacío sirve — el CMS crea los archivos.","provider":"Repositorio","localClone":"Carpeta local (clon git)","localCloneHint":"Elige la carpeta de tu clon. Sincronízala con tu cliente git habitual — el CMS lee y escribe archivos, no ejecuta git.","contentDir":"Carpeta de contenido en el repositorio","privateRepo":"Usa un repositorio privado: los borradores se guardan allí.","folderRequired":"Elige primero la carpeta de contenido.","checking":"Comprobando el acceso al repositorio…","publishIntro":"Dónde se publica el sitio generado. Puedes cambiarlo más tarde en Ajustes.","existingSite":"Este repositorio ya está configurado — el sitio se sigue publicando en: {{target}}. Puedes cambiarlo más tarde en Ajustes (las claves secretas, si las hay, deben volver a introducirse allí).","install":"Instalar","steps":{"config":"Guardando la configuración…","content":"Cargando el contenido…","target":"Guardando el destino de publicación…","testTarget":"Probando el destino de publicación…"},"doneTitle":"¡Todo listo!","doneBody":"La configuración se ha guardado en este navegador. Para ahorrar este paso a otros editores, descarga config.js y reemplaza el de la carpeta admin de tu alojamiento.","downloadConfig":"Descargar config.js","open":"Abrir el admin","footer":"El contenido se queda en tu repositorio o en este navegador; los tokens de acceso nunca salen de este navegador."},"data":{"title":"1. ¿Dónde guardas tus datos?","intro":"Tus entradas, páginas, usuarios y ajustes — los datos propios del admin. Es independiente de dónde se aloja el sitio público (siguiente paso).","localNote":"Nada que configurar: el contenido se guarda en este navegador. Expórtalo desde Ajustes para hacer una copia de seguridad o moverlo más tarde.","options":{"sqlite-file":{"title":"SQLite","hint":"Una base de datos SQLite guardada en el alojamiento que elijas en el siguiente paso (Flexweg, tu servidor, S3, Git…). Sin cuentas de usuario — o el servicio SQLite de Flexweg, con cuentas, si alojas en Flexweg."},"flexweg-sqlite":{"title":"SQLite (servicio Flexweg)","hint":"Una base de datos SQLite gestionada por el servicio de Flexweg, con cuentas de usuario integradas. Necesita una cuenta de Flexweg, esté donde esté alojado el sitio."},"firebase":{"title":"Firebase","hint":"Firestore + Firebase Auth en tu proyecto de Google. Tiempo real, plan Spark gratuito."},"markdown-git":{"title":"Archivos Markdown en Git","hint":"Entradas como archivos .md en un repositorio GitHub / GitLab (o un clon local). Cada editor usa su propio token; cada cambio es un commit."},"local":{"title":"Este navegador","hint":"Un solo usuario, sin inicio de sesión, nada que configurar. Ideal para un admin que se ejecuta en tu ordenador."}}},"hosting":{"title":"2. ¿Dónde se publica el sitio?","intro":"Dónde se sube el sitio estático generado (HTML, CSS, imágenes) cada vez que publicas. Puedes cambiarlo más tarde en Ajustes.","existing":"Este repositorio de contenido ya publica en el destino de abajo. Mantenlo o elige otro."},"install":{"title":"3. Instalación","intro":"Revisa el resumen y luego instala.","data":"Datos","hosting":"Hosting","saveTarget":"Guardando el destino de publicación…","noteConfigJs":"La configuración del admin (config.js) se sube junto al admin en Flexweg cuando es posible; si no, se te ofrecerá descargarla.","noteLocalConfig":"La configuración se guarda en este navegador; se te ofrecerá config.js para ponerlo en la carpeta del admin y que otros editores se salten esta configuración."},"sqliteFile":{"security":"Sin cuentas de usuario: cualquiera que pueda abrir este admin puede editar el contenido — protege la carpeta del admin en tu hosting. El archivo de la base se sirve como cualquier otro archivo: mantenlo cifrado o guárdalo en una ubicación privada aparte.","intro":"Dónde se guarda el archivo de base de datos. Este admin lo lee y lo guarda a través de los mismos conectores que el alojamiento.","path":"Ruta del archivo de base de datos","pathHint":"Se crea al guardar por primera vez si aún no existe. Con un repositorio Git, cada guardado es un commit — mejor usa un repositorio o una rama que no lance un build del sitio.","existing":"base de datos existente","new":"nueva base de datos","dataNote":"Nada que configurar aquí: la base de datos se guardará en el alojamiento que elijas en el siguiente paso.","heading":"Base de datos SQLite","flexwegService":"Usar el servicio SQLite de Flexweg","flexwegServiceHint":"La base de datos la gestiona Flexweg e incluye cuentas de usuario integradas (correo + contraseña). Si no, es un simple archivo en este alojamiento, sin cuentas.","summaryFile":"Archivo {{path}} en este alojamiento","summaryService":"Servicio SQLite de Flexweg ({{path}})","encrypt":"Cifrar la base","encryptHint":"Recomendado en un hosting público: el archivo es ilegible sin la frase de contraseña. Cada navegador nuevo la pide una vez.","passphrase":"Frase de contraseña","passphraseHint":"Guárdala ahora en tu gestor de contraseñas: sin ella nadie puede abrir la base, ni siquiera tú.","copy":"Copiar","copied":"Copiada","generate":"Nueva","passphraseTooShort":"La frase de contraseña debe tener al menos 12 caracteres.","existingEncrypted":"Ya existe una base cifrada en esta ruta: introduce su frase de contraseña.","separate":"Guardar la base en una ubicación privada aparte","separateHint":"P. ej. un bucket S3 / R2 privado o un repositorio Git privado: la base nunca la sirve el sitio público.","summaryEncrypted":"cifrada","summaryLocation":"guardada en {{location}}","locationLabel":"Ubicación de la base","gitBranchNote":"La base se guarda en la rama {{branch}} de este repositorio, que nunca se publica: guardar contenido no vuelve a generar el sitio.","summaryBranch":"en la rama {{branch}}"},"adminHosting":{"deploying":"Copiando el admin al sitio…","label":"Alojar también el admin en este sitio","hint":"El admin se copia en {{url}} con su config.js (sin secretos dentro) — así cada editor puede abrirlo allí. Cada editor sigue iniciando sesión con su propio acceso.","folder":"Carpeta del admin","alreadyHere":"Este admin ya se ejecuta desde este sitio: su config.js se actualizará en su lugar.","doneBody":"El admin ya está en tu sitio. En GitHub Pages, activa primero Pages para el repositorio si aún no lo has hecho (Settings → Pages) y luego ábrelo:","open":"Abrir el admin en línea","continueHere":"Continuar en este admin"}}');
const flexweg$3 = { "actions": { "upload": "Subiendo archivo", "delete": "Eliminando archivo", "rename": "Renombrando archivo", "get": "Leyendo archivo", "list": "Listando archivos", "createFolder": "Creando carpeta", "renameFolder": "Renombrando carpeta", "deleteFolder": "Eliminando carpeta", "storageLimits": "Leyendo límites de almacenamiento", "commit": "Publicando cambios" }, "errors": { "configMissing": "El destino de publicación no está configurado. Configúralo en Ajustes antes de publicar.", "network": "{{action}}: error de red o CORS bloqueado. Comprueba tu conexión.", "auth": "{{action}}: falló la autenticación. Revisa las credenciales del destino de publicación en Ajustes.", "notFound": "{{action}}: no se encontró en el destino de publicación.", "tooLarge": "{{action}}: archivo demasiado grande para el destino de publicación.", "rateLimited": "{{action}}: demasiadas peticiones, vuelve a intentarlo en un momento.", "serverError": "{{action}}: error del servidor del destino de publicación ({{status}}). Inténtalo de nuevo.", "generic": "{{action}} falló ({{status}}){{detail}}.", "unsupported": "{{action}}: no compatible con el destino de publicación «{{connector}}».", "unknownConnector": "Destino de publicación desconocido «{{connector}}». Revisa Ajustes → Destino de publicación.", "folderAccess": "Sin acceso a la carpeta local. Abre Ajustes → Destino de publicación y pulsa «Reconectar carpeta»." } };
const publish$3 = { "log": { "rendering": "Generando página…", "uploading": "Subiendo {{path}}…", "deleting": "Eliminando {{path}}…", "regenerating": "Regenerando listados…", "skipped": "Omitido {{path}} (sin cambios)", "done": "Publicado en {{url}}", "failed": "Falló: {{error}}" } };
const docstore$3 = { "errors": { "notConnected": "No conectado al repositorio de contenido. Vuelve a iniciar sesión con tu token de acceso.", "conflict": "Otra persona modificó este elemento mientras tanto. Ahora se muestra su versión: vuelve a aplicar tu cambio.", "sqliteUnsupported": "El destino «{{connector}}» no puede guardar un archivo de base de datos." } };
const connectors$3 = { "target": "Destino de publicación", "settingsTitle": "Destino de publicación", "settingsHelp": "Dónde se sube el sitio renderizado al publicar. Las credenciales se guardan con tu backend de contenido (o en este navegador para los repositorios Git de contenido) y todos los admins pueden leerlas.", "saved": "Destino de publicación guardado. Ejecuta Regenerar → Todo para publicar el sitio completo en el nuevo destino.", "test": "Probar la conexión", "testOk": "Conexión OK", "testFailed": "Error de conexión", "names": { "flexweg": "Flexweg", "git-pages": "Repositorio Git (GitHub Pages, Cloudflare Pages, GitLab Pages…)", "s3": "Bucket compatible con S3 (AWS S3, Cloudflare R2, Backblaze B2, OVH…)", "php-bridge": "Tu propio servidor (bridge PHP)", "browser-mirror": "Descargar como ZIP", "local-folder": "Carpeta local en este ordenador" }, "hints": { "flexweg": "Subida a través de la API Files de Flexweg.", "git-pages": "Cada publicación es un commit en el repositorio; el alojamiento reconstruye el sitio a partir de él.", "s3": "Requiere una regla CORS en el bucket que permita el origen de este admin, y alojamiento web (o una CDN) para servir los archivos index.html.", "php-bridge": "Sube external/bridges/php/flexweg-bridge.php a tu servidor, define su clave de API y luego introduce su URL aquí.", "browser-mirror": "El sitio se guarda en este navegador; descarga el ZIP y súbelo a mano donde quieras.", "local-folder": "Escribe el sitio directamente en una carpeta (Chrome / Edge). Sírvelo en local o súbelo con tus propias herramientas." }, "fields": { "flexweg": { "apiKey": "Clave de API", "siteUrl": "URL del sitio", "apiBaseUrl": "URL base de la API" }, "git-pages": { "host": "Alojamiento", "provider": "Proveedor Git", "owner": "Propietario (usuario u organización)", "repo": "Repositorio", "project": "Ruta del proyecto", "branch": "Rama", "dir": "Carpeta en el repositorio", "token": "Token de acceso", "siteUrl": "URL pública del sitio", "apiBaseUrl": "URL de la API (solo autoalojado)" }, "s3": { "endpoint": "Endpoint", "region": "Región", "bucket": "Bucket", "prefix": "Prefijo de claves (opcional)", "accessKeyId": "ID de clave de acceso", "secretAccessKey": "Clave de acceso secreta", "siteUrl": "URL pública del sitio", "forcePathStyle": "URLs de tipo ruta (MinIO, R2, la mayoría de compatibles)", "publicRead": "Hacer públicos los archivos subidos (ACL public-read) — para buckets que no son públicos mediante una política (OVHcloud, Scaleway…). Déjalo desactivado en buckets de AWS con «bucket owner enforced»." }, "php-bridge": { "apiBaseUrl": "URL del bridge", "apiKey": "Clave de API del bridge", "siteUrl": "URL pública del sitio" }, "browser-mirror": { "siteUrl": "URL pública del sitio (opcional)" }, "local-folder": { "siteUrl": "URL en la que se sirve la carpeta (opcional)" } }, "help": { "flexweg": { "apiKey": "Se genera desde tu cuenta de Flexweg → API." }, "git-pages": { "host": "Cloudflare Pages: conecta el proyecto a este repositorio sin comando de build y con la carpeta de salida de abajo. Funciona con repositorios privados.", "dir": 'Déjalo vacío para la raíz del repositorio. GitHub Pages: "" o "docs". GitLab Pages: "public".', "token": "Token fine-grained sobre este repositorio con Contents: read & write (GitHub) — añade Pages: read & write para que el CMS pueda activar GitHub Pages — o un token con el scope api (GitLab). Déjalo vacío para usar el token de acceso de cada editor cuando el contenido está en el mismo proveedor.", "siteUrl": "p. ej. https://user.github.io/repo — una URL con subcarpeta sirve, los enlaces se ajustan automáticamente." }, "s3": { "endpoint": "Déjalo vacío para AWS (se deduce de la región). R2: https://<account-id>.r2.cloudflarestorage.com", "siteUrl": "La URL de sitio web del bucket o tu dominio de CDN." }, "php-bridge": { "apiBaseUrl": "La URL completa de flexweg-bridge.php en tu servidor (HTTPS)." }, "browser-mirror": { "siteUrl": "Donde subirás el ZIP — se usa para las URLs absolutas (sitemaps, RSS, medios)." }, "local-folder": { "siteUrl": "p. ej. http://localhost:8080 cuando un servidor web local sirve la carpeta." } }, "options": { "github-pages": "GitHub Pages", "cloudflare-pages": "Cloudflare Pages (conectado al repositorio)", "gitlab-pages": "GitLab Pages", "other": "Otro (Netlify, Vercel, git pull en el servidor…)", "github": "GitHub", "gitlab": "GitLab" }, "folder": { "choose": "Elegir carpeta…", "change": "Cambiar de carpeta…", "reconnect": "Volver a conectar la carpeta", "unsupported": "Este navegador no puede escribir en carpetas locales. Usa Chrome o Edge." }, "mirror": { "download": "Descargar el sitio (ZIP)", "count": "{{count}} archivos en este navegador" }, "adminHosting": { "title": "Admin en este sitio", "help": "Copia este admin en el destino de publicación (primer despliegue, o actualización tras una nueva versión). Su config.js no contiene secretos.", "deploy": "Desplegar / actualizar el admin", "deployed": "Admin desplegado ({{count}} archivos) — {{url}}" }, "pages": { "enabled": "GitHub Pages activado para este repositorio — el sitio estará en línea en un minuto aproximadamente.", "enableHint": 'Publicación completada. Para poner el sitio en línea, activa GitHub Pages para {{repo}}: Settings → Pages → Deploy from a branch → {{branch}} / {{folder}}. (O da al token el permiso "Pages: read and write" y el CMS lo hará por ti.)' }, "siteUrl": { "mismatch": "La URL pública del sitio (Ajustes → Sitio) es {{site}}, pero este destino sirve el sitio en {{target}}. Los enlaces, el CSS y los sitemaps siguen la URL del sitio: serán incorrectos en este alojamiento.", "use": "Usar {{url}} para el sitio", "updated": "URL del sitio actualizada. Ejecuta Regenerar → Todo para volver a publicar las páginas con los nuevos enlaces." } };
const gitAccess$3 = { "heading": "Conectar con el repositorio de contenido", "tokenIntro": "El contenido se guarda en el repositorio {{provider}} {{repo}}. Inicia sesión con tu propio token de acceso personal — tus permisos en el repositorio deciden tu rol (escritura = editor, admin / maintainer = admin).", "token": "Token de acceso personal", "tokenHelpGithub": "Token fine-grained, con acceso solo a este repositorio, permiso Contents: lectura y escritura.", "tokenHelpGitlab": "Token con el api scope, rol Developer o superior en este proyecto.", "createToken": "Crear un token", "connect": "Conectar", "tokenStorage": "El token se guarda solo en este navegador. Al cerrar sesión se olvida.", "failed": "Este token no puede escribir en el repositorio (no válido, caducado o de solo lectura). Comprueba sus permisos.", "folderIntro": "El contenido se guarda en una carpeta de este ordenador (normalmente un clon git que sincronizas con tu propio cliente git). Concede acceso a este navegador — los navegadores vuelven a pedirlo tras cada recarga.", "openFolder": "Abrir la carpeta de contenido" };
const hosting$3 = { "flexweg": { "title": "Flexweg", "short": "Hosting Flexweg", "hint": "Sube a través de la Flexweg Files API. Clave API de tu cuenta Flexweg." }, "github-pages": { "title": "GitHub Pages", "short": "Gratis, desde un repositorio GitHub", "hint": "Cada publicación es un commit en el repositorio; GitHub Pages lo sirve. Settings → Pages → Deploy from a branch. Repositorios públicos en el plan gratuito." }, "cloudflare-pages": { "title": "Cloudflare Pages", "short": "Gratis, admite repositorios privados", "hint": "El CMS hace commit del sitio en un repositorio GitHub / GitLab; conecta un proyecto de Cloudflare Pages a él (sin comando de build, carpeta de salida = la carpeta de abajo)." }, "gitlab-pages": { "title": "GitLab Pages", "short": "Gratis, desde un repositorio GitLab", "hint": "Cada publicación es un commit; el CMS añade un .gitlab-ci.yml mínimo que publica la carpeta public/." }, "git-other": { "title": "Netlify, Vercel…", "short": "Cualquier host que despliegue un repositorio", "hint": "El CMS hace commit del sitio en un repositorio Git; conecta tu host (Netlify, Vercel, un servidor que ejecuta git pull…) a ese repositorio." }, "s3": { "title": "S3 / R2 / B2…", "short": "Bucket de almacenamiento de objetos", "hint": "AWS S3, Cloudflare R2, Backblaze B2, OVH, Scaleway, MinIO… Requiere una regla CORS en el bucket y alojamiento web o un CDN delante." }, "own-server": { "title": "Tu propio servidor (FTP / SFTP)", "short": "Hosting compartido, VPS…", "hint": "Los navegadores no hablan FTP ni SFTP: sube una vez el puente PHP (external/bridges/php/flexweg-bridge.php) con tu cliente FTP, define su clave API y luego introduce su URL aquí. Funciona en cualquier host PHP." }, "local-folder": { "title": "Carpeta local", "short": "En este ordenador", "hint": "Escribe el sitio en una carpeta de este ordenador (Chrome / Edge). Sírvelo localmente o súbelo con tus propias herramientas." }, "zip": { "title": "Descargar como ZIP", "short": "Súbelo a mano", "hint": "El sitio se guarda en este navegador; descarga un ZIP desde Ajustes y súbelo donde quieras (Netlify Drop, cliente FTP…)." } };
const sqliteAccess$3 = { "heading": "Conectarse a la base de datos", "intro": "Este admin guarda su contenido en {{path}}. Introduce las credenciales de acceso para este navegador.", "storage": "Las credenciales solo se guardan en este navegador. Al cerrar sesión se olvidan.", "passphrase": "Frase de contraseña de la base", "passphraseHint": "La base está cifrada. Introduce la frase de contraseña elegida en la instalación (se guarda solo en este navegador).", "passphraseWrong": "Frase de contraseña incorrecta: no se pudo abrir la base.", "passphraseMissing": "Introduce la frase de contraseña de la base." };
const es = {
  common: common$3,
  auth: auth$3,
  nav: nav$3,
  dashboard: dashboard$3,
  posts: posts$3,
  pages: pages$3,
  taxonomies: taxonomies$3,
  media: media$3,
  themes: themes$3,
  plugins: plugins$3,
  externalInstall: externalInstall$3,
  externalLoader: externalLoader$3,
  menus: menus$3,
  settings: settings$3,
  users: users$3,
  firestoreSetup: firestoreSetup$3,
  errors: errors$3,
  identity: identity$3,
  setup: setup$3,
  flexweg: flexweg$3,
  publish: publish$3,
  docstore: docstore$3,
  connectors: connectors$3,
  gitAccess: gitAccess$3,
  hosting: hosting$3,
  sqliteAccess: sqliteAccess$3
};
const common$2 = { "save": "Opslaan", "saving": "Opslaan…", "saved": "Opgeslagen", "cancel": "Annuleren", "delete": "Verwijderen", "deleting": "Verwijderen…", "edit": "Bewerken", "create": "Aanmaken", "search": "Zoeken", "loading": "Laden…", "yes": "Ja", "no": "Nee", "confirm": "Bevestigen", "back": "Terug", "next": "Volgende", "previous": "Vorige", "close": "Sluiten", "all": "Alle", "none": "Geen", "actions": "Acties", "name": "Naam", "slug": "Slug", "description": "Beschrijving", "status": "Status", "createdAt": "Aangemaakt", "updatedAt": "Bijgewerkt", "publishedAt": "Gepubliceerd", "language": "Taal", "darkMode": "Donkere modus", "lightMode": "Lichte modus", "signOut": "Uitloggen", "administrator": "Beheerder", "editor": "Redacteur", "appName": "AgentCMS" };
const auth$2 = { "signIn": "Inloggen", "signingIn": "Inloggen…", "email": "E-mail", "password": "Wachtwoord", "emailPlaceholder": "u@bedrijf.com", "passwordPlaceholder": "••••••••", "forgotPassword": "Wachtwoord vergeten?", "resetEmailSent": "E-mail om wachtwoord opnieuw in te stellen verzonden naar {{email}}.", "enterEmailFirst": "Voer eerst uw e-mail hierboven in en klik dan op resetten.", "emailPasswordRequired": "E-mail en wachtwoord zijn vereist.", "signInSubtitle": "Gebruik uw werk-e-mail en wachtwoord.", "footer": "Accountaanvragen verlopen via uw beheerder.", "errors": { "invalidEmail": "Ongeldig e-mailadres.", "invalidCredentials": "Ongeldig e-mailadres of wachtwoord.", "tooManyRequests": "Te veel pogingen. Probeer later opnieuw of stel uw wachtwoord opnieuw in.", "userDisabled": "Dit account is uitgeschakeld.", "networkFailed": "Netwerkfout. Controleer uw verbinding.", "generic": "Authenticatie mislukt." } };
const nav$2 = { "openMenu": "Menu openen", "closeMenu": "Menu sluiten", "dashboard": "Dashboard", "posts": "Berichten", "pages": "Pagina's", "taxonomies": "Categorieën & Tags", "media": "Media", "themes": "Thema's", "themeSettings": "Thema-instellingen", "plugins": "Plugins", "menus": "Menu's", "users": "Gebruikers", "settings": "Instellingen" };
const dashboard$2 = { "title": "Dashboard", "welcome": "Welkom terug, {{email}}.", "stats": { "totalPosts": "Berichten", "totalPages": "Pagina's", "online": "Online", "drafts": "Concepten" } };
const posts$2 = { "title": "Berichten", "newPost": "Nieuw bericht", "noPosts": "Nog geen berichten. Maak uw eerste bericht om te beginnen.", "noPostsInFilter": "Geen berichten passen bij het huidige filter.", "search": { "placeholder": "Berichten zoeken…", "clear": "Zoekopdracht wissen", "noResults": "Geen berichten komen overeen met uw zoekopdracht." }, "pagination": { "previous": "Vorige", "next": "Volgende", "showing": "{{from}}–{{to}} van {{total}} weergegeven", "pageOf": "Pagina {{page}} van {{total}}" }, "bulk": { "selectedCount_one": "{{count}} geselecteerd", "selectedCount_other": "{{count}} geselecteerd", "selectPage_one": "{{count}} op deze pagina selecteren", "selectPage_other": "Alle {{count}} op deze pagina selecteren", "deselectPage": "Pagina deselecteren", "allOnPageSelected_one": "{{count}} op deze pagina geselecteerd.", "allOnPageSelected_other": "Alle {{count}} op deze pagina geselecteerd.", "selectAllMatching_one": "Het overeenkomende bericht selecteren", "selectAllMatching_other": "Alle {{count}} overeenkomende berichten selecteren", "allMatchingSelected_one": "Het overeenkomende bericht is geselecteerd.", "allMatchingSelected_other": "Alle {{count}} overeenkomende berichten zijn geselecteerd.", "selectOne": '"{{title}}" selecteren', "publish": "Publiceren ({{count}})", "publishing": "Publiceren…", "publishedCount": "{{ok}} gepubliceerd, {{failed}} mislukt.", "unpublish": "Depubliceren ({{count}})", "unpublishing": "Depubliceren…", "unpublishedCount": "{{ok}} gedepubliceerd, {{failed}} mislukt.", "delete": "Verwijderen", "deleting": "Verwijderen…", "deletedCount": "{{ok}} verwijderd, {{failed}} mislukt.", "confirmDelete_one": "{{count}} bericht verwijderen? Dit depubliceert van Flexweg en kan niet ongedaan worden gemaakt.", "confirmDelete_other": "{{count}} berichten verwijderen? Dit depubliceert van Flexweg en kan niet ongedaan worden gemaakt.", "noDraftSelected": "Geen conceptberichten geselecteerd.", "noOnlineSelected": "Geen online berichten geselecteerd.", "clear": "Selectie wissen" }, "filters": { "all": "Alle", "draft": "Concept", "online": "Online" }, "fields": { "title": "Titel", "slug": "Slug", "excerpt": "Samenvatting", "content": "Inhoud", "category": "Categorie", "tags": "Tags", "heroImage": "Uitgelichte afbeelding", "seoTitle": "SEO-titel", "seoDescription": "SEO-beschrijving", "createdAt": "Aangemaakt op", "updatedAt": "Laatst bijgewerkt", "publishedAt": "Gepubliceerd op" }, "edit": { "newTitle": "Nieuw bericht", "editTitle": "Bericht bewerken", "saved": "Opgeslagen.", "savedAndRepublished": "Opgeslagen en opnieuw gepubliceerd.", "saveFailed": "Opslaan mislukt.", "saveAndRepublish": "Opslaan en opnieuw publiceren", "draftSaved": "Concept opgeslagen.", "slugCollision": { "post": 'Deze URL wordt al gebruikt door bericht: "{{label}}".', "page": 'Deze URL wordt al gebruikt door pagina: "{{label}}".', "category": 'Deze URL wordt al gebruikt door categorie: "{{label}}".' }, "publish": "Publiceren", "unpublish": "Depubliceren", "publishing": "Publiceren…", "unpublishing": "Depubliceren…", "titlePlaceholder": "Titel toevoegen", "permalink": "Permalink", "slugFormatHint": "Alleen kleine letters, ASCII, gescheiden door streepjes.", "slugAutoSuffixed": 'Suffix toegevoegd omdat "{{base}}" al wordt gebruikt door {{owner}}.', "slugAutoSuffixedOwner": { "post": 'bericht: "{{label}}"', "page": 'pagina: "{{label}}"', "category": 'categorie: "{{label}}"' }, "saveBlocked": { "titleRequired": "Voeg een titel toe voordat u opslaat.", "slugRequired": "Een titel en URL-slug zijn vereist om op te slaan.", "slugInvalid": "Ongeldig slug-formaat (ASCII in kleine letters + streepjes).", "slugCollision": "Los het URL-conflict op voordat u opslaat." }, "viewPublished": "Bekijken", "confirmDelete": "Dit item verwijderen?", "inspector": { "document": "Document", "block": "Blok", "blockEmpty": "Selecteer een blok in de editor om de opties te zien.", "publishing": "Publicatie", "permalink": "Permalink", "categories": "Categorieën & tags", "featured": "Uitgelichte afbeelding", "seo": "SEO", "excerpt": "Samenvatting", "dates": "Datums" }, "blocks": { "addBlock": "Blok toevoegen", "transform": "Omzetten naar", "moveUp": "Omhoog verplaatsen", "moveDown": "Omlaag verplaatsen", "duplicate": "Dupliceren", "remove": "Blok verwijderen", "paragraph": "Paragraaf", "heading2": "Kop 2", "heading3": "Kop 3", "bulletList": "Opsomming", "orderedList": "Genummerde lijst", "blockquote": "Citaat", "codeBlock": "Code", "image": "Afbeelding", "horizontalRule": "Scheiding", "categories": { "text": "Tekst", "media": "Media", "layout": "Lay-out", "embed": "Insluitingen", "advanced": "Geavanceerd" }, "noSettings": "Dit blok heeft geen instellingen.", "noSelection": "Selecteer een blok in de editor om de opties te zien.", "slash": { "noResults": "Geen overeenkomend blok." } } }, "status": { "draft": "Concept", "online": "Online" }, "preview": { "title": "Voorbeeld", "rendering": "Voorbeeld renderen…", "error": "Voorbeeld mislukt: {{error}}", "viewports": { "mobile": "Mobiel", "tablet": "Tablet", "desktop": "Desktop" } } };
const pages$2 = { "title": "Pagina's", "newPage": "Nieuwe pagina", "noPages": "Nog geen pagina's.", "homeBadge": "Startpagina", "homeBadgeTooltip": "Wordt gebruikt als startpagina van de site" };
const taxonomies$2 = { "title": "Categorieën & Tags", "categories": "Categorieën", "tags": "Tags", "newCategory": "Nieuwe categorie", "newTag": "Nieuwe tag", "noCategories": "Nog geen categorieën.", "noTags": "Nog geen tags.", "slugCollision": 'Deze slug wordt al gebruikt door "{{label}}".', "seo": { "button": "SEO", "buttonTitle": "SEO-metatags bewerken", "title": "SEO-metatags", "subtitle": 'Aangepaste titel en beschrijving voor de archiefpagina van "{{name}}".', "metaTitle": "Metatitel", "metaTitleHint": "Gebruikt als <title> van de pagina. Standaard: de naam van de term.", "metaDescription": "Metabeschrijving", "metaDescriptionHint": "Gebruikt als metabeschrijving van de pagina. Standaard: de beschrijving van de term." } };
const media$2 = { "title": "Mediabibliotheek", "upload": "Uploaden", "uploading": "Uploaden…", "finalizing": "Afronden…", "uploadFailed": "Upload mislukt", "retry": "Opnieuw proberen", "noMedia": "Nog geen media.", "alt": "Alt-tekst", "caption": "Bijschrift", "filename": "Bestandsnaam", "size": "Grootte", "type": "Type" };
const themes$2 = { "title": "Thema's", "active": "Actief", "activate": "Activeren", "installExternal": "Thema installeren", "uninstallDisabledTitle": "Schakel naar een ander thema voordat u dit deïnstalleert.", "syncAssets": "Thema-bestanden synchroniseren", "regenerateSite": "Site opnieuw genereren", "regenerating": "Opnieuw genereren…", "regenerate": { "button": "Opnieuw genereren", "running": "Bezig…", "groupBuiltins": "Site", "groupPlugins": "Plugins", "home": "Alleen homepage", "homeHelp": "Genereert alleen index.html opnieuw — snelste optie.", "allHtml": "Alle HTML-pagina's", "allHtmlHelp": "Elke post, pagina, archief en lijst — plus menu / posts / authors JSON-snapshots.", "repair": "URL's herstellen", "repairHelp": "Berekent de canonieke URL van elke online post opnieuw en verplaatst bestanden die op de verkeerde URL terechtkwamen. Handig na een import die liep voordat de termen gesynchroniseerd waren.", "assets": "Thema-bestanden", "assetsHelp": "Uploadt CSS + bijbehorende scripts van het actieve thema naar /theme-assets/.", "everything": "Alles", "everythingHelp": "Thema-bestanden + alle HTML + elke plugin-uitvoer. Langzaamste optie.", "noPluginTargets": "Geen plugin-regeneraties — activeer een plugin die regenereren ondersteunt." }, "confirmSwitch": { "title": "Overschakelen naar {{theme}}?", "body": "Wisselen van thema vereist het opnieuw uploaden van de thema-bestanden en het regenereren van elke gepubliceerde pagina zodat het nieuwe uiterlijk overal doorwerkt. Dit kan even duren.", "confirm": "Overschakelen en regenereren", "cancel": "Annuleren" } };
const plugins$2 = { "title": "Plugins", "enabled": "Ingeschakeld", "disabled": "Uitgeschakeld", "enable": "Inschakelen", "disable": "Uitschakelen", "configure": "Configureren", "author": "auteur", "learnMore": "Meer info", "mustUseBadge": "Verplicht", "installExternal": "Plugin installeren", "tabs": { "regular": "Plugins", "mustUse": "Verplichte plugins" } };
const externalInstall$2 = { "titlePlugin": "Een plugin installeren", "titleTheme": "Een thema installeren", "labelPlugin": "plugin", "labelTheme": "thema", "intro": "Sleep een ZIP-bestand met een {{label}}-bundle (manifest.json + bundle.js in de root van de ZIP) hierheen. De {{label}} wordt naar uw Flexweg-site geüpload en na een herlaad geregistreerd. Een ZIP met dezelfde manifest-id opnieuw uploaden werkt het bestaande item ter plaatse bij — geen deïnstallatie nodig.", "zipField": "Bundle-ZIP-bestand", "install": "Installeren", "installing": "Bezig met installeren…", "installSuccess": "{{name}} geïnstalleerd ({{count}} bestanden geüpload). Herladen…", "upgradeSuccess": "{{name}} bijgewerkt van v{{previousVersion}} naar v{{newVersion}} ({{count}} bestanden geüpload). Herladen…", "installedTitle": "Al geïnstalleerd", "bundledDefaultsTitle": "Meegeleverde standaards beschikbaar", "bundledDefaultsHint": "{{count}} meegeleverde plugin/thema is momenteel gedeïnstalleerd. Herstel ze om terug te krijgen wat met deze admin-versie werd meegeleverd.", "bundledDefaultsRestore": "Herstellen", "bundledDefaultsRestored": "{{plugins}} plugin(s) en {{themes}} thema('s) hersteld. Herladen…", "uninstall": "Deïnstalleren", "uninstallSuccess": "{{id}} gedeïnstalleerd. Herladen…", "confirmUninstall": "{{id}} deïnstalleren? Bestanden worden verwijderd van Flexweg.", "errors": { "no-manifest": "ZIP mist manifest.json in de root.", "invalid-manifest": "manifest.json is ongeldig (verplichte velden ontbreken of het is geen geldig JSON).", "incompatible-api": "De bundle is gebouwd tegen een incompatibele runtime-API-versie.", "no-bundle": "De ZIP bevat niet het in het manifest opgegeven entry-bestand.", "fetch-manifest": "Kon de huidige external.json op Flexweg niet lezen.", "upload-failed": "Upload mislukt — controleer uw Flexweg-API-sleutel en uw verbinding." } };
const externalLoader$2 = { "someFailed": "{{count}} externe bundle(s) konden niet worden geladen. Bekijk de browserconsole." };
const menus$2 = { "title": "Menu's", "header": "Hoofdmenu", "footer": "Voettekstmenu", "label": "Label", "saveAndPublish": "Opslaan & genereren", "discard": "Negeren", "saved": "Menu's opgeslagen en gepubliceerd.", "saveFailed": "Kon menu's niet opslaan.", "unsavedChanges": "U heeft niet-opgeslagen wijzigingen." };
const settings$2 = { "title": "Instellingen", "tabs": { "general": "Algemeen" }, "site": { "title": "Site", "siteTitle": "Sitetitel", "siteDescription": "Sitebeschrijving", "siteLanguage": "Sitetaal", "siteLanguageHelp": 'BCP-47-tag (bv. en, fr-CA) die op elke gepubliceerde pagina in <html lang="…"> wordt geplaatst. Het voorvoegsel wordt vergeleken met de ondersteunde vertaallocales voor sitemap-/RSS-labels en in het thema ingebakken teksten; niet-ondersteunde locales vallen terug op Engels.', "siteLanguageResolved": "Vertalingen gebruiken: {{label}}", "baseUrl": "Publieke site-URL", "postsPerPage": "Berichten per pagina", "homeMode": "Inhoud startpagina", "homeLatest": "Laatste berichten", "homeStatic": "Statische pagina", "homePage": "Startpagina", "discourageIndexing": "Zoekmachines ontmoedigen deze site te indexeren", "discourageIndexingHelp": "Indien ingeschakeld krijgt elke gepubliceerde pagina een noindex/nofollow-metatag en blokkeert robots.txt alle crawlers. Volgt het gedrag van WordPress — handig voor stagingsites of controles vóór de lancering. Zoekmachines die de instructie respecteren, indexeren de site niet.", "discourageRegenerateHint": "Indexeringsinstelling opgeslagen. Klik in Thema's op 'Alles opnieuw genereren' om de wijziging toe te passen op alle gepubliceerde pagina's en robots.txt." }, "flexweg": { "title": "Flexweg-API", "apiKey": "API-sleutel", "apiKeyHelp": "Aangemaakt vanuit uw Flexweg-account → API.", "siteUrl": "Site-URL", "siteUrlHelp": "Publieke URL van uw Flexweg-site zonder slash op het einde.", "apiBaseUrl": "API-basis-URL", "storageHelpFirebase": "Opgeslagen in Firestore (config/flexweg). Te lezen door elk ingelogd teamlid, alleen door beheerders te schrijven.", "storageHelpSqlite": "Opgeslagen in de lokale SQLite-tabel config. Te lezen door elk ingelogd teamlid, alleen door beheerders te schrijven." }, "backend": { "title": "Data-backend", "active": "Actief backend:", "switchButton": "Backend wisselen…", "confirmTitle": "Alle huidige data gaat verloren.", "confirmBody": "Wisselen wist de configuratie in de browser en herlaadt het instelformulier. Het nieuwe backend start leeg — de data van het vorige backend blijft staan (in Firestore of als .sqlite-bestand op Flexweg), maar het CMS leest het pas weer wanneer u terug wisselt.", "confirmYes": "Ja, backend wisselen", "downloadBackup": "Download een back-up van het .sqlite-bestand", "downloadBackupHelp": "doe dit voordat u van backend wisselt.", "markdownGit": "Markdown — {{source}}", "localFolder": "lokale map", "localBrowser": "Deze browser (lokaal, één gebruiker)", "sqliteFile": "SQLite-bestand — {{location}}" }, "performance": { "title": "Prestaties", "help": "Hoe de admin berichten en pagina's laadt. De standaardmodus werkt op het gratis Firestore-plan zonder setup; de gepagineerde modus is voor zeer grote sites en vereist eenmalige index-setup.", "mode": "Laadmodus", "modeGlobal": "Standaard (geen setup nodig)", "modePaginated": "Server-side gepagineerd (Firestore-indexen vereist)", "globalHelp": "Laadt de hele berichten-collectie in één live abonnement. Sorteren, filteren en zoeken gebeurt in het geheugen. Aanbevolen voor sites met minder dan ~5 000 berichten.", "paginatedHelp": "Cursor-gepagineerde abonnementen, één pagina per keer. Vereist Firestore-composite-indexen — zie README. Aanbevolen voor zeer grote sites.", "savedReload": "Opgeslagen. Herlaad de admin om de nieuwe modus toe te passen." }, "editor": { "title": "Editor", "help": "Typografie binnen de bericht-/pagina-editor. Onafhankelijk van het publieke thema.", "fontFamily": "Lettertypefamilie", "bodySize": "Tekstgrootte", "h1Size": "H1-grootte", "h2Size": "H2-grootte", "h3Size": "H3-grootte", "sizeHelp": "CSS-lengte, bijv. 16px of 1rem. Laat leeg voor standaard.", "reset": "Terugzetten naar standaard" }, "profile": { "title": "Profiel", "adminLocale": "Admin-taal", "adminLocaleHelp": "Taal die wordt gebruikt door de adminschermen. Opgeslagen in uw profiel.", "firstName": "Voornaam", "lastName": "Achternaam", "headline": "Titel", "headlinePlaceholder": "bv. Journalist, Hoofdredacteur…", "headlineHelp": "Wordt openbaar onder uw naam getoond in auteurkaarten en op uw archiefpagina.", "bio": "Biografie", "bioPlaceholder": "Een korte alinea die op uw auteurspagina en onder uw artikelen verschijnt.", "bioHelp": "Zichtbaar op de publieke site in de auteur-zijbalk en op de auteursarchiefpagina.", "socials": "Sociale profielen", "socialsHelp": `Voeg de URL's toe van de profielen die u op de publieke site wilt tonen en vink "Tonen" aan voor de zichtbare. Lege URL's worden genegeerd.`, "socialsShow": "Tonen", "socialsShowHelp": "Schakelt de zichtbaarheid van dit netwerk op de publieke site om.", "avatar": "Profielfoto", "avatarHelp": "Kies een afbeelding uit uw mediabibliotheek. Vierkante afbeeldingen werken het best.", "pickAvatar": "Kies uit media", "changeAvatar": "Foto wijzigen", "removeAvatar": "Verwijderen", "save": "Profiel opslaan" }, "transfer": { "title": "Content verplaatsen of back-uppen", "help": "Exporteer alles (posts, pagina's, categorieën, metadata van media, profielen, instellingen) als één JSON-bestand. Op een Markdown- of lokaal backend kunt u zo'n bestand importeren met behoud van de id's — zo migreert u vanaf Firebase of SQLite. Mediabestanden en geheime sleutels worden niet meegenomen.", "export": "Content exporteren (JSON)", "import": "Content importeren…", "modeMerge": "Samenvoegen (zelfde id's overschrijven)", "modeReplace": "Geïmporteerde collecties vervangen", "replaceConfirm": "De modus Vervangen verwijdert vóór het importeren alle bestaande items van de collecties die in het bestand staan. Doorgaan?", "invalidFile": "Dit bestand is geen contentexport van AgentCMS.", "imported": "{{posts}} posts/pagina's, {{terms}} termen en {{media}} media geïmporteerd. Voer Opnieuw genereren → Alles uit om ze te publiceren." }, "encryption": { "title": "Databaseversleuteling:", "on": "aan", "off": "uit", "onHelp": "Het databasebestand is onleesbaar zonder de wachtzin. Wijzigen slaat het bestand opnieuw op met een nieuwe sleutel; andere browsers vragen om de nieuwe wachtzin.", "offHelp": "Het databasebestand is leesbaar voor iedereen die het kan downloaden (statische hosting serveert het als elke pagina). Versleutel het met een wachtzin.", "enable": "Database versleutelen…", "change": "Wachtzin wijzigen…", "savedConfirm": "Ik heb deze wachtzin in mijn wachtwoordmanager bewaard — zonder kan de inhoud niet worden geopend.", "enableConfirm": "Nu versleutelen", "changeConfirm": "Wachtzin wijzigen", "done": "Database opnieuw opgeslagen met de nieuwe wachtzin." } };
const users$2 = { "title": "Gebruikers", "noUsers": "Nog geen gebruikers.", "role": "Rol", "disabled": "Uitgeschakeld", "editProfileTitle": "Profiel bewerken — {{email}}", "profileSaved": "Profiel opgeslagen.", "descriptionFirebase": "Beheer uw team. Nieuwe accounts worden aangemaakt in de Firebase Console en hier gespiegeld bij de eerste keer inloggen.", "descriptionSqlite": "Beheer uw team. Gebruik de knop +Gebruiker toevoegen hieronder om accounts direct aan te maken.", "addUser": "Gebruiker toevoegen", "addUserSuccess": "{{email}} toegevoegd.", "removeConfirmFirebase": "Het record van {{email}} verwijderen? Hiermee verwijdert u hun profiel en rol uit het CMS. Om hun login-toegang in te trekken, verwijdert u het account ook in de Firebase Console.", "removeConfirmSqlite": "{{email}} definitief verwijderen? Dit trekt hun login-toegang in EN verwijdert hun profiel en rol. Dit kan niet ongedaan worden gemaakt.", "empty": { "title": "Nog geen teamleden", "descriptionFirebase": "Maak het eerste account aan in de Firebase Console en log hier daarna één keer in om het profiel te registreren.", "descriptionSqlite": "Klik op +Gebruiker toevoegen hierboven om het eerste teamlid uit te nodigen." }, "help": { "title": "Hoe u een nieuw teamlid toevoegt", "bootstrapLine": "De bootstrap-admin (altijd volledige toegang) is:", "firebase": { "step1": "Open de Firebase Console → Authentication → Add user.", "step2": "Stel een e-mail en wachtwoord in en stuur ze naar het nieuwe teamlid.", "step3": "Vraag hen om hier één keer in te loggen — hun profiel verschijnt in de lijst hierboven en u kunt hun rol en gegevens bewerken." }, "sqlite": { "step1": "Klik op de knop +Gebruiker toevoegen hierboven.", "step2": "Voer hun e-mail en een tijdelijk wachtwoord (8+ tekens) in.", "step3": "Deel de inloggegevens veilig — ze kunnen het wachtwoord vanuit hun profiel wijzigen zodra ze zijn ingelogd." }, "git": { "step1": "Voeg de persoon toe als collaborator van de content-repository (schrijftoegang = redacteur, admin / maintainer = admin).", "step2": "Diegene maakt een eigen persoonlijk toegangstoken aan op GitHub / GitLab.", "step3": "Diegene opent de admin en logt in met dat token — het profiel wordt hier automatisch aangemaakt." } }, "addUserModal": { "title": "Een nieuw teamlid toevoegen", "intro": "Maakt het account direct aan in de Flexweg SQLite Auth-database. De nieuwe gebruiker krijgt standaard de rol editor; promoveer hem of haar via de lijst hieronder als adminrechten nodig zijn.", "submit": "Gebruiker aanmaken", "submitting": "Aanmaken…" }, "actions": { "editProfile": "Profiel bewerken", "promote": "Promoveren tot beheerder", "demote": "Degraderen tot redacteur", "disable": "Uitschakelen", "enable": "Inschakelen", "delete": "Record verwijderen" }, "descriptionGit": "Teamleden zijn de personen met schrijftoegang tot de content-repository. Ze verschijnen hier na hun eerste login; hun rol volgt hun rechten op de repository.", "descriptionLocal": "Deze admin draait in modus voor één gebruiker: content wordt in deze browser opgeslagen en er zijn geen accounts.", "descriptionSqliteFile": "Geen gebruikersaccounts met dit backend: iedereen die de admin kan openen, kan bewerken. Beveilig de admin-map op het niveau van uw hosting. De auteursprofielen hieronder zijn ter informatie." };
const firestoreSetup$2 = { "title": "Firestore-setup vereist", "intro": "De berichten- en pagina-overzichtspagina's hebben enkele Firestore composite indexes nodig om efficiënt te queryen. Die moeten handmatig worden aangemaakt — Firebase reserveert het aanmaken van indexes voor projectbeheerders.", "checking": "Uw Firestore-indexes controleren…", "missingCount_one": "{{count}} index ontbreekt:", "missingCount_other": "{{count}} indexes ontbreken:", "openConsole": "Firebase Console openen om aan te maken", "noUrl": "Auto-suggestie-URL niet extraheerbaar — zie README voor het gcloud-commando.", "howItWorks": "Hoe het werkt", "step1": "Klik op de link voor elke ontbrekende index — Firebase Console opent met de definitie vooraf ingevuld.", "step2": 'Klik op "Create" en wacht 1–5 minuten tot de index is opgebouwd (status in de console).', "step3": "Kom terug en klik op Opnieuw proberen. Zodra beide queries slagen, laadt de admin.", "retry": "Opnieuw proberen", "retrying": "Opnieuw proberen…", "buildHint": "Het opbouwen van een index kan na aanmaak een paar minuten duren.", "allReady": "Alle indexes klaar.", "unexpectedTitle": "Firestore niet bereikbaar", "unexpectedHint": "Controleer uw verbinding en Firestore-regels. Als u net de indexes hebt aangemaakt, wacht tot ze klaar zijn en probeer opnieuw." };
const errors$2 = { "appError": "Toepassingsfout", "loadAccountFailed": "Kon uw account niet laden", "loadAccountHint": "Als het probleem aanhoudt, log uit en probeer opnieuw.", "accountDisabled": "Account uitgeschakeld", "accountDisabledMessage": "Uw toegang tot deze CMS is uitgeschakeld. Neem contact op met uw beheerder.", "firebaseNotConfigured": "Firebase is niet geconfigureerd", "firebaseEnvMissing": "De volgende omgevingsvariabelen ontbreken:\n{{vars}}\n\nKopieer .env.example naar .env, vul uw Firebase-projectgegevens in en herstart de dev-server.", "adminEmailNotConfigured": "Admin-e-mail is niet geconfigureerd", "adminEmailMessage": "VITE_ADMIN_EMAIL ontbreekt in .env. Stel deze in op het e-mailadres van de bootstrap-beheerder.", "consoleHint": "Controleer de browserconsole en uw .env-configuratie. Zie de README voor instellingsinstructies." };
const identity$2 = { "brandTitle": "AgentCMS", "brandSubtitle": "Statische publisher", "login": { "heading": "Inloggen", "intro": "Gebruik het e-mailadres en wachtwoord die uw beheerder met u heeft gedeeld.", "submit": "Inloggen", "submitting": "Inloggen…" }, "fields": { "name": "Weergavenaam (optioneel)", "namePlaceholder": "Jan Jansen", "email": "E-mail", "password": "Wachtwoord", "passwordHint": "Minimaal 8 tekens." }, "footer": "Nieuwe accounts worden door een beheerder aangemaakt vanaf de Gebruikers-pagina.", "errors": { "invalidEmail": "Voer een geldig e-mailadres in.", "missingPassword": "Wachtwoord is vereist.", "passwordTooShort": "Het wachtwoord moet minimaal 8 tekens lang zijn." } };
const setup$2 = /* @__PURE__ */ JSON.parse(`{"title":"Welkom bij AgentCMS","subtitle":"Eerste configuratie","intro":"Vul uw Firebase-gegevens in, het bootstrap-beheerderaccount en uw Flexweg-API-sleutel. De waarden worden gevalideerd, opgeslagen in uw project (Firestore + een config.js-bestand op Flexweg) en de admin laadt opnieuw met het normale aanmeldproces. U doet dit slechts één keer.","introFirebase":"Stap 1 — Firebase. Vul uw Firebase-projectgegevens en het bootstrap-beheerdersaccount in. We melden u aan, verifiëren het e-mailadres en controleren of uw Firestore-regels deze admin herkennen voordat we doorgaan naar de Flexweg-stap.","introFlexweg":"Stap 2 — Flexweg. Vul uw Flexweg-API-sleutel en site-URL in. We testen de API, slaan de configuratie op in Firestore, uploaden config.js naar uw site en synchroniseren de thema-assets.","continueToFlexweg":"Firebase valideren en doorgaan","stepper":{"terms":"Voorwaarden","backend":"Backend","firebase":"Firebase","flexweg":"Flexweg","sqlite":"SQLite","docstore":"Content & publicatie","data":"Gegevens","hosting":"Hosting","install":"Installatie"},"backend":{"title":"Kies een data-backend","intro":"Kies waar het CMS uw berichten, pagina's, gebruikers en instellingen opslaat. U kunt later wisselen via Instellingen (data wordt niet gemigreerd).","sqliteTitle":"Flexweg SQLite (aanbevolen)","sqliteHint":"Alle data blijft op uw Flexweg-site als SQLite-bestand. Geen externe dienst. Auth wordt geleverd door de Flexweg SQLite-API.","firebaseTitle":"Firebase","firebaseHint":"Gebruik een Firebase-project voor Firestore + Auth. Gratis met het Spark-plan. Realtime updates via onSnapshot.","continue":"Doorgaan","markdownGitTitle":"Markdown-bestanden in een Git-repository","markdownGitHint":"Posts als .md-bestanden op GitHub / GitLab (of een lokale clone). Elke redacteur logt in met een eigen toegangstoken; elke wijziging is een commit. Geen database, werkt met meerdere redacteuren en computers.","localTitle":"Alleen deze browser","localHint":"Eén gebruiker, geen login, niets in te stellen. Content blijft in deze browser (exporteer via Instellingen). Ideaal voor een admin die op uw eigen computer draait."},"sqlite":{"heading":"Verbind uw Flexweg-site","intro":"We gebruiken uw Flexweg-master-API-sleutel ÉÉN KEER om een beperkt token aan te maken voor de SQLite-database. Na de installatie wordt de master-sleutel weggegooid en wordt alleen het beperkte token (begrensd tot dit ene SQLite-bestand) opgeslagen.","apiKeyHint":"Master Flexweg-API-sleutel. Alleen gebruikt om te installeren — daarna nooit opgeslagen.","detectedFromUrl":"Gedetecteerd uit URL","advanced":"Geavanceerde instellingen (Site-URL, SQLite-pad…)","pathHint":"Waar het SQLite-bestand op uw Flexweg-site staat. Mappen worden automatisch aangemaakt.","adminHeading":"Beheerdersaccount","adminIntro":"Maak de eerste gebruiker aan — dit account krijgt automatisch adminrechten. Volgende leden worden vanaf de Gebruikers-pagina onboarded zodra u bent ingelogd.","passwordHint":"Minimaal 8 tekens.","submit":"SQLite-database installeren"},"terms":{"title":"Gebruiksvoorwaarden","intro":"Lees en accepteer de onderstaande voorwaarden voordat u AgentCMS gebruikt. Ze zijn in eenvoudige taal geschreven zodat ze snel te lezen zijn.","section1":{"title":"1. Gratis dienst","body":"AgentCMS wordt door Flexweg gratis aangeboden. U kunt het zonder beperking gebruiken met uw Flexweg-hosting — Flexweg zal u het gebruik van het CMS zelf nooit in rekening brengen. De gebruikelijke kosten van uw Flexweg-hostingplan en uw Firebase-plan blijven van toepassing op de respectieve accounts."},"section2":{"title":"2. Geleverd „as-is“, zonder garantie","body":"Het CMS wordt as-is geleverd. We werken eraan om het stabiel te houden en in de loop van de tijd te verbeteren, maar we kunnen niet garanderen dat het vrij is van bugs, defecten of onderbrekingen. Gebruik het met dezelfde voorzichtigheid als bij elke tool die u niet zelf heeft geschreven: bewaar back-ups van belangrijke content."},"section3":{"title":"3. Uw content, uw verantwoordelijkheid","body":"U bent als enige verantwoordelijk voor de content die u via het CMS publiceert — tekst, afbeeldingen, video's, formulieren, code-embeds en alle andere media. U moet de toepasselijke wetgeving in uw rechtsgebied (en in de rechtsgebieden waarop u zich richt) naleven, evenals auteursrechten, beeld- en persoonlijkheidsrechten, regels voor de bescherming van persoonsgegevens en de voorwaarden van eventuele derde-diensten die u gebruikt (ingebedde fonts, video's, enz.). Flexweg is niet verantwoordelijk voor content die door gebruikers van het CMS wordt gepubliceerd."},"section4":{"title":"4. Uw Firebase-account, uw beveiliging","body":"Het CMS slaat zijn data op in uw eigen Firebase-project. U bent verantwoordelijk voor de beveiliging van dat project: kies een sterk wachtwoord voor het bootstrap-beheerderaccount, stel de Firestore-beveiligingsregels in zoals gedocumenteerd, rouleer uw API-sleutels wanneer nodig en controleer wie toegang heeft. Flexweg kan in geen geval verantwoordelijk worden gehouden voor ongeautoriseerde toegang, datalekken, hacks of verlies als gevolg van verkeerde configuratie of compromittering van uw Firebase-account."},"section5":{"title":"5. Beperking van aansprakelijkheid","body":"Flexweg kan niet aansprakelijk worden gesteld voor enige inkomstenderving, dataverlies, gemiste zakelijke kansen of enige directe of indirecte schade voortvloeiend uit het gebruik, misbruik of de onbeschikbaarheid van het CMS. Wanneer de toepasselijke wet Flexweg verplicht enige aansprakelijkheid op zich te nemen, is deze beperkt tot het bedrag dat in de afgelopen 12 maanden daadwerkelijk aan Flexweg voor het CMS is betaald — dat is nul, aangezien het CMS gratis is."},"section6":{"title":"6. Uw data blijft van u","body":"Content die u met het CMS aanmaakt wordt opgeslagen in uw eigen Firebase-project (tekst, instellingen, media-metadata) en op uw eigen Flexweg-hosting (gepubliceerde HTML, afbeeldingen, theme-assets). Het CMS zelf stuurt uw content niet door naar enige derde-dienst. Plugins of themes die u activeert kunnen hun eigen gedrag hebben — controleer wat ze doen voordat u ze activeert."},"section7":{"title":"7. Eerlijk gebruik","body":"Gebruik van het CMS voor onwettige, frauduleuze of schadelijke activiteiten, of op een manier die in strijd is met de algemene voorwaarden van Flexweg, kan leiden tot opschorting van uw toegang tot Flexweg-hosting. We kunnen deze CMS-voorwaarden in de loop van de tijd ook bijwerken; significante wijzigingen worden gecommuniceerd via de admin of per e-mail."},"accept":"Ik heb de Gebruiksvoorwaarden gelezen en ga ermee akkoord.","continue":"Door naar configuratie","back":"Terug"},"sections":{"firebase":"Firebase","admin":"Bootstrap-beheerder","flexweg":"Flexweg-API"},"help":{"firebase":"Vind deze waarden in Firebase Console → Projectinstellingen → Algemeen → Uw apps → SDK-installatie en configuratie.","admin":"Gebruik een bestaande gebruiker uit Firebase Authentication. Iedereen die aanmeldt met dit e-mailadres wordt als beheerder behandeld en omzeilt de gebruikersrecord-controle. Maak de gebruiker via Firebase Console → Authentication als deze nog niet bestaat.","flexweg":"Genereer een permanente API-sleutel in uw Flexweg-account → API. De site-URL is het publieke adres van uw Flexweg-site (bijv. https://uw-site.flexweg.com).","flexwegApiKeyHint":"Haal uw API-sleutel op uit uw Flexweg-accountinstellingen.","flexwegApiKeyLink":"Accountinstellingen openen"},"fields":{"apiKey":"API-sleutel","authDomain":"Auth-domein","projectId":"Project-ID","storageBucket":"Storage-bucket","messagingSenderId":"Messaging-afzender-ID","appId":"App-ID","adminEmail":"E-mail","adminPassword":"Wachtwoord","flexwegApiKey":"API-sleutel","flexwegSiteUrl":"Site-URL","flexwegApiBaseUrl":"API-basis-URL","sqlitePath":"SQLite-pad"},"submit":"Opslaan en doorgaan","submitting":"Bezig met instellen…","success":"Configuratie voltooid!","reloadingHint":"De admin wordt zo herladen — even geduld.","footer":"Deze waarden worden opgeslagen in uw project (Firestore + Flexweg). Ze worden nergens anders heen gestuurd.","steps":{"signInFirebase":"Aanmelden bij Firebase…","testFlexweg":"Flexweg-API testen…","writeFirestore":"Configuratie opslaan…","uploadConfig":"config.js uploaden naar Flexweg…","syncThemes":"Theme-assets synchroniseren naar Flexweg…","sqliteInstall":"Beperkt SQLite-token aanmaken…","sqliteRegisterAdmin":"Admin-account registreren…","sqliteSchema":"SQLite-schema initialiseren…"},"stepsDone":{"sqliteInstall":"Beperkt SQLite-token uitgegeven","sqliteRegisterAdmin":"Admin geregistreerd en ingelogd","sqliteSchema":"SQLite-schema klaar"},"errors":{"missingFields":"Vul alle velden in.","rootDeploymentTitle":"De admin moet in een submap staan, niet in de hoofdmap van de site.","rootDeploymentHint":"Verplaats de admin-bestanden (index.html, config.js, runtime/, …) naar een submap op Flexweg — bijvoorbeeld /admin/ of een willekeurige naam zoals /erf34f654GH3/ voor extra onopvallendheid. Herlaad de admin vervolgens vanuit de URL van de submap en voer de configuratie opnieuw uit.","firebaseAuthGeneric":"Aanmelden bij Firebase mislukt.","firebaseAuthInvalidCredential":"Firebase heeft de combinatie van e-mailadres en wachtwoord geweigerd.","firebaseAuthInvalidCredentialHint":"Moderne Firebase-projecten activeren standaard bescherming tegen e-mailopsomming, waardoor dezelfde fout wordt teruggegeven of het wachtwoord nu fout is, de gebruiker niet bestaat, of de gebruiker zich met een andere provider aanmeldt. Te controleren:\\n• Voer het wachtwoord opnieuw in — kopieer/plak vanuit een wachtwoordbeheerder om typfouten uit te sluiten. Minimale lengte is 6 tekens.\\n• Open Firebase Console → Authentication → Users en bevestig dat het e-mailadres bestaat. Controleer de kolom 'Providers': als deze alleen Google (of een andere provider) toont en niet 'Email/Password', stel het wachtwoord in of reset het via het rijmenu (⋮ → Wachtwoord resetten).\\n• Controleer of de spelling van het e-mailadres exact overeenkomt met wat in Firebase staat opgeslagen.","firebaseAuthUserNotFound":"Geen Firebase-gebruiker met dit e-mailadres. Maak er eerst een aan in Firebase Console → Authentication → Users.","firebaseAuthInvalidEmail":"Het admin-e-mailadres is geen geldig e-mailadres.","firebaseInvalidApiKey":"De Firebase-API-sleutel is ongeldig. Controleer de waarde in Firebase Console.","firebaseNetwork":"Netwerkfout bij aanmelden bij Firebase. Controleer uw verbinding.","firebaseTooManyRequests":"Te veel aanmeldpogingen. Probeer het later opnieuw of reset het wachtwoord via Firebase Console.","firebaseOperationNotAllowed":"Inloggen met e-mail/wachtwoord is niet ingeschakeld op dit Firebase-project. Open Firebase Console → Authentication → Sign-in method en schakel de provider Email/Password in.","firebaseUserDisabled":"Dit Firebase-gebruikersaccount is uitgeschakeld. Schakel het opnieuw in via Firebase Console → Authentication → Users.","wrongAdminEmail":"Het Firebase-account waarmee u bent aangemeld komt niet overeen met het ingevoerde admin-e-mailadres. Probeer het opnieuw.","rulesNotPinnedTitle":"De Firestore-regels herkennen u nog niet als bootstrap-admin.","rulesNotPinnedHint":"Open Firebase Console → Firestore → Rules en vervang de waarde van \`bootstrapAdminEmail()\` door: {{email}} — klik daarna op Publiceren. De regelsjabloon in de README bevat een placeholder \`you@example.com\` die vervangen moet worden door uw echte admin-e-mailadres. Klik na het publiceren van de nieuwe regels hier opnieuw op Verzenden.","flexwegAuth":"Flexweg-API-sleutel geweigerd. Controleer de waarde in uw Flexweg-account → API.","flexwegNetwork":"Netwerkfout bij contact met Flexweg. Controleer de API-basis-URL en uw verbinding.","flexwegHttp":"Flexweg-API-fout ({{status}}): {{detail}}","firestoreRulesTitle":"Firestore weigerde het schrijven van de configuratie.","firestoreRulesHint":"Open Firebase Console → Firestore → Regels en zorg dat het bootstrap-admin-e-mailadres is ingesteld op '{{email}}'. De README bevat een kant-en-klare regelsjabloon.","firestoreOther":"Schrijven naar Firestore mislukt","uploadFailed":"Kon config.js niet uploaden naar Flexweg","generic":"Er is iets misgegaan."},"docstore":{"contentTitle":"Content-repository","contentIntro":"Waar uw posts, pagina's en instellingen worden opgeslagen als Markdown- + JSON-bestanden. Een lege repository is prima — het CMS maakt de bestanden aan.","provider":"Repository","localClone":"Lokale map (git-clone)","localCloneHint":"Kies de map van uw clone. Synchroniseer die met uw gebruikelijke git-client — het CMS leest en schrijft bestanden, het voert geen git uit.","contentDir":"Contentmap in de repository","privateRepo":"Gebruik een privé-repository: concepten worden daarin opgeslagen.","folderRequired":"Kies eerst de contentmap.","checking":"Toegang tot de repository controleren…","publishIntro":"Waar de gegenereerde site wordt gepubliceerd. U kunt dit later wijzigen in Instellingen.","existingSite":"Deze repository is al ingesteld — de site blijft publiceren naar: {{target}}. U kunt dit later wijzigen in Instellingen (eventuele geheime sleutels moeten daar opnieuw worden ingevoerd).","install":"Installeren","steps":{"config":"Configuratie opslaan…","content":"Content laden…","target":"Publicatiedoel opslaan…","testTarget":"Publicatiedoel testen…"},"doneTitle":"Alles klaar!","doneBody":"De configuratie is opgeslagen in deze browser. Om andere redacteuren deze stap te besparen, downloadt u config.js en vervangt u het bestand in de admin-map van uw hosting.","downloadConfig":"config.js downloaden","open":"Admin openen","footer":"Content blijft in uw repository of in deze browser; toegangstokens verlaten deze browser nooit."},"data":{"title":"1. Waar slaat u uw gegevens op?","intro":"Uw posts, pagina's, gebruikers en instellingen — de eigen gegevens van de admin. Dit staat los van waar de publieke site wordt gehost (volgende stap).","localNote":"Niets te configureren: content wordt in deze browser opgeslagen. Exporteer die via Instellingen om een back-up te maken of later te verhuizen.","options":{"sqlite-file":{"title":"SQLite","hint":"Een SQLite-database die wordt opgeslagen op de hosting die u in de volgende stap kiest (Flexweg, uw server, S3, Git…). Zonder gebruikersaccounts — of de SQLite-dienst van Flexweg, met accounts, als u op Flexweg host."},"flexweg-sqlite":{"title":"SQLite (Flexweg-dienst)","hint":"Een SQLite-database die door de dienst van Flexweg wordt beheerd, met ingebouwde gebruikersaccounts. Vereist een Flexweg-account, ongeacht waar de site wordt gehost."},"firebase":{"title":"Firebase","hint":"Firestore + Firebase Auth in uw Google-project. Realtime, gratis Spark-abonnement."},"markdown-git":{"title":"Markdown-bestanden in Git","hint":"Posts als .md-bestanden in een GitHub- / GitLab-repository (of een lokale clone). Elke redacteur gebruikt een eigen token; elke wijziging is een commit."},"local":{"title":"Deze browser","hint":"Eén gebruiker, geen login, niets in te stellen. Ideaal voor een admin die op uw computer draait."}}},"hosting":{"title":"2. Waar wordt de site gepubliceerd?","intro":"Waar de gegenereerde statische site (HTML, CSS, afbeeldingen) bij elke publicatie naartoe wordt geüpload. U kunt dit later wijzigen in Instellingen.","existing":"Deze content-repository publiceert al naar het onderstaande doel. Behoud het of kies een ander."},"install":{"title":"3. Installatie","intro":"Controleer het overzicht en installeer daarna.","data":"Gegevens","hosting":"Hosting","saveTarget":"Publicatiedoel opslaan…","noteConfigJs":"De admin-configuratie (config.js) wordt indien mogelijk naast de admin op Flexweg geüpload; anders wordt u aangeboden haar te downloaden.","noteLocalConfig":"De configuratie wordt in deze browser opgeslagen; u krijgt config.js aangeboden om in de admin-map te plaatsen, zodat andere redacteuren deze installatie kunnen overslaan."},"sqliteFile":{"security":"Geen gebruikersaccounts: iedereen die dit admin kan openen, kan de inhoud bewerken — beveilig de admin-map bij je hosting. Het databasebestand wordt als elk ander bestand geserveerd: houd het versleuteld of bewaar het op een aparte privélocatie.","intro":"Waar het databasebestand wordt opgeslagen. Deze admin leest en bewaart het via dezelfde connectoren als de hosting.","path":"Pad van het databasebestand","pathHint":"Wordt bij de eerste keer opslaan aangemaakt als het nog niet bestaat. Bij een Git-repository is elke keer opslaan een commit — kies bij voorkeur een repository of branch die geen build van de site start.","existing":"bestaande database","new":"nieuwe database","dataNote":"Hier valt niets te configureren: de database wordt opgeslagen op de hosting die u in de volgende stap kiest.","heading":"SQLite-database","flexwegService":"De SQLite-dienst van Flexweg gebruiken","flexwegServiceHint":"De database wordt door Flexweg beheerd en heeft ingebouwde gebruikersaccounts (e-mail + wachtwoord). Anders is het een gewoon bestand op deze hosting, zonder accounts.","summaryFile":"Bestand {{path}} op deze hosting","summaryService":"SQLite-dienst van Flexweg ({{path}})","encrypt":"Database versleutelen","encryptHint":"Aanbevolen bij openbare hosting: zonder wachtzin is het bestand onleesbaar. Elke nieuwe browser vraagt er één keer om.","passphrase":"Wachtzin","passphraseHint":"Bewaar hem nu in je wachtwoordmanager: zonder wachtzin kan niemand de database openen, ook jij niet.","copy":"Kopiëren","copied":"Gekopieerd","generate":"Nieuw","passphraseTooShort":"De wachtzin moet minstens 12 tekens lang zijn.","existingEncrypted":"Op dit pad staat al een versleutelde database: voer de wachtzin ervan in.","separate":"Database op een aparte privélocatie bewaren","separateHint":"Bijv. een privé S3- / R2-bucket of een privé Git-repository: de database wordt dan nooit door de openbare site geserveerd.","summaryEncrypted":"versleuteld","summaryLocation":"opgeslagen in {{location}}","locationLabel":"Locatie van de database","gitBranchNote":"De database staat op de branch {{branch}} van deze repository, die nooit wordt gepubliceerd: inhoud opslaan bouwt de site niet opnieuw.","summaryBranch":"op branch {{branch}}"},"adminHosting":{"deploying":"De admin wordt naar de site gekopieerd…","label":"De admin ook op deze site hosten","hint":"De admin wordt met zijn config.js (zonder geheimen) naar {{url}} gekopieerd — elke redacteur kan hem daar dan openen. Elke redacteur logt nog steeds in met de eigen toegang.","folder":"Admin-map","alreadyHere":"Deze admin draait al vanaf deze site: de config.js wordt ter plekke bijgewerkt.","doneBody":"De admin staat nu op uw site. Schakel bij GitHub Pages eerst Pages in voor de repository als dat nog niet is gebeurd (Settings → Pages) en open hem daarna:","open":"Online admin openen","continueHere":"Doorgaan in deze admin"}}`);
const flexweg$2 = { "actions": { "upload": "Bestand uploaden", "delete": "Bestand verwijderen", "rename": "Bestand hernoemen", "get": "Bestand lezen", "list": "Bestanden lijsten", "createFolder": "Map aanmaken", "renameFolder": "Map hernoemen", "deleteFolder": "Map verwijderen", "storageLimits": "Opslaglimieten ophalen", "commit": "Wijzigingen publiceren" }, "errors": { "configMissing": "Het publicatiedoel is niet ingesteld. Stel het in via Instellingen voordat je publiceert.", "network": "{{action}}: netwerkfout of CORS geblokkeerd. Controleer uw verbinding.", "auth": "{{action}}: authenticatie mislukt. Controleer de gegevens van het publicatiedoel in Instellingen.", "notFound": "{{action}}: niet gevonden op het publicatiedoel.", "tooLarge": "{{action}}: bestand te groot voor het publicatiedoel.", "rateLimited": "{{action}}: te veel verzoeken, probeer het zo opnieuw.", "serverError": "{{action}}: serverfout van het publicatiedoel ({{status}}). Probeer het opnieuw.", "generic": "{{action}} mislukt ({{status}}){{detail}}.", "unsupported": '{{action}}: niet ondersteund door publicatiedoel "{{connector}}".', "unknownConnector": 'Onbekend publicatiedoel "{{connector}}". Controleer Instellingen → Publicatiedoel.', "folderAccess": "Geen toegang tot de lokale map. Open Instellingen → Publicatiedoel en klik op ‘Map opnieuw verbinden’." } };
const publish$2 = { "log": { "rendering": "Pagina renderen…", "uploading": "{{path}} uploaden…", "deleting": "{{path}} verwijderen…", "regenerating": "Lijsten opnieuw genereren…", "skipped": "{{path}} overgeslagen (geen wijzigingen)", "done": "Gepubliceerd op {{url}}", "failed": "Mislukt: {{error}}" } };
const docstore$2 = { "errors": { "notConnected": "Niet verbonden met de contentrepository. Meld je opnieuw aan met je toegangstoken.", "conflict": "Iemand anders heeft dit item intussen gewijzigd. Die versie wordt nu getoond — pas je wijziging opnieuw toe.", "sqliteUnsupported": "Het doel ‘{{connector}}’ kan geen databasebestand opslaan." } };
const connectors$2 = { "target": "Publicatiedoel", "settingsTitle": "Publicatiedoel", "settingsHelp": "Waar de gerenderde site naartoe wordt geüpload bij publiceren. Inloggegevens worden opgeslagen bij uw content-backend (of in deze browser bij Git-content-repository's) en zijn leesbaar voor alle admins.", "saved": "Publicatiedoel opgeslagen. Voer Opnieuw genereren → Alles uit om de hele site naar het nieuwe doel te publiceren.", "test": "Verbinding testen", "testOk": "Verbinding OK", "testFailed": "Verbinding mislukt", "names": { "flexweg": "Flexweg", "git-pages": "Git-repository (GitHub Pages, Cloudflare Pages, GitLab Pages…)", "s3": "S3-compatibele bucket (AWS S3, Cloudflare R2, Backblaze B2, OVH…)", "php-bridge": "Uw eigen server (PHP-bridge)", "browser-mirror": "Downloaden als ZIP", "local-folder": "Lokale map op deze computer" }, "hints": { "flexweg": "Upload via de Flexweg Files API.", "git-pages": "Elke publicatie is één commit in de repository; de host bouwt de site daaruit opnieuw op.", "s3": "Vereist een CORS-regel op de bucket die de origin van deze admin toestaat, en websitehosting (of een CDN) om index.html-bestanden te serveren.", "php-bridge": "Upload external/bridges/php/flexweg-bridge.php naar uw server, stel de API-sleutel in en vul hier de URL in.", "browser-mirror": "De site wordt in deze browser bewaard; download het ZIP en upload het handmatig waar u maar wilt.", "local-folder": "Schrijft de site rechtstreeks naar een map (Chrome / Edge). Serveer hem lokaal of push hem met uw eigen tools." }, "fields": { "flexweg": { "apiKey": "API-sleutel", "siteUrl": "Site-URL", "apiBaseUrl": "Basis-URL van de API" }, "git-pages": { "host": "Hosting", "provider": "Git-provider", "owner": "Eigenaar (gebruiker of organisatie)", "repo": "Repository", "project": "Projectpad", "branch": "Branch", "dir": "Map in de repository", "token": "Toegangstoken", "siteUrl": "Publieke site-URL", "apiBaseUrl": "API-URL (alleen self-hosted)" }, "s3": { "endpoint": "Endpoint", "region": "Regio", "bucket": "Bucket", "prefix": "Sleutelvoorvoegsel (optioneel)", "accessKeyId": "Access key-ID", "secretAccessKey": "Geheime toegangssleutel", "siteUrl": "Publieke site-URL", "forcePathStyle": "Padgebaseerde URL's (MinIO, R2, de meeste compatibele diensten)", "publicRead": "Geüploade bestanden openbaar maken (ACL public-read) — voor buckets die niet via een bucketbeleid openbaar zijn (OVHcloud, Scaleway…). Laat uit bij AWS-buckets met ‘bucket owner enforced’." }, "php-bridge": { "apiBaseUrl": "Bridge-URL", "apiKey": "API-sleutel van de bridge", "siteUrl": "Publieke site-URL" }, "browser-mirror": { "siteUrl": "Publieke site-URL (optioneel)" }, "local-folder": { "siteUrl": "URL waarop de map wordt geserveerd (optioneel)" } }, "help": { "flexweg": { "apiKey": "Aangemaakt vanuit uw Flexweg-account → API." }, "git-pages": { "host": "Cloudflare Pages: koppel het project aan deze repository zonder build-commando en met de uitvoermap hieronder. Werkt met privé-repository's.", "dir": 'Leeg laten voor de root van de repository. GitHub Pages: "" of "docs". GitLab Pages: "public".', "token": "Fine-grained token op deze repository met Contents: read & write (GitHub) — voeg Pages: read & write toe zodat het CMS GitHub Pages kan inschakelen — of een token met de scope api (GitLab). Leeg laten om het eigen toegangstoken van elke redacteur te gebruiken wanneer de content bij dezelfde provider staat.", "siteUrl": "bv. https://user.github.io/repo — een URL met submap is prima, links worden automatisch aangepast." }, "s3": { "endpoint": "Leeg laten voor AWS (afgeleid van de regio). R2: https://<account-id>.r2.cloudflarestorage.com", "siteUrl": "De website-URL van de bucket of uw CDN-domein." }, "php-bridge": { "apiBaseUrl": "De volledige URL van flexweg-bridge.php op uw server (HTTPS)." }, "browser-mirror": { "siteUrl": "Waar u het ZIP gaat uploaden — gebruikt voor absolute URL's (sitemaps, RSS, media)." }, "local-folder": { "siteUrl": "bv. http://localhost:8080 wanneer een lokale webserver de map serveert." } }, "options": { "github-pages": "GitHub Pages", "cloudflare-pages": "Cloudflare Pages (gekoppeld aan de repository)", "gitlab-pages": "GitLab Pages", "other": "Anders (Netlify, Vercel, git pull op de server…)", "github": "GitHub", "gitlab": "GitLab" }, "folder": { "choose": "Map kiezen…", "change": "Andere map…", "reconnect": "Map opnieuw koppelen", "unsupported": "Deze browser kan niet naar lokale mappen schrijven. Gebruik Chrome of Edge." }, "mirror": { "download": "Site downloaden (ZIP)", "count": "{{count}} bestanden in deze browser" }, "adminHosting": { "title": "Admin op deze site", "help": "Kopieer deze admin naar het publicatiedoel (eerste uitrol, of bijwerken na een nieuwe versie). De config.js bevat geen geheimen.", "deploy": "Admin uitrollen / bijwerken", "deployed": "Admin uitgerold ({{count}} bestanden) — {{url}}" }, "pages": { "enabled": "GitHub Pages ingeschakeld voor deze repository — de site staat over ongeveer een minuut online.", "enableHint": 'Publiceren gelukt. Schakel GitHub Pages in voor {{repo}} om de site online te zetten: Settings → Pages → Deploy from a branch → {{branch}} / {{folder}}. (Of geef het token de machtiging "Pages: read and write" en het CMS doet het voor u.)' }, "siteUrl": { "mismatch": "De openbare URL van de site (Instellingen → Site) is {{site}}, maar dit doel serveert de site op {{target}}. Links, CSS en sitemaps volgen de site-URL — ze kloppen niet op deze hosting.", "use": "{{url}} gebruiken voor de site", "updated": "Site-URL bijgewerkt. Voer Opnieuw genereren → Alles uit om de pagina's met de nieuwe links opnieuw te publiceren." } };
const gitAccess$2 = { "heading": "Verbinden met de content-repository", "tokenIntro": "De content staat in de {{provider}}-repository {{repo}}. Log in met uw eigen persoonlijke toegangstoken — uw rechten op de repository bepalen uw rol (schrijftoegang = redacteur, admin / maintainer = admin).", "token": "Persoonlijk toegangstoken", "tokenHelpGithub": "Fine-grained token, alleen toegang tot deze repository, recht Contents: lezen en schrijven.", "tokenHelpGitlab": "Token met de api scope, rol Developer of hoger op dit project.", "createToken": "Token aanmaken", "connect": "Verbinden", "tokenStorage": "Het token wordt alleen in deze browser bewaard. Uitloggen wist het.", "failed": "Met dit token kan niet naar de repository worden geschreven (ongeldig, verlopen of alleen-lezen). Controleer de rechten.", "folderIntro": "De content staat in een map op deze computer (meestal een git-clone die u synchroniseert met uw eigen git-client). Geef deze browser toegang — browsers vragen het na elke herlaadbeurt opnieuw.", "openFolder": "Contentmap openen" };
const hosting$2 = { "flexweg": { "title": "Flexweg", "short": "Flexweg-hosting", "hint": "Uploadt via de Flexweg Files API. API-sleutel uit uw Flexweg-account." }, "github-pages": { "title": "GitHub Pages", "short": "Gratis, vanuit een GitHub-repository", "hint": "Elke publicatie is één commit naar de repository; GitHub Pages serveert die. Settings → Pages → Deploy from a branch. Publieke repositories bij het gratis abonnement." }, "cloudflare-pages": { "title": "Cloudflare Pages", "short": "Gratis, privé-repositories mogelijk", "hint": "Het CMS commit de site naar een GitHub- / GitLab-repository; koppel er een Cloudflare Pages-project aan (geen build-commando, uitvoermap = de map hieronder)." }, "gitlab-pages": { "title": "GitLab Pages", "short": "Gratis, vanuit een GitLab-repository", "hint": "Elke publicatie is één commit; het CMS voegt een minimale .gitlab-ci.yml toe die de map public/ publiceert." }, "git-other": { "title": "Netlify, Vercel…", "short": "Elke host die een repository deployt", "hint": "Het CMS commit de site naar een Git-repository; koppel uw host (Netlify, Vercel, een server die git pull uitvoert…) aan die repository." }, "s3": { "title": "S3 / R2 / B2…", "short": "Object-storage-bucket", "hint": "AWS S3, Cloudflare R2, Backblaze B2, OVH, Scaleway, MinIO… Vereist een CORS-regel op de bucket en website-hosting of een CDN ervoor." }, "own-server": { "title": "Uw eigen server (FTP / SFTP)", "short": "Gedeelde hosting, VPS…", "hint": "Browsers spreken geen FTP of SFTP: upload de PHP-bridge (external/bridges/php/flexweg-bridge.php) eenmalig met uw FTP-client, stel de API-sleutel ervan in en vul hier daarna de URL in. Werkt op elke PHP-host." }, "local-folder": { "title": "Lokale map", "short": "Op deze computer", "hint": "Schrijft de site naar een map op deze computer (Chrome / Edge). Serveer hem lokaal of push hem met uw eigen tools." }, "zip": { "title": "Downloaden als ZIP", "short": "Handmatig uploaden", "hint": "De site wordt in deze browser bewaard; download een ZIP via Instellingen en upload die waar u maar wilt (Netlify Drop, FTP-client…)." } };
const sqliteAccess$2 = { "heading": "Verbinding maken met de database", "intro": "Deze admin slaat zijn content op in {{path}}. Voer de toegangsgegevens voor deze browser in.", "storage": "De toegangsgegevens worden alleen in deze browser bewaard. Afmelden wist ze.", "passphrase": "Wachtzin van de database", "passphraseHint": "De database is versleuteld. Voer de wachtzin in die bij de installatie is gekozen (alleen in deze browser bewaard).", "passphraseWrong": "Verkeerde wachtzin: de database kon niet worden geopend.", "passphraseMissing": "Voer de wachtzin van de database in." };
const nl = {
  common: common$2,
  auth: auth$2,
  nav: nav$2,
  dashboard: dashboard$2,
  posts: posts$2,
  pages: pages$2,
  taxonomies: taxonomies$2,
  media: media$2,
  themes: themes$2,
  plugins: plugins$2,
  externalInstall: externalInstall$2,
  externalLoader: externalLoader$2,
  menus: menus$2,
  settings: settings$2,
  users: users$2,
  firestoreSetup: firestoreSetup$2,
  errors: errors$2,
  identity: identity$2,
  setup: setup$2,
  flexweg: flexweg$2,
  publish: publish$2,
  docstore: docstore$2,
  connectors: connectors$2,
  gitAccess: gitAccess$2,
  hosting: hosting$2,
  sqliteAccess: sqliteAccess$2
};
const common$1 = { "save": "Guardar", "saving": "A guardar…", "saved": "Guardado", "cancel": "Cancelar", "delete": "Eliminar", "deleting": "A eliminar…", "edit": "Editar", "create": "Criar", "search": "Pesquisar", "loading": "A carregar…", "yes": "Sim", "no": "Não", "confirm": "Confirmar", "back": "Voltar", "next": "Seguinte", "previous": "Anterior", "close": "Fechar", "all": "Todos", "none": "Nenhum", "actions": "Ações", "name": "Nome", "slug": "Slug", "description": "Descrição", "status": "Estado", "createdAt": "Criado", "updatedAt": "Atualizado", "publishedAt": "Publicado", "language": "Idioma", "darkMode": "Modo escuro", "lightMode": "Modo claro", "signOut": "Terminar sessão", "administrator": "Administrador", "editor": "Editor", "appName": "AgentCMS" };
const auth$1 = { "signIn": "Iniciar sessão", "signingIn": "A iniciar sessão…", "email": "E-mail", "password": "Palavra-passe", "emailPlaceholder": "voce@empresa.com", "passwordPlaceholder": "••••••••", "forgotPassword": "Esqueceu-se da palavra-passe?", "resetEmailSent": "E-mail de redefinição de palavra-passe enviado para {{email}}.", "enterEmailFirst": "Introduza primeiro o seu e-mail acima e depois clique em redefinir.", "emailPasswordRequired": "E-mail e palavra-passe são obrigatórios.", "signInSubtitle": "Use o seu e-mail de trabalho e palavra-passe.", "footer": "Os pedidos de conta passam pelo seu administrador.", "errors": { "invalidEmail": "Endereço de e-mail inválido.", "invalidCredentials": "E-mail ou palavra-passe inválidos.", "tooManyRequests": "Demasiadas tentativas. Tente novamente mais tarde ou redefina a sua palavra-passe.", "userDisabled": "Esta conta foi desativada.", "networkFailed": "Erro de rede. Verifique a sua ligação.", "generic": "Falha na autenticação." } };
const nav$1 = { "openMenu": "Abrir menu", "closeMenu": "Fechar menu", "dashboard": "Painel", "posts": "Artigos", "pages": "Páginas", "taxonomies": "Categorias e etiquetas", "media": "Multimédia", "themes": "Temas", "themeSettings": "Definições do tema", "plugins": "Plugins", "menus": "Menus", "users": "Utilizadores", "settings": "Definições" };
const dashboard$1 = { "title": "Painel", "welcome": "Bem-vindo de volta, {{email}}.", "stats": { "totalPosts": "Artigos", "totalPages": "Páginas", "online": "Online", "drafts": "Rascunhos" } };
const posts$1 = { "title": "Artigos", "newPost": "Novo artigo", "noPosts": "Ainda não há artigos. Crie o primeiro para começar.", "noPostsInFilter": "Nenhum artigo corresponde ao filtro atual.", "search": { "placeholder": "Procurar artigos…", "clear": "Limpar pesquisa", "noResults": "Nenhum artigo corresponde à sua pesquisa." }, "pagination": { "previous": "Anterior", "next": "Seguinte", "showing": "A mostrar {{from}}–{{to}} de {{total}}", "pageOf": "Página {{page}} de {{total}}" }, "bulk": { "selectedCount_one": "{{count}} selecionado", "selectedCount_other": "{{count}} selecionados", "selectPage_one": "Selecionar {{count}} nesta página", "selectPage_other": "Selecionar os {{count}} desta página", "deselectPage": "Desmarcar página", "allOnPageSelected_one": "{{count}} nesta página selecionado.", "allOnPageSelected_other": "Os {{count}} desta página estão selecionados.", "selectAllMatching_one": "Selecionar o artigo correspondente", "selectAllMatching_other": "Selecionar os {{count}} artigos correspondentes", "allMatchingSelected_one": "O artigo correspondente está selecionado.", "allMatchingSelected_other": "Os {{count}} artigos correspondentes estão selecionados.", "selectOne": "Selecionar «{{title}}»", "publish": "Publicar ({{count}})", "publishing": "A publicar…", "publishedCount": "{{ok}} publicado(s), {{failed}} falha(s).", "unpublish": "Despublicar ({{count}})", "unpublishing": "A despublicar…", "unpublishedCount": "{{ok}} despublicado(s), {{failed}} falha(s).", "delete": "Eliminar", "deleting": "A eliminar…", "deletedCount": "{{ok}} eliminado(s), {{failed}} falha(s).", "confirmDelete_one": "Eliminar {{count}} artigo? Será despublicado do Flexweg e não pode ser desfeito.", "confirmDelete_other": "Eliminar {{count}} artigos? Serão despublicados do Flexweg e não pode ser desfeito.", "noDraftSelected": "Nenhum artigo em rascunho selecionado.", "noOnlineSelected": "Nenhum artigo online selecionado.", "clear": "Limpar seleção" }, "filters": { "all": "Todos", "draft": "Rascunho", "online": "Online" }, "fields": { "title": "Título", "slug": "Slug", "excerpt": "Excerto", "content": "Conteúdo", "category": "Categoria", "tags": "Etiquetas", "heroImage": "Imagem de destaque", "seoTitle": "Título SEO", "seoDescription": "Descrição SEO", "createdAt": "Criado em", "updatedAt": "Última atualização", "publishedAt": "Publicado em" }, "edit": { "newTitle": "Novo artigo", "editTitle": "Editar artigo", "saved": "Guardado.", "savedAndRepublished": "Guardado e republicado.", "saveFailed": "Falha ao guardar.", "saveAndRepublish": "Guardar e republicar", "draftSaved": "Rascunho guardado.", "slugCollision": { "post": 'Este URL já é usado pelo artigo: "{{label}}".', "page": 'Este URL já é usado pela página: "{{label}}".', "category": 'Este URL já é usado pela categoria: "{{label}}".' }, "publish": "Publicar", "unpublish": "Despublicar", "publishing": "A publicar…", "unpublishing": "A despublicar…", "titlePlaceholder": "Adicionar título", "permalink": "Ligação permanente", "slugFormatHint": "Apenas minúsculas, ASCII, separadas por hífens.", "slugAutoSuffixed": 'Sufixo adicionado porque "{{base}}" já é usado por {{owner}}.', "slugAutoSuffixedOwner": { "post": 'publicação: "{{label}}"', "page": 'página: "{{label}}"', "category": 'categoria: "{{label}}"' }, "saveBlocked": { "titleRequired": "Adicione um título antes de guardar.", "slugRequired": "São necessários um título e um slug de URL para guardar.", "slugInvalid": "Formato de slug inválido (ASCII minúsculo + hífens).", "slugCollision": "Resolva o conflito de URL antes de guardar." }, "viewPublished": "Ver", "confirmDelete": "Eliminar este registo?", "inspector": { "document": "Documento", "block": "Bloco", "blockEmpty": "Selecione um bloco no editor para ver as suas opções.", "publishing": "Publicação", "permalink": "Ligação permanente", "categories": "Categorias e etiquetas", "featured": "Imagem de destaque", "seo": "SEO", "excerpt": "Excerto", "dates": "Datas" }, "blocks": { "addBlock": "Adicionar bloco", "transform": "Transformar em", "moveUp": "Mover para cima", "moveDown": "Mover para baixo", "duplicate": "Duplicar", "remove": "Eliminar bloco", "paragraph": "Parágrafo", "heading2": "Título 2", "heading3": "Título 3", "bulletList": "Lista com marcadores", "orderedList": "Lista numerada", "blockquote": "Citação", "codeBlock": "Código", "image": "Imagem", "horizontalRule": "Separador", "categories": { "text": "Texto", "media": "Multimédia", "layout": "Disposição", "embed": "Incorporações", "advanced": "Avançado" }, "noSettings": "Este bloco não tem definições.", "noSelection": "Selecione um bloco no editor para ver as suas opções.", "slash": { "noResults": "Nenhum bloco corresponde." } } }, "status": { "draft": "Rascunho", "online": "Online" }, "preview": { "title": "Pré-visualização", "rendering": "A renderizar pré-visualização…", "error": "Pré-visualização falhou: {{error}}", "viewports": { "mobile": "Telemóvel", "tablet": "Tablet", "desktop": "Computador" } } };
const pages$1 = { "title": "Páginas", "newPage": "Nova página", "noPages": "Ainda não há páginas.", "homeBadge": "Início", "homeBadgeTooltip": "Usada como página inicial do site" };
const taxonomies$1 = { "title": "Categorias e etiquetas", "categories": "Categorias", "tags": "Etiquetas", "newCategory": "Nova categoria", "newTag": "Nova etiqueta", "noCategories": "Ainda não há categorias.", "noTags": "Ainda não há etiquetas.", "slugCollision": 'Este slug já é usado por "{{label}}".', "seo": { "button": "SEO", "buttonTitle": "Editar metatags SEO", "title": "Metatags SEO", "subtitle": 'Título e descrição personalizados para a página de arquivo de "{{name}}".', "metaTitle": "Meta título", "metaTitleHint": "Usado como <title> da página. Padrão: o nome do termo.", "metaDescription": "Meta descrição", "metaDescriptionHint": "Usada como meta descrição da página. Padrão: a descrição do termo." } };
const media$1 = { "title": "Biblioteca multimédia", "upload": "Carregar", "uploading": "A carregar…", "finalizing": "A finalizar…", "uploadFailed": "Falha no carregamento", "retry": "Tentar novamente", "noMedia": "Ainda não há multimédia.", "alt": "Texto alternativo", "caption": "Legenda", "filename": "Nome do ficheiro", "size": "Tamanho", "type": "Tipo" };
const themes$1 = { "title": "Temas", "active": "Ativo", "activate": "Ativar", "installExternal": "Instalar tema", "uninstallDisabledTitle": "Mude para outro tema antes de desinstalar este.", "syncAssets": "Sincronizar recursos do tema", "regenerateSite": "Regenerar o site", "regenerating": "A regenerar…", "regenerate": { "button": "Regenerar", "running": "Em execução…", "groupBuiltins": "Site", "groupPlugins": "Plugins", "home": "Apenas página inicial", "homeHelp": "Regenera apenas index.html — opção mais rápida.", "allHtml": "Todas as páginas HTML", "allHtmlHelp": "Todos os posts, páginas, arquivos e listagens — mais os snapshots menu / posts / authors JSON.", "repair": "Reparar URLs", "repairHelp": "Recalcula a URL canônica de cada post online e move os arquivos que ficaram na URL errada. Útil após uma importação executada antes que os termos fossem sincronizados.", "assets": "Recursos do tema", "assetsHelp": "Envia o CSS e os scripts do tema ativo para /theme-assets/.", "everything": "Tudo", "everythingHelp": "Recursos do tema + todos os HTML + cada saída de plugin. Opção mais lenta.", "noPluginTargets": "Sem regenerações de plugin — ative um plugin que suporte regenerar." }, "confirmSwitch": { "title": "Mudar para {{theme}}?", "body": "Mudar de tema requer reenviar os recursos do tema e regenerar todas as páginas publicadas para que o novo aspeto se propague em todo o lado. Pode demorar um momento.", "confirm": "Mudar e regenerar", "cancel": "Cancelar" } };
const plugins$1 = { "title": "Plugins", "enabled": "Ativado", "disabled": "Desativado", "enable": "Ativar", "disable": "Desativar", "configure": "Configurar", "author": "autor", "learnMore": "Saber mais", "mustUseBadge": "Obrigatório", "installExternal": "Instalar plugin", "tabs": { "regular": "Plugins", "mustUse": "Obrigatórios" } };
const externalInstall$1 = { "titlePlugin": "Instalar um plugin", "titleTheme": "Instalar um tema", "labelPlugin": "plugin", "labelTheme": "tema", "intro": "Largue um ficheiro ZIP com um pacote de {{label}} (manifest.json + bundle.js na raiz do ZIP). O {{label}} será carregado para o seu site Flexweg e registado após uma recarga. Voltar a carregar um ZIP com o mesmo id de manifest atualiza o registo existente no local — não é preciso desinstalar.", "zipField": "Ficheiro ZIP do pacote", "install": "Instalar", "installing": "A instalar…", "installSuccess": "{{name}} instalado ({{count}} ficheiros carregados). A recarregar…", "upgradeSuccess": "{{name}} atualizado de v{{previousVersion}} para v{{newVersion}} ({{count}} ficheiros carregados). A recarregar…", "installedTitle": "Já instalado", "bundledDefaultsTitle": "Plugins/temas incluídos disponíveis", "bundledDefaultsHint": "{{count}} plugin/tema incluído está atualmente desinstalado. Restaure-os para recuperar o que vinha com esta versão do admin.", "bundledDefaultsRestore": "Restaurar", "bundledDefaultsRestored": "{{plugins}} plugin(s) e {{themes}} tema(s) restaurados. A recarregar…", "uninstall": "Desinstalar", "uninstallSuccess": "{{id}} desinstalado. A recarregar…", "confirmUninstall": "Desinstalar {{id}}? Os ficheiros serão eliminados do Flexweg.", "errors": { "no-manifest": "Ao ZIP falta manifest.json na raiz.", "invalid-manifest": "O manifest.json é inválido (campos obrigatórios em falta ou JSON inválido).", "incompatible-api": "O pacote foi construído contra uma versão de API runtime incompatível.", "no-bundle": "O ZIP não contém o ficheiro de entrada declarado no manifest.", "fetch-manifest": "Não foi possível ler o external.json atual no Flexweg.", "upload-failed": "Falha no carregamento — verifique a sua chave API Flexweg e a sua ligação." } };
const externalLoader$1 = { "someFailed": "{{count}} pacote(s) externo(s) falharam ao carregar. Veja a consola do browser." };
const menus$1 = { "title": "Menus", "header": "Menu de cabeçalho", "footer": "Menu de rodapé", "label": "Etiqueta", "saveAndPublish": "Guardar e gerar", "discard": "Descartar", "saved": "Menus guardados e publicados.", "saveFailed": "Não foi possível guardar os menus.", "unsavedChanges": "Tem alterações por guardar." };
const settings$1 = { "title": "Definições", "tabs": { "general": "Geral" }, "site": { "title": "Site", "siteTitle": "Título do site", "siteDescription": "Descrição do site", "siteLanguage": "Idioma do site", "siteLanguageHelp": 'Tag BCP-47 (p. ex. en, fr-CA) inserida em <html lang="…"> em cada página publicada. O prefixo é correspondido com os locais de tradução suportados para os rótulos de sitemap / RSS e textos integrados no tema; os locais não suportados recorrem ao inglês.', "siteLanguageResolved": "As traduções usarão: {{label}}", "baseUrl": "URL público do site", "postsPerPage": "Artigos por página", "homeMode": "Conteúdo da página inicial", "homeLatest": "Artigos mais recentes", "homeStatic": "Página estática", "homePage": "Página inicial", "discourageIndexing": "Desencorajar os motores de pesquisa de indexar este site", "discourageIndexingHelp": "Quando ativado, cada página publicada recebe uma meta tag noindex/nofollow e o robots.txt bloqueia todos os rastreadores. Replica o comportamento do WordPress — útil para sites de staging ou revisões antes do lançamento. Os motores de pesquisa que respeitam a diretiva não indexarão o site.", "discourageRegenerateHint": "Definição de indexação guardada. Clique em «Regenerar tudo» em Temas para aplicar a alteração a todas as páginas publicadas e ao robots.txt." }, "flexweg": { "title": "API Flexweg", "apiKey": "Chave da API", "apiKeyHelp": "Gerada na sua conta Flexweg → API.", "siteUrl": "URL do site", "siteUrlHelp": "URL público do seu site Flexweg sem barra final.", "apiBaseUrl": "URL base da API", "storageHelpFirebase": "Guardada no Firestore (config/flexweg). Legível por qualquer membro com sessão iniciada, gravável apenas por administradores.", "storageHelpSqlite": "Guardada na tabela SQLite local config. Legível por qualquer membro com sessão iniciada, gravável apenas por administradores." }, "backend": { "title": "Backend de dados", "active": "Backend ativo:", "switchButton": "Mudar de backend…", "confirmTitle": "Todos os dados atuais serão perdidos.", "confirmBody": "Mudar limpa a configuração no browser e recarrega o formulário de configuração. O novo backend começa vazio — os dados do backend anterior permanecem onde estavam (no Firestore ou como um ficheiro .sqlite no Flexweg), mas o CMS só voltará a lê-los quando trocar de volta.", "confirmYes": "Sim, mudar de backend", "downloadBackup": "Descarregar uma cópia de segurança do ficheiro .sqlite", "downloadBackupHelp": "faça isto antes de mudar de backend.", "markdownGit": "Markdown — {{source}}", "localFolder": "pasta local", "localBrowser": "Este browser (local, um só utilizador)", "sqliteFile": "Ficheiro SQLite — {{location}}" }, "performance": { "title": "Desempenho", "help": "Como o admin carrega artigos e páginas. O modo padrão funciona no plano gratuito do Firestore sem configuração; o modo paginado é para sites muito grandes e requer criação de índices uma vez.", "mode": "Modo de carregamento", "modeGlobal": "Padrão (sem configuração)", "modePaginated": "Paginação no servidor (índices Firestore necessários)", "globalHelp": "Carrega toda a coleção de artigos numa subscrição ao vivo. Ordenação, filtros e pesquisa em memória. Recomendado para sites com menos de ~5 000 artigos.", "paginatedHelp": "Subscrições paginadas por cursor, uma página de cada vez. Requer índices compostos do Firestore — ver README. Recomendado para sites muito grandes.", "savedReload": "Guardado. Recarregue o admin para aplicar o novo modo." }, "editor": { "title": "Editor", "help": "Tipografia usada no editor de artigos / páginas. Independente do tema público.", "fontFamily": "Família tipográfica", "bodySize": "Tamanho do corpo", "h1Size": "Tamanho H1", "h2Size": "Tamanho H2", "h3Size": "Tamanho H3", "sizeHelp": "Comprimento CSS, p. ex. 16px ou 1rem. Deixe em branco para o valor predefinido.", "reset": "Repor predefinições" }, "profile": { "title": "Perfil", "adminLocale": "Idioma do admin", "adminLocaleHelp": "Idioma usado pela interface de administração. Guardado no seu perfil.", "firstName": "Nome próprio", "lastName": "Apelido", "headline": "Título", "headlinePlaceholder": "ex. Jornalista, Editor-chefe…", "headlineHelp": "Mostrado publicamente sob o seu nome nos cartões de autor e na sua página de arquivo.", "bio": "Biografia", "bioPlaceholder": "Um parágrafo curto mostrado na sua página de autor e por baixo dos seus artigos.", "bioHelp": "Visível no site público na barra lateral do autor e na página de arquivo do autor.", "socials": "Perfis sociais", "socialsHelp": "Adicione os URLs dos perfis que quer expor no site público e ative «Mostrar» nos que devem ser visíveis. URLs vazios são ignorados.", "socialsShow": "Mostrar", "socialsShowHelp": "Alterna a visibilidade desta rede no site público.", "avatar": "Foto de perfil", "avatarHelp": "Escolha uma imagem da sua biblioteca multimédia. Imagens quadradas ficam melhor.", "pickAvatar": "Escolher dos média", "changeAvatar": "Alterar foto", "removeAvatar": "Remover", "save": "Guardar perfil" }, "transfer": { "title": "Mover ou fazer cópia de segurança do conteúdo", "help": "Exporte tudo (posts, páginas, categorias, metadados de multimédia, perfis, definições) num único ficheiro JSON. Num backend Markdown ou local pode importar esse ficheiro mantendo os ids — é assim que se migra a partir do Firebase ou do SQLite. Os ficheiros multimédia e as chaves secretas não são incluídos.", "export": "Exportar o conteúdo (JSON)", "import": "Importar conteúdo…", "modeMerge": "Combinar (substitui os mesmos ids)", "modeReplace": "Substituir as coleções importadas", "replaceConfirm": "O modo Substituir elimina todos os itens existentes das coleções presentes no ficheiro antes de importar. Continuar?", "invalidFile": "Este ficheiro não é uma exportação de conteúdo do AgentCMS.", "imported": "Importados {{posts}} posts/páginas, {{terms}} termos e {{media}} multimédia. Execute Regenerar → Tudo para os publicar." }, "encryption": { "title": "Cifra da base de dados:", "on": "ativa", "off": "inativa", "onHelp": "O ficheiro da base de dados é ilegível sem a frase-passe. Alterá-la volta a guardar o ficheiro com uma nova chave; os outros navegadores vão pedir a nova frase.", "offHelp": "Quem conseguir descarregar o ficheiro da base de dados pode lê-lo (um alojamento estático serve-o como qualquer página). Cifre-o com uma frase-passe.", "enable": "Cifrar a base de dados…", "change": "Alterar a frase-passe…", "savedConfirm": "Guardei esta frase-passe no meu gestor de palavras-passe — sem ela o conteúdo não pode ser aberto.", "enableConfirm": "Cifrar agora", "changeConfirm": "Alterar a frase", "done": "Base de dados guardada com a nova frase-passe." } };
const users$1 = { "title": "Utilizadores", "noUsers": "Ainda não há utilizadores.", "role": "Função", "disabled": "Desativado", "editProfileTitle": "Editar perfil — {{email}}", "profileSaved": "Perfil guardado.", "descriptionFirebase": "Faça a gestão da sua equipa. As novas contas são criadas na Firebase Console e replicadas aqui no primeiro início de sessão.", "descriptionSqlite": "Faça a gestão da sua equipa. Use o botão +Adicionar utilizador abaixo para criar contas diretamente.", "addUser": "Adicionar utilizador", "addUserSuccess": "{{email}} adicionado.", "removeConfirmFirebase": "Eliminar o registo de {{email}}? Isto remove o perfil e a função do CMS. Para revogar o acesso, elimine também a conta na Firebase Console.", "removeConfirmSqlite": "Eliminar permanentemente {{email}}? Isto revoga o acesso E remove o perfil e a função. Esta ação não pode ser desfeita.", "empty": { "title": "Ainda não há membros na equipa", "descriptionFirebase": "Crie a primeira conta na Firebase Console e depois inicie sessão aqui uma vez para registar o perfil.", "descriptionSqlite": "Clique em +Adicionar utilizador acima para convidar o primeiro membro." }, "help": { "title": "Como adicionar um novo membro à equipa", "bootstrapLine": "O admin inicial (sempre com acesso total) é:", "firebase": { "step1": "Abra a Firebase Console → Authentication → Add user.", "step2": "Defina um e-mail e palavra-passe e envie-os ao novo membro.", "step3": "Peça-lhe para iniciar sessão aqui uma vez — o perfil aparece na lista acima e pode editar a função e os dados." }, "sqlite": { "step1": "Clique no botão +Adicionar utilizador acima.", "step2": "Introduza o e-mail e uma palavra-passe temporária (8+ caracteres).", "step3": "Partilhe as credenciais de forma segura — ele pode alterar a palavra-passe a partir do perfil depois de iniciar sessão." }, "git": { "step1": "Adicione a pessoa como colaboradora do repositório de conteúdo (escrita = editor, admin / maintainer = admin).", "step2": "A pessoa cria o seu próprio token de acesso pessoal no GitHub / GitLab.", "step3": "Abre o admin e inicia sessão com esse token — o perfil é criado aqui automaticamente." } }, "addUserModal": { "title": "Adicionar um novo membro à equipa", "intro": "Cria a conta diretamente na base de dados Flexweg SQLite Auth. O novo utilizador fica com a função editor por defeito; promova-o a partir da lista abaixo se precisar de acesso admin.", "submit": "Criar utilizador", "submitting": "A criar…" }, "actions": { "editProfile": "Editar perfil", "promote": "Promover a administrador", "demote": "Despromover a editor", "disable": "Desativar", "enable": "Ativar", "delete": "Eliminar registo" }, "descriptionGit": "Os membros da equipa são as pessoas com acesso de escrita ao repositório de conteúdo. Aparecem aqui após o primeiro início de sessão; a função acompanha as permissões no repositório.", "descriptionLocal": "Este admin funciona em modo de utilizador único: o conteúdo é guardado neste browser e não há contas.", "descriptionSqliteFile": "Sem contas de utilizador com este backend: qualquer pessoa que consiga abrir o admin pode editar. Proteja a pasta do admin ao nível do seu alojamento. Os perfis de autor abaixo são meramente informativos." };
const firestoreSetup$1 = { "title": "Configuração do Firestore necessária", "intro": "As páginas de listagem de artigos e páginas precisam de alguns índices compostos do Firestore para consultas eficientes. Precisam de ser criados manualmente — o Firebase reserva a criação de índices aos administradores do projeto.", "checking": "A verificar os seus índices Firestore…", "missingCount_one": "{{count}} índice em falta:", "missingCount_other": "{{count}} índices em falta:", "openConsole": "Abrir Firebase Console para criar", "noUrl": "Não foi possível extrair o URL de auto-sugestão — consulte o README para o comando gcloud.", "howItWorks": "Como funciona", "step1": "Clique no link de cada índice em falta — Firebase Console abre com a definição pré-preenchida.", "step2": "Clique em «Create» e espere 1–5 minutos pela construção do índice (estado na consola).", "step3": "Volte aqui e clique em Tentar novamente. Quando ambas as consultas tiverem êxito, o admin carrega.", "retry": "Tentar novamente", "retrying": "A tentar…", "buildHint": "A construção de um índice pode demorar alguns minutos após a criação.", "allReady": "Todos os índices estão prontos.", "unexpectedTitle": "Firestore inacessível", "unexpectedHint": "Verifique a sua ligação e as regras do Firestore. Se acabou de criar os índices, espere que terminem e tente novamente." };
const errors$1 = { "appError": "Erro da aplicação", "loadAccountFailed": "Não foi possível carregar a sua conta", "loadAccountHint": "Se o problema persistir, termine sessão e tente novamente.", "accountDisabled": "Conta desativada", "accountDisabledMessage": "O seu acesso a este CMS foi desativado. Contacte o seu administrador.", "firebaseNotConfigured": "Firebase não está configurado", "firebaseEnvMissing": "Faltam as seguintes variáveis de ambiente:\n{{vars}}\n\nCopie .env.example para .env, preencha as credenciais do seu projeto Firebase e reinicie o servidor de desenvolvimento.", "adminEmailNotConfigured": "E-mail do admin não configurado", "adminEmailMessage": "VITE_ADMIN_EMAIL está em falta no .env. Defina-o com o e-mail do administrador inicial.", "consoleHint": "Verifique a consola do browser e a sua configuração .env. Consulte o README para instruções de configuração." };
const identity$1 = { "brandTitle": "AgentCMS", "brandSubtitle": "Publicador estático", "login": { "heading": "Iniciar sessão", "intro": "Use o e-mail e a palavra-passe que o seu administrador lhe forneceu.", "submit": "Iniciar sessão", "submitting": "A iniciar sessão…" }, "fields": { "name": "Nome a apresentar (opcional)", "namePlaceholder": "Maria Silva", "email": "E-mail", "password": "Palavra-passe", "passwordHint": "Pelo menos 8 caracteres." }, "footer": "As novas contas são criadas por um administrador a partir da página Utilizadores.", "errors": { "invalidEmail": "Introduza um endereço de e-mail válido.", "missingPassword": "A palavra-passe é obrigatória.", "passwordTooShort": "A palavra-passe deve ter pelo menos 8 caracteres." } };
const setup$1 = /* @__PURE__ */ JSON.parse('{"title":"Bem-vindo ao AgentCMS","subtitle":"Configuração inicial","intro":"Insira as suas credenciais Firebase, a conta de administrador inicial e a sua chave API Flexweg. Os valores são validados, guardados no seu projeto (Firestore + um ficheiro config.js no Flexweg) e o admin recarrega no fluxo de início de sessão normal. Só faz isto uma vez.","introFirebase":"Passo 1 — Firebase. Preencha as credenciais do seu projeto Firebase e a conta de administrador bootstrap. Iniciamos sessão, verificamos o e-mail e confirmamos que as suas regras Firestore reconhecem este admin antes de avançarmos para o passo Flexweg.","introFlexweg":"Passo 2 — Flexweg. Preencha a sua chave API Flexweg e o URL do site. Testamos a API, guardamos a configuração no Firestore, fazemos upload do config.js para o seu site e sincronizamos os ativos do tema.","continueToFlexweg":"Validar Firebase e continuar","stepper":{"terms":"Condições","backend":"Backend","firebase":"Firebase","flexweg":"Flexweg","sqlite":"SQLite","docstore":"Conteúdo e publicação","data":"Dados","hosting":"Alojamento","install":"Instalação"},"backend":{"title":"Escolha um backend de dados","intro":"Escolha onde o CMS irá guardar os seus artigos, páginas, utilizadores e definições. Pode trocar depois nas Definições (os dados não são migrados).","sqliteTitle":"Flexweg SQLite (recomendado)","sqliteHint":"Todos os dados ficam no seu site Flexweg como um ficheiro SQLite. Sem serviço externo. A auth é fornecida pela API SQLite do Flexweg.","firebaseTitle":"Firebase","firebaseHint":"Use um projeto Firebase para Firestore + Auth. Gratuito no plano Spark. Atualizações em tempo real via onSnapshot.","continue":"Continuar","markdownGitTitle":"Ficheiros Markdown num repositório Git","markdownGitHint":"Posts como ficheiros .md no GitHub / GitLab (ou num clone local). Cada editor inicia sessão com o seu próprio token de acesso; cada alteração é um commit. Sem base de dados, funciona com vários editores e computadores.","localTitle":"Apenas este browser","localHint":"Um só utilizador, sem início de sessão, nada para configurar. O conteúdo fica neste browser (exporte-o a partir das Definições). Ideal para um admin a correr no seu próprio computador."},"sqlite":{"heading":"Conectar o seu site Flexweg","intro":"Vamos usar a sua chave API mestre Flexweg UMA VEZ para criar um token de âmbito limitado para a base de dados SQLite. Após a instalação, a chave mestre é descartada e apenas o token limitado (restrito a este ficheiro SQLite) é guardado.","apiKeyHint":"Chave API mestre Flexweg. Usada apenas para instalar — nunca guardada depois.","detectedFromUrl":"Detetado do URL","advanced":"Definições avançadas (URL do site, caminho SQLite…)","pathHint":"Onde fica o ficheiro SQLite no seu site Flexweg. As pastas são criadas automaticamente.","adminHeading":"Conta de administrador","adminIntro":"Crie o primeiro utilizador — esta conta obtém direitos de admin automaticamente. Os membros seguintes são integrados a partir da página Utilizadores depois de ter sessão iniciada.","passwordHint":"Pelo menos 8 caracteres.","submit":"Instalar base de dados SQLite"},"terms":{"title":"Condições de utilização","intro":"Leia e aceite as condições abaixo antes de utilizar o AgentCMS. Estão escritas em linguagem clara para serem rápidas de ler.","section1":{"title":"1. Serviço gratuito","body":"O AgentCMS é disponibilizado gratuitamente pelo Flexweg. Pode utilizá-lo sem limites com o seu alojamento Flexweg — o Flexweg nunca lhe vai cobrar pelo uso do CMS em si. As tarifas habituais do seu plano de alojamento Flexweg e do seu plano Firebase mantêm-se aplicáveis, cada uma na conta correspondente."},"section2":{"title":"2. Fornecido «tal como está», sem garantia","body":"O CMS é fornecido tal como está. Trabalhamos para o manter estável e melhorá-lo ao longo do tempo, mas não podemos garantir que esteja livre de bugs, defeitos ou interrupções. Utilize-o com a mesma cautela que teria com qualquer ferramenta que não tenha escrito por si: mantenha cópias de segurança dos conteúdos importantes."},"section3":{"title":"3. Os seus conteúdos, a sua responsabilidade","body":"É o único responsável pelos conteúdos que publica através do CMS — textos, imagens, vídeos, formulários, integrações de código e quaisquer outros media. Deve cumprir a lei aplicável na sua jurisdição (e nas que visa), os direitos de autor, os direitos de imagem e de personalidade, as regras de proteção de dados pessoais e as condições de quaisquer serviços de terceiros que utilize (fontes incorporadas, vídeos, etc.). O Flexweg não é responsável pelos conteúdos publicados pelos utilizadores do CMS."},"section4":{"title":"4. A sua conta Firebase, a sua segurança","body":"O CMS guarda os seus dados no seu próprio projeto Firebase. É responsável pela segurança desse projeto: escolha uma palavra-passe forte para a conta de administrador inicial, configure as regras de segurança do Firestore como documentado, faça rotação das suas chaves API quando necessário e verifique quem tem acesso. O Flexweg não pode em caso algum ser responsabilizado por acessos não autorizados, fugas de dados, ataques informáticos ou perdas resultantes de uma má configuração ou comprometimento da sua conta Firebase."},"section5":{"title":"5. Limitação de responsabilidade","body":"O Flexweg não pode ser responsabilizado por qualquer perda de receitas, perda de dados, perda de oportunidade comercial, ou por quaisquer danos diretos ou indiretos decorrentes do uso, mau uso ou indisponibilidade do CMS. Quando a lei aplicável obrigar o Flexweg a assumir alguma responsabilidade, esta limita-se ao montante efetivamente pago ao Flexweg pelo CMS nos últimos 12 meses — ou seja, zero, uma vez que o CMS é gratuito."},"section6":{"title":"6. Os seus dados continuam seus","body":"Os conteúdos que cria com o CMS são guardados no seu próprio projeto Firebase (textos, definições, metadados dos media) e no seu próprio alojamento Flexweg (HTML publicado, imagens, assets de tema). O CMS em si não transmite os seus conteúdos a nenhum serviço de terceiros. Os plugins ou temas que escolher ativar podem ter o seu próprio comportamento — verifique o que fazem antes de os ativar."},"section7":{"title":"7. Bom uso","body":"A utilização do CMS para atividades ilegais, fraudulentas ou nocivas, ou de forma contrária às condições gerais de utilização do Flexweg, pode levar à suspensão do acesso ao alojamento Flexweg. Podemos também atualizar estas condições do CMS ao longo do tempo; as alterações significativas serão comunicadas através do admin ou por e-mail."},"accept":"Li e aceito as Condições de utilização.","continue":"Continuar para a configuração","back":"Voltar"},"sections":{"firebase":"Firebase","admin":"Administrador inicial","flexweg":"API Flexweg"},"help":{"firebase":"Encontre estes valores em Firebase Console → Definições do projeto → Geral → As suas apps → Configuração do SDK.","admin":"Use um utilizador existente em Firebase Authentication. Quem inicie sessão com este e-mail é tratado como administrador e ignora a verificação de registo de utilizador. Crie o utilizador em Firebase Console → Authentication se ainda não existir.","flexweg":"Gere uma chave API permanente na sua conta Flexweg → API. O URL do site é o endereço público do seu site Flexweg (ex. https://o-seu-site.flexweg.com).","flexwegApiKeyHint":"Obtenha a sua chave API nas definições da sua conta Flexweg.","flexwegApiKeyLink":"Abrir definições da conta"},"fields":{"apiKey":"Chave API","authDomain":"Domínio de autenticação","projectId":"ID do projeto","storageBucket":"Bucket de armazenamento","messagingSenderId":"ID de remetente de mensagens","appId":"ID da app","adminEmail":"E-mail","adminPassword":"Palavra-passe","flexwegApiKey":"Chave API","flexwegSiteUrl":"URL do site","flexwegApiBaseUrl":"URL base da API","sqlitePath":"Caminho SQLite"},"submit":"Guardar e continuar","submitting":"A configurar…","success":"Configuração concluída!","reloadingHint":"O admin vai recarregar daqui a um instante — aguarde.","footer":"Estes valores são guardados no seu projeto (Firestore + Flexweg). Não são enviados para mais lado nenhum.","steps":{"signInFirebase":"A iniciar sessão no Firebase…","testFlexweg":"A testar a API Flexweg…","writeFirestore":"A guardar a configuração…","uploadConfig":"A carregar config.js para o Flexweg…","syncThemes":"A sincronizar assets do tema para o Flexweg…","sqliteInstall":"A criar token SQLite com âmbito limitado…","sqliteRegisterAdmin":"A registar a conta de admin…","sqliteSchema":"A inicializar o esquema SQLite…"},"stepsDone":{"sqliteInstall":"Token SQLite com âmbito limitado emitido","sqliteRegisterAdmin":"Admin registado e com sessão iniciada","sqliteSchema":"Esquema SQLite pronto"},"errors":{"missingFields":"Por favor, preencha todos os campos.","rootDeploymentTitle":"O admin deve estar numa subpasta, não na raiz do site.","rootDeploymentHint":"Mova os ficheiros do admin (index.html, config.js, runtime/, …) para uma subpasta no Flexweg — por exemplo /admin/ ou um nome aleatório como /erf34f654GH3/ por discrição. Em seguida recarregue o admin a partir do URL da subpasta e volte a executar a configuração.","firebaseAuthGeneric":"Não foi possível iniciar sessão no Firebase.","firebaseAuthInvalidCredential":"O Firebase rejeitou a combinação de e-mail e palavra-passe.","firebaseAuthInvalidCredentialHint":"Os projetos Firebase recentes ativam por defeito a proteção contra enumeração de e-mails, que devolve o mesmo erro quer a palavra-passe esteja errada, o utilizador não exista, ou o utilizador inicie sessão com outro fornecedor. A verificar:\\n• Reintroduza a palavra-passe — copie/cole de um gestor de palavras-passe para eliminar erros de digitação. O mínimo são 6 caracteres.\\n• Abra Firebase Console → Authentication → Users e confirme que o e-mail existe. Verifique a coluna «Providers»: se mostrar apenas Google (ou outro fornecedor) sem «Email/Password», defina ou redefina a palavra-passe pelo menu da linha (⋮ → Repor palavra-passe).\\n• Confirme que a ortografia do e-mail corresponde exatamente ao que está guardado no Firebase.","firebaseAuthUserNotFound":"Não existe utilizador Firebase com este e-mail. Crie um primeiro em Firebase Console → Authentication → Users.","firebaseAuthInvalidEmail":"O e-mail do administrador não é um endereço válido.","firebaseInvalidApiKey":"A chave API do Firebase é inválida. Verifique o valor na Firebase Console.","firebaseNetwork":"Erro de rede ao iniciar sessão no Firebase. Verifique a sua ligação.","firebaseTooManyRequests":"Demasiadas tentativas de início de sessão. Tente novamente mais tarde ou redefina a palavra-passe via Firebase Console.","firebaseOperationNotAllowed":"O início de sessão por e-mail/palavra-passe não está ativado neste projeto Firebase. Abra Firebase Console → Authentication → Sign-in method e ative o fornecedor Email/Password.","firebaseUserDisabled":"Esta conta de utilizador Firebase está desativada. Reative-a em Firebase Console → Authentication → Users.","wrongAdminEmail":"A conta Firebase com que iniciou sessão não corresponde ao e-mail de admin que escreveu. Tente novamente.","rulesNotPinnedTitle":"As regras do Firestore ainda não o reconhecem como admin bootstrap.","rulesNotPinnedHint":"Abra Firebase Console → Firestore → Rules e substitua o valor de `bootstrapAdminEmail()` por: {{email}} — depois clique em Publicar. O modelo de regras do README inclui um placeholder `you@example.com` que tem de ser substituído pelo seu e-mail de admin real. Depois de publicar as novas regras, clique novamente em Enviar aqui.","flexwegAuth":"Chave API Flexweg rejeitada. Verifique o valor na sua conta Flexweg → API.","flexwegNetwork":"Erro de rede ao contactar o Flexweg. Verifique o URL base da API e a sua ligação.","flexwegHttp":"Erro da API Flexweg ({{status}}): {{detail}}","firestoreRulesTitle":"O Firestore rejeitou a escrita da configuração.","firestoreRulesHint":"Abra Firebase Console → Firestore → Regras e confirme que o e-mail de admin de bootstrap está definido como \'{{email}}\'. O README inclui um modelo de regras pronto a copiar.","firestoreOther":"Falha ao escrever no Firestore","uploadFailed":"Não foi possível carregar config.js para o Flexweg","generic":"Algo correu mal."},"docstore":{"contentTitle":"Repositório de conteúdo","contentIntro":"Onde os seus posts, páginas e definições são guardados como ficheiros Markdown + JSON. Um repositório vazio serve — o CMS cria os ficheiros.","provider":"Repositório","localClone":"Pasta local (clone git)","localCloneHint":"Escolha a pasta do seu clone. Sincronize-a com o seu cliente git habitual — o CMS lê e escreve ficheiros, não executa git.","contentDir":"Pasta de conteúdo no repositório","privateRepo":"Utilize um repositório privado: os rascunhos são guardados lá.","folderRequired":"Escolha primeiro a pasta de conteúdo.","checking":"A verificar o acesso ao repositório…","publishIntro":"Onde o site gerado é publicado. Pode alterá-lo mais tarde nas Definições.","existingSite":"Este repositório já está configurado — o site continua a ser publicado em: {{target}}. Pode alterá-lo mais tarde nas Definições (as chaves secretas, se existirem, têm de ser introduzidas novamente lá).","install":"Instalar","steps":{"config":"A guardar a configuração…","content":"A carregar o conteúdo…","target":"A guardar o destino de publicação…","testTarget":"A testar o destino de publicação…"},"doneTitle":"Tudo pronto!","doneBody":"A configuração foi guardada neste browser. Para poupar este passo a outros editores, descarregue o config.js e substitua o que está na pasta admin do seu alojamento.","downloadConfig":"Descarregar config.js","open":"Abrir o admin","footer":"O conteúdo fica no seu repositório ou neste browser; os tokens de acesso nunca saem deste browser."},"data":{"title":"1. Onde guarda os seus dados?","intro":"Os seus posts, páginas, utilizadores e definições — os dados próprios do admin. Isto é independente de onde o site público está alojado (próximo passo).","localNote":"Nada a configurar: o conteúdo é guardado neste browser. Exporte-o nas Definições para fazer uma cópia de segurança ou movê-lo mais tarde.","options":{"sqlite-file":{"title":"SQLite","hint":"Uma base de dados SQLite guardada no alojamento que escolher no passo seguinte (Flexweg, o seu servidor, S3, Git…). Sem contas de utilizador — ou o serviço SQLite da Flexweg, com contas, se alojar na Flexweg."},"flexweg-sqlite":{"title":"SQLite (serviço Flexweg)","hint":"Uma base de dados SQLite gerida pelo serviço da Flexweg, com contas de utilizador integradas. Requer uma conta Flexweg, seja qual for o alojamento do site."},"firebase":{"title":"Firebase","hint":"Firestore + Firebase Auth no seu projeto Google. Tempo real, plano Spark gratuito."},"markdown-git":{"title":"Ficheiros Markdown em Git","hint":"Posts como ficheiros .md num repositório GitHub / GitLab (ou num clone local). Cada editor utiliza o seu próprio token; cada alteração é um commit."},"local":{"title":"Este browser","hint":"Um único utilizador, sem início de sessão, nada a configurar. Ideal para um admin a correr no seu computador."}}},"hosting":{"title":"2. Onde é publicado o site?","intro":"Para onde o site estático gerado (HTML, CSS, imagens) é carregado sempre que publica. Pode alterá-lo mais tarde nas Definições.","existing":"Este repositório de conteúdo já publica no destino abaixo. Mantenha-o ou escolha outro."},"install":{"title":"3. Instalação","intro":"Verifique o resumo e depois instale.","data":"Dados","hosting":"Alojamento","saveTarget":"A guardar o destino de publicação…","noteConfigJs":"A configuração do admin (config.js) é carregada junto ao admin no Flexweg quando possível; caso contrário, ser-lhe-á proposto descarregá-la.","noteLocalConfig":"A configuração é guardada neste browser; ser-lhe-á proposto o config.js para colocar na pasta do admin, para que outros editores saltem esta configuração."},"sqliteFile":{"security":"Sem contas de utilizador: quem conseguir abrir este admin pode editar o conteúdo — proteja a pasta do admin no seu alojamento. O ficheiro da base de dados é servido como qualquer outro ficheiro: mantenha-o cifrado ou guarde-o num local privado separado.","intro":"Onde o ficheiro de base de dados é guardado. Este admin lê-o e guarda-o através dos mesmos conectores que o alojamento.","path":"Caminho do ficheiro de base de dados","pathHint":"É criado no primeiro guardar, se ainda não existir. Com um repositório Git, cada gravação é um commit — prefira um repositório ou ramo que não desencadeie um build do site.","existing":"base de dados existente","new":"nova base de dados","dataNote":"Nada a configurar aqui: a base de dados será guardada no alojamento que escolher no passo seguinte.","heading":"Base de dados SQLite","flexwegService":"Utilizar o serviço SQLite da Flexweg","flexwegServiceHint":"A base de dados é gerida pela Flexweg e inclui contas de utilizador integradas (e-mail + palavra-passe). Caso contrário, é um simples ficheiro neste alojamento, sem contas.","summaryFile":"Ficheiro {{path}} neste alojamento","summaryService":"Serviço SQLite da Flexweg ({{path}})","encrypt":"Cifrar a base de dados","encryptHint":"Recomendado num alojamento público: o ficheiro fica ilegível sem a frase-passe. Cada novo navegador pede-a uma vez.","passphrase":"Frase-passe","passphraseHint":"Guarde-a já no seu gestor de palavras-passe: sem ela ninguém consegue abrir a base de dados, nem mesmo você.","copy":"Copiar","copied":"Copiada","generate":"Nova","passphraseTooShort":"A frase-passe deve ter pelo menos 12 caracteres.","existingEncrypted":"Já existe uma base de dados cifrada neste caminho: introduza a respetiva frase-passe.","separate":"Guardar a base de dados num local privado separado","separateHint":"Por ex. um bucket S3 / R2 privado ou um repositório Git privado: a base de dados nunca é servida pelo site público.","summaryEncrypted":"cifrada","summaryLocation":"guardada em {{location}}","locationLabel":"Local da base de dados","gitBranchNote":"A base de dados fica no ramo {{branch}} deste repositório, que nunca é publicado: guardar conteúdo não volta a gerar o site.","summaryBranch":"no ramo {{branch}}"},"adminHosting":{"deploying":"A copiar o admin para o site…","label":"Alojar também o admin neste site","hint":"O admin é copiado para {{url}} com o seu config.js (sem segredos) — cada editor pode então abri-lo aí. Cada editor continua a iniciar sessão com o seu próprio acesso.","folder":"Pasta do admin","alreadyHere":"Este admin já está a correr a partir deste site: o seu config.js será atualizado no local.","doneBody":"O admin está agora no seu site. No GitHub Pages, ative primeiro o Pages para o repositório se ainda não o fez (Settings → Pages) e depois abra-o:","open":"Abrir o admin online","continueHere":"Continuar neste admin"}}');
const flexweg$1 = { "actions": { "upload": "A carregar ficheiro", "delete": "A eliminar ficheiro", "rename": "A renomear ficheiro", "get": "A ler ficheiro", "list": "A listar ficheiros", "createFolder": "A criar pasta", "renameFolder": "A renomear pasta", "deleteFolder": "A eliminar pasta", "storageLimits": "A obter limites de armazenamento", "commit": "A publicar alterações" }, "errors": { "configMissing": "O destino de publicação não está configurado. Configure-o nas Definições antes de publicar.", "network": "{{action}}: erro de rede ou CORS bloqueado. Verifique a sua ligação.", "auth": "{{action}}: falha na autenticação. Verifique as credenciais do destino de publicação nas Definições.", "notFound": "{{action}}: não encontrado no destino de publicação.", "tooLarge": "{{action}}: ficheiro demasiado grande para o destino de publicação.", "rateLimited": "{{action}}: demasiados pedidos, tente novamente daqui a um momento.", "serverError": "{{action}}: erro do servidor do destino de publicação ({{status}}). Tente novamente.", "generic": "{{action}} falhou ({{status}}){{detail}}.", "unsupported": "{{action}}: não suportado pelo destino de publicação «{{connector}}».", "unknownConnector": "Destino de publicação desconhecido «{{connector}}». Verifique Definições → Destino de publicação.", "folderAccess": "Sem acesso à pasta local. Abra Definições → Destino de publicação e clique em «Religar pasta»." } };
const publish$1 = { "log": { "rendering": "A renderizar página…", "uploading": "A carregar {{path}}…", "deleting": "A eliminar {{path}}…", "regenerating": "A regenerar listagens…", "skipped": "{{path}} ignorado (sem alterações)", "done": "Publicado em {{url}}", "failed": "Falhou: {{error}}" } };
const docstore$1 = { "errors": { "notConnected": "Sem ligação ao repositório de conteúdo. Volte a iniciar sessão com o seu token de acesso.", "conflict": "Outra pessoa alterou este item entretanto. A versão dela é agora apresentada — volte a aplicar a sua alteração.", "sqliteUnsupported": "O destino «{{connector}}» não consegue guardar um ficheiro de base de dados." } };
const connectors$1 = { "target": "Destino de publicação", "settingsTitle": "Destino de publicação", "settingsHelp": "Onde o site renderizado é enviado ao publicar. As credenciais são guardadas com o seu backend de conteúdo (ou neste browser para repositórios Git de conteúdo) e podem ser lidas por todos os admins.", "saved": "Destino de publicação guardado. Execute Regenerar → Tudo para publicar o site completo no novo destino.", "test": "Testar a ligação", "testOk": "Ligação OK", "testFailed": "Falha na ligação", "names": { "flexweg": "Flexweg", "git-pages": "Repositório Git (GitHub Pages, Cloudflare Pages, GitLab Pages…)", "s3": "Bucket compatível com S3 (AWS S3, Cloudflare R2, Backblaze B2, OVH…)", "php-bridge": "O seu próprio servidor (bridge PHP)", "browser-mirror": "Descarregar como ZIP", "local-folder": "Pasta local neste computador" }, "hints": { "flexweg": "Envio através da API Files do Flexweg.", "git-pages": "Cada publicação é um commit no repositório; o alojamento reconstrói o site a partir dele.", "s3": "Requer uma regra CORS no bucket que permita a origem deste admin, e alojamento de site (ou uma CDN) para servir os ficheiros index.html.", "php-bridge": "Envie external/bridges/php/flexweg-bridge.php para o seu servidor, defina a respetiva chave de API e depois preencha o URL aqui.", "browser-mirror": "O site é guardado neste browser; descarregue o ZIP e envie-o manualmente para onde quiser.", "local-folder": "Escreve o site diretamente numa pasta (Chrome / Edge). Sirva-o localmente ou envie-o com as suas próprias ferramentas." }, "fields": { "flexweg": { "apiKey": "Chave de API", "siteUrl": "URL do site", "apiBaseUrl": "URL base da API" }, "git-pages": { "host": "Alojamento", "provider": "Fornecedor Git", "owner": "Proprietário (utilizador ou organização)", "repo": "Repositório", "project": "Caminho do projeto", "branch": "Ramo", "dir": "Pasta no repositório", "token": "Token de acesso", "siteUrl": "URL pública do site", "apiBaseUrl": "URL da API (apenas auto-alojado)" }, "s3": { "endpoint": "Endpoint", "region": "Região", "bucket": "Bucket", "prefix": "Prefixo das chaves (opcional)", "accessKeyId": "ID da chave de acesso", "secretAccessKey": "Chave de acesso secreta", "siteUrl": "URL pública do site", "forcePathStyle": "URLs do tipo caminho (MinIO, R2, a maioria dos compatíveis)", "publicRead": "Tornar públicos os ficheiros carregados (ACL public-read) — para buckets que não são públicos através de uma política (OVHcloud, Scaleway…). Deixe desativado em buckets AWS com «bucket owner enforced»." }, "php-bridge": { "apiBaseUrl": "URL do bridge", "apiKey": "Chave de API do bridge", "siteUrl": "URL pública do site" }, "browser-mirror": { "siteUrl": "URL pública do site (opcional)" }, "local-folder": { "siteUrl": "URL onde a pasta é servida (opcional)" } }, "help": { "flexweg": { "apiKey": "Gerada a partir da sua conta Flexweg → API." }, "git-pages": { "host": "Cloudflare Pages: ligue o projeto a este repositório sem comando de build e com a pasta de saída abaixo. Funciona com repositórios privados.", "dir": 'Deixe vazio para a raiz do repositório. GitHub Pages: "" ou "docs". GitLab Pages: "public".', "token": "Token fine-grained neste repositório com Contents: read & write (GitHub) — adicione Pages: read & write para permitir que o CMS ative o GitHub Pages — ou um token com o scope api (GitLab). Deixe vazio para usar o token de acesso de cada editor quando o conteúdo está no mesmo fornecedor.", "siteUrl": "p. ex. https://user.github.io/repo — um URL com subpasta funciona, as ligações são ajustadas automaticamente." }, "s3": { "endpoint": "Deixe vazio para AWS (deduzido da região). R2: https://<account-id>.r2.cloudflarestorage.com", "siteUrl": "O URL de alojamento do bucket ou o seu domínio CDN." }, "php-bridge": { "apiBaseUrl": "O URL completo de flexweg-bridge.php no seu servidor (HTTPS)." }, "browser-mirror": { "siteUrl": "Onde vai enviar o ZIP — usado para os URLs absolutos (sitemaps, RSS, multimédia)." }, "local-folder": { "siteUrl": "p. ex. http://localhost:8080 quando um servidor web local serve a pasta." } }, "options": { "github-pages": "GitHub Pages", "cloudflare-pages": "Cloudflare Pages (ligado ao repositório)", "gitlab-pages": "GitLab Pages", "other": "Outro (Netlify, Vercel, git pull no servidor…)", "github": "GitHub", "gitlab": "GitLab" }, "folder": { "choose": "Escolher pasta…", "change": "Mudar de pasta…", "reconnect": "Voltar a ligar a pasta", "unsupported": "Este browser não consegue escrever em pastas locais. Utilize o Chrome ou o Edge." }, "mirror": { "download": "Descarregar o site (ZIP)", "count": "{{count}} ficheiros neste browser" }, "adminHosting": { "title": "Admin neste site", "help": "Copie este admin para o destino de publicação (primeira implementação, ou atualização após uma nova versão). O seu config.js não contém segredos.", "deploy": "Implementar / atualizar o admin", "deployed": "Admin implementado ({{count}} ficheiros) — {{url}}" }, "pages": { "enabled": "GitHub Pages ativado para este repositório — o site estará online dentro de cerca de um minuto.", "enableHint": 'Publicação concluída. Para colocar o site online, ative o GitHub Pages para {{repo}}: Settings → Pages → Deploy from a branch → {{branch}} / {{folder}}. (Ou dê ao token a permissão "Pages: read and write" e o CMS faz isso por si.)' }, "siteUrl": { "mismatch": "O URL público do site (Definições → Site) é {{site}}, mas este destino serve o site em {{target}}. As ligações, o CSS e os sitemaps seguem o URL do site — estarão errados neste alojamento.", "use": "Usar {{url}} para o site", "updated": "URL do site atualizado. Execute Regenerar → Tudo para voltar a publicar as páginas com as novas ligações." } };
const gitAccess$1 = { "heading": "Ligar ao repositório de conteúdo", "tokenIntro": "O conteúdo está guardado no repositório {{provider}} {{repo}}. Inicie sessão com o seu próprio token de acesso pessoal — as suas permissões no repositório determinam a sua função (escrita = editor, admin / maintainer = admin).", "token": "Token de acesso pessoal", "tokenHelpGithub": "Token fine-grained, com acesso apenas a este repositório, permissão Contents: leitura e escrita.", "tokenHelpGitlab": "Token com o api scope, função Developer ou superior neste projeto.", "createToken": "Criar um token", "connect": "Ligar", "tokenStorage": "O token é guardado apenas neste browser. Terminar sessão apaga-o.", "failed": "Este token não consegue escrever no repositório (inválido, expirado ou só de leitura). Verifique as permissões.", "folderIntro": "O conteúdo está guardado numa pasta deste computador (normalmente um clone git que sincroniza com o seu próprio cliente git). Conceda acesso a este browser — os browsers voltam a pedir após cada recarregamento.", "openFolder": "Abrir a pasta de conteúdo" };
const hosting$1 = { "flexweg": { "title": "Flexweg", "short": "Alojamento Flexweg", "hint": "Carrega através da Flexweg Files API. Chave API da sua conta Flexweg." }, "github-pages": { "title": "GitHub Pages", "short": "Gratuito, a partir de um repositório GitHub", "hint": "Cada publicação é um commit no repositório; o GitHub Pages serve-o. Settings → Pages → Deploy from a branch. Repositórios públicos no plano gratuito." }, "cloudflare-pages": { "title": "Cloudflare Pages", "short": "Gratuito, repositórios privados OK", "hint": "O CMS faz commit do site num repositório GitHub / GitLab; ligue-lhe um projeto Cloudflare Pages (sem comando de build, pasta de saída = a pasta abaixo)." }, "gitlab-pages": { "title": "GitLab Pages", "short": "Gratuito, a partir de um repositório GitLab", "hint": "Cada publicação é um commit; o CMS adiciona um .gitlab-ci.yml mínimo que publica a pasta public/." }, "git-other": { "title": "Netlify, Vercel…", "short": "Qualquer alojamento que implemente um repositório", "hint": "O CMS faz commit do site num repositório Git; ligue o seu alojamento (Netlify, Vercel, um servidor que executa git pull…) a esse repositório." }, "s3": { "title": "S3 / R2 / B2…", "short": "Bucket de armazenamento de objetos", "hint": "AWS S3, Cloudflare R2, Backblaze B2, OVH, Scaleway, MinIO… Requer uma regra CORS no bucket e alojamento de sites ou um CDN à frente." }, "own-server": { "title": "O seu próprio servidor (FTP / SFTP)", "short": "Alojamento partilhado, VPS…", "hint": "Os browsers não falam FTP nem SFTP: carregue uma vez a ponte PHP (external/bridges/php/flexweg-bridge.php) com o seu cliente FTP, defina a respetiva chave API e depois indique aqui o seu URL. Funciona em qualquer alojamento PHP." }, "local-folder": { "title": "Pasta local", "short": "Neste computador", "hint": "Escreve o site numa pasta deste computador (Chrome / Edge). Sirva-o localmente ou envie-o com as suas próprias ferramentas." }, "zip": { "title": "Descarregar como ZIP", "short": "Carregue-o manualmente", "hint": "O site é guardado neste browser; descarregue um ZIP nas Definições e carregue-o onde quiser (Netlify Drop, cliente FTP…)." } };
const sqliteAccess$1 = { "heading": "Ligar à base de dados", "intro": "Este admin guarda o seu conteúdo em {{path}}. Introduza as credenciais de acesso para este browser.", "storage": "As credenciais são guardadas apenas neste browser. Terminar sessão apaga-as.", "passphrase": "Frase-passe da base de dados", "passphraseHint": "A base de dados está cifrada. Introduza a frase-passe escolhida na instalação (guardada apenas neste navegador).", "passphraseWrong": "Frase-passe incorreta: não foi possível abrir a base de dados.", "passphraseMissing": "Introduza a frase-passe da base de dados." };
const pt = {
  common: common$1,
  auth: auth$1,
  nav: nav$1,
  dashboard: dashboard$1,
  posts: posts$1,
  pages: pages$1,
  taxonomies: taxonomies$1,
  media: media$1,
  themes: themes$1,
  plugins: plugins$1,
  externalInstall: externalInstall$1,
  externalLoader: externalLoader$1,
  menus: menus$1,
  settings: settings$1,
  users: users$1,
  firestoreSetup: firestoreSetup$1,
  errors: errors$1,
  identity: identity$1,
  setup: setup$1,
  flexweg: flexweg$1,
  publish: publish$1,
  docstore: docstore$1,
  connectors: connectors$1,
  gitAccess: gitAccess$1,
  hosting: hosting$1,
  sqliteAccess: sqliteAccess$1
};
const common = { "save": "저장", "saving": "저장 중…", "saved": "저장됨", "cancel": "취소", "delete": "삭제", "deleting": "삭제 중…", "edit": "편집", "create": "만들기", "search": "검색", "loading": "불러오는 중…", "yes": "예", "no": "아니요", "confirm": "확인", "back": "뒤로", "next": "다음", "previous": "이전", "close": "닫기", "all": "전체", "none": "없음", "actions": "작업", "name": "이름", "slug": "슬러그", "description": "설명", "status": "상태", "createdAt": "생성됨", "updatedAt": "업데이트됨", "publishedAt": "게시됨", "language": "언어", "darkMode": "다크 모드", "lightMode": "라이트 모드", "signOut": "로그아웃", "administrator": "관리자", "editor": "편집자", "appName": "AgentCMS" };
const auth = { "signIn": "로그인", "signingIn": "로그인 중…", "email": "이메일", "password": "비밀번호", "emailPlaceholder": "you@company.com", "passwordPlaceholder": "••••••••", "forgotPassword": "비밀번호를 잊으셨나요?", "resetEmailSent": "{{email}} 주소로 비밀번호 재설정 이메일을 보냈습니다.", "enterEmailFirst": "위에 이메일을 먼저 입력한 다음 재설정을 클릭하세요.", "emailPasswordRequired": "이메일과 비밀번호를 모두 입력해 주세요.", "signInSubtitle": "업무용 이메일과 비밀번호를 사용하세요.", "footer": "계정 요청은 관리자를 통해 처리됩니다.", "errors": { "invalidEmail": "유효하지 않은 이메일 주소입니다.", "invalidCredentials": "이메일 또는 비밀번호가 올바르지 않습니다.", "tooManyRequests": "시도 횟수가 너무 많습니다. 나중에 다시 시도하거나 비밀번호를 재설정하세요.", "userDisabled": "이 계정은 비활성화되었습니다.", "networkFailed": "네트워크 오류입니다. 연결 상태를 확인하세요.", "generic": "인증에 실패했습니다." } };
const nav = { "openMenu": "메뉴 열기", "closeMenu": "메뉴 닫기", "dashboard": "대시보드", "posts": "게시물", "pages": "페이지", "taxonomies": "카테고리 및 태그", "media": "미디어", "themes": "테마", "themeSettings": "테마 설정", "plugins": "플러그인", "menus": "메뉴", "users": "사용자", "settings": "설정" };
const dashboard = { "title": "대시보드", "welcome": "{{email}}님, 다시 오신 것을 환영합니다.", "stats": { "totalPosts": "게시물", "totalPages": "페이지", "online": "온라인", "drafts": "초안" } };
const posts = { "title": "게시물", "newPost": "새 게시물", "noPosts": "아직 게시물이 없습니다. 첫 게시물을 만들어 시작하세요.", "noPostsInFilter": "현재 필터와 일치하는 게시물이 없습니다.", "search": { "placeholder": "게시물 검색…", "clear": "검색 지우기", "noResults": "검색과 일치하는 게시물이 없습니다." }, "pagination": { "previous": "이전", "next": "다음", "showing": "{{total}}개 중 {{from}}–{{to}} 표시", "pageOf": "{{total}}페이지 중 {{page}}페이지" }, "bulk": { "selectedCount_one": "{{count}}개 선택됨", "selectedCount_other": "{{count}}개 선택됨", "selectPage_one": "이 페이지에서 {{count}}개 선택", "selectPage_other": "이 페이지의 {{count}}개 모두 선택", "deselectPage": "페이지 선택 해제", "allOnPageSelected_one": "이 페이지에서 {{count}}개가 선택되었습니다.", "allOnPageSelected_other": "이 페이지의 {{count}}개가 모두 선택되었습니다.", "selectAllMatching_one": "일치하는 게시물 선택", "selectAllMatching_other": "일치하는 {{count}}개 게시물 모두 선택", "allMatchingSelected_one": "일치하는 게시물이 선택되었습니다.", "allMatchingSelected_other": "일치하는 {{count}}개 게시물이 모두 선택되었습니다.", "selectOne": '"{{title}}" 선택', "publish": "게시 ({{count}})", "publishing": "게시 중…", "publishedCount": "{{ok}}개 게시됨, {{failed}}개 실패.", "unpublish": "게시 취소 ({{count}})", "unpublishing": "게시 취소 중…", "unpublishedCount": "{{ok}}개 게시 취소됨, {{failed}}개 실패.", "delete": "삭제", "deleting": "삭제 중…", "deletedCount": "{{ok}}개 삭제됨, {{failed}}개 실패.", "confirmDelete_one": "게시물 {{count}}개를 삭제하시겠습니까? Flexweg에서 게시 취소되며 되돌릴 수 없습니다.", "confirmDelete_other": "게시물 {{count}}개를 삭제하시겠습니까? Flexweg에서 게시 취소되며 되돌릴 수 없습니다.", "noDraftSelected": "선택된 초안 게시물이 없습니다.", "noOnlineSelected": "선택된 온라인 게시물이 없습니다.", "clear": "선택 해제" }, "filters": { "all": "전체", "draft": "초안", "online": "온라인" }, "fields": { "title": "제목", "slug": "슬러그", "excerpt": "발췌문", "content": "본문", "category": "카테고리", "tags": "태그", "heroImage": "대표 이미지", "seoTitle": "SEO 제목", "seoDescription": "SEO 설명", "createdAt": "작성일", "updatedAt": "마지막 업데이트", "publishedAt": "게시일" }, "edit": { "newTitle": "새 게시물", "editTitle": "게시물 편집", "saved": "저장되었습니다.", "savedAndRepublished": "저장 및 재게시되었습니다.", "saveFailed": "저장에 실패했습니다.", "saveAndRepublish": "저장 및 재게시", "draftSaved": "초안이 저장되었습니다.", "slugCollision": { "post": '이 URL은 이미 게시물에서 사용 중입니다: "{{label}}".', "page": '이 URL은 이미 페이지에서 사용 중입니다: "{{label}}".', "category": '이 URL은 이미 카테고리에서 사용 중입니다: "{{label}}".' }, "publish": "게시", "unpublish": "게시 취소", "publishing": "게시 중…", "unpublishing": "게시 취소 중…", "titlePlaceholder": "제목 추가", "permalink": "고유 링크", "slugFormatHint": "소문자 ASCII와 하이픈만 사용할 수 있습니다.", "slugAutoSuffixed": '"{{base}}"이(가) 이미 {{owner}}에서 사용 중이므로 접미사를 추가했습니다.', "slugAutoSuffixedOwner": { "post": '게시물: "{{label}}"', "page": '페이지: "{{label}}"', "category": '카테고리: "{{label}}"' }, "saveBlocked": { "titleRequired": "저장하기 전에 제목을 추가하세요.", "slugRequired": "저장하려면 제목과 URL 슬러그가 필요합니다.", "slugInvalid": "슬러그 형식이 잘못되었습니다 (소문자 ASCII + 하이픈).", "slugCollision": "저장하기 전에 URL 충돌을 해결하세요." }, "viewPublished": "보기", "confirmDelete": "이 항목을 삭제하시겠습니까?", "inspector": { "document": "문서", "block": "블록", "blockEmpty": "옵션을 보려면 편집기에서 블록을 선택하세요.", "publishing": "게시", "permalink": "고유 링크", "categories": "카테고리 및 태그", "featured": "대표 이미지", "seo": "SEO", "excerpt": "발췌문", "dates": "날짜" }, "blocks": { "addBlock": "블록 추가", "transform": "변환", "moveUp": "위로 이동", "moveDown": "아래로 이동", "duplicate": "복제", "remove": "블록 삭제", "paragraph": "단락", "heading2": "제목 2", "heading3": "제목 3", "bulletList": "글머리 기호 목록", "orderedList": "번호 매기기 목록", "blockquote": "인용", "codeBlock": "코드", "image": "이미지", "horizontalRule": "구분선", "categories": { "text": "텍스트", "media": "미디어", "layout": "레이아웃", "embed": "임베드", "advanced": "고급" }, "noSettings": "이 블록에는 설정이 없습니다.", "noSelection": "옵션을 보려면 편집기에서 블록을 선택하세요.", "slash": { "noResults": "일치하는 블록이 없습니다." } } }, "status": { "draft": "초안", "online": "온라인" }, "preview": { "title": "미리보기", "rendering": "미리보기 렌더링 중…", "error": "미리보기 실패: {{error}}", "viewports": { "mobile": "모바일", "tablet": "태블릿", "desktop": "데스크탑" } } };
const pages = { "title": "페이지", "newPage": "새 페이지", "noPages": "아직 페이지가 없습니다.", "homeBadge": "홈", "homeBadgeTooltip": "사이트 홈 페이지로 사용됨" };
const taxonomies = { "title": "카테고리 및 태그", "categories": "카테고리", "tags": "태그", "newCategory": "새 카테고리", "newTag": "새 태그", "noCategories": "아직 카테고리가 없습니다.", "noTags": "아직 태그가 없습니다.", "slugCollision": '이 슬러그는 이미 "{{label}}"에서 사용 중입니다.', "seo": { "button": "SEO", "buttonTitle": "SEO 메타 태그 편집", "title": "SEO 메타 태그", "subtitle": '"{{name}}" 아카이브 페이지의 사용자 지정 제목과 설명입니다.', "metaTitle": "메타 제목", "metaTitleHint": "페이지 <title>로 사용됩니다. 기본값: 용어 이름.", "metaDescription": "메타 설명", "metaDescriptionHint": "페이지 메타 설명으로 사용됩니다. 기본값: 용어 설명." } };
const media = { "title": "미디어 라이브러리", "upload": "업로드", "uploading": "업로드 중…", "finalizing": "마무리 중…", "uploadFailed": "업로드 실패", "retry": "재시도", "noMedia": "아직 미디어가 없습니다.", "alt": "대체 텍스트", "caption": "캡션", "filename": "파일명", "size": "크기", "type": "유형" };
const themes = { "title": "테마", "active": "활성", "activate": "활성화", "installExternal": "테마 설치", "uninstallDisabledTitle": "이 테마를 제거하기 전에 다른 테마로 전환하세요.", "syncAssets": "테마 자산 동기화", "regenerateSite": "사이트 재생성", "regenerating": "재생성 중…", "regenerate": { "button": "재생성", "running": "실행 중…", "groupBuiltins": "사이트", "groupPlugins": "플러그인", "home": "홈 페이지만", "homeHelp": "index.html만 재생성합니다 — 가장 빠른 옵션입니다.", "allHtml": "모든 HTML 페이지", "allHtmlHelp": "모든 게시물, 페이지, 아카이브, 목록 + menu / posts / authors JSON 스냅샷.", "repair": "URL 복구", "repairHelp": "온라인 상태의 모든 게시물에 대해 정규 경로를 다시 계산하고 잘못된 URL에 업로드된 파일을 옮깁니다. 용어 동기화 전에 실행된 import 이후 유용합니다.", "assets": "테마 자산", "assetsHelp": "활성 테마의 CSS와 부속 스크립트를 /theme-assets/에 업로드합니다.", "everything": "전체", "everythingHelp": "테마 자산 + 모든 HTML + 모든 플러그인 출력. 가장 느린 옵션입니다.", "noPluginTargets": "플러그인 재생성 대상 없음 — 재생성을 지원하는 플러그인을 활성화하세요." }, "confirmSwitch": { "title": "{{theme}}(으)로 전환하시겠습니까?", "body": "테마 전환 시 새 디자인이 모든 곳에 적용되도록 테마 자산을 다시 업로드하고 게시된 모든 페이지를 재생성해야 합니다. 잠시 시간이 걸릴 수 있습니다.", "confirm": "전환 및 재생성", "cancel": "취소" } };
const plugins = { "title": "플러그인", "enabled": "활성화됨", "disabled": "비활성화됨", "enable": "활성화", "disable": "비활성화", "configure": "설정", "author": "제작자", "learnMore": "자세히 보기", "mustUseBadge": "필수", "installExternal": "플러그인 설치", "tabs": { "regular": "플러그인", "mustUse": "필수 플러그인" } };
const externalInstall = { "titlePlugin": "플러그인 설치", "titleTheme": "테마 설치", "labelPlugin": "플러그인", "labelTheme": "테마", "intro": "{{label}} 번들이 들어 있는 ZIP 파일을 드롭하세요 (ZIP 루트에 manifest.json + bundle.js). 해당 {{label}}이(가) Flexweg 사이트에 업로드되고 새로고침 후 등록됩니다. 같은 manifest id의 ZIP을 다시 업로드하면 기존 항목이 그 자리에서 업그레이드됩니다 — 제거할 필요가 없습니다.", "zipField": "번들 ZIP 파일", "install": "설치", "installing": "설치 중…", "installSuccess": "{{name}} 설치됨 ({{count}}개 파일 업로드). 새로고침 중…", "upgradeSuccess": "{{name}} v{{previousVersion}}에서 v{{newVersion}}(으)로 업그레이드됨 ({{count}}개 파일 업로드). 새로고침 중…", "installedTitle": "이미 설치됨", "bundledDefaultsTitle": "내장 기본 항목 사용 가능", "bundledDefaultsHint": "현재 {{count}}개의 내장 플러그인/테마가 제거된 상태입니다. 복원하면 이 관리자 버전에 함께 배포된 항목을 되살릴 수 있습니다.", "bundledDefaultsRestore": "복원", "bundledDefaultsRestored": "플러그인 {{plugins}}개, 테마 {{themes}}개가 복원되었습니다. 새로고침 중…", "uninstall": "제거", "uninstallSuccess": "{{id}} 제거됨. 새로고침 중…", "confirmUninstall": "{{id}}을(를) 제거하시겠습니까? 파일이 Flexweg에서 삭제됩니다.", "errors": { "no-manifest": "ZIP 루트에 manifest.json이 없습니다.", "invalid-manifest": "manifest.json이 유효하지 않습니다 (필수 필드 누락 또는 유효하지 않은 JSON).", "incompatible-api": "번들이 호환되지 않는 런타임 API 버전으로 빌드되었습니다.", "no-bundle": "ZIP에 manifest에 선언된 진입 파일이 없습니다.", "fetch-manifest": "Flexweg에서 현재 external.json을 읽을 수 없습니다.", "upload-failed": "업로드 실패 — Flexweg API 키와 연결 상태를 확인하세요." } };
const externalLoader = { "someFailed": "{{count}}개의 외부 번들 로드에 실패했습니다. 브라우저 콘솔을 확인하세요." };
const menus = { "title": "메뉴", "header": "헤더 메뉴", "footer": "푸터 메뉴", "label": "레이블", "saveAndPublish": "저장 및 생성", "discard": "변경 취소", "saved": "메뉴가 저장되어 게시되었습니다.", "saveFailed": "메뉴를 저장할 수 없습니다.", "unsavedChanges": "저장되지 않은 변경 사항이 있습니다." };
const settings = { "title": "설정", "tabs": { "general": "일반" }, "site": { "title": "사이트", "siteTitle": "사이트 제목", "siteDescription": "사이트 설명", "siteLanguage": "사이트 언어", "siteLanguageHelp": '게시되는 모든 페이지의 <html lang="…">에 삽입되는 BCP-47 태그 (예: en, fr-CA)입니다. 접두사는 지원되는 번역 로케일과 비교되어 사이트맵 / RSS 라벨 및 테마에 포함된 문자열에 사용됩니다. 지원되지 않는 로케일은 영어로 대체됩니다.', "siteLanguageResolved": "번역에 사용될 언어: {{label}}", "baseUrl": "공개 사이트 URL", "postsPerPage": "페이지당 게시물 수", "homeMode": "홈 콘텐츠", "homeLatest": "최신 게시물", "homeStatic": "정적 페이지", "homePage": "홈 페이지", "discourageIndexing": "검색 엔진이 이 사이트를 색인하지 않도록 요청", "discourageIndexingHelp": "활성화하면 게시되는 모든 페이지에 noindex/nofollow 메타 태그가 추가되고 robots.txt가 모든 크롤러를 차단합니다. WordPress의 동작과 같으며 — 스테이징 사이트나 출시 전 검토에 유용합니다. 이 지시를 따르는 검색 엔진은 사이트를 색인하지 않습니다.", "discourageRegenerateHint": "색인 설정이 저장되었습니다. 테마에서 '모두 재생성'을 클릭하면 게시된 모든 페이지와 robots.txt에 변경 사항이 적용됩니다." }, "flexweg": { "title": "Flexweg API", "apiKey": "API 키", "apiKeyHelp": "Flexweg 계정 → API에서 생성됩니다.", "siteUrl": "사이트 URL", "siteUrlHelp": "끝에 슬래시가 없는 Flexweg 사이트의 공개 URL.", "apiBaseUrl": "API 기본 URL", "storageHelpFirebase": "Firestore (config/flexweg)에 저장됩니다. 로그인한 팀원 누구나 읽을 수 있고, 관리자만 쓸 수 있습니다.", "storageHelpSqlite": "로컬 SQLite의 config 테이블에 저장됩니다. 로그인한 팀원 누구나 읽을 수 있고, 관리자만 쓸 수 있습니다." }, "backend": { "title": "데이터 백엔드", "active": "활성 백엔드:", "switchButton": "백엔드 전환…", "confirmTitle": "현재의 모든 데이터가 사라집니다.", "confirmBody": "전환하면 브라우저 내 구성이 지워지고 설정 양식이 다시 로드됩니다. 새 백엔드는 비어 있는 상태로 시작하며 — 이전 백엔드의 데이터는 그대로 남아 있지만 (Firestore 또는 Flexweg의 .sqlite 파일에) 다시 전환할 때까지 CMS가 그 데이터를 읽지 않습니다.", "confirmYes": "예, 백엔드를 전환합니다", "downloadBackup": ".sqlite 파일 백업 다운로드", "downloadBackupHelp": "백엔드 전환 전에 수행하세요.", "markdownGit": "Markdown — {{source}}", "localFolder": "로컬 폴더", "localBrowser": "이 브라우저 (로컬, 단일 사용자)", "sqliteFile": "SQLite 파일 — {{location}}" }, "performance": { "title": "성능", "help": "관리자가 게시물과 페이지를 로드하는 방식입니다. 기본 모드는 무료 Firestore 플랜에서 추가 설정 없이 동작합니다. 페이지네이션 모드는 매우 큰 사이트용이며 한 번의 인덱스 생성이 필요합니다.", "mode": "로딩 모드", "modeGlobal": "표준 (설정 불필요)", "modePaginated": "서버 측 페이지네이션 (Firestore 인덱스 필요)", "globalHelp": "전체 게시물 컬렉션을 하나의 실시간 구독으로 로드합니다. 정렬, 필터링, 검색을 메모리에서 수행합니다. 게시물 약 5,000개 미만 사이트에 권장됩니다.", "paginatedHelp": "커서 기반 페이지네이션 구독으로 한 번에 한 페이지씩 가져옵니다. Firestore 복합 인덱스가 필요합니다 — README 참조. 매우 큰 사이트에 권장됩니다.", "savedReload": "저장되었습니다. 새 모드를 적용하려면 관리자를 다시 로드하세요." }, "editor": { "title": "편집기", "help": "게시물 / 페이지 편집기 내부의 타이포그래피. 공개 테마와는 별개입니다.", "fontFamily": "글꼴", "bodySize": "본문 크기", "h1Size": "H1 크기", "h2Size": "H2 크기", "h3Size": "H3 크기", "sizeHelp": "CSS 길이 (예: 16px, 1rem). 비워두면 기본값이 적용됩니다.", "reset": "기본값으로 재설정" }, "profile": { "title": "프로필", "adminLocale": "관리자 언어", "adminLocaleHelp": "관리자 인터페이스에서 사용되는 언어입니다. 프로필에 저장됩니다.", "firstName": "이름", "lastName": "성", "headline": "직함", "headlinePlaceholder": "예: 기자, 편집장…", "headlineHelp": "이름 아래의 작성자 카드와 아카이브 페이지에 공개적으로 표시됩니다.", "bio": "소개", "bioPlaceholder": "작성자 페이지와 기사 하단에 표시되는 짧은 단락입니다.", "bioHelp": "공개 사이트의 작성자 사이드바와 작성자 아카이브 페이지에 표시됩니다.", "socials": "소셜 프로필", "socialsHelp": '공개 사이트에 노출할 프로필의 URL을 입력하고, 표시할 항목에 "표시"를 체크하세요. URL이 비어 있으면 무시됩니다.', "socialsShow": "표시", "socialsShowHelp": "공개 사이트에서 이 네트워크의 표시 여부를 전환합니다.", "avatar": "프로필 사진", "avatarHelp": "미디어 라이브러리에서 이미지를 선택하세요. 정사각형 이미지가 가장 잘 표시됩니다.", "pickAvatar": "미디어에서 선택", "changeAvatar": "사진 변경", "removeAvatar": "삭제", "save": "프로필 저장" }, "transfer": { "title": "콘텐츠 이동 또는 백업", "help": "모든 것 (게시물, 페이지, 카테고리, 미디어 메타데이터, 프로필, 설정)을 하나의 JSON 파일로 내보냅니다. Markdown 또는 로컬 백엔드에서는 ID를 유지한 채 이 파일을 가져올 수 있습니다 — Firebase나 SQLite에서 마이그레이션하는 방법입니다. 미디어 파일과 비밀 키는 포함되지 않습니다.", "export": "콘텐츠 내보내기 (JSON)", "import": "콘텐츠 가져오기…", "modeMerge": "병합 (같은 ID 덮어쓰기)", "modeReplace": "가져온 컬렉션 교체", "replaceConfirm": "교체 모드는 가져오기 전에 파일에 포함된 컬렉션의 기존 항목을 모두 삭제합니다. 계속하시겠습니까?", "invalidFile": "이 파일은 AgentCMS 콘텐츠 내보내기 파일이 아닙니다.", "imported": "게시물/페이지 {{posts}}개, 용어 {{terms}}개, 미디어 {{media}}개를 가져왔습니다. 재생성 → 전체를 실행해 게시하세요." }, "encryption": { "title": "데이터베이스 암호화:", "on": "켜짐", "off": "꺼짐", "onHelp": "암호 문구 없이는 데이터베이스 파일을 읽을 수 없습니다. 변경하면 새 키로 파일을 다시 저장하며, 다른 브라우저에서는 새 암호 문구를 요청합니다.", "offHelp": "파일을 내려받을 수 있는 사람은 누구나 데이터베이스를 읽을 수 있습니다(정적 호스팅은 일반 페이지처럼 제공합니다). 암호 문구로 암호화하세요.", "enable": "데이터베이스 암호화…", "change": "암호 문구 변경…", "savedConfirm": "이 암호 문구를 비밀번호 관리자에 저장했습니다. 암호 문구가 없으면 콘텐츠를 열 수 없습니다.", "enableConfirm": "지금 암호화", "changeConfirm": "암호 문구 변경", "done": "새 암호 문구로 데이터베이스를 다시 저장했습니다." } };
const users = { "title": "사용자", "noUsers": "아직 사용자가 없습니다.", "role": "역할", "disabled": "비활성화됨", "editProfileTitle": "프로필 편집 — {{email}}", "profileSaved": "프로필이 저장되었습니다.", "descriptionFirebase": "팀을 관리하세요. 새 계정은 Firebase Console에서 만들어지며, 첫 로그인 시 여기에 동기화됩니다.", "descriptionSqlite": "팀을 관리하세요. 아래의 +사용자 추가 버튼으로 계정을 직접 만들 수 있습니다.", "addUser": "사용자 추가", "addUserSuccess": "{{email}}을(를) 추가했습니다.", "removeConfirmFirebase": "{{email}}의 사용자 기록을 삭제하시겠습니까? CMS에서 프로필과 역할이 제거됩니다. 로그인 권한도 회수하려면 Firebase Console에서 계정도 삭제하세요.", "removeConfirmSqlite": "{{email}}을(를) 영구적으로 삭제하시겠습니까? 로그인 권한이 회수되고 프로필과 역할도 제거됩니다. 이 작업은 되돌릴 수 없습니다.", "empty": { "title": "아직 팀원이 없습니다", "descriptionFirebase": "Firebase Console에서 첫 계정을 만든 다음, 이곳에 한 번 로그인하여 프로필을 등록하세요.", "descriptionSqlite": "위의 +사용자 추가를 눌러 첫 팀원을 초대하세요." }, "help": { "title": "새 팀원을 추가하는 방법", "bootstrapLine": "부트스트랩 관리자 (항상 전체 권한)는 다음과 같습니다:", "firebase": { "step1": "Firebase Console → Authentication → Add user를 여세요.", "step2": "이메일과 비밀번호를 설정해 새 팀원에게 전달하세요.", "step3": "여기에 한 번 로그인하도록 요청하세요 — 프로필이 위 목록에 나타나며 역할과 세부 정보를 편집할 수 있습니다." }, "sqlite": { "step1": "위의 +사용자 추가 버튼을 누르세요.", "step2": "이메일과 임시 비밀번호 (8자 이상)를 입력하세요.", "step3": "자격 증명을 안전하게 공유하세요 — 로그인 후 프로필에서 비밀번호를 변경할 수 있습니다." }, "git": { "step1": "해당 사용자를 콘텐츠 저장소의 협업자로 추가하세요 (쓰기 권한 = 편집자, admin / maintainer = 관리자).", "step2": "해당 사용자가 GitHub / GitLab에서 자신의 개인 액세스 토큰을 생성합니다.", "step3": "관리자 화면을 열고 그 토큰으로 로그인하면 — 프로필이 여기에 자동으로 생성됩니다." } }, "addUserModal": { "title": "새 팀원 추가", "intro": "Flexweg SQLite Auth 데이터베이스에 계정을 직접 만듭니다. 새 사용자는 기본적으로 editor 역할을 갖습니다. 관리자 권한이 필요하면 아래 목록에서 승격하세요.", "submit": "사용자 만들기", "submitting": "만드는 중…" }, "actions": { "editProfile": "프로필 편집", "promote": "관리자로 승격", "demote": "편집자로 강등", "disable": "비활성화", "enable": "활성화", "delete": "기록 삭제" }, "descriptionGit": "팀원은 콘텐츠 저장소에 쓰기 권한이 있는 사람들입니다. 처음 로그인한 후 여기에 표시되며, 역할은 저장소 권한을 따릅니다.", "descriptionLocal": "이 관리자는 단일 사용자 모드로 실행됩니다: 콘텐츠는 이 브라우저에 저장되며 계정이 없습니다.", "descriptionSqliteFile": "이 백엔드에는 사용자 계정이 없습니다: 관리자를 열 수 있는 사람은 누구나 편집할 수 있습니다. 호스팅 수준에서 관리자 폴더를 보호하세요. 아래 작성자 프로필은 참고용입니다." };
const firestoreSetup = { "title": "Firestore 설정 필요", "intro": "게시물 및 페이지 목록 페이지는 효율적인 쿼리를 위해 몇 개의 Firestore 복합 인덱스가 필요합니다. 수동으로 생성해야 합니다 — Firebase는 인덱스 생성을 프로젝트 관리자에게만 허용합니다.", "checking": "Firestore 인덱스 확인 중…", "missingCount_one": "{{count}}개의 인덱스가 누락되었습니다:", "missingCount_other": "{{count}}개의 인덱스가 누락되었습니다:", "openConsole": "생성하려면 Firebase Console 열기", "noUrl": "자동 제안 URL을 추출할 수 없습니다 — gcloud 명령은 README를 참조하세요.", "howItWorks": "작동 방식", "step1": "각 누락된 인덱스의 링크를 클릭하세요 — Firebase Console이 정의가 미리 채워진 상태로 열립니다.", "step2": "'Create'를 클릭하고 인덱스가 빌드될 때까지 1~5분 기다리세요 (콘솔에서 상태 확인).", "step3": "여기로 돌아와 재시도를 클릭하세요. 두 쿼리가 모두 성공하면 관리자가 로드됩니다.", "retry": "재시도", "retrying": "재시도 중…", "buildHint": "인덱스 생성 후 빌드까지 몇 분이 걸릴 수 있습니다.", "allReady": "모든 인덱스가 준비되었습니다.", "unexpectedTitle": "Firestore에 도달할 수 없음", "unexpectedHint": "네트워크 연결과 Firestore 규칙을 확인하세요. 인덱스를 방금 생성했다면 빌드가 끝날 때까지 기다린 후 재시도하세요." };
const errors = { "appError": "애플리케이션 오류", "loadAccountFailed": "계정을 불러올 수 없습니다", "loadAccountHint": "문제가 지속되면 로그아웃한 뒤 다시 시도하세요.", "accountDisabled": "계정 비활성화됨", "accountDisabledMessage": "이 CMS에 대한 접근 권한이 비활성화되었습니다. 관리자에게 문의하세요.", "firebaseNotConfigured": "Firebase가 설정되지 않았습니다", "firebaseEnvMissing": "다음 환경 변수가 누락되었습니다:\n{{vars}}\n\n.env.example을 .env로 복사하고 Firebase 프로젝트 자격 증명을 입력한 후 개발 서버를 재시작하세요.", "adminEmailNotConfigured": "관리자 이메일이 설정되지 않았습니다", "adminEmailMessage": ".env에 VITE_ADMIN_EMAIL이 누락되었습니다. 부트스트랩 관리자의 이메일로 설정하세요.", "consoleHint": "브라우저 콘솔과 .env 설정을 확인하세요. 설정 방법은 README를 참조하세요." };
const identity = { "brandTitle": "AgentCMS", "brandSubtitle": "정적 퍼블리셔", "login": { "heading": "로그인", "intro": "관리자가 공유한 이메일과 비밀번호를 사용하세요.", "submit": "로그인", "submitting": "로그인 중…" }, "fields": { "name": "표시 이름 (선택)", "namePlaceholder": "홍길동", "email": "이메일", "password": "비밀번호", "passwordHint": "최소 8자 이상." }, "footer": "새 계정은 관리자가 사용자 페이지에서 만듭니다.", "errors": { "invalidEmail": "유효한 이메일 주소를 입력하세요.", "missingPassword": "비밀번호는 필수입니다.", "passwordTooShort": "비밀번호는 최소 8자 이상이어야 합니다." } };
const setup = /* @__PURE__ */ JSON.parse(`{"title":"AgentCMS에 오신 것을 환영합니다","subtitle":"최초 설정","intro":"Firebase 자격 증명, 부트스트랩 관리자 계정, Flexweg API 키를 입력하세요. 값은 검증된 후 프로젝트에 저장되며(Firestore + Flexweg의 config.js 파일) 관리자가 일반 로그인 흐름으로 다시 로드됩니다. 한 번만 수행하면 됩니다.","introFirebase":"1단계 — Firebase. Firebase 프로젝트 자격 증명과 부트스트랩 관리자 계정을 입력하세요. 로그인하고 이메일을 확인하며 Firestore 규칙이 이 관리자를 인식하는지 확인한 후 Flexweg 단계로 넘어갑니다.","introFlexweg":"2단계 — Flexweg. Flexweg API 키와 사이트 URL을 입력하세요. API를 테스트하고 Firestore에 구성을 저장하며 사이트에 config.js를 업로드하고 테마 자산을 동기화합니다.","continueToFlexweg":"Firebase 확인 후 계속","stepper":{"terms":"약관","backend":"백엔드","firebase":"Firebase","flexweg":"Flexweg","sqlite":"SQLite","docstore":"콘텐츠 및 게시","data":"데이터","hosting":"호스팅","install":"설치"},"backend":{"title":"데이터 백엔드 선택","intro":"CMS가 게시물, 페이지, 사용자, 설정을 어디에 저장할지 선택하세요. 나중에 설정에서 변경할 수 있습니다 (데이터는 마이그레이션되지 않습니다).","sqliteTitle":"Flexweg SQLite (권장)","sqliteHint":"모든 데이터가 Flexweg 사이트에 SQLite 파일로 저장됩니다. 외부 서비스 없음. 인증은 Flexweg SQLite API가 제공합니다.","firebaseTitle":"Firebase","firebaseHint":"Firestore + Auth를 위해 Firebase 프로젝트를 사용합니다. Spark 플랜 무료. onSnapshot을 통한 실시간 업데이트.","continue":"계속","markdownGitTitle":"Git 저장소의 Markdown 파일","markdownGitHint":"게시물을 GitHub / GitLab (또는 로컬 클론)의 .md 파일로 관리합니다. 각 편집자는 자신의 액세스 토큰으로 로그인하며, 모든 변경은 하나의 커밋이 됩니다. 데이터베이스가 필요 없고, 여러 편집자와 여러 컴퓨터에서 사용할 수 있습니다.","localTitle":"이 브라우저만","localHint":"단일 사용자, 로그인 없음, 설정할 것도 없습니다. 콘텐츠는 이 브라우저에 남습니다 (설정에서 내보내기 가능). 내 컴퓨터에서 실행하는 관리자에 가장 적합합니다."},"sqlite":{"heading":"Flexweg 사이트 연결","intro":"Flexweg 마스터 API 키를 한 번만 사용해 SQLite 데이터베이스용으로 범위가 한정된 토큰을 생성합니다. 설치 후에는 마스터 키가 폐기되고 이 SQLite 파일 하나로 범위가 한정된 토큰만 저장됩니다.","apiKeyHint":"Flexweg 마스터 API 키. 설치에만 사용되며 — 이후에는 저장되지 않습니다.","detectedFromUrl":"URL에서 감지됨","advanced":"고급 설정 (사이트 URL, SQLite 경로…)","pathHint":"SQLite 파일이 Flexweg 사이트에 위치할 경로입니다. 폴더는 자동으로 생성됩니다.","adminHeading":"관리자 계정","adminIntro":"첫 사용자를 만드세요 — 이 계정은 자동으로 관리자 권한을 갖게 됩니다. 이후 멤버는 로그인한 후 사용자 페이지에서 온보딩합니다.","passwordHint":"최소 8자 이상.","submit":"SQLite 데이터베이스 설치"},"terms":{"title":"이용 약관","intro":"AgentCMS를 사용하기 전에 아래 약관을 읽고 동의해 주세요. 빠르게 읽을 수 있도록 평이한 언어로 작성되었습니다.","section1":{"title":"1. 무료 서비스","body":"AgentCMS는 Flexweg가 무료로 제공합니다. Flexweg 호스팅과 함께 무제한으로 사용할 수 있으며 — Flexweg는 CMS 자체의 사용에 대해 결코 청구하지 않습니다. Flexweg 호스팅 요금제와 Firebase 요금제의 일반 요금은 각각 해당 계정에 적용됩니다."},"section2":{"title":"2. \\"있는 그대로\\" 제공, 무보증","body":"CMS는 있는 그대로 제공됩니다. 안정적으로 유지하고 시간이 지남에 따라 개선하기 위해 노력하지만, 버그, 결함 또는 중단이 없음을 보장할 수는 없습니다. 직접 작성하지 않은 도구를 사용할 때와 동일한 주의를 기울여 사용하세요: 중요한 콘텐츠는 백업을 보관하세요."},"section3":{"title":"3. 귀하의 콘텐츠, 귀하의 책임","body":"귀하는 CMS를 통해 게시하는 콘텐츠 — 텍스트, 이미지, 비디오, 양식, 코드 임베드 및 기타 미디어 — 에 대해 단독 책임을 집니다. 귀하의 관할권(및 대상으로 하는 관할권)에서 적용되는 법률, 저작권, 초상권 및 인격권, 개인정보 보호 규칙, 그리고 사용하는 모든 제3자 서비스의 약관(임베드된 폰트, 비디오 등)을 준수해야 합니다. Flexweg는 CMS 사용자가 게시한 콘텐츠에 대해 책임지지 않습니다."},"section4":{"title":"4. 귀하의 Firebase 계정, 귀하의 보안","body":"CMS는 데이터를 귀하의 Firebase 프로젝트에 저장합니다. 해당 프로젝트의 보안은 귀하의 책임입니다: 부트스트랩 관리자 계정에 강력한 비밀번호를 선택하고, 문서에 따라 Firestore 보안 규칙을 설정하고, 필요할 때 API 키를 교체하고, 누가 접근할 수 있는지 검토하세요. Flexweg는 어떠한 경우에도 귀하의 Firebase 계정의 잘못된 구성이나 침해로 인한 무단 접근, 데이터 유출, 해킹 또는 손실에 대해 책임지지 않습니다."},"section5":{"title":"5. 책임의 제한","body":"Flexweg는 CMS의 사용, 오용 또는 사용 불가로 인한 수익 손실, 데이터 손실, 비즈니스 기회 손실 또는 직간접적인 손해에 대해 책임지지 않습니다. 적용 법률이 Flexweg에 일정 책임을 부과하는 경우, 그 책임은 지난 12개월 동안 CMS에 대해 Flexweg에 실제로 지불된 금액으로 제한됩니다 — CMS가 무료이므로 0입니다."},"section6":{"title":"6. 귀하의 데이터는 귀하의 것","body":"CMS로 만든 콘텐츠는 귀하의 Firebase 프로젝트(텍스트, 설정, 미디어 메타데이터)와 귀하의 Flexweg 호스팅(게시된 HTML, 이미지, 테마 에셋)에 저장됩니다. CMS 자체는 귀하의 콘텐츠를 어떤 제3자 서비스로도 전송하지 않습니다. 활성화하기로 선택한 플러그인이나 테마는 자체 동작을 가질 수 있습니다 — 활성화하기 전에 무엇을 하는지 확인하세요."},"section7":{"title":"7. 공정한 사용","body":"CMS를 불법, 사기 또는 유해한 활동에 사용하거나 Flexweg의 일반 이용 약관에 위배되는 방식으로 사용하면 Flexweg 호스팅 액세스가 정지될 수 있습니다. 또한 시간이 지남에 따라 이러한 CMS 약관을 업데이트할 수 있으며, 중요한 변경 사항은 관리자 또는 이메일을 통해 전달됩니다."},"accept":"이용 약관을 읽고 동의합니다.","continue":"구성으로 계속","back":"뒤로"},"sections":{"firebase":"Firebase","admin":"부트스트랩 관리자","flexweg":"Flexweg API"},"help":{"firebase":"이 값은 Firebase 콘솔 → 프로젝트 설정 → 일반 → 내 앱 → SDK 설정 및 구성에서 찾을 수 있습니다.","admin":"Firebase Authentication의 기존 사용자를 사용하세요. 이 이메일로 로그인하는 사람은 관리자로 처리되며 사용자 레코드 확인을 우회합니다. 사용자가 없으면 Firebase 콘솔 → Authentication에서 만드세요.","flexweg":"Flexweg 계정 → API에서 영구 API 키를 생성하세요. 사이트 URL은 Flexweg 사이트의 공개 주소입니다(예: https://your-site.flexweg.com).","flexwegApiKeyHint":"Flexweg 계정 설정에서 API 키를 받으세요.","flexwegApiKeyLink":"계정 설정 열기"},"fields":{"apiKey":"API 키","authDomain":"인증 도메인","projectId":"프로젝트 ID","storageBucket":"스토리지 버킷","messagingSenderId":"메시징 발신자 ID","appId":"앱 ID","adminEmail":"이메일","adminPassword":"비밀번호","flexwegApiKey":"API 키","flexwegSiteUrl":"사이트 URL","flexwegApiBaseUrl":"API 기본 URL","sqlitePath":"SQLite 경로"},"submit":"저장하고 계속","submitting":"설정 중…","success":"설정 완료!","reloadingHint":"잠시 후 관리자 페이지가 새로고침됩니다. 잠시만 기다려 주세요.","footer":"이 값은 프로젝트(Firestore + Flexweg)에 저장됩니다. 다른 곳으로 전송되지 않습니다.","steps":{"signInFirebase":"Firebase에 로그인 중…","testFlexweg":"Flexweg API 테스트 중…","writeFirestore":"구성 저장 중…","uploadConfig":"config.js를 Flexweg에 업로드 중…","syncThemes":"테마 에셋을 Flexweg에 동기화하는 중…","sqliteInstall":"범위가 한정된 SQLite 토큰 생성 중…","sqliteRegisterAdmin":"관리자 계정 등록 중…","sqliteSchema":"SQLite 스키마 초기화 중…"},"stepsDone":{"sqliteInstall":"범위가 한정된 SQLite 토큰이 발급되었습니다","sqliteRegisterAdmin":"관리자가 등록되고 로그인되었습니다","sqliteSchema":"SQLite 스키마가 준비되었습니다"},"errors":{"missingFields":"모든 필드를 입력해 주세요.","rootDeploymentTitle":"관리자는 사이트 루트가 아닌 하위 폴더에 있어야 합니다.","rootDeploymentHint":"관리자 파일(index.html, config.js, runtime/, …)을 Flexweg의 하위 폴더로 이동하세요 — 예를 들어 /admin/ 또는 보안을 위한 무작위 이름인 /erf34f654GH3/ 등으로. 그런 다음 해당 하위 폴더 URL에서 관리자를 다시 로드하고 설정을 다시 실행하세요.","firebaseAuthGeneric":"Firebase 로그인에 실패했습니다.","firebaseAuthInvalidCredential":"Firebase가 이메일과 비밀번호 조합을 거부했습니다.","firebaseAuthInvalidCredentialHint":"최신 Firebase 프로젝트는 이메일 열거 방지가 기본으로 켜져 있어, 비밀번호가 틀렸을 때, 사용자가 존재하지 않을 때, 또는 사용자가 다른 제공업체로 로그인할 때 모두 같은 오류를 반환합니다. 확인 사항:\\n• 비밀번호를 다시 입력하세요 — 오타를 배제하기 위해 비밀번호 관리자에서 복사/붙여넣기하세요. 최소 길이는 6자입니다.\\n• Firebase 콘솔 → Authentication → Users를 열어 이메일이 존재하는지 확인하세요. 'Providers' 열을 확인하세요: 'Email/Password'가 없고 Google(또는 다른 제공업체)만 표시되면, 행 메뉴(⋮ → 비밀번호 재설정)에서 비밀번호를 설정하거나 재설정하세요.\\n• 이메일 철자가 Firebase에 저장된 값과 정확히 일치하는지 확인하세요.","firebaseAuthUserNotFound":"이 이메일을 사용하는 Firebase 사용자가 없습니다. 먼저 Firebase 콘솔 → Authentication → Users에서 만드세요.","firebaseAuthInvalidEmail":"관리자 이메일이 유효한 주소가 아닙니다.","firebaseInvalidApiKey":"Firebase API 키가 잘못되었습니다. Firebase 콘솔에서 값을 다시 확인하세요.","firebaseNetwork":"Firebase 로그인 중 네트워크 오류가 발생했습니다. 연결을 확인하세요.","firebaseTooManyRequests":"로그인 시도가 너무 많습니다. 잠시 후 다시 시도하거나 Firebase 콘솔에서 비밀번호를 재설정하세요.","firebaseOperationNotAllowed":"이 Firebase 프로젝트에서는 이메일/비밀번호 로그인이 활성화되어 있지 않습니다. Firebase 콘솔 → Authentication → Sign-in method를 열어 Email/Password 제공업체를 활성화하세요.","firebaseUserDisabled":"이 Firebase 사용자 계정은 비활성화되어 있습니다. Firebase 콘솔 → Authentication → Users에서 다시 활성화하세요.","wrongAdminEmail":"로그인한 Firebase 계정이 입력한 관리자 이메일과 일치하지 않습니다. 다시 시도하세요.","rulesNotPinnedTitle":"Firestore 규칙이 아직 부트스트랩 관리자로 인식하지 못합니다.","rulesNotPinnedHint":"Firebase 콘솔 → Firestore → 규칙을 열고 \`bootstrapAdminEmail()\`의 값을 다음으로 교체하세요: {{email}} — 그런 다음 게시를 클릭하세요. README의 규칙 템플릿에는 자리표시자 \`you@example.com\`이 있으며, 실제 관리자 이메일로 교체해야 합니다. 업데이트된 규칙을 게시한 후 여기에서 제출을 다시 클릭하세요.","flexwegAuth":"Flexweg API 키가 거부되었습니다. Flexweg 계정 → API에서 값을 확인하세요.","flexwegNetwork":"Flexweg에 연결하는 중 네트워크 오류가 발생했습니다. API 기본 URL과 연결을 확인하세요.","flexwegHttp":"Flexweg API 오류 ({{status}}): {{detail}}","firestoreRulesTitle":"Firestore가 구성 쓰기를 거부했습니다.","firestoreRulesHint":"Firebase 콘솔 → Firestore → 규칙을 열고 부트스트랩 관리자 이메일이 '{{email}}'로 설정되어 있는지 확인하세요. README에 복사해서 붙여 넣을 수 있는 규칙 템플릿이 있습니다.","firestoreOther":"Firestore 쓰기 실패","uploadFailed":"config.js를 Flexweg에 업로드할 수 없습니다","generic":"문제가 발생했습니다."},"docstore":{"contentTitle":"콘텐츠 저장소","contentIntro":"게시물, 페이지, 설정이 Markdown + JSON 파일로 저장되는 곳입니다. 빈 저장소도 괜찮습니다 — CMS가 파일을 생성합니다.","provider":"저장소","localClone":"로컬 폴더 (git 클론)","localCloneHint":"클론한 폴더를 선택하세요. 평소 사용하는 git 클라이언트로 동기화하세요 — CMS는 파일을 읽고 쓸 뿐 git을 실행하지 않습니다.","contentDir":"저장소 내 콘텐츠 폴더","privateRepo":"비공개 저장소를 사용하세요: 초안이 그곳에 저장됩니다.","folderRequired":"먼저 콘텐츠 폴더를 선택하세요.","checking":"저장소 접근 권한 확인 중…","publishIntro":"생성된 사이트가 게시되는 곳입니다. 나중에 설정에서 변경할 수 있습니다.","existingSite":"이 저장소는 이미 설정되어 있습니다 — 사이트는 계속 다음 위치에 게시됩니다: {{target}}. 나중에 설정에서 변경할 수 있습니다 (비밀 키가 있다면 그곳에서 다시 입력해야 합니다).","install":"설치","steps":{"config":"구성 저장 중…","content":"콘텐츠 불러오는 중…","target":"게시 대상 저장 중…","testTarget":"게시 대상 테스트 중…"},"doneTitle":"모두 준비되었습니다!","doneBody":"구성이 이 브라우저에 저장되었습니다. 다른 편집자가 이 설정을 반복하지 않도록 config.js를 다운로드해 호스팅의 관리자 폴더에 있는 파일을 교체하세요.","downloadConfig":"config.js 다운로드","open":"관리자 열기","footer":"콘텐츠는 저장소 또는 이 브라우저에 남으며, 액세스 토큰은 절대 이 브라우저 밖으로 나가지 않습니다."},"data":{"title":"1. 데이터를 어디에 저장하시겠어요?","intro":"게시물, 페이지, 사용자, 설정 — 관리자 자체의 데이터입니다. 공개 사이트를 호스팅하는 위치(다음 단계)와는 별개입니다.","localNote":"설정할 것이 없습니다: 콘텐츠는 이 브라우저에 저장됩니다. 백업하거나 나중에 옮기려면 설정에서 내보내세요.","options":{"sqlite-file":{"title":"SQLite","hint":"다음 단계에서 선택하는 호스팅(Flexweg, 자체 서버, S3, Git…)에 저장되는 SQLite 데이터베이스입니다. 사용자 계정이 없습니다 — Flexweg에서 호스팅한다면 계정이 포함된 Flexweg의 SQLite 서비스를 사용할 수도 있습니다."},"flexweg-sqlite":{"title":"SQLite (Flexweg 서비스)","hint":"Flexweg 서비스가 운영하는 SQLite 데이터베이스로, 사용자 계정이 내장되어 있습니다. 사이트를 어디에서 호스팅하든 Flexweg 계정이 필요합니다."},"firebase":{"title":"Firebase","hint":"Google 프로젝트의 Firestore + Firebase Auth. 실시간, 무료 Spark 요금제."},"markdown-git":{"title":"Git의 Markdown 파일","hint":"게시물을 GitHub / GitLab 저장소(또는 로컬 클론)의 .md 파일로 저장합니다. 각 편집자는 자신의 토큰을 사용하며, 모든 변경은 커밋이 됩니다."},"local":{"title":"이 브라우저","hint":"단일 사용자, 로그인 없음, 설정할 것 없음. 컴퓨터에서 실행하는 관리자에 적합합니다."}}},"hosting":{"title":"2. 사이트를 어디에 게시하시겠어요?","intro":"게시할 때마다 생성된 정적 사이트(HTML, CSS, 이미지)가 업로드되는 곳입니다. 나중에 설정에서 변경할 수 있습니다.","existing":"이 콘텐츠 저장소는 이미 아래 대상에 게시하고 있습니다. 그대로 유지하거나 다른 대상을 선택하세요."},"install":{"title":"3. 설치","intro":"요약을 확인한 후 설치하세요.","data":"데이터","hosting":"호스팅","saveTarget":"게시 대상 저장 중…","noteConfigJs":"관리자 구성(config.js)은 가능하면 Flexweg의 관리자 옆에 업로드됩니다. 그렇지 않으면 다운로드하도록 안내됩니다.","noteLocalConfig":"구성은 이 브라우저에 저장됩니다. 다른 편집자가 이 설정을 건너뛸 수 있도록 관리자 폴더에 넣을 config.js가 제공됩니다."},"sqliteFile":{"security":"사용자 계정이 없습니다. 이 관리자 화면을 열 수 있는 사람은 누구나 콘텐츠를 수정할 수 있으니 호스팅에서 관리자 폴더를 보호하세요. 데이터베이스 파일은 다른 파일처럼 공개적으로 제공되므로 암호화하거나 별도의 비공개 위치에 저장하세요.","intro":"데이터베이스 파일이 저장되는 위치입니다. 이 관리자는 호스팅과 동일한 커넥터를 통해 파일을 읽고 저장합니다.","path":"데이터베이스 파일 경로","pathHint":"아직 없으면 처음 저장할 때 생성됩니다. Git 저장소를 사용하면 저장할 때마다 커밋이 생성되므로 — 사이트 빌드를 트리거하지 않는 저장소나 브랜치를 사용하세요.","existing":"기존 데이터베이스","new":"새 데이터베이스","dataNote":"여기서는 설정할 것이 없습니다: 데이터베이스는 다음 단계에서 선택하는 호스팅에 저장됩니다.","heading":"SQLite 데이터베이스","flexwegService":"Flexweg의 SQLite 서비스 사용","flexwegServiceHint":"데이터베이스는 Flexweg가 운영하며 사용자 계정(이메일 + 비밀번호)이 내장되어 있습니다. 그렇지 않으면 계정 없이 이 호스팅에 저장되는 일반 파일입니다.","summaryFile":"이 호스팅의 파일 {{path}}","summaryService":"Flexweg SQLite 서비스 ({{path}})","encrypt":"데이터베이스 암호화","encryptHint":"공개 호스팅에서 권장: 암호 문구 없이는 파일을 읽을 수 없습니다. 새 브라우저마다 한 번 입력합니다.","passphrase":"암호 문구","passphraseHint":"지금 비밀번호 관리자에 저장하세요. 암호 문구가 없으면 본인을 포함해 누구도 데이터베이스를 열 수 없습니다.","copy":"복사","copied":"복사됨","generate":"새로 만들기","passphraseTooShort":"암호 문구는 12자 이상이어야 합니다.","existingEncrypted":"이 경로에 암호화된 데이터베이스가 이미 있습니다. 해당 암호 문구를 입력하세요.","separate":"데이터베이스를 별도의 비공개 위치에 저장","separateHint":"예: 비공개 S3 / R2 버킷 또는 비공개 Git 저장소. 이렇게 하면 공개 사이트가 데이터베이스를 제공하지 않습니다.","summaryEncrypted":"암호화됨","summaryLocation":"{{location}}에 저장됨","locationLabel":"데이터베이스 위치","gitBranchNote":"데이터베이스는 게시되지 않는 이 저장소의 {{branch}} 브랜치에 보관됩니다. 콘텐츠를 저장해도 사이트가 다시 빌드되지 않습니다.","summaryBranch":"{{branch}} 브랜치"},"adminHosting":{"deploying":"관리자를 사이트에 복사하는 중…","label":"이 사이트에 관리자도 호스팅","hint":"관리자가 config.js(비밀 정보 없음)와 함께 {{url}}에 복사되며, 모든 편집자가 그곳에서 열 수 있습니다. 각 편집자는 여전히 자신의 액세스로 로그인합니다.","folder":"관리자 폴더","alreadyHere":"이 관리자는 이미 이 사이트에서 실행 중입니다. config.js가 그 자리에서 업데이트됩니다.","doneBody":"관리자가 이제 사이트에 있습니다. GitHub Pages를 사용한다면 아직 활성화하지 않은 경우 먼저 저장소의 Pages를 활성화한 다음(Settings → Pages) 여세요:","open":"온라인 관리자 열기","continueHere":"이 관리자에서 계속하기"}}`);
const flexweg = { "actions": { "upload": "파일 업로드", "delete": "파일 삭제", "rename": "파일 이름 변경", "get": "파일 읽기", "list": "파일 목록 조회", "createFolder": "폴더 생성", "renameFolder": "폴더 이름 변경", "deleteFolder": "폴더 삭제", "storageLimits": "저장 용량 한도 조회", "commit": "변경 사항 게시 중" }, "errors": { "configMissing": "게시 대상이 설정되지 않았습니다. 게시하기 전에 설정에서 구성하세요.", "network": "{{action}}: 네트워크 오류 또는 CORS가 차단되었습니다. 연결 상태를 확인하세요.", "auth": "{{action}}: 인증에 실패했습니다. 설정에서 게시 대상 자격 증명을 확인하세요.", "notFound": "{{action}}: 게시 대상에서 찾을 수 없습니다.", "tooLarge": "{{action}}: 게시 대상에 비해 파일이 너무 큽니다.", "rateLimited": "{{action}}: 요청이 너무 많습니다. 잠시 후 다시 시도하세요.", "serverError": "{{action}}: 게시 대상 서버 오류({{status}}). 다시 시도하세요.", "generic": "{{action}} 실패 ({{status}}){{detail}}.", "unsupported": '{{action}}: "{{connector}}" 게시 대상에서 지원되지 않습니다.', "unknownConnector": '알 수 없는 게시 대상 "{{connector}}". 설정 → 게시 대상을 확인하세요.', "folderAccess": "로컬 폴더에 접근할 수 없습니다. 설정 → 게시 대상에서 “폴더 다시 연결”을 클릭하세요." } };
const publish = { "log": { "rendering": "페이지 렌더링 중…", "uploading": "{{path}} 업로드 중…", "deleting": "{{path}} 삭제 중…", "regenerating": "목록 재생성 중…", "skipped": "{{path}} 건너뜀 (변경 없음)", "done": "{{url}}에 게시됨", "failed": "실패: {{error}}" } };
const docstore = { "errors": { "notConnected": "콘텐츠 저장소에 연결되어 있지 않습니다. 액세스 토큰으로 다시 로그인하세요.", "conflict": "그 사이 다른 사람이 이 항목을 변경했습니다. 이제 그 버전이 표시됩니다 — 변경 사항을 다시 적용하세요.", "sqliteUnsupported": '"{{connector}}" 대상에는 데이터베이스 파일을 저장할 수 없습니다.' } };
const connectors = { "target": "게시 대상", "settingsTitle": "게시 대상", "settingsHelp": "게시할 때 렌더링된 사이트가 업로드되는 곳입니다. 자격 증명은 콘텐츠 백엔드에 저장되며 (Git 콘텐츠 저장소의 경우 이 브라우저에 보관) 모든 관리자가 읽을 수 있습니다.", "saved": "게시 대상이 저장되었습니다. 재생성 → 전체를 실행해 사이트 전체를 새 대상에 게시하세요.", "test": "연결 테스트", "testOk": "연결 정상", "testFailed": "연결 실패", "names": { "flexweg": "Flexweg", "git-pages": "Git 저장소 (GitHub Pages, Cloudflare Pages, GitLab Pages…)", "s3": "S3 호환 버킷 (AWS S3, Cloudflare R2, Backblaze B2, OVH…)", "php-bridge": "자체 서버 (PHP 브리지)", "browser-mirror": "ZIP으로 다운로드", "local-folder": "이 컴퓨터의 로컬 폴더" }, "hints": { "flexweg": "Flexweg Files API를 통해 업로드합니다.", "git-pages": "게시할 때마다 저장소에 커밋 하나가 생성되며, 호스트가 이를 바탕으로 사이트를 다시 빌드합니다.", "s3": "버킷에 이 관리자의 오리진을 허용하는 CORS 규칙이 필요하며, index.html 파일을 제공하려면 웹사이트 호스팅 (또는 CDN)이 필요합니다.", "php-bridge": "external/bridges/php/flexweg-bridge.php를 서버에 업로드하고 API 키를 설정한 다음 여기에 URL을 입력하세요.", "browser-mirror": "사이트는 이 브라우저에 보관됩니다. ZIP을 다운로드해 원하는 곳에 직접 업로드하세요.", "local-folder": "사이트를 폴더에 바로 기록합니다 (Chrome / Edge). 로컬에서 제공하거나 자신의 도구로 푸시하세요." }, "fields": { "flexweg": { "apiKey": "API 키", "siteUrl": "사이트 URL", "apiBaseUrl": "API 기본 URL" }, "git-pages": { "host": "호스팅", "provider": "Git 제공자", "owner": "소유자 (사용자 또는 조직)", "repo": "저장소", "project": "프로젝트 경로", "branch": "브랜치", "dir": "저장소 내 폴더", "token": "액세스 토큰", "siteUrl": "공개 사이트 URL", "apiBaseUrl": "API URL (자체 호스팅 전용)" }, "s3": { "endpoint": "엔드포인트", "region": "리전", "bucket": "버킷", "prefix": "키 접두사 (선택 사항)", "accessKeyId": "액세스 키 ID", "secretAccessKey": "비밀 액세스 키", "siteUrl": "공개 사이트 URL", "forcePathStyle": "경로 스타일 URL (MinIO, R2, 대부분의 호환 서비스)", "publicRead": "업로드한 파일을 공개로 설정(ACL public-read) — 버킷 정책으로 공개되지 않은 버킷용(OVHcloud, Scaleway 등). ‘bucket owner enforced’를 사용하는 AWS 버킷에서는 꺼 두세요." }, "php-bridge": { "apiBaseUrl": "브리지 URL", "apiKey": "브리지 API 키", "siteUrl": "공개 사이트 URL" }, "browser-mirror": { "siteUrl": "공개 사이트 URL (선택 사항)" }, "local-folder": { "siteUrl": "폴더가 제공되는 URL (선택 사항)" } }, "help": { "flexweg": { "apiKey": "Flexweg 계정 → API에서 생성합니다." }, "git-pages": { "host": "Cloudflare Pages: 빌드 명령 없이 아래 출력 폴더로 프로젝트를 이 저장소에 연결하세요. 비공개 저장소에서도 작동합니다.", "dir": '저장소 루트를 사용하려면 비워 두세요. GitHub Pages: "" 또는 "docs". GitLab Pages: "public".', "token": "이 저장소에 대해 Contents: read & write 권한이 있는 세분화된(fine-grained) 토큰(GitHub) — CMS가 GitHub Pages를 활성화하도록 하려면 Pages: read & write를 추가하세요 — 또는 api 스코프가 있는 토큰(GitLab). 콘텐츠가 같은 제공자에 있다면 비워 두어 각 편집자의 액세스 토큰을 사용하세요.", "siteUrl": "예: https://user.github.io/repo — 하위 폴더 URL도 괜찮으며, 링크는 자동으로 조정됩니다." }, "s3": { "endpoint": "AWS는 비워 두세요 (리전에서 자동 구성됨). R2: https://<account-id>.r2.cloudflarestorage.com", "siteUrl": "버킷 웹사이트 URL 또는 CDN 도메인." }, "php-bridge": { "apiBaseUrl": "서버에 있는 flexweg-bridge.php의 전체 URL (HTTPS)." }, "browser-mirror": { "siteUrl": "ZIP을 업로드할 위치 — 절대 URL (사이트맵, RSS, 미디어)에 사용됩니다." }, "local-folder": { "siteUrl": "예: 로컬 웹 서버가 폴더를 제공하는 경우 http://localhost:8080." } }, "options": { "github-pages": "GitHub Pages", "cloudflare-pages": "Cloudflare Pages (저장소에 연결됨)", "gitlab-pages": "GitLab Pages", "other": "기타 (Netlify, Vercel, 서버 git pull…)", "github": "GitHub", "gitlab": "GitLab" }, "folder": { "choose": "폴더 선택…", "change": "폴더 변경…", "reconnect": "폴더 다시 연결", "unsupported": "이 브라우저는 로컬 폴더에 쓸 수 없습니다. Chrome 또는 Edge를 사용하세요." }, "mirror": { "download": "사이트 다운로드 (ZIP)", "count": "이 브라우저에 있는 파일 {{count}}개" }, "adminHosting": { "title": "이 사이트의 관리자", "help": "이 관리자를 게시 대상에 복사합니다(최초 배포 또는 새 버전 이후 업데이트). config.js에는 비밀 정보가 없습니다.", "deploy": "관리자 배포 / 업데이트", "deployed": "관리자 배포 완료 ({{count}}개 파일) — {{url}}" }, "pages": { "enabled": "이 저장소에 GitHub Pages가 활성화되었습니다 — 약 1분 후 사이트가 온라인 상태가 됩니다.", "enableHint": '게시에 성공했습니다. 사이트를 온라인으로 만들려면 {{repo}}에 대해 GitHub Pages를 활성화하세요: Settings → Pages → Deploy from a branch → {{branch}} / {{folder}}. (또는 토큰에 "Pages: read and write" 권한을 부여하면 CMS가 대신 처리합니다.)' }, "siteUrl": { "mismatch": "사이트 공개 URL(설정 → 사이트)은 {{site}}이지만, 이 대상은 사이트를 {{target}}에서 제공합니다. 링크, CSS, 사이트맵은 사이트 URL을 따르므로 이 호스팅에서는 잘못됩니다.", "use": "사이트에 {{url}} 사용", "updated": "사이트 URL을 업데이트했습니다. 재생성 → 전체를 실행해 새 링크로 페이지를 다시 게시하세요." } };
const gitAccess = { "heading": "콘텐츠 저장소에 연결", "tokenIntro": "콘텐츠는 {{provider}} 저장소 {{repo}}에 저장됩니다. 자신의 개인 액세스 토큰으로 로그인하세요 — 저장소 권한에 따라 역할이 결정됩니다 (쓰기 권한 = 편집자, admin / maintainer = 관리자).", "token": "개인 액세스 토큰", "tokenHelpGithub": "이 저장소에만 접근 가능한 fine-grained 토큰, Contents 권한: 읽기 및 쓰기.", "tokenHelpGitlab": "api scope가 있는 토큰, 이 프로젝트에서 Developer 이상의 역할.", "createToken": "토큰 만들기", "connect": "연결", "tokenStorage": "토큰은 이 브라우저에만 보관됩니다. 로그아웃하면 삭제됩니다.", "failed": "이 토큰으로는 저장소에 쓸 수 없습니다 (유효하지 않음, 만료됨 또는 읽기 전용). 권한을 확인하세요.", "folderIntro": "콘텐츠는 이 컴퓨터의 폴더에 저장됩니다 (보통 자신의 git 클라이언트로 동기화하는 git 클론). 이 브라우저에 접근 권한을 허용하세요 — 브라우저는 새로고침할 때마다 다시 묻습니다.", "openFolder": "콘텐츠 폴더 열기" };
const hosting = { "flexweg": { "title": "Flexweg", "short": "Flexweg 호스팅", "hint": "Flexweg Files API를 통해 업로드합니다. Flexweg 계정의 API 키를 사용하세요." }, "github-pages": { "title": "GitHub Pages", "short": "무료, GitHub 저장소에서", "hint": "게시할 때마다 저장소에 커밋 하나가 생성되고 GitHub Pages가 이를 제공합니다. Settings → Pages → Deploy from a branch. 무료 요금제는 공개 저장소만 가능합니다." }, "cloudflare-pages": { "title": "Cloudflare Pages", "short": "무료, 비공개 저장소 가능", "hint": "CMS가 사이트를 GitHub / GitLab 저장소에 커밋합니다. 여기에 Cloudflare Pages 프로젝트를 연결하세요(빌드 명령 없음, 출력 폴더 = 아래 폴더)." }, "gitlab-pages": { "title": "GitLab Pages", "short": "무료, GitLab 저장소에서", "hint": "게시할 때마다 커밋 하나가 생성됩니다. CMS가 public/ 폴더를 게시하는 최소한의 .gitlab-ci.yml을 추가합니다." }, "git-other": { "title": "Netlify, Vercel…", "short": "저장소를 배포하는 모든 호스트", "hint": "CMS가 사이트를 Git 저장소에 커밋합니다. 호스트(Netlify, Vercel, git pull을 실행하는 서버…)를 해당 저장소에 연결하세요." }, "s3": { "title": "S3 / R2 / B2…", "short": "오브젝트 스토리지 버킷", "hint": "AWS S3, Cloudflare R2, Backblaze B2, OVH, Scaleway, MinIO… 버킷에 CORS 규칙과 웹사이트 호스팅 또는 앞단의 CDN이 필요합니다." }, "own-server": { "title": "자체 서버 (FTP / SFTP)", "short": "공유 호스팅, VPS…", "hint": "브라우저는 FTP나 SFTP를 사용할 수 없습니다: FTP 클라이언트로 PHP 브리지(external/bridges/php/flexweg-bridge.php)를 한 번 업로드하고 API 키를 설정한 다음, 여기에 해당 URL을 입력하세요. 모든 PHP 호스트에서 작동합니다." }, "local-folder": { "title": "로컬 폴더", "short": "이 컴퓨터에", "hint": "사이트를 이 컴퓨터의 폴더에 씁니다(Chrome / Edge). 로컬에서 제공하거나 자체 도구로 푸시하세요." }, "zip": { "title": "ZIP으로 다운로드", "short": "직접 업로드", "hint": "사이트는 이 브라우저에 보관됩니다. 설정에서 ZIP을 다운로드해 원하는 곳(Netlify Drop, FTP 클라이언트…)에 업로드하세요." } };
const sqliteAccess = { "heading": "데이터베이스에 연결", "intro": "이 관리자는 콘텐츠를 {{path}}에 저장합니다. 이 브라우저의 액세스 자격 증명을 입력하세요.", "storage": "자격 증명은 이 브라우저에만 보관됩니다. 로그아웃하면 삭제됩니다.", "passphrase": "데이터베이스 암호 문구", "passphraseHint": "데이터베이스가 암호화되어 있습니다. 설치 시 정한 암호 문구를 입력하세요(이 브라우저에만 저장됩니다).", "passphraseWrong": "암호 문구가 올바르지 않아 데이터베이스를 열 수 없습니다.", "passphraseMissing": "데이터베이스 암호 문구를 입력하세요." };
const ko = {
  common,
  auth,
  nav,
  dashboard,
  posts,
  pages,
  taxonomies,
  media,
  themes,
  plugins,
  externalInstall,
  externalLoader,
  menus,
  settings,
  users,
  firestoreSetup,
  errors,
  identity,
  setup,
  flexweg,
  publish,
  docstore,
  connectors,
  gitAccess,
  hosting,
  sqliteAccess
};
const SUPPORTED_LOCALES = ["en", "fr", "de", "es", "nl", "pt", "ko"];
const DEFAULT_LOCALE = "en";
const STORAGE_KEY = "adminLocale";
function isSupportedLocale(value) {
  return typeof value === "string" && SUPPORTED_LOCALES.includes(value);
}
function resolveInitialLocale(profileLocale) {
  if (isSupportedLocale(profileLocale)) return profileLocale;
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isSupportedLocale(stored)) return stored;
  }
  if (typeof navigator !== "undefined" && typeof navigator.language === "string") {
    const prefix = navigator.language.split("-")[0]?.toLowerCase();
    if (isSupportedLocale(prefix)) return prefix;
  }
  return DEFAULT_LOCALE;
}
void instance.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    de: { translation: de },
    es: { translation: es },
    nl: { translation: nl },
    pt: { translation: pt },
    ko: { translation: ko }
  },
  lng: resolveInitialLocale(),
  fallbackLng: DEFAULT_LOCALE,
  interpolation: { escapeValue: false },
  returnNull: false,
  // Disable Suspense — resources are loaded synchronously from static
  // imports, so suspending makes no sense and can race with React's
  // reconciler if a parent boundary catches the thrown promise.
  react: { useSuspense: false }
});
const subscribers = /* @__PURE__ */ new Set();
function newToastId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function showToast(input) {
  const toast2 = { ...input, id: newToastId(), createdAt: Date.now() };
  subscribers.forEach((fn) => {
    try {
      fn(toast2);
    } catch (err) {
      console.error("Toast subscriber threw:", err);
    }
  });
  return toast2;
}
const toast = {
  info: (message, durationMs) => showToast({ level: "info", message, durationMs }),
  success: (message, durationMs) => showToast({ level: "success", message, durationMs }),
  warn: (message, durationMs) => showToast({ level: "warn", message, durationMs }),
  error: (message, durationMs) => showToast({ level: "error", message, durationMs })
};
function subscribeToToasts(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}
class StorageError extends Error {
  constructor(message, status, body) {
    super(message);
    this.status = status;
    this.body = body;
    this.name = "StorageError";
  }
}
function actionLabel(action) {
  return instance.t(`flexweg.actions.${action}`);
}
function extractDetail(body) {
  if (!body) return "";
  let text = body.trim();
  try {
    const parsed = JSON.parse(text);
    text = parsed.error ?? parsed.message ?? text;
  } catch {
  }
  if (text.length > 240) text = text.slice(0, 240) + "…";
  return text;
}
function buildErrorMessage(action, status, body) {
  const label = actionLabel(action);
  const detail = extractDetail(body);
  switch (status) {
    case 401:
    case 403:
      return instance.t("flexweg.errors.auth", { action: label });
    case 404:
      return instance.t("flexweg.errors.notFound", { action: label });
    case 413:
      return instance.t("flexweg.errors.tooLarge", { action: label });
    case 429:
      return instance.t("flexweg.errors.rateLimited", { action: label });
    case 500:
    case 502:
    case 503:
    case 504:
      return instance.t("flexweg.errors.serverError", { action: label, status });
    default:
      return instance.t("flexweg.errors.generic", {
        action: label,
        status,
        detail: detail ? `: ${detail}` : ""
      });
  }
}
async function performRequest(action, fetcher) {
  let res;
  try {
    res = await fetcher();
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    toast.error(instance.t("flexweg.errors.network", { action: actionLabel(action) }));
    throw err;
  }
  if (res.ok) return res;
  const body = await res.text().catch(() => "");
  const isSilenced = (action === "delete" || action === "deleteFolder") && res.status === 404;
  const message = buildErrorMessage(action, res.status, body);
  if (!isSilenced) toast.error(message);
  throw new StorageError(message, res.status, body);
}
async function gitFetch(action, url, init, allow = []) {
  let res;
  try {
    res = await fetch(url, init);
  } catch (err) {
    return performRequest(action, () => Promise.reject(err));
  }
  if (res.ok || allow.includes(res.status)) return res;
  return performRequest(action, async () => res);
}
async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function lane() {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, lane));
  return results;
}
class GitConflictError extends Error {
  constructor(message, currentHeadSha) {
    super(message);
    this.currentHeadSha = currentHeadSha;
    this.name = "GitConflictError";
  }
}
const TREE_CHUNK = 300;
const GRAPHQL_BATCH = 50;
const MAX_REF_RETRIES = 3;
function createGitHubTransport(cfg) {
  const api = (cfg.apiBaseUrl || "https://api.github.com").replace(/\/+$/, "");
  const graphqlUrl = api.endsWith("/api/v3") ? api.replace(/\/api\/v3$/, "/api/graphql") : `${api}/graphql`;
  const repoUrl = `${api}/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}`;
  const refPath = `heads/${cfg.branch.split("/").map(encodeURIComponent).join("/")}`;
  const headers = {
    Authorization: `Bearer ${cfg.token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
  };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };
  async function getJson(url, action = "get") {
    const res = await gitFetch(action, url, { headers, cache: "no-store" });
    return await res.json();
  }
  async function postJson(url, body, method = "POST") {
    const res = await gitFetch("commit", url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
    return await res.json();
  }
  async function headSha() {
    const res = await gitFetch("get", `${repoUrl}/git/ref/${refPath}`, { headers, cache: "no-store" }, [404, 409]);
    if (!res.ok) return "";
    const data = await res.json();
    if (Array.isArray(data)) return "";
    return data.object?.sha ?? "";
  }
  async function treeShaOf(commitSha) {
    const commit2 = await getJson(`${repoUrl}/git/commits/${commitSha}`);
    return commit2.tree.sha;
  }
  async function walk(treeSha, prefix, out) {
    const data = await getJson(`${repoUrl}/git/trees/${treeSha}`, "list");
    for (const item of data.tree) {
      const path = prefix + item.path;
      if (item.type === "blob") out.push({ path, sha: item.sha, size: item.size });
      else if (item.type === "tree") await walk(item.sha, path + "/", out);
    }
  }
  async function listTreeAt(head) {
    if (!head) return { headSha: "", entries: [] };
    const treeSha = await treeShaOf(head);
    const data = await getJson(
      `${repoUrl}/git/trees/${treeSha}?recursive=1`,
      "list"
    );
    if (!data.truncated) {
      return {
        headSha: head,
        entries: data.tree.filter((t) => t.type === "blob").map((t) => ({ path: t.path, sha: t.sha, size: t.size }))
      };
    }
    const entries = [];
    await walk(treeSha, "", entries);
    return { headSha: head, entries };
  }
  async function readBlobBase64(sha) {
    const blob = await getJson(`${repoUrl}/git/blobs/${sha}`);
    return blob.content;
  }
  async function graphqlTexts(shas) {
    const out = /* @__PURE__ */ new Map();
    for (let i = 0; i < shas.length; i += GRAPHQL_BATCH) {
      const batch = shas.slice(i, i + GRAPHQL_BATCH);
      const fields = batch.map((sha, j) => `b${j}: object(oid: "${sha}") { ... on Blob { text isBinary isTruncated } }`).join("\n");
      const query = `query($owner: String!, $name: String!) { repository(owner: $owner, name: $name) { ${fields} } }`;
      try {
        const res = await fetch(graphqlUrl, {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify({ query, variables: { owner: cfg.owner, name: cfg.repo } })
        });
        if (!res.ok) continue;
        const json = await res.json();
        const repo = json.data?.repository;
        if (!repo) continue;
        batch.forEach((sha, j) => {
          const blob = repo[`b${j}`];
          if (blob && !blob.isBinary && !blob.isTruncated && typeof blob.text === "string") {
            out.set(sha, blob.text);
          }
        });
      } catch {
      }
    }
    return out;
  }
  async function readTexts(entries) {
    const shas = [...new Set(entries.map((e) => e.sha))];
    const bySha = await getCachedTexts(shas);
    const missing = shas.filter((sha) => !bySha.has(sha));
    const fetched = /* @__PURE__ */ new Map();
    if (missing.length > 0) {
      const viaGraphql = await graphqlTexts(missing);
      for (const [sha, text] of viaGraphql) fetched.set(sha, text);
      const rest = missing.filter((sha) => !fetched.has(sha));
      await mapLimit(rest, 6, async (sha) => {
        fetched.set(sha, base64ToUtf8(await readBlobBase64(sha)));
      });
      await putCachedTexts(fetched);
    }
    const out = /* @__PURE__ */ new Map();
    for (const e of entries) {
      const text = bySha.get(e.sha) ?? fetched.get(e.sha);
      if (text !== void 0) out.set(e.path, text);
    }
    return out;
  }
  async function readBytes(entry) {
    return base64ToBytes(await readBlobBase64(entry.sha));
  }
  async function bootstrapBranch(message) {
    const repo = await getJson(repoUrl);
    const defaultRes = repo.default_branch ? await gitFetch(
      "get",
      `${repoUrl}/git/ref/heads/${encodeURIComponent(repo.default_branch)}`,
      { headers, cache: "no-store" },
      [404, 409]
    ) : null;
    if (!defaultRes || !defaultRes.ok) {
      const created = await postJson(
        `${repoUrl}/contents/.gitkeep`,
        { message, content: "", branch: cfg.branch },
        "PUT"
      );
      return created.commit.sha;
    }
    const tree = await postJson(`${repoUrl}/git/trees`, {
      tree: [{ path: ".gitkeep", mode: "100644", type: "blob", content: "" }]
    });
    const commit2 = await postJson(`${repoUrl}/git/commits`, {
      message,
      tree: tree.sha,
      parents: []
    });
    await postJson(`${repoUrl}/git/refs`, { ref: `refs/heads/${cfg.branch}`, sha: commit2.sha });
    return commit2.sha;
  }
  async function commit(changes, opts) {
    const blobShas = /* @__PURE__ */ new Map();
    for (const change of changes) {
      if (change.type === "put" && change.encoding === "base64" && !blobShas.has(change.path)) {
        const blob = await postJson(`${repoUrl}/git/blobs`, {
          content: change.content,
          encoding: "base64"
        });
        blobShas.set(change.path, blob.sha);
      }
    }
    for (let attempt = 0; ; attempt++) {
      let head = await headSha();
      if (opts.expectedHeadSha !== void 0 && head !== opts.expectedHeadSha) {
        throw new GitConflictError(`Branch ${cfg.branch} moved`, head);
      }
      if (!head) head = await bootstrapBranch("Initialize branch — AgentCMS");
      const baseTree = await treeShaOf(head);
      let existing = null;
      if (changes.some((c) => c.type === "delete")) {
        existing = new Set((await listTreeAt(head)).entries.map((e) => e.path));
      }
      const items = [];
      for (const change of changes) {
        if (change.type === "delete") {
          if (existing?.has(change.path)) {
            items.push({ path: change.path, mode: "100644", type: "blob", sha: null });
          }
        } else if (change.encoding === "base64") {
          items.push({ path: change.path, mode: "100644", type: "blob", sha: blobShas.get(change.path) });
        } else {
          items.push({ path: change.path, mode: "100644", type: "blob", content: change.content });
        }
      }
      let tree = baseTree;
      for (let i = 0; i < items.length; i += TREE_CHUNK) {
        const res = await postJson(`${repoUrl}/git/trees`, {
          base_tree: tree,
          tree: items.slice(i, i + TREE_CHUNK)
        });
        tree = res.sha;
      }
      if (tree === baseTree) return head;
      const created = await postJson(`${repoUrl}/git/commits`, {
        message: opts.message,
        tree,
        parents: [head]
      });
      const update = await gitFetch(
        "commit",
        `${repoUrl}/git/refs/${refPath}`,
        { method: "PATCH", headers: jsonHeaders, body: JSON.stringify({ sha: created.sha, force: false }) },
        [409, 422]
      );
      if (update.ok) return created.sha;
      if (opts.expectedHeadSha !== void 0) {
        throw new GitConflictError(`Branch ${cfg.branch} moved`, await headSha());
      }
      if (attempt >= MAX_REF_RETRIES) {
        throw new GitConflictError(`Branch ${cfg.branch} kept moving`, await headSha());
      }
    }
  }
  async function resetBranch(files, opts) {
    const items = [];
    for (const f of files) {
      const blob = await postJson(`${repoUrl}/git/blobs`, { content: f.content, encoding: "base64" });
      items.push({ path: f.path, mode: "100644", type: "blob", sha: blob.sha });
    }
    const tree = await postJson(`${repoUrl}/git/trees`, { tree: items });
    const created = await postJson(`${repoUrl}/git/commits`, { message: opts.message, tree: tree.sha, parents: [] });
    const head = await headSha();
    if (head !== opts.expectedHeadSha) throw new GitConflictError(`Branch ${cfg.branch} moved`, head);
    await gitFetch("commit", `${repoUrl}/git/refs/${refPath}`, {
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify({ sha: created.sha, force: true })
    });
    return created.sha;
  }
  async function permissions() {
    const [user, repo] = await Promise.all([
      getJson(`${api}/user`),
      getJson(repoUrl)
    ]);
    const p = repo.permissions ?? {};
    return { login: user.login, canWrite: !!(p.push || p.maintain || p.admin), isAdmin: !!(p.admin || p.maintain) };
  }
  return {
    kind: "github",
    label: `${cfg.owner}/${cfg.repo}@${cfg.branch}`,
    headSha,
    listTree: async () => listTreeAt(await headSha()),
    readTexts,
    readBytes,
    commit,
    permissions,
    resetBranch
  };
}
const MAX_RETRIES = 3;
const WRITE_LEVEL = 30;
const ADMIN_LEVEL = 40;
function createGitLabTransport(cfg) {
  const api = (cfg.apiBaseUrl || "https://gitlab.com/api/v4").replace(/\/+$/, "");
  const projectUrl = `${api}/projects/${encodeURIComponent(cfg.project)}`;
  const headers = { Authorization: `Bearer ${cfg.token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };
  const pathsByHead = /* @__PURE__ */ new Map();
  async function getJson(url, action = "get") {
    const res = await gitFetch(action, url, { headers, cache: "no-store" });
    return await res.json();
  }
  async function headSha() {
    const res = await gitFetch(
      "get",
      `${projectUrl}/repository/branches/${encodeURIComponent(cfg.branch)}`,
      { headers, cache: "no-store" },
      [404]
    );
    if (!res.ok) return "";
    const data = await res.json();
    return data.commit?.id ?? "";
  }
  async function listTreeAt(head) {
    if (!head) return { headSha: "", entries: [] };
    const entries = [];
    for (let page = 1; ; page++) {
      const url = `${projectUrl}/repository/tree?${new URLSearchParams({
        ref: head,
        recursive: "true",
        per_page: "100",
        page: String(page)
      })}`;
      const res = await gitFetch("list", url, { headers, cache: "no-store" });
      const items = await res.json();
      for (const item of items) {
        if (item.type === "blob") entries.push({ path: item.path, sha: item.id });
      }
      const nextPage = res.headers.get("x-next-page");
      if (!nextPage || items.length === 0) break;
    }
    pathsByHead.set(head, new Set(entries.map((e) => e.path)));
    return { headSha: head, entries };
  }
  async function rawBlob(sha) {
    return gitFetch("get", `${projectUrl}/repository/blobs/${sha}/raw`, { headers });
  }
  async function readTexts(entries) {
    const shas = [...new Set(entries.map((e) => e.sha))];
    const bySha = await getCachedTexts(shas);
    const missing = shas.filter((sha) => !bySha.has(sha));
    const fetched = /* @__PURE__ */ new Map();
    await mapLimit(missing, 6, async (sha) => {
      fetched.set(sha, await (await rawBlob(sha)).text());
    });
    await putCachedTexts(fetched);
    const out = /* @__PURE__ */ new Map();
    for (const e of entries) {
      const text = bySha.get(e.sha) ?? fetched.get(e.sha);
      if (text !== void 0) out.set(e.path, text);
    }
    return out;
  }
  async function readBytes(entry) {
    return new Uint8Array(await (await rawBlob(entry.sha)).arrayBuffer());
  }
  async function existingPaths(head) {
    if (!head) return /* @__PURE__ */ new Set();
    return pathsByHead.get(head) ?? new Set((await listTreeAt(head)).entries.map((e) => e.path));
  }
  async function defaultBranch() {
    const project = await getJson(projectUrl);
    return project.default_branch || void 0;
  }
  async function commit(changes, opts) {
    for (let attempt = 0; ; attempt++) {
      const head = await headSha();
      if (opts.expectedHeadSha !== void 0 && head !== opts.expectedHeadSha) {
        throw new GitConflictError(`Branch ${cfg.branch} moved`, head);
      }
      const existing = await existingPaths(head);
      const actions = [];
      const after = new Set(existing);
      for (const change of changes) {
        if (change.type === "delete") {
          if (!existing.has(change.path)) continue;
          actions.push({ action: "delete", file_path: change.path });
          after.delete(change.path);
        } else {
          actions.push({
            action: existing.has(change.path) ? "update" : "create",
            file_path: change.path,
            encoding: "base64",
            content: change.encoding === "base64" ? change.content : utf8ToBase64(change.content)
          });
          after.add(change.path);
        }
      }
      if (actions.length === 0) return head;
      const body = {
        branch: cfg.branch,
        commit_message: opts.message,
        actions
      };
      if (!head) {
        const base = await defaultBranch();
        if (base && base !== cfg.branch) body.start_branch = base;
      }
      const res = await gitFetch(
        "commit",
        `${projectUrl}/repository/commits`,
        { method: "POST", headers: jsonHeaders, body: JSON.stringify(body) },
        // 400 = create/update mismatch: someone added / removed a file
        // since our listing. Refresh and retry.
        [400]
      );
      if (res.ok) {
        const created = await res.json();
        pathsByHead.set(created.id, after);
        return created.id;
      }
      pathsByHead.delete(head);
      if (opts.expectedHeadSha !== void 0 || attempt >= MAX_RETRIES) {
        throw new GitConflictError(`Commit on ${cfg.branch} rejected: ${await res.text()}`, await headSha());
      }
    }
  }
  async function permissions() {
    const [user, project] = await Promise.all([
      getJson(`${api}/user`),
      getJson(projectUrl)
    ]);
    const level = Math.max(
      project.permissions?.project_access?.access_level ?? 0,
      project.permissions?.group_access?.access_level ?? 0
    );
    return { login: user.username, canWrite: level >= WRITE_LEVEL, isAdmin: level >= ADMIN_LEVEL };
  }
  return {
    kind: "gitlab",
    label: `${cfg.project}@${cfg.branch}`,
    headSha,
    listTree: async () => listTreeAt(await headSha()),
    readTexts,
    readBytes,
    commit,
    permissions
  };
}
const IGNORED = /* @__PURE__ */ new Set([".git", "node_modules", ".DS_Store", "Thumbs.db"]);
async function ensureFolderPermission(handle, request) {
  const dir = handle;
  const desc = { mode: "readwrite" };
  if (await dir.queryPermission?.(desc) === "granted") return true;
  return false;
}
function fingerprint(entries) {
  let h = 2166136261;
  for (const e of entries) {
    const line = `${e.path}\0${e.sha}
`;
    for (let i = 0; i < line.length; i++) {
      h ^= line.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
  }
  return `local-${entries.length}-${(h >>> 0).toString(16)}`;
}
function createLocalFsTransport(handle) {
  const root = handle;
  const files = /* @__PURE__ */ new Map();
  async function walk(dir, prefix, out) {
    for await (const [name, child] of dir.entries()) {
      if (IGNORED.has(name)) continue;
      const path = prefix + name;
      if (child.kind === "directory") {
        await walk(child, path + "/", out);
      } else {
        const file = await child.getFile();
        files.set(path, child);
        out.push({ path, sha: `${file.size}:${file.lastModified}`, size: file.size });
      }
    }
  }
  async function listTree() {
    files.clear();
    const entries = [];
    await walk(root, "", entries);
    entries.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
    return { headSha: fingerprint(entries), entries };
  }
  async function fileHandle(path) {
    const cached = files.get(path);
    if (cached) return cached;
    const parts = path.split("/");
    let dir = root;
    for (const part of parts.slice(0, -1)) dir = await dir.getDirectoryHandle(part);
    return dir.getFileHandle(parts[parts.length - 1]);
  }
  async function readTexts(entries) {
    const out = /* @__PURE__ */ new Map();
    for (const e of entries) {
      try {
        out.set(e.path, await (await (await fileHandle(e.path)).getFile()).text());
      } catch {
      }
    }
    return out;
  }
  async function readBytes(entry) {
    const file = await (await fileHandle(entry.path)).getFile();
    return new Uint8Array(await file.arrayBuffer());
  }
  async function writeFile(path, bytes) {
    const parts = path.split("/");
    let dir = root;
    for (const part of parts.slice(0, -1)) dir = await dir.getDirectoryHandle(part, { create: true });
    const file = await dir.getFileHandle(parts[parts.length - 1], { create: true });
    const writable = await file.createWritable();
    await writable.write(bytes);
    await writable.close();
    files.set(path, file);
  }
  async function removeFile(path) {
    const parts = path.split("/");
    try {
      let dir = root;
      for (const part of parts.slice(0, -1)) dir = await dir.getDirectoryHandle(part);
      await dir.removeEntry(parts[parts.length - 1]);
    } catch {
    }
    files.delete(path);
  }
  async function commit(changes, opts) {
    if (opts.expectedHeadSha !== void 0) {
      const current = (await listTree()).headSha;
      if (current !== opts.expectedHeadSha) throw new GitConflictError("Folder changed on disk", current);
    }
    for (const change of changes) {
      if (change.type === "delete") await removeFile(change.path);
      else await writeFile(change.path, changeToBytes(change));
    }
    return (await listTree()).headSha;
  }
  return {
    kind: "local",
    label: root.name,
    headSha: async () => (await listTree()).headSha,
    listTree,
    readTexts,
    readBytes,
    commit,
    permissions: async () => ({
      login: "local",
      canWrite: await ensureFolderPermission(handle),
      isAdmin: true
    })
  };
}
const DB_NAME = "flexweg-folder-handles";
const STORE = "handles";
function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function loadFolderHandle(key) {
  try {
    const db = await openDb();
    return await new Promise((resolve) => {
      const req = db.transaction(STORE, "readonly").objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}
function createRemoteGitTransport(cfg) {
  return cfg.provider === "github" ? createGitHubTransport(cfg) : createGitLabTransport(cfg);
}
function joinRepoPath(dir, path) {
  const d = dir.replace(/^\/+|\/+$/g, "");
  const p = path.replace(/^\/+/, "");
  return d ? `${d}/${p}` : p;
}
const index = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GitConflictError,
  createLocalFsTransport,
  createRemoteGitTransport,
  ensureFolderPermission,
  joinRepoPath,
  loadFolderHandle
}, Symbol.toStringTag, { value: "Module" }));
export {
  GitConflictError as G,
  StorageError as S,
  createLocalFsTransport as a,
  bytesToBase64 as b,
  createRemoteGitTransport as c,
  base64ToBytes as d,
  ensureFolderPermission as e,
  base64ToUtf8 as f,
  index as g,
  instance as i,
  joinRepoPath as j,
  loadFolderHandle as l,
  mapLimit as m,
  performRequest as p,
  subscribeToToasts as s,
  toast as t
};
