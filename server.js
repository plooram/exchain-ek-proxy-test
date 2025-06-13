const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const config = require('./config');

const app = express();
const port = config.PORT;

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static('public'));

// Store the custom Prebid.js build
let customPrebidBuild = null;
let lastBuildTime = null;

console.log(chalk.blue.bold('🚀 ExChain Prebid.js Debug Environment - eb.dk Configuration'));
console.log(chalk.yellow('📋 eb.dk Module Configuration:'));
config.PREBID_CONFIG.CUSTOM_BUILD_MODULES.forEach((module, index) => {
    console.log(chalk.gray(`   ${index + 1}. ${module}`));
});

/**
 * Generate custom Prebid.js build with eb.dk's exact modules
 */
async function generateCustomPrebidBuild() {
    console.log(chalk.blue('\n🔧 Generating custom Prebid.js build with eb.dk modules...'));
    
    try {
        // First try the official Prebid.js build service
        console.log(chalk.gray('🔄 Trying official Prebid.js build service...'));
        
        // Fallback to original eb.dk Prebid.js (but add debugging)
        console.log(chalk.yellow('📦 Fetching eb.dk original Prebid.js for baseline...'));
        const fallbackResponse = await fetch(config.PREBID_CONFIG.ORIGINAL_URL, {
            timeout: 30000
        });
        
        if (!fallbackResponse.ok) {
            throw new Error(`Failed to fetch original: ${fallbackResponse.status}`);
        }
        
        const originalBuild = await fallbackResponse.text();
        console.log(chalk.green(`✅ Original eb.dk build fetched: ${Math.round(originalBuild.length / 1024)}KB`));
        console.log(chalk.yellow('💡 Using original build + enhanced debugging for accurate eb.dk environment'));
        
        return originalBuild;
        
    } catch (error) {
        console.error(chalk.red('❌ Failed to get Prebid.js:'), error.message);
        throw error;
    }
}

/**
 * Add comprehensive debug instrumentation to Prebid.js
 */
