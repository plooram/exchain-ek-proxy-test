/**
 * ExChain Prebid.js Debug Environment Configuration
 * JavaScript configuration file for environment settings
 */

const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    host: process.env.HOST || 'localhost'
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: process.env.CORS_HEADERS || 'Content-Type,Authorization,X-Requested-With'
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'combined',
    enableColoredLogs: process.env.ENABLE_COLORED_LOGS !== 'false',
    enableConsoleLogs: process.env.ENABLE_CONSOLE_LOGS !== 'false'
  },

  // Debug Configuration
  debug: {
    mode: process.env.DEBUG_MODE !== 'false',
    saveOriginalPrebid: process.env.SAVE_ORIGINAL_PREBID !== 'false',
    saveDebugPrebid: process.env.SAVE_DEBUG_PREBID !== 'false'
  },

  // Prebid.js Configuration
  prebid: {
    defaultUrl: process.env.DEFAULT_PREBID_URL || 
      'https://content.lwgadm.com/prebid/8.52.2/ed5af547-1a82-4aa5-b07e-0c5b819de028/prebid.js'
  },

  // File Storage Configuration
  files: {
    publicDir: process.env.PUBLIC_DIR || 'public',
    originalPrebidFilename: process.env.ORIGINAL_PREBID_FILENAME || 'prebid-original.js',
    debugPrebidFilename: process.env.DEBUG_PREBID_FILENAME || 'prebid-debug.js'
  },

  // PowerShell Compatibility Settings
  powershell: {
    // Commands for PowerShell compatibility
    commands: {
      listProcess: 'Get-Process',
      listFiles: 'Get-ChildItem', 
      removeFile: 'Remove-Item',
      copyFile: 'Copy-Item',
      moveFile: 'Move-Item'
    },
    isWindows: process.platform === 'win32'
  }
};

module.exports = config; 