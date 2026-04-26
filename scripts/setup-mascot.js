/**
 * Setup script: Prepares mascot SVGs and splash screen.
 *
 * Run:  node scripts/setup-mascot.js
 *
 * Prerequisites:
 *   npm install --save-dev react-native-svg-transformer sharp
 */

const fs = require('fs');
const path = require('path');

const IMAGES = path.join(__dirname, '..', 'assets', 'images');

// 1. Rename "sad - no tears.svg" → "sad.svg" (spaces break imports)
const oldSad = path.join(IMAGES, 'sad - no tears.svg');
const newSad = path.join(IMAGES, 'sad.svg');

if (fs.existsSync(oldSad) && !fs.existsSync(newSad)) {
  fs.renameSync(oldSad, newSad);
  console.log('✓ Renamed "sad - no tears.svg" → "sad.svg"');
} else if (fs.existsSync(newSad)) {
  console.log('✓ sad.svg already exists');
} else {
  console.warn('⚠ Could not find "sad - no tears.svg"');
}

// 2. Convert happy_energized.svg → splash-icon.png (Expo splash requires PNG)
async function convertSplash() {
  try {
    const sharp = require('sharp');
    const svgPath = path.join(IMAGES, 'happy_energized.svg');
    const pngPath = path.join(IMAGES, 'splash-icon.png');

    // Back up the old splash
    const backupPath = path.join(IMAGES, 'splash-icon.old.png');
    if (fs.existsSync(pngPath) && !fs.existsSync(backupPath)) {
      fs.copyFileSync(pngPath, backupPath);
      console.log('✓ Backed up old splash-icon.png → splash-icon.old.png');
    }

    await sharp(svgPath)
      .resize(1024, 1024, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(pngPath);

    console.log('✓ Converted happy_energized.svg → splash-icon.png (1024×1024)');
  } catch (err) {
    console.error('✗ Could not convert SVG to PNG:', err.message);
    console.log('  Fallback: use an online SVG-to-PNG converter (e.g., svgtopng.com)');
    console.log('  Convert assets/images/happy_energized.svg → assets/images/splash-icon.png');
  }
}

convertSplash();
