const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 167, name: 'icon-167x167.png' },
  { size: 180, name: 'icon-180x180.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' }
];

const faviconSizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' }
];

async function generateIcons() {
  // 確保目錄存在
  const iconsDir = path.join(__dirname, '../public/icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // 讀取原始 logo
  const logoPath = path.join(__dirname, '../public/42.png');
  const logoBuffer = fs.readFileSync(logoPath);

  // 生成所有尺寸的圖標
  for (const { size, name } of sizes) {
    await sharp(logoBuffer)
      .resize(size, size)
      .toFile(path.join(iconsDir, name));
    console.log(`Generated ${name}`);
  }

  // 生成 favicon
  for (const { size, name } of faviconSizes) {
    await sharp(logoBuffer)
      .resize(size, size)
      .toFile(path.join(iconsDir, name));
    console.log(`Generated ${name}`);
  }

  // 生成啟動畫面
  const splashPath = path.join(__dirname, '../public/screenshots/splash.png');
  if (!fs.existsSync(path.dirname(splashPath))) {
    fs.mkdirSync(path.dirname(splashPath), { recursive: true });
  }

  await sharp(logoBuffer)
    .resize(1242, 2436, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .toFile(splashPath);
  console.log('Generated splash screen');

  // 生成截圖
  const screenshotPath = path.join(__dirname, '../public/screenshots/screenshot1.png');
  await sharp(logoBuffer)
    .resize(1080, 1920, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .toFile(screenshotPath);
  console.log('Generated screenshot');
}

generateIcons().catch(console.error); 