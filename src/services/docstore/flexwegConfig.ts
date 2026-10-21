// Document-store implementation of the Flexweg API config store
// ("markdown-git" / "local" backends). Doc id "flexweg" in the `config`
// collection. Same defaults / normalisation as the Firebase impl. The
// git store keeps the apiKey out of the repo itself — this module just
// reads/writes the doc.

import { getDocStore } from "./index";
import type { FlexwegConfig } from "../flexwegConfig";

// `FlexwegConfig` is type-only — keeps the runtime import graph
// acyclic with the top-level dispatcher.

export const DEFAULT_FLEXWEG_API_BASE_URL = "https://www.flexweg.com/api/v1";

const CONFIG_ID = "flexweg";

function stripTrailingSlash(s: string): string {
  return s.replace(/\/+$/, "");
}

export async function getFlexwegConfig(): Promise<FlexwegConfig | null> {
  const store = getDocStore();
  await store.ready();
  const data = store.get("config", CONFIG_ID) as Partial<FlexwegConfig> | undefined;
  if (!data?.apiKey || !data?.siteUrl) return null;
  return {
    apiKey: data.apiKey,
    siteUrl: stripTrailingSlash(data.siteUrl),
    apiBaseUrl: stripTrailingSlash(data.apiBaseUrl ?? DEFAULT_FLEXWEG_API_BASE_URL),
  };
}

export async function setFlexwegConfig(next: FlexwegConfig): Promise<void> {
  await getDocStore().write(
    [
      {
        op: "set",
        collection: "config",
        doc: {
          id: CONFIG_ID,
          apiKey: next.apiKey,
          siteUrl: stripTrailingSlash(next.siteUrl),
          apiBaseUrl: stripTrailingSlash(next.apiBaseUrl || DEFAULT_FLEXWEG_API_BASE_URL),
        },
      },
    ],
    { message: "Update Flexweg API settings" },
  );
}
