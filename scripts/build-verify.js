#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Build verification script to ensure all outputs are present and valid
 */

const REQUIRED_FILES = [
  'dist/main/main/index.js',
  'dist/preload/preload/index.js',
  'dist/renderer/index.html',
  'dist/renderer/assets',
];

const DIST_DIR = path.join(__dirname, '..', 'dist');

function checkFileExists(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  const exists = fs.existsSync(fullPath);

  if (exists) {
    const stats = fs.statSync(fullPath);
    const size = stats.isFile() ? `(${Math.round(stats.size / 1024)}KB)` : '(directory)';
    console.log(`✅ ${filePath} ${size}`);
    return true;
  } else {
    console.log(`❌ ${filePath} - MISSING`);
    return false;
  }
}

function analyzeRendererBundle() {
  const rendererDir = path.join(DIST_DIR, 'renderer');
  if (!fs.existsSync(rendererDir)) {
    console.log('❌ Renderer directory missing');
    return false;
  }

  const assetsDir = path.join(rendererDir, 'assets');
  if (!fs.existsSync(assetsDir)) {
    console.log('❌ Assets directory missing');
    return false;
  }

  const assetFiles = fs.readdirSync(assetsDir);
  const jsFiles = assetFiles.filter(f => f.endsWith('.js'));
  const cssFiles = assetFiles.filter(f => f.endsWith('.css'));

  console.log(`📦 Bundle Analysis:`);
  console.log(`   JavaScript files: ${jsFiles.length}`);
  console.log(`   CSS files: ${cssFiles.length}`);

  // Check bundle sizes
  let totalSize = 0;
  assetFiles.forEach(file => {
    const filePath = path.join(assetsDir, file);
    const stats = fs.statSync(filePath);
    const sizeKB = Math.round(stats.size / 1024);
    totalSize += sizeKB;

    if (sizeKB > 500) {
      console.log(`⚠️  Large file: ${file} (${sizeKB}KB)`);
    }
  });

  console.log(`   Total bundle size: ${totalSize}KB`);

  if (totalSize > 2000) {
    console.log('⚠️  Bundle size exceeds 2MB - consider optimization');
  }

  return true;
}

function checkConfigStrict(configPath, name) {
  if (!fs.existsSync(configPath)) {
    console.log(`❌ ${name} TypeScript config - missing`);
    return false;
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    // Check if this config has strict mode directly
    if (config.compilerOptions?.strict === true) {
      console.log(`✅ ${name} TypeScript config`);
      return true;
    }

    // Check if it extends another config
    if (config.extends) {
      const baseConfigPath = path.resolve(path.dirname(configPath), config.extends);
      if (fs.existsSync(baseConfigPath)) {
        const baseConfig = JSON.parse(fs.readFileSync(baseConfigPath, 'utf8'));
        if (baseConfig.compilerOptions?.strict === true) {
          console.log(`✅ ${name} TypeScript config (extends strict)`);
          return true;
        }
      }
    }

    console.log(`⚠️  ${name} TypeScript config - missing strict settings`);
    return false;
  } catch (e) {
    console.log(`❌ ${name} TypeScript config - invalid JSON`);
    return false;
  }
}

function verifyTSConfig() {
  const mainTsConfig = path.join(__dirname, '..', 'tsconfig.main.json');
  const preloadTsConfig = path.join(__dirname, '..', 'tsconfig.preload.json');
  const rendererTsConfig = path.join(__dirname, '..', 'tsconfig.renderer.json');

  console.log('\n📋 TypeScript Configuration Check:');

  const mainValid = checkConfigStrict(mainTsConfig, 'Main');
  const preloadValid = checkConfigStrict(preloadTsConfig, 'Preload');
  const rendererValid = checkConfigStrict(rendererTsConfig, 'Renderer');

  return mainValid && preloadValid && rendererValid;
}

function main() {
  console.log('🔍 Build Verification Starting...\n');

  console.log('📁 Checking required files:');
  const filesExist = REQUIRED_FILES.every(checkFileExists);

  console.log('\n📊 Analyzing bundle:');
  const bundleValid = analyzeRendererBundle();

  const tsConfigValid = verifyTSConfig();

  console.log('\n🏁 Build Verification Summary:');

  if (filesExist && bundleValid && tsConfigValid) {
    console.log('✅ All checks passed! Build is ready for packaging.');
    process.exit(0);
  } else {
    console.log('❌ Build verification failed. Please check the issues above.');
    process.exit(1);
  }
}

main();
