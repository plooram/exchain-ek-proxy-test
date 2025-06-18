# ExChain Analytics Adapter - Legacy Debug Environment (v3.2.1)

## Overview

This is the **legacy version** that uses a direct Prebid.js build with the v3.2.1 adapter built-in. This was the original approach before the proxy injection system was developed.

## Features

- **Direct Prebid.js Build**: Uses Prebid.js 8.52.2 with v3.2.1 adapter
- **Simple Configuration**: Basic module setup
- **Standard Debugging**: Standard Prebid.js debugging tools

## Quick Start

```bash
cd 02-legacy-debug-environment/prebid-debug-environment
npm install
npm start
```

## Current Status

- 🔄 **Legacy system** - separate server and configuration
- 🔄 **Older adapter version** - v3.2.1 (no race condition fixes)
- 🔄 **Different approach** - direct build vs proxy injection

## Files

- `prebid-debug-environment/server.js` - Legacy server
- `prebid-debug-environment/config.js` - Legacy configuration
- `prebid-debug-environment/public/` - Legacy test files

## Why This Exists

This version is kept for:
- **Reference**: To compare approaches
- **Fallback**: In case proxy system has issues
- **Documentation**: Shows the evolution of the project

---

**Version**: Legacy Debug Environment  
**Status**: 🔄 **LEGACY - KEPT FOR REFERENCE** 