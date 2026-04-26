/**
 * Generate app icon PNGs from the happy_energized mascot SVG.
 * 
 * Usage: node scripts/generate-icons.js
 * 
 * Produces:
 *   - assets/images/icon.png              (1024x1024, with background)
 *   - assets/images/splash-icon.png       (512x512, transparent)
 *   - assets/images/favicon.png           (48x48)
 *   - assets/images/android-icon-foreground.png (1024x1024, padded for safe zone)
 *   - assets/images/android-icon-background.png (1024x1024, solid bg)
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ASSETS = path.join(__dirname, '..', 'assets', 'images');
const SVG_PATH = path.join(ASSETS, 'happy_energized.svg');

// Binty palette — soft green (#4F7942) accent, light blue bg from app.json (#E6F4FE)
const BG_COLOR = '#E6F4FE';  // matches android adaptiveIcon backgroundColor
const KANGKONG = '#4F7942';

async function main() {
  const svgBuf = fs.readFileSync(SVG_PATH);

  // 1. Main icon (1024x1024) — mascot centred on coloured background with padding
  console.log('Generating icon.png ...');
  const mascot768 = await sharp(svgBuf)
    .resize(700, 700, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: BG_COLOR }
  })
    .composite([{ input: mascot768, gravity: 'centre' }])
    .png()
    .toFile(path.join(ASSETS, 'icon.png'));
  console.log('  -> icon.png done');

  // 2. Splash icon (512x512, transparent bg — used by expo-splash-screen)
  console.log('Generating splash-icon.png ...');
  await sharp(svgBuf)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(ASSETS, 'splash-icon.png'));
  console.log('  -> splash-icon.png done');

  // 3. Favicon (48x48)
  console.log('Generating favicon.png ...');
  const mascot36 = await sharp(svgBuf)
    .resize(36, 36, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: { width: 48, height: 48, channels: 4, background: BG_COLOR }
  })
    .composite([{ input: mascot36, gravity: 'centre' }])
    .png()
    .toFile(path.join(ASSETS, 'favicon.png'));
  console.log('  -> favicon.png done');

  // 4. Android adaptive icon foreground (1024x1024, transparent, mascot in safe zone ~66%)
  console.log('Generating android-icon-foreground.png ...');
  const mascot620 = await sharp(svgBuf)
    .resize(580, 580, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  })
    .composite([{ input: mascot620, gravity: 'centre' }])
    .png()
    .toFile(path.join(ASSETS, 'android-icon-foreground.png'));
  console.log('  -> android-icon-foreground.png done');

  // 5. Android adaptive icon background (1024x1024 solid colour)
  console.log('Generating android-icon-background.png ...');
  await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: BG_COLOR }
  })
    .png()
    .toFile(path.join(ASSETS, 'android-icon-background.png'));
  console.log('  -> android-icon-background.png done');

  console.log('\nAll icons generated successfully!');
}

main().catch(err => { console.error(err); process.exit(1); });
