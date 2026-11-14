import sharp from "sharp";
import fs from "fs";
import path from "path";

const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]
  );

for (const f of walk("public").filter((f) => /\.png$/i.test(f))) {
  const before = fs.statSync(f).size;
  if (before < 300 * 1024) continue; // already small
  const buf = await sharp(f)
    .resize({ width: 1600, withoutEnlargement: true })
    .png({ palette: true, quality: 80, compressionLevel: 9, effort: 10 })
    .toBuffer();
  if (buf.length < before) {
    fs.writeFileSync(f, buf);
    console.log(f, (before / 1024) | 0, "KB ->", (buf.length / 1024) | 0, "KB");
  }
}