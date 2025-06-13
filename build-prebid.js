#!/usr/bin/env node
/**
 * Custom Prebid.js Build Script
 * 
 * Builds Prebid.js 8.52.2 with eb.dk's exact module configuration
 * as specified by Björn in his email.
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');

// eb.dk's module configuration
const modules = config.PREBID_CONFIG.CUSTOM_BUILD_MODULES;

console.log('🔧 Building custom Prebid.js with eb.dk modules...');
console.log(`📦 Modules (${modules.length}):`, modules.join(', '));

// Create the prebid build configuration
const prebidConfig = `
// Custom Prebid.js build configuration for eb.dk environment
// Generated on ${new Date().toISOString()}

const prebid = require('prebid.js');

// Configure modules
const modules = [
    ${modules.map(module => `'${module}'`).join(',\n    ')}
];

console.log('Prebid.js modules loaded:', modules);

// Export configured prebid
module.exports = prebid;
`;

// Create build directory
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
}

// Write prebid configuration
const configPath = path.join(buildDir, 'prebid-config.js');
fs.writeFileSync(configPath, prebidConfig);

console.log(`✅ Custom Prebid.js configuration created: ${configPath}`);
console.log(`🎯 Next: Use this build to replicate eb.dk's exact environment`);

// Instructions for manual build
console.log(`
📋 To complete the build:

1. Manual approach (recommended):
   - Go to https://docs.prebid.org/download.html
   - Select Prebid.js version 8.52.2
   - Add these modules: ${modules.join(', ')}
   - Download the custom build
   - Save as 'build/prebid-custom.js'

2. Alternative - Use Prebid build API:
   - The build service might not support all eb.dk modules
   - Custom adapters like 'exchainAnalyticsAdapter' may need manual integration
`); 