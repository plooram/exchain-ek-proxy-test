# Step-by-Step Plan: ExChain Prebid.js Debug Testing Environment

## **Phase 1: Project Setup & Environment Preparation**

### Step 1: Create the Base Project Structure
- Create a new directory: `prebid-debug-environment`
- Initialize as npm project with `package.json`
- Set up the basic folder structure:
  ```
  prebid-debug-environment/
  ├── server.js (main proxy server)
  ├── public/ (static files)
  │   ├── test.html (main test page)
  │   ├── prebid-original.js (backup)
  │   └── prebid-debug.js (instrumented version)
  └── package.json
  ```

### Step 2: Install Dependencies
- **Core dependencies**: `express`, `cors`, `node-fetch`, `morgan`, `chalk`
- **Development dependencies**: `nodemon`
- Configure npm scripts for development and production

### Step 3: Environment Configuration
- Set up PowerShell-compatible commands (per user preferences)
- Configure port settings (default: 3000)
- Set up CORS and static file serving

## **Phase 2: Proxy Server Development**

### Step 4: Create the Express Proxy Server
- Build the main `server.js` with:
  - Route to proxy and modify Prebid.js files (`/prebid.js`)
  - Route to refresh Prebid.js content (`/refresh-prebid`)
  - Static file serving for test pages
  - Comprehensive logging with colored output

### Step 5: Implement Prebid.js Modification Engine
- **Fetch function**: Download original Prebid.js from remote URLs
- **Instrumentation injection**: Add comprehensive debugging code that:
  - Creates global `window.exchainDebug` object
  - Hooks into `pbjs.setConfig`, `pbjs.mergeConfig`, `pbjs.requestBids`
  - Tracks all ORTB2 changes with timestamps
  - Monitors Prebid.js events (`beforeRequestBids`, `bidRequested`, etc.)
  - Logs bid request details with IOID presence/absence

### Step 6: Debug Instrumentation Features
- **ORTB2 History Tracking**: Record every change to ORTB2 configuration
- **Event Logging**: Capture all Prebid.js events with data
- **Config Change Monitoring**: Track all setConfig/mergeConfig calls
- **Bid Request Analysis**: Monitor actual bid requests for IOID presence
- **Global Debug Functions**: `debugExchain()` and `clearExchainDebug()`

## **Phase 3: Test Interface Development**

### Step 7: Create the HTML Test Interface
- Build `public/test.html` with:
  - Debug control panel with buttons for reports and data clearing
  - Real-time status display
  - Test ad slot (300x250 banner)
  - Debug output display area
  - Prebid.js integration with proxy URL

### Step 8: JavaScript Test Functions
- **Prebid.js initialization**: Load proxied Prebid.js with debugging
- **Ad unit configuration**: Set up test ad units with AppNexus bidder
- **Debug controls**: Functions for generating reports and clearing data
- **ORTB2 inspection**: Real-time ORTB2 configuration viewing

## **Phase 4: ExChain Analytics Integration**

### Step 9: ExChain Module Integration
- Integrate the existing ExChain Analytics Adapter code
- Ensure the module generates IOIDs correctly in the debug environment
- Verify IOID placement in both required locations:
  - `ortb2.site.ext.data.ioids` (array)
  - `ortb2.site.keywords` (string)

### Step 10: IOID Lifecycle Tracking
- Monitor IOID generation timing (during `beforeRequestBids`)
- Track IOID persistence through the auction lifecycle  
- Identify points where IOIDs might be lost or overwritten
- Compare IOID presence in ORTB2 config vs. actual bid requests

## **Phase 5: Testing & Validation**

### Step 11: Basic Functionality Testing
- Start the debug server
- Load the test page
- Verify Prebid.js proxy is working
- Confirm debug instrumentation is active
- Test basic bid request flow

### Step 12: IOID Loss Detection Testing
- Run multiple auction cycles
- Generate debug reports after each cycle
- Compare ORTB2 history vs. bid request data
- Identify specific points where IOIDs disappear

### Step 13: Edge Case Testing
- Test with different Prebid.js versions
- Test with multiple bidders
- Test with different ad unit configurations
- Test rapid successive auctions

## **Phase 6: Analysis & Reporting**

### Step 14: Debug Report Analysis
- **Expected Good Case**: IOIDs present from setConfig through bid requests
- **Problem Case**: IOIDs present in setConfig but missing from bid requests
- Identify the exact sequence of events that causes IOID loss

### Step 15: Problem Identification
- Analyze the timeline of ORTB2 changes
- Identify which Prebid.js functions/events clear or overwrite ORTB2
- Document the root cause of IOID loss

### Step 16: Solution Development
- Based on findings, develop fixes for the ExChain adapter
- Test fixes in the debug environment
- Validate that IOIDs persist through the entire auction cycle

## **Phase 7: Documentation & Cleanup**

### Step 17: Results Documentation
- Document the specific problem found
- Create before/after comparisons
- Document the solution implemented

### Step 18: Environment Cleanup
- Remove temporary debug files
- Clean up any test data
- Prepare final working solution for production

## **Key Success Metrics**

1. **Debug Environment Functional**: Server runs, proxies Prebid.js, injects debugging code
2. **IOID Tracking Active**: Can monitor IOID generation and placement in ORTB2
3. **Problem Identified**: Can pinpoint exactly where/when IOIDs are lost
4. **Solution Validated**: Can confirm IOIDs persist through entire auction cycle
5. **Production Ready**: Final ExChain adapter works reliably in production environments

## **Project Context**

This debug testing environment is designed to solve a critical issue with the ExChain Analytics Adapter where ORTB2 changes containing IOIDs (Impression Opportunity Identifiers) are being lost somewhere in the Prebid.js auction lifecycle. 

### The Problem
- ExChain Analytics Adapter generates IOIDs during `beforeRequestBids` event
- IOIDs are placed in `ortb2.site.ext.data.ioids` and `ortb2.site.keywords`
- IOIDs appear to be lost before reaching actual bid requests
- Publishers report inconsistent IOID presence in bid streams

### The Solution Approach
- Proxy and instrument Prebid.js with comprehensive debugging
- Track every ORTB2 modification throughout the auction lifecycle
- Identify the exact point where IOIDs are lost or overwritten
- Develop and validate fixes to ensure IOID persistence

### Expected Outcome
A robust debugging environment that provides complete visibility into the Prebid.js auction lifecycle, enabling rapid identification and resolution of ORTB2 persistence issues.

---

**Note**: This plan provides a systematic approach to identifying and solving the ORTB2/IOID persistence issue while creating a robust debugging environment for ongoing development and testing of the ExChain Analytics Adapter. 