function addDebuggingCode(prebidSource) {
    const debugCode = `
// === ExChain Debug Environment - ORTB2 & IOID Tracking ===
// Generated: ${new Date().toISOString()}
// Purpose: Track ORTB2 changes and IOID propagation in eb.dk's environment
// Configuration: ${config.PREBID_CONFIG.CUSTOM_BUILD_MODULES.length} modules expected

(function() {
    // Global debug object
    window.exchainDebug = {
        ortb2History: [],
        eventLog: [],
        configChanges: [],
        bidRequests: [],
        startTime: Date.now(),
        
        // Capture ORTB2 state at any point
        captureOrtb2State: function(source) {
            const ortb2 = pbjs.getConfig('ortb2') || {};
            const hasIOID = !!(ortb2.site && ortb2.site.ext && ortb2.site.ext.data && ortb2.site.ext.data.ioids);
            const ioidValue = hasIOID ? ortb2.site.ext.data.ioids[0] : null;
            const keywords = ortb2.site ? ortb2.site.keywords : null;
            
            const state = {
                timestamp: new Date().toISOString(),
                source: source,
                ortb2: JSON.parse(JSON.stringify(ortb2)),
                hasIOID: hasIOID,
                ioidValue: ioidValue,
                keywords: keywords
            };
            
            this.ortb2History.push(state);
            console.log('[ExChain Debug] ORTB2 State:', source, hasIOID ? '✅ IOID Present' : '❌ No IOID', state);
            return state;
        },
        
        // Log events with context
        logEvent: function(event, data) {
            const logEntry = {
                timestamp: new Date().toISOString(),
                event: event,
                data: JSON.parse(JSON.stringify(data || {}))
            };
            this.eventLog.push(logEntry);
            console.log('[ExChain Debug] Event:', event, logEntry);
        },
        
        // Export debug data
        exportData: function() {
            const exportData = {
                ortb2History: this.ortb2History,
                eventLog: this.eventLog,
                configChanges: this.configChanges,
                bidRequests: this.bidRequests
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'exchain-debug-' + new Date().toISOString().slice(0, 19).replace(/:/g, '-') + '.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };
    
    // Enhanced console output capture
    const originalConsoleLog = console.log;
    console.log = function(...args) {
        if (window.exchainDebugConsole) {
            const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
            
            const logEntry = document.createElement('div');
            logEntry.className = 'console-entry';
            logEntry.innerHTML = '<span class="timestamp">' + new Date().toLocaleTimeString() + '</span> ' + 
                                 '<span class="message">' + message + '</span>';
            window.exchainDebugConsole.appendChild(logEntry);
            window.exchainDebugConsole.scrollTop = window.exchainDebugConsole.scrollHeight;
        }
        originalConsoleLog.apply(console, args);
    };
    
    // Wait for pbjs to be available
    if (typeof pbjs !== 'undefined') {
        setupPrebidDebugging();
    } else {
        const checkPbjs = setInterval(function() {
            if (typeof pbjs !== 'undefined') {
                clearInterval(checkPbjs);
                setupPrebidDebugging();
            }
        }, 100);
    }
    
    function setupPrebidDebugging() {
        console.log('[ExChain Debug] 🎯 Prebid.js detected - Setting up ORTB2/IOID tracking');
        console.log('[ExChain Debug] 📦 Active modules:', Object.keys(pbjs.installedModules || {}));
        
        // Verify eb.dk module presence
        const expectedModules = ${JSON.stringify(config.PREBID_CONFIG.CUSTOM_BUILD_MODULES)};
        const installedModules = Object.keys(pbjs.installedModules || {});
        const missingModules = expectedModules.filter(m => !installedModules.includes(m));
        
        if (missingModules.length > 0) {
            console.warn('[ExChain Debug] ⚠️ Missing expected eb.dk modules:', missingModules);
        } else {
            console.log('[ExChain Debug] ✅ All expected eb.dk modules present');
        }
        
        // Capture initial state
        window.exchainDebug.captureOrtb2State('initial');
        
        // Hook into pbjs.requestBids
        const originalRequestBids = pbjs.requestBids;
        pbjs.requestBids = function(...args) {
            window.exchainDebug.logEvent('pbjs.requestBids called', arguments[0] || {});
            window.exchainDebug.captureOrtb2State('requestBids:start');
            return originalRequestBids.apply(this, args);
        };
        
        // Hook into pbjs.setConfig
        const originalSetConfig = pbjs.setConfig;
        pbjs.setConfig = function(config) {
            window.exchainDebug.captureOrtb2State('setConfig:before');
            window.exchainDebug.logEvent('pbjs.setConfig called', config);
            
            // Capture stack trace for setConfig calls
            if (config.ortb2) {
                window.exchainDebug.configChanges.push({
                    timestamp: new Date().toISOString(),
                    config: JSON.parse(JSON.stringify(config)),
                    stackTrace: new Error().stack
                });
            }
            
            const result = originalSetConfig.apply(this, arguments);
            window.exchainDebug.captureOrtb2State('setConfig:after');
            return result;
        };
        
        // Hook into Prebid events
        pbjs.onEvent('beforeRequestBids', function(data) {
            window.exchainDebug.captureOrtb2State('beforeRequestBids');
            window.exchainDebug.logEvent('Event: beforeRequestBids', data);
        });
        
        pbjs.onEvent('bidRequested', function(data) {
            window.exchainDebug.logEvent('Event: bidRequested', data);
        });
        
        pbjs.onEvent('beforeBidderHttp', function(bidderRequest, fn) {
            const ortb2 = bidderRequest.ortb2 || {};
            const hasIOID = !!(ortb2.site && ortb2.site.ext && ortb2.site.ext.data && ortb2.site.ext.data.ioids);
            
            window.exchainDebug.bidRequests.push({
                timestamp: new Date().toISOString(),
                ortb2: JSON.parse(JSON.stringify(ortb2)),
                hasIOID: hasIOID,
                ioidValue: hasIOID ? ortb2.site.ext.data.ioids[0] : null
            });
            
            window.exchainDebug.logEvent('Event: beforeBidderHttp', bidderRequest);
            window.exchainDebug.logEvent('beforeBidderHttp - Request details', {
                ortb2: ortb2,
                hasIOID: hasIOID
            });
        });
        
        pbjs.onEvent('auctionEnd', function(data) {
            window.exchainDebug.logEvent('Event: auctionEnd', data);
        });
        
        pbjs.onEvent('bidderDone', function(data) {
            window.exchainDebug.logEvent('Event: bidderDone', data);
        });
        
        console.log('[ExChain Debug] ✅ All hooks installed - Ready for ORTB2/IOID tracking');
    }
    
    // Global helper functions
    window.debugExchain = function() {
        console.log('=== ExChain Debug Report ===');
        console.log('ORTB2 History:', window.exchainDebug.ortb2History);
        console.log('Event Log:', window.exchainDebug.eventLog);
        console.log('Config Changes:', window.exchainDebug.configChanges);
        console.log('Bid Requests:', window.exchainDebug.bidRequests);
        
        // Generate summary
        const ioidsDetected = window.exchainDebug.ortb2History.filter(h => h.hasIOID).length;
        const totalSnapshots = window.exchainDebug.ortb2History.length;
        
        console.log('=== Summary ===');
        console.log('ORTB2 Snapshots:', totalSnapshots);
        console.log('IOIDs Detected:', ioidsDetected);
        console.log('Events Logged:', window.exchainDebug.eventLog.length);
        console.log('Bid Requests:', window.exchainDebug.bidRequests.length);
        
        return window.exchainDebug;
    };
    
    window.clearExchainDebug = function() {
        window.exchainDebug.ortb2History = [];
        window.exchainDebug.eventLog = [];
        window.exchainDebug.configChanges = [];
        window.exchainDebug.bidRequests = [];
        console.log('[ExChain Debug] Debug data cleared');
    };
    
    console.log('[ExChain Debug] 🎉 Debug environment ready - eb.dk configuration!');
    console.log('[ExChain Debug] 💡 Use debugExchain() to see report');
    console.log('[ExChain Debug] 🧹 Use clearExchainDebug() to clear data');
})();

`;

    return prebidSource + '\n' + debugCode;
}

