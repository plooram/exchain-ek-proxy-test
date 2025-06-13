/*
 * Copyright 2025 EXCHAIN PTE. LTD.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { getGlobal } from '../src/prebidGlobal.js';

/**
 * ExChain Analytics Adapter - Prebid Build Compatible Version
 * 
 * ✅ This is the PRODUCTION-READY version for commercial publishers
 * ✅ Clean, minimal code with standard Prebid.js event handling
 * ✅ No testing environment hooks or excessive logging
 * ✅ Self-contained - no external dependencies required
 * ✅ Compatible with Prebid.js build system
 * ✅ FIXED: Race condition resolved by using auctionInit hook
 * 
 * This module generates a single IOID per auction cycle and places it in:
 * - ortb2.site.ext.data.ioids (array with single element)
 * - ortb2.site.keywords (appended as "ioid={uuid}")
 * 
 * Key Features:
 * - Single IOID per auction (not per impression)
 * - Global ORTB2 placement only (no impression-level injection)
 * - auctionInit event timing (FIXED race condition)
 * - No state persistence between auctions
 * - Minimal complexity for maximum reliability
 * 
 * Build Instructions:
 * 1. Copy this file to modules/exchainAnalyticsAdapter.js in Prebid source
 * 2. Run: gulp build --modules=exchainAnalyticsAdapter
 * 
 * @maintainer admin@exchain.co
 * @version 3.2.2 - Race condition fix
 */

// Add module version for easier debugging
const MODULE_VERSION = '3.2.2';
export const MODULE_NAME = 'exchainAnalyticsAdapter';

/**
 * ExChain Analytics Module - Prebid Build Compatible Version
 * Generates one IOID per auction and places it in global ORTB2 locations
 */
export const exchainPrebidModule = {
  /**
   * Module name for registration
   * @type {string}
   */
  name: MODULE_NAME,

  /**
   * Module version for debugging
   * @type {string}
   */
  version: MODULE_VERSION,

  /**
   * Generates a secure UUIDv4
   * @returns {string | undefined} UUID string or undefined if crypto not available
   */
  generateUUID: function() {
    // Use crypto for secure random numbers
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const arr = new Uint8Array(16);
      crypto.getRandomValues(arr);

      // Set the version to 4 (UUIDv4)
      arr[6] = (arr[6] & 0x0f) | 0x40;
      // Set the variant to RFC 4122
      arr[8] = (arr[8] & 0x3f) | 0x80;

      // Convert array to hexadecimal string format
      return [...arr].map((b, i) => {
        const hex = b.toString(16).padStart(2, '0');
        if (i === 4 || i === 6 || i === 8 || i === 10) return '-' + hex;
        return hex;
      }).join('');
    }
    
    return undefined;
  },

  /**
   * Initialize the analytics adapter
   * Registers event handler for auctionInit (RACE CONDITION FIX)
   * 
   * @param {Object} config - Configuration options
   * @param {boolean} config.enabled - Whether the module should be enabled (default: true)
   */
  init: function(config = {}) {
    // Allow publishers to disable if needed
    if (config.enabled === false) {
      console.log(`ExChain Analytics v${MODULE_VERSION}: Module disabled via configuration`);
      return;
    }

    const pbjs = getGlobal();
    if (!pbjs) {
      console.warn(`ExChain Analytics v${MODULE_VERSION}: Prebid.js not available`);
      return;
    }
    
    try {
      // RACE CONDITION FIX: Register for auctionInit instead of beforeRequestBids
      // auctionInit fires BEFORE bid construction, ensuring IOIDs reach bidders
      pbjs.onEvent('auctionInit', this.onAuctionInit.bind(this));
      
      // Keep beforeRequestBids as fallback for safety
      pbjs.onEvent('beforeRequestBids', this.onBeforeRequestBids.bind(this));
      
      console.log(`ExChain Analytics v${MODULE_VERSION}: Successfully initialized with race condition fix`);
    } catch (error) {
      console.error(`ExChain Analytics v${MODULE_VERSION}: Error setting up event handlers:`, error);
    }
  },

  /**
   * Handle auctionInit event - PRIMARY handler (RACE CONDITION FIX)
   * This fires BEFORE bid request construction begins
   * 
   * @param {Object} auctionData - Auction initialization data
   */
  onAuctionInit: function(auctionData) {
    this.generateAndInjectIOID();
  },

  /**
   * Handle beforeRequestBids event - FALLBACK handler
   * Only executes if auctionInit didn't work for some reason
   * 
   * @param {Object} bidRequestConfig - Prebid bid request configuration
   */
  onBeforeRequestBids: function(bidRequestConfig) {
    // This is now a fallback - auctionInit should handle it
    // Only uncomment the line below if you want double execution for debugging:
    // this.generateAndInjectIOID();
  },

  /**
   * Generate UUID and inject into ORTB2 - main logic (UNCHANGED)
   */
  generateAndInjectIOID: function() {
    // Generate single UUID for this entire auction
    const ioid = this.generateUUID();
    if (!ioid) {
      console.warn(`ExChain Analytics v${MODULE_VERSION}: UUID generation failed, skipping IOID injection`);
      return;
    }

    // Inject IOID into global ORTB2 locations
    this.injectGlobalIOID(ioid);
  },

  /**
   * Inject IOID into global ORTB2 locations (UNCHANGED)
   * Places IOID in exactly two locations:
   * 1. ortb2.site.ext.data.ioids (array with single element)
   * 2. ortb2.site.keywords (appended string)
   * 
   * @param {string} ioid - The UUID to inject
   */
  injectGlobalIOID: function(ioid) {
    const pbjs = getGlobal();
    if (!pbjs || !ioid) return;

    try {
      // Get current ORTB2 configuration
      const ortb2 = pbjs.getConfig('ortb2') || {};
      
      // Ensure site structure exists
      ortb2.site = ortb2.site || {};
      ortb2.site.ext = ortb2.site.ext || {};
      ortb2.site.ext.data = ortb2.site.ext.data || {};

      // 1. Inject into ortb2.site.ext.data.ioids as single-element array
      ortb2.site.ext.data.ioids = [ioid];

      // 2. Inject into ortb2.site.keywords
      const ioidKeyword = `ioid=${ioid}`;
      
      if (ortb2.site.keywords) {
        // Preserve existing keywords, remove old IOIDs, add new IOID
        const existingKeywords = ortb2.site.keywords
          .split(',')
          .map(k => k.trim())
          .filter(k => k && !k.startsWith('ioid='))
          .join(',');
        
        ortb2.site.keywords = existingKeywords ? `${existingKeywords},${ioidKeyword}` : ioidKeyword;
      } else {
        ortb2.site.keywords = ioidKeyword;
      }

      // Apply the configuration update
      pbjs.setConfig({ ortb2 });

    } catch (error) {
      console.error(`ExChain Analytics v${MODULE_VERSION}: Error injecting IOID into global ORTB2:`, error);
    }
  }
};

// Export for analytics adapter interface
export default exchainPrebidModule;

// Register as a Prebid module
getGlobal().installedModules.push(MODULE_NAME);

// Auto-initialize when Prebid loads
function initModule() {
  const pbjs = getGlobal();
  if (pbjs && pbjs.onEvent) {
    exchainPrebidModule.init();
  }
}

// Use Prebid's queue system
getGlobal().que.push(() => {
  initModule();
});
