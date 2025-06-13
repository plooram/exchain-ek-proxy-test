# Prebid.js Debugging Environment Setup Guide

## Overview
This guide will help you set up a local debugging environment to proxy the Prebid.js file and trace where ORTB2 changes are being lost. You'll intercept the remote Prebid.js file, add debugging code, and serve it locally.

## Step 1: Project Setup

### Create the project structure:
```bash
mkdir prebid-debug-environment
cd prebid-debug-environment
npm init -y
```

### Install dependencies:
```bash
npm install express cors node-fetch morgan chalk
npm install --save-dev nodemon
```

### Update package.json scripts:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "debug": "node --inspect server.js"
  }
}
```

## Step 2: Create the Proxy Server

Create `server.js`:
```javascript
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const morgan = require('morgan');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.static('public'));

// Store the original Prebid.js content
let originalPrebidContent = null;
let modifiedPrebidContent = null;

// Fetch and modify Prebid.js
async function fetchAndModifyPrebid(prebidUrl) {
    try {
        console.log(chalk.blue(`Fetching original Prebid.js from: ${prebidUrl}`));
        
        const response = await fetch(prebidUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        originalPrebidContent = await response.text();
        console.log(chalk.green(`✅ Original Prebid.js fetched (${originalPrebidContent.length} characters)`));
        
        // Add debugging instrumentation
        modifiedPrebidContent = addDebuggingCode(originalPrebidContent);
        
        // Save both versions locally
        fs.writeFileSync('./public/prebid-original.js', originalPrebidContent);
        fs.writeFileSync('./public/prebid-debug.js', modifiedPrebidContent);
        
        console.log(chalk.green('✅ Prebid.js files saved locally'));
        
        return modifiedPrebidContent;
        
    } catch (error) {
        console.error(chalk.red(`❌ Error fetching Prebid.js: ${error.message}`));
        throw error;
    }
}

// Add comprehensive debugging code to Prebid.js
function addDebuggingCode(prebidCode) {
    console.log(chalk.yellow('🔧 Adding debugging instrumentation...'));
    
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
    
    console.log(chalk.green(`✅ Debug code injected (${debugCode.length} characters added)`));
    
    return modifiedCode;
}

// Route to serve the proxied Prebid.js
app.get('/prebid.js', async (req, res) => {
    try {
        const prebidUrl = req.query.url || 'https://content.lwgadm.com/prebid/8.52.2/ed5af547-1a82-4aa5-b07e-0c5b819de028/prebid.js';
        
        console.log(chalk.blue(`📡 Request for Prebid.js proxy: ${prebidUrl}`));
        
        if (!modifiedPrebidContent) {
            await fetchAndModifyPrebid(prebidUrl);
        }
        
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'no-cache');
        res.send(modifiedPrebidContent);
        
        console.log(chalk.green('✅ Served modified Prebid.js'));
        
    } catch (error) {
        console.error(chalk.red(`❌ Error serving Prebid.js: ${error.message}`));
        res.status(500).send(`// Error loading Prebid.js: ${error.message}`);
    }
});