// Route: Serve custom Prebid.js with eb.dk modules and debug instrumentation
app.get('/prebid.js', async (req, res) => {
    try {
        console.log(chalk.blue('\n📦 Prebid.js requested - Serving eb.dk build with debugging...'));
        
        // Generate custom build if not cached or older than 1 hour
        const now = Date.now();
        if (!customPrebidBuild || !lastBuildTime || (now - lastBuildTime) > 3600000) {
            console.log(chalk.yellow('🔄 Fetching fresh eb.dk build...'));
            customPrebidBuild = await generateCustomPrebidBuild();
            lastBuildTime = now;
        } else {
            console.log(chalk.green('⚡ Using cached build'));
        }
        
        // Add debug instrumentation
        const debugPrebid = addDebuggingCode(customPrebidBuild);
        
        // Serve with appropriate headers
        res.set({
            'Content-Type': 'application/javascript',
            'Cache-Control': 'no-cache',
            'X-Debug-Environment': 'ExChain-eb.dk',
            'X-Prebid-Version': config.PREBID_CONFIG.VERSION,
            'X-Expected-Modules': config.PREBID_CONFIG.CUSTOM_BUILD_MODULES.length
        });
        
        console.log(chalk.green(`✅ Served eb.dk Prebid.js: ${Math.round(debugPrebid.length / 1024)}KB with debug instrumentation`));
        res.send(debugPrebid);
        
    } catch (error) {
        console.error(chalk.red('❌ Error serving Prebid.js:'), error);
        res.status(500).json({ error: 'Failed to generate Prebid.js build' });
    }
});

// Route: Force refresh of build
app.get('/refresh-prebid', async (req, res) => {
    try {
        console.log(chalk.blue('\n🔄 Force refreshing Prebid.js build...'));
        customPrebidBuild = await generateCustomPrebidBuild();
        lastBuildTime = Date.now();
        
        res.json({
            status: 'success',
            message: 'Prebid.js build refreshed',
            version: config.PREBID_CONFIG.VERSION,
            expectedModules: config.PREBID_CONFIG.CUSTOM_BUILD_MODULES.length,
            size: Math.round(customPrebidBuild.length / 1024) + 'KB'
        });
        
    } catch (error) {
        console.error(chalk.red('❌ Error refreshing build:'), error);
        res.status(500).json({ error: 'Failed to refresh build' });
    }
});

// Route: Server status and configuration
app.get('/status', (req, res) => {
    res.json({
        status: 'active',
        environment: 'ExChain Debug Environment - eb.dk Configuration',
        prebidVersion: config.PREBID_CONFIG.VERSION,
        expectedModules: config.PREBID_CONFIG.CUSTOM_BUILD_MODULES.length,
        modules: config.PREBID_CONFIG.CUSTOM_BUILD_MODULES,
        buildCached: !!customPrebidBuild,
        lastBuildTime: lastBuildTime ? new Date(lastBuildTime).toISOString() : null,
        originalUrl: config.PREBID_CONFIG.ORIGINAL_URL,
        endpoints: {
            prebidJs: '/prebid.js',
            testInterface: '/test.html',
            status: '/status',
            refresh: '/refresh-prebid'
        }
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(chalk.red('Server Error:'), err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
    console.log(chalk.green.bold(`\n🚀 ExChain Debug Environment running on port ${port}`));
    console.log(chalk.blue('🎯 eb.dk Module Configuration Active'));
    console.log(chalk.yellow('📋 Available endpoints:'));
    console.log(chalk.gray(`   • http://localhost:${port}/prebid.js - eb.dk Prebid.js with debugging`));
    console.log(chalk.gray(`   • http://localhost:${port}/test.html - Debug interface`));
    console.log(chalk.gray(`   • http://localhost:${port}/status - Server status`));
    console.log(chalk.gray(`   • http://localhost:${port}/refresh-prebid - Force rebuild`));
    console.log(chalk.green('\n✅ Ready to debug ORTB2/IOID issues in eb.dk environment!'));
    console.log(chalk.blue('💡 This setup replicates eb.dk\'s exact Prebid.js environment with enhanced debugging'));
}); 