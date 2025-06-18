// ExChain Prebid.js Debug Environment - Main Proxy Server
// This file will contain the Express server that proxies and instruments Prebid.js

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const morgan = require('morgan');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const config = require('./config');

// Initialize Express app
const app = express();
const PORT = config.server.port;

// Store the original and modified Prebid.js content
let originalPrebidContent = null;
let modifiedPrebidContent = null;

// Middleware setup
app.use(cors({
    origin: config.cors.origin,
    methods: config.cors.methods,
    allowedHeaders: config.cors.allowedHeaders.split(',')
}));

app.use(morgan(config.logging.level));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(config.files.publicDir));

// Utility function for colored logging
function log(message, type = 'info') {
    if (!config.logging.enableConsoleLogs) return;
    
    const timestamp = new Date().toISOString();
    switch (type) {
        case 'success':
            console.log(chalk.green(`✅ [${timestamp}] ${message}`));
            break;
        case 'error':
            console.log(chalk.red(`❌ [${timestamp}] ${message}`));
            break;
        case 'warning':
            console.log(chalk.yellow(`⚠️ [${timestamp}] ${message}`));
            break;
        case 'info':
            console.log(chalk.blue(`ℹ️ [${timestamp}] ${message}`));
            break;
        default:
            console.log(`[${timestamp}] ${message}`);
    }
}

