# Build Our Own Prebid.js Solution - Implementation Plan

## **🎯 Overview**

This document outlines the plan to build our own Prebid.js bundle with the exact modules used by the publisher, eliminating all current injection conflicts and timing issues.

**Date:** June 18, 2025  
**Trigger:** Publisher suggestion to build custom Prebid.js + proxy redirection  
**Status:** Planning Phase

---

## **🔍 Current Problems This Solves**

### **❌ Issues Eliminated:**
1. **Dual Adapter Versions:** v3.2.1 (embedded) + v3.2.2 (injected) conflicts
2. **IOID Injection Timing:** Bid requests constructed before IOID injection
3. **Template Literal Conflicts:** Base64 encoding complexity
4. **Proxy Injection Complexity:** Multiple retry mechanisms and fallbacks
5. **Module Compatibility:** Exact match with production environment

### **✅ Benefits:**
- **Single Clean Adapter:** Only v3.2.2 adapter in the bundle
- **No Injection Complexity:** Direct module inclusion
- **Exact Production Match:** Same modules as publisher's environment
- **Simplified Debugging:** No proxy interference
- **Reliable IOID Injection:** Direct module execution

---

## **📋 Publisher's Exact Module List**

Based on publisher's suggestion, we need to build Prebid.js with these modules:

```json
{
  "modules": [
    "videoModule",
    "adpod", 
    "adfBidAdapter",
    "adnuntiusBidAdapter",
    "amxBidAdapter",
    "appnexusBidAdapter",
    "consentManagement",
    "criteoBidAdapter",
    "currency",
    "dfpAdServerVideo",
    "exchainAnalyticsAdapter",  // Our v3.2.2 version
    "gdprEnforcement",
    "improvedigitalBidAdapter",
    "ixBidAdapter",
    "jwplayerVideoProvider",
    "livewrappedAnalyticsAdapter",
    "livewrappedBidAdapter",
    "priceFloors",
    "pubmaticBidAdapter",
    "pubProvidedIdSystem",
    "readpeakBidAdapter",
    "rubiconBidAdapter",
    "schain",
    "sharedIdSystem",
    "teadsBidAdapter",
    "userId"
  ]
}
```

**Total Modules:** 26 modules (vs current 11 in eb.dk config)

---

## **🚀 Implementation Steps**

### **Phase 1: Environment Setup**

#### **Step 1.1: Install Prebid.js Build Tools**
```bash
# Install Prebid.js CLI globally
npm install -g prebid-cli

# Verify installation
prebid --version
```

#### **Step 1.2: Create Build Directory**
```bash
# Create dedicated build directory
mkdir prebid-custom-build
cd prebid-custom-build

# Initialize npm project
npm init -y
```

### **Phase 2: Build Configuration**

#### **Step 2.1: Create prebid-config.json**
```json
{
  "modules": [
    "videoModule",
    "adpod", 
    "adfBidAdapter",
    "adnuntiusBidAdapter",
    "amxBidAdapter",
    "appnexusBidAdapter",
    "consentManagement",
    "criteoBidAdapter",
    "currency",
    "dfpAdServerVideo",
    "exchainAnalyticsAdapter",
    "gdprEnforcement",
    "improvedigitalBidAdapter",
    "ixBidAdapter",
    "jwplayerVideoProvider",
    "livewrappedAnalyticsAdapter",
    "livewrappedBidAdapter",
    "priceFloors",
    "pubmaticBidAdapter",
    "pubProvidedIdSystem",
    "readpeakBidAdapter",
    "rubiconBidAdapter",
    "schain",
    "sharedIdSystem",
    "teadsBidAdapter",
    "userId"
  ],
  "version": "8.52.2",
  "output": "prebid-custom.js"
}
```

#### **Step 2.2: Custom Adapter Integration**
```bash
# Copy our v3.2.2 adapter to the build directory
cp ../docs/exchainAnalyticsAdapter_v3.2.2/exchain-ioid-fix.js ./modules/exchainAnalyticsAdapter.js
```

### **Phase 3: Build Process**

#### **Step 3.1: Build Custom Prebid.js**
```bash
# Build with our custom adapter
prebid build --config prebid-config.json --output prebid-custom.js

# Verify build size and syntax
node -c prebid-custom.js
```

#### **Step 3.2: Test Build**
```bash
# Create simple test page
echo '<script src="prebid-custom.js"></script>' > test-build.html

# Test in browser
start test-build.html
```

### **Phase 4: Proxy Setup**

#### **Step 4.1: Install Proxy Tools**
```bash
# Option 1: Fiddler (Windows)
# Download from: https://www.telerik.com/fiddler

# Option 2: Charles Proxy
# Download from: https://www.charlesproxy.com/

# Option 3: Browser DevTools (Chrome/Firefox)
# Built-in network tab with request blocking
```

