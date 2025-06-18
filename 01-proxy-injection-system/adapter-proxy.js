/**
 * ExChain Analytics Adapter Proxy
 * 
 * This module intercepts the ExChain Analytics adapter loading in Prebid.js
 * and replaces it with our local version 3.2.2 that includes the race condition fix.
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');

// Path to our local adapter version
const LOCAL_ADAPTER_PATH = path.join(__dirname, 'docs', 'exchainAnalyticsAdapter_v3.2.2', 'exchain-ioid-fix.js');

/**
 * Create a proxy layer for Prebid.js that intercepts the ExChain adapter
 * @param {string} prebidSource - The original Prebid.js source code
 * @returns {string} - Modified Prebid.js with proxy code
 */
function createProxy(prebidSource) {
    console.log('[Adapter Proxy] Injecting proxy code at the beginning of Prebid.js.');
    
    // Read our local adapter
    const localAdapter = fs.readFileSync(LOCAL_ADAPTER_PATH, 'utf8');
    const adapterBase64 = Buffer.from(localAdapter, 'utf8').toString('base64');
    
    // Create proxy code that completely replaces the adapter
    const proxyCode = `
// === ExChain Analytics Adapter Proxy ===
// Generated: ${new Date().toISOString()}
// Purpose: Replace production adapter with local version 3.2.2

(function() {
    'use strict';
    
    // Store original functions
    const originalLoadModule = window.pbjs && window.pbjs.loadModule;
    const originalQue = window.pbjs && window.pbjs.que;
    
    // Function to load our v3.2.2 adapter
    function loadV3_2_2Adapter() {
        try {
            console.log('[ExChain Proxy] Loading v3.2.2 adapter...');
            
            // Decode and execute our adapter
            const adapterCode = atob('${adapterBase64}');
            eval(adapterCode);
            
            console.log('[ExChain Proxy] ✅ Successfully loaded v3.2.2 adapter');
            
            // Verify the adapter is working
            if (typeof window.pbjs !== 'undefined' && window.pbjs.analytics) {
                const adapter = window.pbjs.analytics.find(a => a.name === 'exchainAnalyticsAdapter');
                if (adapter) {
                    console.log('[ExChain Proxy] ✅ v3.2.2 adapter registered successfully');
                    return true;
                }
            }
            
            console.log('[ExChain Proxy] ⚠️ Adapter not found in pbjs.analytics');
            return false;
        } catch (error) {
            console.error('[ExChain Proxy] ❌ Error loading v3.2.2 adapter:', error);
            return false;
        }
    }
    
    // Override pbjs.loadModule to intercept exchainAnalyticsAdapter
    if (window.pbjs && window.pbjs.loadModule) {
        window.pbjs.loadModule = function(moduleName) {
            if (moduleName === 'exchainAnalyticsAdapter') {
                console.log('[ExChain Proxy] Intercepted loadModule call for exchainAnalyticsAdapter');
                return loadV3_2_2Adapter();
            }
            return originalLoadModule.apply(this, arguments);
        };
    }
    
    // Override pbjs.que to ensure our adapter loads
    if (window.pbjs) {
        const originalPush = window.pbjs.que ? window.pbjs.que.push : function() {};
        
        if (!window.pbjs.que) {
            window.pbjs.que = [];
        }
        
        window.pbjs.que.push = function(fn) {
            // Call the original function first
            const result = originalPush.call(this, fn);
            
            // Check if this is an adapter initialization
            if (typeof fn === 'function') {
                try {
                    // Execute the function to see if it's loading the adapter
                    fn();
                    
                    // Check if we need to replace the adapter
                    if (window.pbjs.analytics) {
                        const existingAdapter = window.pbjs.analytics.find(a => a.name === 'exchainAnalyticsAdapter');
                        if (existingAdapter) {
                            // Check if it's the old version
                            const adapterCode = existingAdapter.toString();
                            if (adapterCode.includes('v3.2.1') || !adapterCode.includes('v3.2.2')) {
                                console.log('[ExChain Proxy] 🔄 Replacing old adapter with v3.2.2...');
                                
                                // Remove the old adapter
                                const index = window.pbjs.analytics.indexOf(existingAdapter);
                                if (index > -1) {
                                    window.pbjs.analytics.splice(index, 1);
                                }
                                
                                // Load the new adapter
                                loadV3_2_2Adapter();
                            }
                        }
                    }
                } catch (e) {
                    // Function execution failed, continue normally
                }
            }
            
            return result;
        };
    }
    
    // Aggressive replacement strategy - run periodically
    function ensureV3_2_2Adapter() {
        if (window.pbjs && window.pbjs.analytics) {
            const adapter = window.pbjs.analytics.find(a => a.name === 'exchainAnalyticsAdapter');
            if (adapter) {
                const adapterCode = adapter.toString();
                if (adapterCode.includes('v3.2.1') || !adapterCode.includes('v3.2.2')) {
                    console.log('[ExChain Proxy] 🔄 Aggressive replacement: Removing old adapter');
                    
                    // Remove old adapter
                    const index = window.pbjs.analytics.indexOf(adapter);
                    if (index > -1) {
                        window.pbjs.analytics.splice(index, 1);
                    }
                    
                    // Load new adapter
                    loadV3_2_2Adapter();
                } else {
                    console.log('[ExChain Proxy] ✅ v3.2.2 adapter confirmed active');
                }
            } else {
                console.log('[ExChain Proxy] 🔄 No adapter found, loading v3.2.2...');
                loadV3_2_2Adapter();
            }
        }
    }
    
    // Run replacement check periodically
    let checkCount = 0;
    const maxChecks = 10;
    const checkInterval = setInterval(() => {
        checkCount++;
        if (checkCount > maxChecks) {
            clearInterval(checkInterval);
            return;
        }
        
        if (window.pbjs) {
            ensureV3_2_2Adapter();
        }
    }, 500);
    
    console.log('[ExChain Proxy] Proxy installed successfully');
})();
`;

    // Always inject at the very beginning to avoid syntax conflicts
    return proxyCode + '\n' + prebidSource;
}

module.exports = { createProxy }; 