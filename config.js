module.exports = {
    // Server configuration
    PORT: process.env.PORT || 3000,
    HOST: process.env.HOST || 'localhost',
    
    // Prebid.js configuration
    PREBID_CONFIG: {
        // Use Prebid.js build service with eb.dk's exact modules
        BUILD_URL: 'https://cdn.jsdelivr.net/npm/prebid.js@8.52.2/build/dist/prebid.js',
        CUSTOM_BUILD_MODULES: [
            'videoModule',
            'adpod', 
            'adfBidAdapter',
            'adnuntiusBidAdapter',
            'amxBidAdapter',
            'appnexusBidAdapter',
            'consentManagement',
            'criteoBidAdapter',
            'currency',
            'dfpAdServerVideo',
            'exchainAnalyticsAdapter',
            'gdprEnforcement',
            'improvedigitalBidAdapter',
            'ixBidAdapter',
            'jwplayerVideoProvider',
            'livewrappedAnalyticsAdapter',
            'livewrappedBidAdapter',
            'priceFloors',
            'pubmaticBidAdapter',
            'pubProvidedIdSystem',
            'readpeakBidAdapter',
            'rubiconBidAdapter',
            'schain',
            'sharedIdSystem',
            'teadsBidAdapter',
            'userId'
        ],
        // eb.dk's current Prebid.js (as fallback/reference)
        ORIGINAL_URL: 'https://content.lwgadm.com/prebid/8.52.2/ed5af547-1a82-4aa5-b07e-0c5b819de028/prebid.js',
        VERSION: '8.52.2'
    },
    
    // Legacy URL for backward compatibility
    PREBID_URL: 'https://content.lwgadm.com/prebid/8.52.2/ed5af547-1a82-4aa5-b07e-0c5b819de028/prebid.js',
    
    // Debug configuration
    DEBUG: {
        ENABLED: true,
        LOG_LEVEL: 'info',
        TRACK_ORTB2: true,
        TRACK_EVENTS: true
    }
}; 