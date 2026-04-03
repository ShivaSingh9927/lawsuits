import sharp from "sharp";
import path from "path";
import fs from "fs";

const sourceLogo = path.resolve(process.cwd(), "backup_assets/TDO-black-logo-transp-01.png");
const publicDir = path.resolve(process.cwd(), "public");

const iconSpecs = [
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "android-chrome-192x192.png", size: 192 },
  { name: "android-chrome-512x512.png", size: 512 }
];

async function generateIcons() {
  console.log(`Generating icons from ${sourceLogo}...`);
  
  if (!fs.existsSync(sourceLogo)) {
    console.error("Source logo not found!");
    process.exit(1);
  }

  for (const spec of iconSpecs) {
    const targetPath = path.join(publicDir, spec.name);
    console.log(`Creating ${spec.name} (${spec.size}x${spec.size})...`);
    
    await sharp(sourceLogo)
      .resize(spec.size, spec.size)
      .toFile(targetPath);
  }

  // Also update TDO-black-logo-transp-01.webp if it exists
  const webpLogo = path.join(publicDir, "TDO-black-logo-transp-01.webp");
  console.log(`Updating ${webpLogo}...`);
  await sharp(sourceLogo).toFile(webpLogo);

  // Simple favicon.ico (using 32x32)
  const icoPath = path.join(publicDir, "favicon.ico");
  console.log(`Creating favicon.ico...`);
  await sharp(sourceLogo).resize(32, 32).toFile(icoPath);

  console.log("\n✅ BRAND ASSETS UPDATED SUCCESSFULLY!");
}

generateIcons().catch(console.error);
