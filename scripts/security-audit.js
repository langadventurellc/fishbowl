#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Security audit script to validate Electron security configurations
 */

function checkElectronBuilderSecurity() {
  console.log('🔒 Electron Builder Security Check:');

  try {
    const configPath = path.join(__dirname, '..', 'electron-builder.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    const fuses = config.electronFuses || {};

    // Check security fuses
    const securityChecks = [
      {
        key: 'runAsNode',
        expected: false,
        description: 'Disable Node.js integration in main process',
      },
      { key: 'enableCookieEncryption', expected: true, description: 'Enable cookie encryption' },
      {
        key: 'enableNodeOptionsEnvironmentVariable',
        expected: false,
        description: 'Disable NODE_OPTIONS env var',
      },
      {
        key: 'enableNodeCliInspectArguments',
        expected: false,
        description: 'Disable Node.js CLI inspect arguments',
      },
      {
        key: 'enableEmbeddedAsarIntegrityValidation',
        expected: true,
        description: 'Enable ASAR integrity validation',
      },
      {
        key: 'onlyLoadAppFromAsar',
        expected: true,
        description: 'Only load app from ASAR archive',
      },
      {
        key: 'grantFileProtocolExtraPrivileges',
        expected: false,
        description: 'Disable extra file protocol privileges',
      },
    ];

    let allSecure = true;

    securityChecks.forEach(({ key, expected, description }) => {
      const actual = fuses[key];
      if (actual === expected) {
        console.log(`✅ ${description}: ${actual}`);
      } else {
        console.log(`❌ ${description}: ${actual} (expected: ${expected})`);
        allSecure = false;
      }
    });

    // Check ASAR configuration
    if (config.asar === true) {
      console.log('✅ ASAR packaging enabled');
    } else {
      console.log('⚠️  ASAR packaging disabled - consider enabling for security');
      allSecure = false;
    }

    return allSecure;
  } catch (error) {
    console.log('❌ Failed to check Electron Builder configuration:', error.message);
    return false;
  }
}

function checkMainProcessSecurity() {
  console.log('\n🔒 Main Process Security Check:');

  try {
    const mainPath = path.join(__dirname, '..', 'src', 'main', 'window.ts');
    const mainContent = fs.readFileSync(mainPath, 'utf8');

    const securityChecks = [
      { pattern: /contextIsolation:\s*true/, description: 'Context isolation enabled' },
      { pattern: /nodeIntegration:\s*false/, description: 'Node integration disabled' },
      { pattern: /sandbox:\s*true/, description: 'Sandbox enabled' },
      { pattern: /webSecurity:\s*true/, description: 'Web security enabled' },
    ];

    let allSecure = true;

    securityChecks.forEach(({ pattern, description }) => {
      if (pattern.test(mainContent)) {
        console.log(`✅ ${description}`);
      } else {
        console.log(`⚠️  ${description} - not found or disabled`);
        allSecure = false;
      }
    });

    return allSecure;
  } catch (error) {
    console.log('❌ Failed to check main process security:', error.message);
    return false;
  }
}

function checkPreloadSecurity() {
  console.log('\n🔒 Preload Script Security Check:');

  try {
    const preloadPath = path.join(__dirname, '..', 'src', 'preload', 'index.ts');
    const preloadContent = fs.readFileSync(preloadPath, 'utf8');

    // Check for secure IPC patterns
    const securityChecks = [
      { pattern: /contextBridge\.exposeInMainWorld/, description: 'Context bridge used for IPC' },
      { pattern: /process\.env\.NODE_ENV/, description: 'Environment checks in place' },
      { pattern: /sanitize|validate/, description: 'Input sanitization/validation present' },
    ];

    let allSecure = true;

    securityChecks.forEach(({ pattern, description }) => {
      if (pattern.test(preloadContent)) {
        console.log(`✅ ${description}`);
      } else {
        console.log(`⚠️  ${description} - not found`);
        // Don't mark as insecure for all checks, some are optional
      }
    });

    // Check for dangerous patterns
    const dangerousPatterns = [
      { pattern: /require\(['"]child_process['"]/, description: 'Direct child_process usage' },
      { pattern: /require\(['"]fs['"]/, description: 'Direct fs module usage' },
      { pattern: /eval\s*\(/, description: 'Use of eval()' },
    ];

    dangerousPatterns.forEach(({ pattern, description }) => {
      if (pattern.test(preloadContent)) {
        console.log(`❌ Security risk: ${description}`);
        allSecure = false;
      }
    });

    return allSecure;
  } catch (error) {
    console.log('❌ Failed to check preload security:', error.message);
    return false;
  }
}

function checkDependencySecurity() {
  console.log('\n🔒 Dependency Security Check:');

  try {
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    // Check for known secure Electron version
    const electronVersion = packageData.devDependencies?.electron;
    if (electronVersion) {
      console.log(`✅ Electron version: ${electronVersion}`);
      // Check if it's a reasonably recent version (basic check)
      const versionNumber = electronVersion.replace(/[\^~]/, '');
      const majorVersion = parseInt(versionNumber.split('.')[0]);
      if (majorVersion >= 20) {
        console.log('✅ Electron version is reasonably recent');
      } else {
        console.log('⚠️  Consider updating Electron to a more recent version');
      }
    }

    // Check for security-related packages
    const securityPackages = ['helmet', 'csp', 'cors'];
    const hasSecurityPackages = securityPackages.some(
      pkg => packageData.dependencies?.[pkg] || packageData.devDependencies?.[pkg],
    );

    if (hasSecurityPackages) {
      console.log('✅ Security-related packages detected');
    } else {
      console.log('ℹ️  No explicit security packages (may not be needed for Electron app)');
    }

    return true;
  } catch (error) {
    console.log('❌ Failed to check dependencies:', error.message);
    return false;
  }
}

function generateSecurityReport() {
  console.log('\n📊 Security Audit Report:');

  const checks = [
    { name: 'Electron Builder Security', result: checkElectronBuilderSecurity() },
    { name: 'Main Process Security', result: checkMainProcessSecurity() },
    { name: 'Preload Script Security', result: checkPreloadSecurity() },
    { name: 'Dependency Security', result: checkDependencySecurity() },
  ];

  console.log('\n📋 Summary:');
  checks.forEach(({ name, result }) => {
    console.log(`${result ? '✅' : '⚠️'} ${name}: ${result ? 'PASS' : 'NEEDS ATTENTION'}`);
  });

  const allPassed = checks.every(check => check.result);

  console.log(`\n🏁 Overall Security Status: ${allPassed ? '✅ SECURE' : '⚠️  NEEDS ATTENTION'}`);

  if (!allPassed) {
    console.log('\n📝 Recommendations:');
    console.log('• Review security warnings above');
    console.log('• Enable missing security configurations');
    console.log('• Consider running: npm audit');
    console.log('• Review Electron security best practices');
  }

  return allPassed;
}

function main() {
  console.log('🔍 Security Audit Starting...\n');

  const success = generateSecurityReport();

  if (success) {
    console.log('\n✅ Security audit completed - all checks passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Security audit completed - some issues need attention.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  checkElectronBuilderSecurity,
  checkMainProcessSecurity,
  checkPreloadSecurity,
  checkDependencySecurity,
  generateSecurityReport,
};
