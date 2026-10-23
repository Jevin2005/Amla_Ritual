import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { build } from "esbuild";
import sharp from "sharp";

const assets = JSON.parse(await readFile(new URL("../src/shared/media/model-assets.json", import.meta.url), "utf8"));
const bundle = await build({ entryPoints: [fileURLToPath(new URL("../src/shared/media/model-delivery.ts", import.meta.url))], bundle: true, platform: "node", format: "cjs", write: false });
const context = { module: { exports: {} } };
vm.runInNewContext(bundle.outputFiles[0].text, context);
const { optimizedModelUrl } = context.module.exports;

test("only the verified catalog models use bundled optimized jars", () => {
  for (const asset of assets) assert.equal(optimizedModelUrl(asset.source), asset.path);
  for (const source of ["/custom.glb", assets[0].source.replace("78395f4475addb2e", "new-model"), "https://example.com/jar.glb"]) {
    assert.equal(optimizedModelUrl(source), source, "new catalog uploads must remain authoritative");
  }
});

test("all six shipped jars are valid embedded GLBs with bounded texture dimensions", async () => {
  assert.equal(assets.length, 6);
  for (const asset of assets) {
    const buffer = await readFile(new URL(`../public${asset.path}`, import.meta.url));
    assert.equal(buffer.readUInt32LE(0), 0x46546c67);
    assert.equal(buffer.readUInt32LE(4), 2);
    assert.equal(buffer.readUInt32LE(8), buffer.length);
    const jsonLength = buffer.readUInt32LE(12);
    const json = JSON.parse(buffer.subarray(20, 20 + jsonLength));
    const binary = buffer.subarray(28 + jsonLength);
    assert.equal(json.buffers[0].byteLength, binary.length);
    assert.ok(json.meshes.length > 0);
    for (const view of json.bufferViews) {
      assert.equal(view.buffer, 0);
      assert.equal(view.byteOffset % 4, 0);
      assert.ok(view.byteOffset + view.byteLength <= binary.length);
    }
    let decodedBytes = 0;
    for (const image of json.images) {
      const view = json.bufferViews[image.bufferView];
      const metadata = await sharp(binary.subarray(view.byteOffset, view.byteOffset + view.byteLength)).metadata();
      assert.ok(metadata.width <= 1024 && metadata.height <= 1024, `${asset.path} texture exceeds budget`);
      decodedBytes += metadata.width * metadata.height * 4;
    }
    assert.ok(decodedBytes <= 20 * 1024 * 1024, `${asset.path} decoded textures exceed 20 MiB`);
  }
});
