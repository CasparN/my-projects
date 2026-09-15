import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const docs = path.resolve(root, "../docs");
const target = path.join(root, "public/doc-assets");
const files = await fs.readdir(docs, { recursive: true });
const dimensions = {};
// This folder contains generated copies only; source files remain in ../docs.
await fs.rm(target, { recursive: true, force: true });

for (const file of files) {
  const extension = path.extname(file).toLowerCase();
  if (![".png", ".jpg", ".jpeg", ".webp", ".svg"].includes(extension)) continue;
  const source = path.join(docs, file);
  const destination = path.join(target, file);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  if (extension === ".svg") {
    await fs.copyFile(source, destination);
  } else {
    const sizes = [];
    for (const size of [640, 1600]) {
      sizes.push(
        await sharp(source)
          .rotate()
          .resize({
            width: size,
            height: size,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 90, effort: 6 })
          .toFile(`${destination}.${size}.webp`),
      );
    }
    const image = sizes[1];
    dimensions[file.replaceAll(path.sep, "/")] = {
      width: image.width,
      height: image.height,
      smallWidth: sizes[0].width,
    };
  }
}
await fs.writeFile(
  path.join(root, "src/lib/doc-media.json"),
  JSON.stringify(dimensions, null, 2) + "\n",
);
console.log(`Prepared ${Object.keys(dimensions).length} documentation images.`);