#### **Step 4.2: Configure URL Redirection**
**Target URL:** `https://content.lwgadm.com/prebid/8.52.2/ed5af547-1a82-4aa5-b07e-0c5b819de028/prebid.js`

**Redirect To:** `http://localhost:3000/prebid-custom.js`

#### **Step 4.3: Proxy Configuration Examples**

**Fiddler Rules:**
```
if (oSession.url.Contains("content.lwgadm.com/prebid/8.52.2/ed5af547-1a82-4aa5-b07e-0c5b819de028/prebid.js")) {
    oSession.url = "http://localhost:3000/prebid-custom.js";
}
```

**Chrome DevTools:**
1. Open DevTools → Network tab
2. Right-click request → Block request URL
3. Add custom response with our local file

---

## **🔧 Integration with Current System**

### **Step 5.1: Modify Server.js**
```javascript
// Add new endpoint for custom build
app.get('/prebid-custom.js', (req, res) => {
    const customBuild = fs.readFileSync('./prebid-custom-build/prebid-custom.js', 'utf8');
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(customBuild);
});
```

### **Step 5.2: Update Test Page**
```javascript
// Option to use custom build instead of proxy
const useCustomBuild = true;
const prebidUrl = useCustomBuild ? '/prebid-custom.js' : '/prebid.js';
```

---

## **📊 Expected Results**

### **Before (Current System):**
- ❌ Dual adapter versions (v3.2.1 + v3.2.2)
- ❌ IOID injection timing issues
- ❌ Complex proxy injection logic
- ❌ Template literal conflicts
- ❌ Multiple retry mechanisms

### **After (Custom Build):**
- ✅ Single adapter version (v3.2.2 only)
- ✅ Direct IOID injection (no timing issues)
- ✅ No proxy complexity
- ✅ Clean module integration
- ✅ Exact production environment match

---

## **🧪 Testing Strategy**

### **Test 1: Build Verification**
- [ ] Prebid.js builds without errors
- [ ] File size is reasonable (< 2MB)
- [ ] Syntax validation passes
- [ ] All modules are included

### **Test 2: Adapter Functionality**
- [ ] v3.2.2 adapter loads correctly
- [ ] IOID generation works
- [ ] ORTB2 injection functions
- [ ] No v3.2.1 adapter present

### **Test 3: Proxy Redirection**
- [ ] URL redirection works
- [ ] Custom build serves correctly
- [ ] No caching issues
- [ ] Publisher's site loads our build

### **Test 4: Production Compatibility**
- [ ] All bid adapters function
- [ ] Analytics modules work
- [ ] Video modules load
- [ ] Consent management works

---

## **⚠️ Potential Challenges**

### **Challenge 1: Module Dependencies**
- **Risk:** Some modules may have dependencies not listed
- **Mitigation:** Build incrementally, test each module addition

### **Challenge 2: Build Size**
- **Risk:** 26 modules may create very large file
- **Mitigation:** Monitor file size, consider module optimization

### **Challenge 3: Version Compatibility**
- **Risk:** Module versions may conflict
- **Mitigation:** Use exact versions from publisher's build

### **Challenge 4: Proxy Setup**
- **Risk:** Complex proxy configuration
- **Mitigation:** Start with simple browser DevTools approach

---

## **📝 Success Criteria**

### **Technical Success:**
- [ ] Custom Prebid.js builds successfully
- [ ] All 26 modules included and functional
- [ ] v3.2.2 adapter works without conflicts
- [ ] IOID injection works reliably
- [ ] Proxy redirection functions correctly

### **Business Success:**
- [ ] Publisher can test our adapter in their environment
- [ ] No more dual version conflicts
- [ ] Simplified debugging and testing
- [ ] Production-ready solution

---

## **🔄 Next Steps**

### **Immediate Actions:**
1. **Set up build environment** (Prebid CLI installation)
2. **Create build configuration** with publisher's module list
3. **Test basic build process** with minimal modules
4. **Integrate our v3.2.2 adapter** into the build

### **Short-term Goals:**
1. **Complete custom build** with all 26 modules
2. **Set up proxy redirection** (Fiddler/DevTools)
3. **Test in publisher's environment**
4. **Validate IOID injection** works correctly

### **Long-term Benefits:**
1. **Eliminate all current technical issues**
2. **Provide clean testing environment**
3. **Match production setup exactly**
4. **Simplify future development**

---

## **📞 Contact Information**

- **Repository:** https://github.com/Exchain-Pte-Ltd/exchain-analytics-adapter
- **GitHub Username:** plooram
- **Maintainer:** admin@exchain.co

---

**Status:** 📋 **PLANNING COMPLETE - READY FOR IMPLEMENTATION** 