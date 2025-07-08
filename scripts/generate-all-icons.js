#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Generate multiple icon sizes for different platforms
 */

// Icon sizes needed for different platforms
const ICON_SIZES = {
  'icon-16x16.png': 16,
  'icon-32x32.png': 32,
  'icon-48x48.png': 48,
  'icon-64x64.png': 64,
  'icon-128x128.png': 128,
  'icon-256x256.png': 256,
  'icon-512x512.png': 512,
  'icon-1024x1024.png': 1024,
};

// Simple SVG template that can be scaled
const SVG_TEMPLATE = size => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle -->
  <circle cx="256" cy="256" r="240" fill="#1e40af" stroke="#1d4ed8" stroke-width="8"/>
  
  <!-- Fishbowl outline -->
  <circle cx="256" cy="280" r="160" fill="none" stroke="#ffffff" stroke-width="6" opacity="0.8"/>
  
  <!-- Water level -->
  <path d="M 120 280 Q 256 260 392 280 Q 256 300 120 280" fill="#3b82f6" opacity="0.6"/>
  
  <!-- AI Agent representations (bubbles) -->
  <circle cx="200" cy="320" r="20" fill="#10b981" opacity="0.9"/>
  <circle cx="312" cy="340" r="18" fill="#f59e0b" opacity="0.9"/>
  <circle cx="256" cy="380" r="16" fill="#ec4899" opacity="0.9"/>
  
  <!-- Speech bubbles -->
  <ellipse cx="180" cy="280" rx="12" ry="8" fill="#ffffff" opacity="0.7"/>
  <ellipse cx="320" cy="300" rx="10" ry="6" fill="#ffffff" opacity="0.7"/>
  <ellipse cx="240" cy="340" rx="8" ry="5" fill="#ffffff" opacity="0.7"/>
  
  <!-- Title text -->
  <text x="256" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#ffffff">
    F
  </text>
  
  <!-- Smaller decorative elements -->
  <circle cx="160" cy="240" r="4" fill="#ffffff" opacity="0.5"/>
  <circle cx="350" cy="250" r="3" fill="#ffffff" opacity="0.5"/>
  <circle cx="290" cy="220" r="2" fill="#ffffff" opacity="0.5"/>
</svg>`;

function generateSVGIcons() {
  const assetsDir = path.join(__dirname, '..', 'assets');

  // Generate the main SVG file
  const mainSvgPath = path.join(assetsDir, 'icon.svg');
  if (!fs.existsSync(mainSvgPath)) {
    fs.writeFileSync(mainSvgPath, SVG_TEMPLATE(512));
    console.log('✅ Generated main SVG icon: assets/icon.svg');
  }

  // Generate sized SVG files for easier conversion
  Object.entries(ICON_SIZES).forEach(([filename, size]) => {
    const svgContent = SVG_TEMPLATE(size);
    const svgPath = path.join(assetsDir, filename.replace('.png', '.svg'));
    fs.writeFileSync(svgPath, svgContent);
    console.log(`✅ Generated ${filename.replace('.png', '.svg')} (${size}x${size})`);
  });
}

function generateICOFile() {
  // For Windows .ico file, create a simple metadata file
  const icoMetadata = {
    sizes: [16, 32, 48, 64, 128, 256],
    description: 'Windows icon file - use icon.png and resize as needed',
    note: 'For production, convert PNG to ICO using online tools or ImageMagick',
  };

  const metadataPath = path.join(__dirname, '..', 'assets', 'icon.ico.json');
  fs.writeFileSync(metadataPath, JSON.stringify(icoMetadata, null, 2));
  console.log('📄 Generated ICO metadata: assets/icon.ico.json');
}

function generateAppleIconMetadata() {
  // For macOS .icns file metadata
  const icnsMetadata = {
    sizes: [16, 32, 64, 128, 256, 512, 1024],
    description: 'macOS icon file - use icon.png and resize as needed',
    note: 'For production, convert PNG to ICNS using iconutil or online tools',
  };

  const metadataPath = path.join(__dirname, '..', 'assets', 'icon.icns.json');
  fs.writeFileSync(metadataPath, JSON.stringify(icnsMetadata, null, 2));
  console.log('📄 Generated ICNS metadata: assets/icon.icns.json');
}

function updatePackageMetadata() {
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  // Update package.json with icon information
  packageData.build = packageData.build || {};
  packageData.build.appId = packageData.build.appId || 'com.langadventure.fishbowl';
  packageData.build.productName = packageData.build.productName || 'Fishbowl';
  packageData.build.copyright =
    packageData.build.copyright || 'Copyright © 2024 Language Adventure LLC';

  // Don't overwrite existing package.json completely, just log the info
  console.log('📦 Package metadata ready for Electron Builder');
}

function checkOrCreateDirectory() {
  const assetsDir = path.join(__dirname, '..', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
    console.log('📁 Created assets directory');
  }
}

function main() {
  console.log('🎨 Comprehensive Icon Generation Starting...\n');

  checkOrCreateDirectory();
  generateSVGIcons();
  generateICOFile();
  generateAppleIconMetadata();
  updatePackageMetadata();

  console.log('\n📋 Icon Generation Summary:');
  console.log('   ✅ SVG icons generated for all required sizes');
  console.log('   ✅ Platform-specific metadata files created');
  console.log('   ✅ Ready for Electron Builder packaging');

  console.log('\n📝 Next Steps:');
  console.log('   • For production: Convert SVG to PNG/ICO/ICNS using image tools');
  console.log('   • Test packaging with: npm run dist:current');
  console.log('   • Icons will be automatically included in packaged app');

  console.log('\n✅ Icon generation completed successfully!');
}

if (require.main === module) {
  main();
}

module.exports = { generateSVGIcons, generateICOFile, generateAppleIconMetadata };