// Fetch and modify Prebid.js from remote URL
async function fetchAndModifyPrebid(prebidUrl) {
    try {
        log(`Fetching original Prebid.js from: ${prebidUrl}`, 'info');
        
        const response = await fetch(prebidUrl, {
            headers: {
                'User-Agent': 'ExChain-Debug-Environment/1.0.0'
            },
            timeout: 30000 // 30 second timeout
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        originalPrebidContent = await response.text();
        log(`Original Prebid.js fetched (${originalPrebidContent.length} characters)`, 'success');
        
        // Add debugging instrumentation
        modifiedPrebidContent = addDebuggingCode(originalPrebidContent);
        
        // Save both versions locally if enabled
        if (config.debug.saveOriginalPrebid) {
            const originalPath = path.join(config.files.publicDir, config.files.originalPrebidFilename);
            fs.writeFileSync(originalPath, originalPrebidContent);
            log(`Original Prebid.js saved to ${originalPath}`, 'success');
        }
        
        if (config.debug.saveDebugPrebid) {
            const debugPath = path.join(config.files.publicDir, config.files.debugPrebidFilename);
            fs.writeFileSync(debugPath, modifiedPrebidContent);
            log(`Debug Prebid.js saved to ${debugPath}`, 'success');
        }
        
        return modifiedPrebidContent;
        
    } catch (error) {
        log(`Error fetching Prebid.js: ${error.message}`, 'error');
        throw error;
    }
}

// Add comprehensive debugging code to Prebid.js
function addDebuggingCode(prebidCode) {
    log('Adding debugging instrumentation to Prebid.js...', 'info');
    
    // Debug code to inject
    const debugCode = `
/* ===== EXCHAIN DEBUGGING INSTRUMENTATION ===== */
(function() {
    console.log('%c🚀 ExChain Debug Mode Active', 'color: #00ff00; font-weight: bold; font-size: 16px;');
    
    // Create global debug object
    window.exchainDebug = {
        ortb2History: [],
        eventLog: [],
        configChanges: [],
        bidRequests: [],
        
        // Log function with timestamp
        log: function(event, data) {
            const timestamp = new Date().toISOString();
            const logEntry = { timestamp, event, data: JSON.parse(JSON.stringify(data)) };
            this.eventLog.push(logEntry);
            console.log('%c[ExChain Debug]', 'color: #ff6b35; font-weight: bold;', event, data);
        },
        
        // Track ORTB2 changes
        trackOrtb2: function(source, ortb2Data) {
            const timestamp = new Date().toISOString();
            const snapshot = {
                timestamp,
                source,
                ortb2: JSON.parse(JSON.stringify(ortb2Data || {})),
                hasIOID: !!(ortb2Data?.site?.ext?.data?.ioids?.length > 0),
                ioidValue: ortb2Data?.site?.ext?.data?.ioids?.[0] || null,
                keywords: ortb2Data?.site?.keywords || null
            };
            this.ortb2History.push(snapshot);
            console.log('%c[ORTB2 Tracker]', 'color: #4ecdc4; font-weight: bold;', source, snapshot);
        },
        
        // Get debug report
        getReport: function() {
            return {
                ortb2History: this.ortb2History,
                eventLog: this.eventLog,
                configChanges: this.configChanges,
                bidRequests: this.bidRequests
            };
        },
        
        // Clear debug data
        clear: function() {
            this.ortb2History = [];
            this.eventLog = [];
            this.configChanges = [];
            this.bidRequests = [];
            console.log('%c[ExChain Debug] Data cleared', 'color: #ff6b35;');
        }
    };
    
    // Helper function to deeply clone objects
    function deepClone(obj) {
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch (e) {
            return obj;
        }
    }
    
    // Store original methods we'll override
    const originalMethods = {};
    
    // Wait for pbjs to be available
    function waitForPbjs(callback) {
        if (typeof pbjs !== 'undefined' && pbjs.getConfig) {
            callback();
        } else {
            setTimeout(() => waitForPbjs(callback), 50);
        }
    }
    
    waitForPbjs(function() {
        console.log('%c🎯 Prebid.js detected, installing hooks...', 'color: #00ff00; font-weight: bold;');
        
        // Hook pbjs.setConfig
        if (pbjs.setConfig) {
            originalMethods.setConfig = pbjs.setConfig;
            pbjs.setConfig = function(config) {
                window.exchainDebug.log('pbjs.setConfig called', config);
                window.exchainDebug.configChanges.push({
                    timestamp: new Date().toISOString(),
                    config: deepClone(config),
                    stackTrace: new Error().stack
                });
                
                // Track ORTB2 before
                if (config.ortb2) {
                    window.exchainDebug.trackOrtb2('setConfig:before', pbjs.getConfig('ortb2'));
                }
                
                const result = originalMethods.setConfig.apply(this, arguments);
                
                // Track ORTB2 after
                if (config.ortb2) {
                    window.exchainDebug.trackOrtb2('setConfig:after', pbjs.getConfig('ortb2'));
                }
                
                return result;
            };
        }
        
        // Hook pbjs.mergeConfig  
        if (pbjs.mergeConfig) {
            originalMethods.mergeConfig = pbjs.mergeConfig;
            pbjs.mergeConfig = function(config) {
                window.exchainDebug.log('pbjs.mergeConfig called', config);
                
                const result = originalMethods.mergeConfig.apply(this, arguments);
                
                if (config.ortb2) {
                    window.exchainDebug.trackOrtb2('mergeConfig:after', pbjs.getConfig('ortb2'));
                }
                
                return result;
            };
        }
        
        // Hook pbjs.requestBids
        if (pbjs.requestBids) {
            originalMethods.requestBids = pbjs.requestBids;
            pbjs.requestBids = function(requestConfig) {
                window.exchainDebug.log('pbjs.requestBids called', requestConfig);
                window.exchainDebug.trackOrtb2('requestBids:start', pbjs.getConfig('ortb2'));
                
                return originalMethods.requestBids.apply(this, arguments);
            };
        }
        
        // Hook event system
        if (pbjs.onEvent) {
            // Track all events
            ['beforeRequestBids', 'bidRequested', 'bidResponse', 'bidderDone', 'auctionEnd', 'beforeBidderHttp'].forEach(eventName => {
                pbjs.onEvent(eventName, function(eventData) {
                    window.exchainDebug.log(\`Event: \${eventName}\`, eventData);
                    
                    if (eventName === 'beforeRequestBids') {
                        window.exchainDebug.trackOrtb2('beforeRequestBids', pbjs.getConfig('ortb2'));
                    }
                    
                    if (eventName === 'beforeBidderHttp') {
                        window.exchainDebug.log('beforeBidderHttp - Request details', {
                            bidder: eventData.bidder,
                            ortb2: eventData.ortb2,
                            hasIOID: !!(eventData.ortb2?.site?.ext?.data?.ioids?.length > 0)
                        });
                        window.exchainDebug.bidRequests.push({
                            timestamp: new Date().toISOString(),
                            bidder: eventData.bidder,
                            ortb2: deepClone(eventData.ortb2),
                            hasIOID: !!(eventData.ortb2?.site?.ext?.data?.ioids?.length > 0),
                            ioidValue: eventData.ortb2?.site?.ext?.data?.ioids?.[0] || null
                        });
                    }
                });
            });
        }
        
        console.log('%c✅ All debugging hooks installed successfully!', 'color: #00ff00; font-weight: bold;');
    });
    
    // Global debug helper functions
    window.debugExchain = function() {
        console.log('%c=== EXCHAIN DEBUG REPORT ===', 'color: #ff6b35; font-size: 18px; font-weight: bold;');
        const report = window.exchainDebug.getReport();
        
        console.log('%cORTB2 History:', 'color: #4ecdc4; font-weight: bold;', report.ortb2History);
        console.log('%cEvent Log:', 'color: #4ecdc4; font-weight: bold;', report.eventLog);
        console.log('%cConfig Changes:', 'color: #4ecdc4; font-weight: bold;', report.configChanges);
        console.log('%cBid Requests:', 'color: #4ecdc4; font-weight: bold;', report.bidRequests);
        
        // Summary
        const ioidSnapshots = report.ortb2History.filter(h => h.hasIOID);
        const ioidRequests = report.bidRequests.filter(r => r.hasIOID);
        
        console.log('%c=== SUMMARY ===', 'color: #ff6b35; font-size: 16px; font-weight: bold;');
        console.log(\`📊 Total ORTB2 snapshots: \${report.ortb2History.length}\`);
        console.log(\`✅ Snapshots with IOID: \${ioidSnapshots.length}\`);
        console.log(\`📡 Total bid requests: \${report.bidRequests.length}\`);
        console.log(\`✅ Bid requests with IOID: \${ioidRequests.length}\`);
        
        return report;
    };
    
    window.clearExchainDebug = function() {
        window.exchainDebug.clear();
    };
    
})();
/* ===== END EXCHAIN DEBUGGING INSTRUMENTATION ===== */

`;

    // Insert debug code near the beginning of the file, after any initial comments
    const insertionPoint = prebidCode.indexOf('(function') > -1 ? 
        prebidCode.indexOf('(function') : 
        Math.min(prebidCode.length, 1000);
    
    const modifiedCode = 
        prebidCode.slice(0, insertionPoint) + 
        debugCode + 
        prebidCode.slice(insertionPoint);
    
    log(`Debug code injected (${debugCode.length} characters added)`, 'success');
    
    return modifiedCode;
}

// Route to serve the proxied Prebid.js
app.get('/prebid.js', async (req, res) => {
    try {
        const prebidUrl = req.query.url || config.prebid.defaultUrl;
        
        log(`Request for Prebid.js proxy: ${prebidUrl}`, 'info');
        
        if (!modifiedPrebidContent) {
            await fetchAndModifyPrebid(prebidUrl);
        }
        
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(modifiedPrebidContent);
        
        log('Served modified Prebid.js', 'success');
        
    } catch (error) {
        log(`Error serving Prebid.js: ${error.message}`, 'error');
        res.status(500).send(`// Error loading Prebid.js: ${error.message}`);
    }
});

// Route to refresh the Prebid.js file
app.post('/refresh-prebid', async (req, res) => {
    try {
        const prebidUrl = req.body.url || req.query.url || config.prebid.defaultUrl;
        
        log('Refreshing Prebid.js...', 'warning');
        await fetchAndModifyPrebid(prebidUrl);
        
        res.json({ 
            success: true, 
            message: 'Prebid.js refreshed successfully',
            size: modifiedPrebidContent.length,
            timestamp: new Date().toISOString()
        });
        
        log('Prebid.js refreshed successfully', 'success');
        
    } catch (error) {
        log(`Error refreshing Prebid.js: ${error.message}`, 'error');
        res.status(500).json({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Route to get server status
app.get('/status', (req, res) => {
    res.json({
        status: 'running',
        timestamp: new Date().toISOString(),
        config: {
            port: PORT,
            nodeEnv: config.server.nodeEnv,
            debugMode: config.debug.mode
        },
        prebid: {
            originalLoaded: !!originalPrebidContent,
            modifiedLoaded: !!modifiedPrebidContent,
            originalSize: originalPrebidContent ? originalPrebidContent.length : 0,
            modifiedSize: modifiedPrebidContent ? modifiedPrebidContent.length : 0
        }
    });
});

// Default route
app.get('/', (req, res) => {
    res.redirect('/test.html');
});

// Error handling middleware
app.use((err, req, res, next) => {
    log(`Server error: ${err.message}`, 'error');
    res.status(500).json({ 
        error: 'Internal server error',
        message: config.server.nodeEnv === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    log(`404 - Not found: ${req.url}`, 'warning');
    res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(chalk.green(`\n🚀 ExChain Prebid Debug Server running on http://localhost:${PORT}`));
    console.log(chalk.blue(`📡 Proxy URL: http://localhost:${PORT}/prebid.js?url=YOUR_PREBID_URL`));
    console.log(chalk.yellow(`📁 Test page: http://localhost:${PORT}/test.html`));
    console.log(chalk.magenta(`🔍 Server status: http://localhost:${PORT}/status`));
    console.log(chalk.cyan(`📊 Configuration loaded from: ${path.resolve('./config.js')}\n`));
    
    log('ExChain Prebid Debug Server started successfully', 'success');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    log('Shutting down ExChain Debug Server...', 'warning');
    process.exit(0);
});

process.on('SIGTERM', () => {
    log('Received SIGTERM, shutting down gracefully...', 'warning');
    process.exit(0);
});

module.exports = app; 