import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const [input, name] = process.argv.slice(2);
if (!input || !name || !/^[a-z][a-z0-9-]+$/.test(name)) {
  console.error(
    "Usage: node scripts/prepare-photo.mjs /path/to/photo.jpg descriptive-name",
  );
  process.exit(1);
}

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "public/media");
await fs.mkdir(output, { recursive: true });
const dimensions = [];
for (const size of [640, 1600]) {
  // Sharp strips EXIF/XMP by default. Rotate before stripping EXIF orientation.
  const result = await sharp(input)
    .rotate()
    .resize({
      width: size,
      height: size,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 85, effort: 6 })
    .toFile(path.join(output, `${name}-${size}.webp`));
  dimensions.push(result);
}
const manifestPath = path.join(root, "src/lib/media.json");
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
manifest[name] = {
  width: dimensions[1].width,
  height: dimensions[1].height,
  smallWidth: dimensions[0].width,
};
await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(
  `Prepared ${name}: two WebP sizes, orientation corrected, no capture metadata.`,
);
