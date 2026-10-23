import { printResult } from "../output";
import { readVersionInfo } from "../paths";
import { compareVersions } from "../semver";
import type { Command } from "./types";

// "@scope/name" → https://registry.npmjs.org/@scope%2fname/latest
export function registryLatestUrl(name: string): string {
  return `https://registry.npmjs.org/${name.replace("/", "%2f")}/latest`;
}

// Latest published version on npm, or null when offline / not published.
export async function fetchLatestVersion(fetchImpl: typeof fetch = fetch, name = readVersionInfo().name): Promise<string | null> {
  try {
    const res = await fetchImpl(registryLatestUrl(name), { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const body = (await res.json()) as { version?: unknown };
    return typeof body.version === "string" ? body.version : null;
  } catch {
    return null;
  }
}

export const versionCommand: Command = {
  name: "version",
  summary: "Show this tool's version, the admin API version and (with --check) whether a newer release exists.",
  usage: "version [--check]",
  options: [{ name: "check", type: "boolean", description: "Ask the npm registry for the latest release." }],
  async run({ io, options }) {
    const info = readVersionInfo();
    const data: Record<string, unknown> = { ...info };
    if (options.check) {
      const latest = await fetchLatestVersion();
      data.latest = latest;
      data.updateAvailable = latest ? compareVersions(latest, info.version) > 0 : null;
    }
    printResult(io, data, () => {
      const lines = [`agentcms ${info.version} (admin API ${info.apiVersion}, data schema ${info.dataSchema})`];
      if (options.check) {
        if (!data.latest) lines.push("Could not reach the npm registry to check for updates.");
        else if (data.updateAvailable) lines.push(`Update available: ${data.latest}`);
        else lines.push("This is the latest release.");
      }
      return lines.join("\n");
    });
  },
};
