# ExChain Analytics Adapter - Prebid.js Debug Environment

## Overview

This project contains **three different implementations** of the ExChain Analytics Adapter for testing and debugging in Prebid.js environments. Each version represents a different approach to solving the adapter integration challenges.

## Project Structure

```
Exchain_EK_Proxy_Test/
├── 01-proxy-injection-system/     # Current working version (v3.2.2 proxy)
├── 02-legacy-debug-environment/   # Legacy version (v3.2.1 direct build)
├── 03-custom-prebid-build/        # New version (publisher's 26 modules)
├── docs/                          # Shared documentation
│   ├── exchainAnalyticsAdapter_v3.2.2/
│   │   └── exchain-ioid-fix.js    # v3.2.2 adapter with race condition fix
│   ├── build-our-own-prebid-solution.md  # Implementation plan
│   ├── handover-summary.md        # System status and handover documentation
│   └── DebugAndConsoleLogs/       # Debug output directory
└── README.md                      # This file
```

## Three Implementation Approaches

### 1. **Proxy Injection System** (`01-proxy-injection-system/`)
- **Status**: ✅ **Currently Working**
- **Method**: Intercepts Prebid.js from eb.dk and injects v3.2.2 adapter
- **Features**: Base64 encoding, enhanced debugging, eb.dk configuration
- **Issues**: Dual adapter versions, IOID timing problems
- **Quick Start**: `cd 01-proxy-injection-system && npm start`

### 2. **Legacy Debug Environment** (`02-legacy-debug-environment/`)
- **Status**: 🔄 **Legacy/Reference**
- **Method**: Direct Prebid.js build with v3.2.1 adapter built-in
- **Features**: Simple configuration, standard debugging
- **Issues**: Older adapter version, no race condition fixes
- **Purpose**: Reference and fallback system

### 3. **Custom Prebid.js Build** (`03-custom-prebid-build/`)
- **Status**: 📋 **Planned Implementation**
- **Method**: Build our own Prebid.js with publisher's exact 26 modules
- **Features**: Single adapter version, proxy redirection, clean implementation
- **Benefits**: Eliminates all current issues, exact production match
- **Plan**: See `docs/build-our-own-prebid-solution.md`

## Quick Start

### Current Working Version
```bash
cd 01-proxy-injection-system
npm install
npm start
```
Then visit: `http://localhost:3000/test.html`

### Legacy Version
```bash
cd 02-legacy-debug-environment/prebid-debug-environment
npm install
npm start
```

## Key Features Across All Versions

- **ExChain Analytics Adapter**: Generates IOID (Impression Opportunity ID) for each auction
- **ORTB2 Integration**: Injects IOID into global ORTB2 configuration
- **Debug Capabilities**: Enhanced logging and monitoring
- **Test Interfaces**: Sophisticated testing and validation tools

## Development Evolution

1. **Started with**: Legacy direct build approach (v3.2.1)
2. **Evolved to**: Proxy injection system (v3.2.2) - current working version
3. **Planning**: Custom Prebid.js build (v3.2.2) - future implementation

## Current Focus

The **proxy injection system** (01-proxy-injection-system) is currently the main working version, but we're planning to implement the **custom Prebid.js build** approach to eliminate all current technical issues.

## Documentation

- **Implementation Plan**: `docs/build-our-own-prebid-solution.md`
- **Handover Summary**: `docs/handover-summary.md`
- **Adapter Code**: `docs/exchainAnalyticsAdapter_v3.2.2/exchain-ioid-fix.js`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary to ExChain Pte Ltd.

## Contact

- **Repository**: https://github.com/Exchain-Pte-Ltd/exchain-analytics-adapter
- **GitHub Username**: plooram
- **Maintainer**: admin@exchain.co

---

**Status**: 🟡 **MULTI-VERSION PROJECT - CURRENTLY WORKING ON PROXY INJECTION SYSTEM** 