import { readFile, writeFile } from "node:fs/promises";
import { randomBytes, pbkdf2Sync, createCipheriv } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const source = process.argv[2];
if (!source) throw new Error("Usage: node scripts/encrypt.mjs /path/to/source.html (passphrase on stdin)");
async function readPassphrase() {
  if (!process.stdin.isTTY) {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    return Buffer.concat(chunks).toString("utf8").replace(/\r?\n$/, "");
  }
  process.stderr.write("Passphrase (hidden): ");
  process.stdin.setRawMode(true);
  process.stdin.resume();
  return new Promise((resolve, reject) => {
    let value = "";
    function finish() {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.removeListener("data", onData);
      process.stderr.write("\n");
    }
    function onData(chunk) {
      for (const character of chunk.toString("utf8")) {
        if (character === "\u0003") { finish(); reject(new Error("Cancelled")); return; }
        if (character === "\r" || character === "\n") { finish(); resolve(value); return; }
        if (character === "\u007f" || character === "\b") value = value.slice(0, -1);
        else value += character;
      }
    }
    process.stdin.on("data", onData);
  });
}
const passphrase = await readPassphrase();
if (!passphrase) throw new Error("Passphrase must not be empty");
const html = await readFile(source);
const salt = randomBytes(16);
const iv = randomBytes(12);
const iterations = 600000;
const key = pbkdf2Sync(passphrase, salt, iterations, 32, "sha256");
const cipher = createCipheriv("aes-256-gcm", key, iv);
const ciphertext = Buffer.concat([cipher.update(html), cipher.final(), cipher.getAuthTag()]);
key.fill(0);
const payload = { version: 1, iterations, salt: salt.toString("base64"), iv: iv.toString("base64"), ciphertext: ciphertext.toString("base64") };
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
await writeFile(resolve(root, "content.enc.json"), JSON.stringify(payload) + "\n");
console.log(`Encrypted ${html.length} bytes. No readable source or passphrase written to the repository.`);
