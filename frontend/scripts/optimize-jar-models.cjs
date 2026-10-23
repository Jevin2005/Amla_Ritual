/* eslint-disable @typescript-eslint/no-require-imports -- Sharp uses its CommonJS native entrypoint on Windows. */
const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");
const assets = require("../src/shared/media/model-assets.json");

// Preserve geometry, materials and texture channels. Only resize embedded
// textures, then repack buffer views at the four-byte boundaries GLB requires.
async function optimize(input) {
  if (input.readUInt32LE(0) !== 0x46546c67 || input.readUInt32LE(4) !== 2 || input.readUInt32LE(8) !== input.length) {
    throw new Error("Expected a complete GLB 2.0 file");
  }
  const jsonLength = input.readUInt32LE(12);
  const json = JSON.parse(input.subarray(20, 20 + jsonLength).toString());
  if (json.buffers.length !== 1 || json.buffers[0].uri) throw new Error("Expected one embedded buffer");
  const binary = input.subarray(28 + jsonLength);
  const imageViews = new Map(json.images.map((image) => [image.bufferView, image]));
  // The flower model has 17 maps instead of five. Keep its total texture
  // footprint within the same mobile budget as the other jars.
  const textureSize = json.images.length > 5 ? 512 : 1024;
  const chunks = [];
  let length = 0;
  for (let index = 0; index < json.bufferViews.length; index++) {
    const view = json.bufferViews[index];
    let chunk = binary.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength);
    const image = imageViews.get(index);
    if (image) {
      const resized = sharp(chunk).resize({ width: textureSize, height: textureSize, fit: "inside", withoutEnlargement: true });
      chunk = image.mimeType === "image/png"
        ? await resized.png().toBuffer()
        : await resized.jpeg({ quality: 90, chromaSubsampling: "4:4:4" }).toBuffer();
    }
    view.byteOffset = length;
    view.byteLength = chunk.length;
    const padding = Buffer.alloc((4 - chunk.length % 4) % 4);
    chunks.push(chunk, padding);
    length += chunk.length + padding.length;
  }
  json.buffers[0].byteLength = length;
  const rawJson = Buffer.from(JSON.stringify(json));
  const packedJson = Buffer.concat([rawJson, Buffer.alloc((4 - rawJson.length % 4) % 4, 0x20)]);
  const header = Buffer.alloc(20);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(28 + packedJson.length + length, 8);
  header.writeUInt32LE(packedJson.length, 12);
  header.writeUInt32LE(0x4e4f534a, 16);
  const binaryHeader = Buffer.alloc(8);
  binaryHeader.writeUInt32LE(length, 0);
  binaryHeader.writeUInt32LE(0x004e4942, 4);
  return Buffer.concat([header, packedJson, binaryHeader, ...chunks]);
}

async function main() {
  for (const asset of assets) {
    const response = await fetch(asset.source);
    if (!response.ok) throw new Error(`${response.status}: ${asset.source}`);
    const input = Buffer.from(await response.arrayBuffer());
    const output = await optimize(input);
    const destination = path.join(__dirname, "../public", asset.path);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, output);
    console.log(`${asset.path}: ${input.length} -> ${output.length} bytes`);
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
