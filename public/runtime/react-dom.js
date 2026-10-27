// Runtime stub for "react-dom".
const R = (typeof window !== "undefined" && window.__AGENTCMS_RUNTIME__)
  ? window.__AGENTCMS_RUNTIME__.reactDom
  : null;

if (!R) {
  throw new Error(
    "[agentcms] window.__AGENTCMS_RUNTIME__ is not initialised when react-dom was imported.",
  );
}

export default R;
export const createPortal = R.createPortal;
export const flushSync = R.flushSync;
export const unstable_batchedUpdates = R.unstable_batchedUpdates;
export const version = R.version;
