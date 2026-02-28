/**
 * Generates PNG app icons from the master SVG icon.
 * Run once before building: node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import { readFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "..", "public", "icons");

if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

const svgBuffer = readFileSync(join(iconsDir, "icon.svg"));

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log("Generating standard icons...");
for (const size of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(join(iconsDir, `icon-${size}x${size}.png`));
  console.log(`  ✓ icon-${size}x${size}.png`);
}

console.log("\nGenerating maskable icons (with safe-zone padding)...");
for (const size of [192, 512]) {
  const innerSize = Math.floor(size * 0.8);
  const padding = Math.floor(size * 0.1);
  await sharp(svgBuffer)
    .resize(innerSize, innerSize)
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 194, g: 65, b: 12, alpha: 1 },
    })
    .png()
    .toFile(join(iconsDir, `icon-maskable-${size}x${size}.png`));
  console.log(`  ✓ icon-maskable-${size}x${size}.png`);
}

console.log("\nAll icons generated successfully in public/icons/");
