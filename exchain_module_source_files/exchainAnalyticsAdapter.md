# Overview

**Module Name:** ExChain Analytics Adapter  
**Module Type:** Analytics Adapter  
**Maintainer:** admin@exchain.co

# Description

ExChain Analytics Adapter is a Prebid.js module that generates unique Impression Opportunity Identifiers (IOIDs) for each auction. The module automatically injects a secure UUIDv4 into global ORTB2 locations to enhance analytics and tracking capabilities while maintaining privacy compliance.

## Key Features

- Generates one secure UUID per auction (not per impression)
- Automatically injects IOIDs into standard ORTB2 locations
- Privacy-first design with no user tracking
- Self-contained with no external dependencies
- Comprehensive debugging and logging tools

## ORTB2 Placement

The module places IOIDs in exactly two locations:
- `ortb2.site.ext.data.ioids` - Array with single UUID element
- `ortb2.site.keywords` - Appended as "ioid={uuid}" string

# Test Parameters

```javascript
// Basic test configuration
var adUnits = [{
    code: 'test-div',
    mediaTypes: {
        banner: {
            sizes: [[300, 250], [728, 90]]
        }
    },
    bids: [{
        bidder: 'appnexus', // Use your preferred test bidder
        params: {
            placementId: 13144370
        }
    }]
}];

// No additional configuration required for ExChain Analytics Adapter
// The module auto-initializes and generates IOIDs automatically
```

## Verification

Check browser console for:
```
✅ ExChain Analytics Adapter v3.2.1: Successfully initialized
✅ ExChain IOID successfully generated and injected!
📍 IOID in ortb2.site.ext.data.ioids: ["550e8400-e29b-41d4-a716-446655440000"]
🔤 IOID in ortb2.site.keywords: "ioid=550e8400-e29b-41d4-a716-446655440000"
```

## Debug Helper

Run `debugExchain()` in browser console for module status and ORTB2 inspection. 