import type { StorageConnectorFactory } from "../registry";
import { createFilesApiConnector } from "./flexweg";

// Self-hosted PHP bridge (external/bridges/php/flexweg-bridge.php): a
// single file dropped on any PHP host (shared hosting, VPS…) that
// implements the Flexweg Files API contract over the local filesystem.
// The browser can't speak FTP / SFTP; the bridge is how a "personal
// server" becomes a publish target.

export interface PhpBridgeSettings {
  // URL of the bridge script, e.g. https://example.com/cms-bridge/flexweg-bridge.php
  apiBaseUrl: string;
  apiKey: string;
  // Public URL of the site root the bridge writes into.
  siteUrl: string;
}

export const phpBridgeFactory: StorageConnectorFactory<PhpBridgeSettings> = {
  id: "php-bridge",
  create(settings) {
    const config = {
      apiKey: settings.apiKey ?? "",
      siteUrl: (settings.siteUrl ?? "").replace(/\/+$/, ""),
      // The bridge routes on PATH_INFO: <script>/files/upload, …
      apiBaseUrl: (settings.apiBaseUrl ?? "").replace(/\/+$/, ""),
    };
    const connector = createFilesApiConnector("php-bridge", async () =>
      config.apiKey && config.apiBaseUrl ? config : null,
    );
    // Shared hosting has no meaningful plan quota to report.
    return { ...connector, capabilities: { ...connector.capabilities, storageLimits: false }, storageLimits: undefined };
  },
};
