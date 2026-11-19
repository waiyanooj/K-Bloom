// Local-only helper: never expose filesystem paths through a web API.
const fs = require("node:fs/promises");
const path = require("node:path");
const { createHash } = require("node:crypto");
const { spawnSync } = require("node:child_process");
const readline = require("node:readline/promises");

function imageExtension(data) {
  if (data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return ".png";
  if (data[0] === 255 && data[1] === 216 && data[2] === 255) return ".jpg";
  if (["GIF87a", "GIF89a"].includes(data.toString("ascii", 0, 6))) return ".gif";
  if (data.toString("ascii", 0, 4) === "RIFF" && data.toString("ascii", 8, 12) === "WEBP") return ".webp";
  throw new Error("Use a PNG, JPEG, GIF or WebP image.");
}

async function importImage(input) {
  const source = input.trim().replace(/^"(.*)"$/, "$1");
  const info = await fs.stat(source);
  if (!info.isFile() || info.size > 20 * 1024 * 1024)
    throw new Error("Choose an image file no larger than 20 MB.");
  const data = await fs.readFile(source);
  const extension = imageExtension(data);
  const name = path.basename(source, path.extname(source)).toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "image";
  const hash = createHash("sha256").update(data).digest("hex");
  const filename = `${name}-${hash}${extension}`;
  const directory = path.resolve(__dirname, "../public/img/uploads");
  await fs.mkdir(directory, { recursive: true });
  try {
    await fs.writeFile(path.join(directory, filename), data, { flag: "wx" });
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    const existing = await fs.readFile(path.join(directory, filename));
    if (!existing.equals(data)) throw new Error("Destination differs; no file was overwritten.");
  }
  return `/img/uploads/${filename}`;
}

async function main() {
  const inputs = process.argv.slice(2);
  if (!inputs.length) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    console.log('Paste Windows "Copy as path" values, one per line. Press Enter on an empty line to finish.');
    try {
      while (true) {
        const input = await rl.question("Image path: ");
        if (!input.trim()) break;
        inputs.push(input);
      }
    } finally { rl.close(); }
  }
  if (!inputs.length) return;
  const urls = [];
  for (const input of inputs) {
    try { urls.push(await importImage(input)); }
    catch (error) {
      console.error(`Could not import ${input}: ${error.message}`);
      process.exitCode = 1;
    }
  }
  if (!urls.length) return;
  const output = urls.join("\n");
  console.log(`\nGoogle Sheets image URLs:\n${output}`);
  if (process.platform === "win32") {
    const copy = spawnSync("clip.exe", [], { input: Buffer.from(output, "utf16le"), windowsHide: true });
    console.log(copy.status === 0 ? "\nCopied to clipboard." : "\nClipboard unavailable. Copy the URLs above.");
  }
  console.log("Paste one URL into Image URL, or multiple lines inside one Detail Image URLs cell.");
  console.log("For the hosted website, deploy public/img/uploads with the app before updating Sheets.");
}

if (require.main === module) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
module.exports = { importImage, imageExtension };
