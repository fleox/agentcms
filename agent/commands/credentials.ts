import { copyToClipboard, fromAwsProfile, fromEnv, fromGh, promptHidden } from "../credentialSources";
import { forgetFirebaseSession } from "../firebaseSession";
import { CREDENTIAL_TYPES, listCredentials, parseAccount, removeCredential, requireCredential, setCredential } from "../credentials";
import { generatePassphrase } from "../../src/services/docstore/sqliteCrypto";
import { CliError, printResult } from "../output";
import { listSites } from "../sites";
import { timingSafeEqual } from "node:crypto";
import type { Command } from "./types";

// Values are never printed — not even masked.

export const credentialsCommand: Command = {
  name: "credentials",
  summary:
    "Store, list, copy, verify or remove access tokens / keys per account (<type>:<name>). `set` reads the secret from --from-env, --from-gh, --from-aws-profile, --generate (passphrases) or a hidden prompt the USER types in; `copy` puts it on the clipboard without printing it; `verify` clears the clipboard, then the USER pastes the value from where they saved it (password manager) at a hidden prompt — proof they really kept it.",
  usage: "credentials <set|list|copy|verify|remove|types> [<type>:<name>] [--from-env VAR[,VAR]] [--from-gh] [--from-aws-profile <name>] [--generate] [--field <name>]",
  options: [
    { name: "from-env", type: "string", description: "Read the value(s) from these environment variables (comma-separated, in field order)." },
    { name: "from-gh", type: "boolean", description: "github: take the token of the signed-in GitHub CLI (gh auth token)." },
    { name: "from-aws-profile", type: "string", description: "s3: import the key pair of this aws CLI profile." },
    { name: "generate", type: "boolean", description: "passphrase: generate a strong random passphrase." },
    { name: "field", type: "string", description: "copy / verify: which field (default: the first, e.g. token / passphrase)." },
  ],
  async run({ io, options, positionals }) {
    const [action = "list", account] = positionals;
    if (action === "types") {
      printResult(io, CREDENTIAL_TYPES, () =>
        Object.entries(CREDENTIAL_TYPES)
          .map(([type, c]) => `${type}: ${c.label} (${c.fields.join(", ")})\n  ${c.howTo}`)
          .join("\n"),
      );
      return;
    }
    if (action === "list") {
      const { sites } = listSites();
      const list = listCredentials().map((c) => ({
        ...c,
        usedBy: sites.filter((s) => s.credentials.data === c.account || s.credentials.hosting === c.account || s.credentials.passphrase === c.account).map((s) => s.alias),
      }));
      printResult(io, list, () =>
        list.length
          ? list.map((c) => `${c.account}  (${c.fields.join(", ")})${c.usedBy.length ? `  used by ${c.usedBy.join(", ")}` : ""}`).join("\n")
          : "No stored credentials.",
      );
      return;
    }
    if (!account) throw new CliError("usage", `credentials ${action} needs an account, e.g. github:my-login.`, undefined, 2);
    const { type } = parseAccount(account);
    if (action === "remove") {
      const removed = removeCredential(account);
      forgetFirebaseSession(account);
      printResult(io, { account, removed }, () => (removed ? `Removed ${account}.` : `${account} was not stored.`));
      return;
    }
    if (action === "copy") {
      const cred = requireCredential(account);
      const field = typeof options.field === "string" ? options.field : CREDENTIAL_TYPES[type].fields[0];
      if (!cred.values[field]) throw new CliError("usage", `${account} has no field "${field}".`, `Fields: ${Object.keys(cred.values).join(", ")}.`, 2);
      const tool = copyToClipboard(cred.values[field]);
      printResult(io, { account, field, copied: true, tool }, () => `Copied ${field} of ${account} to the clipboard.`);
      return;
    }
    if (action === "verify") {
      const cred = requireCredential(account);
      const field = typeof options.field === "string" ? options.field : CREDENTIAL_TYPES[type].fields[0];
      const stored = cred.values[field];
      if (!stored) throw new CliError("usage", `${account} has no field "${field}".`, `Fields: ${Object.keys(cred.values).join(", ")}.`, 2);
      if (!process.stdin.isTTY) {
        throw new CliError(
          "needs-terminal",
          "verify reads the value the USER pastes in their own terminal.",
          `Ask the user to run it themselves (in Claude Code: \`! npx -y @agent-cms/agentcms credentials verify ${account}\`).`,
        );
      }
      // The clipboard may still hold the value from `copy`: empty it so the
      // answer comes from where the user saved it, not from the clipboard.
      let cleared = false;
      try {
        copyToClipboard("");
        cleared = true;
      } catch {
        // No clipboard tool: nothing was copied there either.
      }
      io.err(`${cleared ? "Clipboard cleared. " : ""}Paste the ${field} of ${account} from where you saved it (password manager), then press Enter.`);
      const typed = (await promptHidden(`${field}: `)).trim();
      const a = Buffer.from(typed);
      const b = Buffer.from(stored);
      const match = a.length === b.length && timingSafeEqual(a, b);
      if (!match) {
        throw new CliError(
          "mismatch",
          `That is not the ${field} of ${account}.`,
          `The saved copy is wrong or incomplete: copy it again (\`agentcms credentials copy ${account}\`), save it again, and re-run verify.`,
        );
      }
      printResult(io, { account, field, verified: true }, () => `${field} of ${account} verified: the saved copy is correct.`);
      return;
    }
    if (action !== "set") throw new CliError("usage", `Unknown action "${action}".`, "Use set, list, copy, verify, remove or types.", 2);

    const spec = CREDENTIAL_TYPES[type];
    let values: Record<string, string>;
    if (options.generate) {
      if (type !== "passphrase") throw new CliError("usage", "--generate only applies to passphrase accounts.", undefined, 2);
      values = { passphrase: generatePassphrase() };
    } else if (typeof options["from-env"] === "string") values = fromEnv(options["from-env"].split(",").map((s) => s.trim()), spec.fields);
    else if (options["from-gh"]) {
      if (type !== "github") throw new CliError("usage", "--from-gh only applies to github accounts.", undefined, 2);
      values = fromGh();
    } else if (typeof options["from-aws-profile"] === "string") {
      if (type !== "s3") throw new CliError("usage", "--from-aws-profile only applies to s3 accounts.", undefined, 2);
      values = fromAwsProfile(options["from-aws-profile"]);
    } else {
      io.err(`${spec.label} for ${account}. ${spec.howTo}`);
      values = {};
      for (const field of spec.fields) values[field] = await promptHidden(`${field}: `);
    }
    const saved = setCredential(account, values);
    forgetFirebaseSession(account);
    printResult(io, { account, type, fields: Object.keys(saved.values) }, () => `Stored ${account} (${Object.keys(saved.values).join(", ")}).`);
  },
};
