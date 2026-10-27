import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { N as NodeSelection } from "./index--QpyX5Bx.mjs";
const blocks = /* @__PURE__ */ new Map();
const coreIds = /* @__PURE__ */ new Set();
let version = 0;
function registerCoreBlock(manifest) {
  if (blocks.has(manifest.id) && !coreIds.has(manifest.id)) {
    console.warn(`Block "${manifest.id}" already registered as a non-core block. Overwriting.`);
  }
  blocks.set(manifest.id, manifest);
  coreIds.add(manifest.id);
  version++;
}
function registerBlock(manifest) {
  if (coreIds.has(manifest.id)) {
    console.warn(`Block "${manifest.id}" collides with a core block. Plugin block ignored.`);
    return;
  }
  if (blocks.has(manifest.id)) {
    console.warn(`Block "${manifest.id}" is already registered. Overwriting.`);
  }
  blocks.set(manifest.id, manifest);
  version++;
}
function listBlocks() {
  return Array.from(blocks.values());
}
function getBlock(id) {
  return blocks.get(id);
}
function resetBlocks() {
  for (const id of Array.from(blocks.keys())) {
    if (!coreIds.has(id)) blocks.delete(id);
  }
  version++;
}
function getRegistryVersion() {
  return version;
}
function findActiveBlock(editor) {
  const all = Array.from(blocks.values());
  const $from = editor?.state?.selection?.$from;
  if (!$from) {
    for (const manifest of all) {
      if (manifest.isActive?.(editor)) return manifest;
    }
    return void 0;
  }
  const { selection } = editor.state;
  const chain = [];
  if (selection instanceof NodeSelection) {
    chain.push({
      typeName: selection.node.type.name,
      attrs: selection.node.attrs
    });
  }
  for (let depth = $from.depth; depth >= 1; depth--) {
    const node = $from.node(depth);
    chain.push({
      typeName: node.type.name,
      attrs: node.attrs
    });
  }
  function manifestNodeName(m) {
    if (m.nodeName) return m.nodeName;
    if (m.id.startsWith("core/")) {
      return m.id.slice("core/".length).replace(/-/g, "");
    }
    return m.id;
  }
  function matchesFrame(m, frame) {
    const name = manifestNodeName(m);
    const headingMatch = name.match(/^heading([1-6])$/);
    if (headingMatch) {
      const level = Number.parseInt(headingMatch[1], 10);
      return frame.typeName === "heading" && frame.attrs.level === level;
    }
    return name === frame.typeName;
  }
  for (const frame of chain) {
    const matched = all.find((m) => matchesFrame(m, frame));
    if (matched && matched.inspector) return matched;
  }
  for (const frame of chain) {
    const matched = all.find((m) => matchesFrame(m, frame));
    if (matched) return matched;
  }
  return void 0;
}
export {
  findActiveBlock,
  getBlock,
  getRegistryVersion,
  listBlocks,
  registerBlock,
  registerCoreBlock,
  resetBlocks
};