// Route to refresh the Prebid.js file
app.post('/refresh-prebid', async (req, res) => {
    try {
        const prebidUrl = req.body.url || req.query.url;
        if (!prebidUrl) {
            return res.status(400).json({ error: 'URL parameter required' });
        }
        
        console.log(chalk.yellow('🔄 Refreshing Prebid.js...'));
        await fetchAndModifyPrebid(prebidUrl);
        
        res.json({ 
            success: true, 
            message: 'Prebid.js refreshed successfully',
            size: modifiedPrebidContent.length 
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve static files from public directory
app.use(express.static('public'));

// Start server
app.listen(PORT, () => {
    console.log(chalk.green(`\n🚀 Prebid Debug Server running on http://localhost:${PORT}`));
    console.log(chalk.blue(`📡 Proxy URL: http://localhost:${PORT}/prebid.js?url=YOUR_PREBID_URL`));
    console.log(chalk.yellow(`📁 Test page: http://localhost:${PORT}/test.html\n`));
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n👋 Shutting down Prebid Debug Server...'));
    process.exit(0);
});
```

## Step 3: Create Test HTML Page

Create `public/test.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ExChain Prebid.js Debug Test</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        .debug-panel {
            background: #f5f5f5;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .ad-slot {
            width: 300px;
            height: 250px;
            border: 2px dashed #ccc;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 20px 0;
            background: #fafafa;
        }
        button {
            background: #007cba;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin: 5px;
        }
        button:hover {
            background: #005a87;
        }
        pre {
            background: #f8f8f8;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 15px;
            overflow-x: auto;
            font-size: 12px;
        }
        .status {
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
        .status.success { background: #d4edda; border: 1px solid #c3e6cb; }
        .status.error { background: #f8d7da; border: 1px solid #f5c6cb; }
        .status.warning { background: #fff3cd; border: 1px solid #ffeaa7; }
    </style>
</head>
<body>
    <h1>🔍 ExChain Prebid.js Debug Environment</h1>
    
    <div class="debug-panel">
        <h2>Debug Controls</h2>
        <button onclick="runDebugReport()">📊 Generate Debug Report</button>
        <button onclick="clearDebugData()">🗑️ Clear Debug Data</button>
        <button onclick="testBidRequest()">🎯 Test Bid Request</button>
        <button onclick="inspectCurrentOrtb2()">🔍 Inspect Current ORTB2</button>
    </div>

    <div class="debug-panel">
        <h2>Current Status</h2>
        <div id="status-display">
            <div class="status warning">⏳ Initializing...</div>
        </div>
    </div>

    <div class="debug-panel">
        <h2>Test Ad Slot</h2>
        <div id="test-ad-slot" class="ad-slot">
            Test Ad Slot (300x250)
        </div>
    </div>

    <div class="debug-panel">
        <h2>Debug Output</h2>
        <pre id="debug-output">Debug information will appear here...</pre>
    </div>

    <!-- Load the proxied Prebid.js with debugging -->
    <script>
        // Replace this URL with your actual Prebid.js URL
        const PREBID_URL = 'https://content.lwgadm.com/prebid/8.52.2/ed5af547-1a82-4aa5-b07e-0c5b819de028/prebid.js';
        const PROXY_URL = \`/prebid.js?url=\${encodeURIComponent(PREBID_URL)}\`;
        
        // Load the proxied Prebid.js
        const script = document.createElement('script');
        script.src = PROXY_URL;
        script.onload = function() {
            initializePrebid();
        };
        script.onerror = function() {
            updateStatus('❌ Failed to load Prebid.js', 'error');
        };
        document.head.appendChild(script);
        
        function updateStatus(message, type = 'success') {
            const statusDiv = document.getElementById('status-display');
            statusDiv.innerHTML = \`<div class="status \${type}">\${message}</div>\`;
        }
        
        function updateDebugOutput(content) {
            document.getElementById('debug-output').textContent = content;
        }
        
        function initializePrebid() {
            updateStatus('✅ Prebid.js loaded successfully');
            
            // Wait for pbjs to be ready
            pbjs.que.push(function() {
                updateStatus('✅ Prebid.js initialized with ExChain debugging');
                
                // Configure ad units
                const adUnits = [{
                    code: 'test-ad-slot',
                    mediaTypes: {
                        banner: {
                            sizes: [[300, 250]]
                        }
                    },
                    bids: [{
                        bidder: 'appnexus',
                        params: {
                            placementId: 13144370 // Test placement
                        }
                    }]
                }];
                
                pbjs.addAdUnits(adUnits);
                
                // Set up your ExChain module (paste your module code here)
                // OR if it's built into Prebid.js, it should auto-initialize
                
                updateStatus('✅ Ready for testing - Check browser console for debug output');
            });
        }
        
        function runDebugReport() {
            if (typeof debugExchain === 'function') {
                const report = debugExchain();
                updateDebugOutput(JSON.stringify(report, null, 2));
            } else {
                updateDebugOutput('Debug function not available. Make sure Prebid.js is loaded.');
            }
        }
        
        function clearDebugData() {
            if (typeof clearExchainDebug === 'function') {
                clearExchainDebug();
                updateDebugOutput('Debug data cleared.');
            }
        }
        
        function testBidRequest() {
            pbjs.que.push(function() {
                updateStatus('🎯 Running test bid request...', 'warning');
                
                pbjs.requestBids({
                    bidsBackHandler: function(bids) {
                        updateStatus(\`✅ Bid request completed. Check debug output for details.\`);
                        runDebugReport();
                    }
                });
            });
        }
        
        function inspectCurrentOrtb2() {
            pbjs.que.push(function() {
                const ortb2 = pbjs.getConfig('ortb2');
                updateDebugOutput(\`Current ORTB2 Configuration:\\n\${JSON.stringify(ortb2, null, 2)}\`);
            });
        }
    </script>
</body>
</html>
```

## Step 4: Running the Debug Environment

### Start the server:
```bash
npm run dev
```

### Open your browser:
```
http://localhost:3000/test.html
```

## Step 5: Using the Debug Environment

### Browser Console Commands:
```javascript
// Generate comprehensive debug report
debugExchain()

// Clear debug data
clearExchainDebug()

// Check current ORTB2
pbjs.getConfig('ortb2')

// Check ExChain debug object
window.exchainDebug
```

### Key Things to Look For:

1. **ORTB2 History Timeline**: Track when IOIDs are added/removed
2. **Config Changes**: See all setConfig/mergeConfig calls
3. **Bid Request Analysis**: Check if IOIDs make it to actual bid requests
4. **Event Sequence**: Understand the order of Prebid events

## Step 6: Analyzing the Results

### Expected Debug Output:
```javascript
// Good case - IOID persists
{
  "ortb2History": [
    {
      "timestamp": "2025-01-15T10:30:00.000Z",
      "source": "setConfig:after",
      "hasIOID": true,
      "ioidValue": "abc123-def4-5678-90ab-cdef12345678"
    }
  ],
  "bidRequests": [
    {
      "timestamp": "2025-01-15T10:30:01.000Z",
      "bidder": "appnexus",
      "hasIOID": true,
      "ioidValue": "abc123-def4-5678-90ab-cdef12345678"
    }
  ]
}

// Bad case - IOID lost
{
  "ortb2History": [
    {
      "timestamp": "2025-01-15T10:30:00.000Z",
      "source": "setConfig:after", 
      "hasIOID": true,
      "ioidValue": "abc123-def4-5678-90ab-cdef12345678"
    },
    {
      "timestamp": "2025-01-15T10:30:00.500Z",
      "source": "requestBids:start",
      "hasIOID": false,  // <-- IOID was lost!
      "ioidValue": null
    }
  ]
}
```

## Step 7: Troubleshooting Common Issues

### Port already in use:
```bash
# Change PORT in server.js or kill existing process
lsof -ti:3000 | xargs kill -9
```

### CORS issues:
The server includes CORS headers, but if you encounter issues:
```javascript
// Add to server.js
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
```

### Debug data not appearing:
1. Check browser console for errors
2. Verify Prebid.js loaded successfully
3. Make sure your ExChain module is included in the build

This setup will give you complete visibility into the Prebid.js auction lifecycle and help you identify exactly where the ORTB2 changes are being lost.