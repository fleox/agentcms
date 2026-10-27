import { main } from "./cli";

const [major] = process.versions.node.split(".").map(Number);
if (major < 20) {
  process.stderr.write(`agentcms needs Node.js 20 or newer (found ${process.versions.node}).\n`);
  process.exit(1);
}

main(process.argv.slice(2)).then((code) => {
  // Firebase / network clients keep sockets open: exit once stdout is
  // flushed rather than waiting for them.
  process.stdout.write("", () => process.exit(code));
});
