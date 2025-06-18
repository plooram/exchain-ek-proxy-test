module.exports = {
    // Server configuration
    PORT: 3000,
    HOST: process.env.HOST || 'localhost',
    
    // Prebid.js configuration
    PREBID_CONFIG: {
        VERSION: '8.52.2',
        ORIGINAL_URL: 'https://content.lwgadm.com/prebid/8.52.2/ed5af547-1a82-4aa5-b07e-0c5b819de028/prebid.js',
        CUSTOM_BUILD_MODULES: [
            'exchainAnalyticsAdapter',
            'appnexusBidAdapter',
            'openxBidAdapter',
            'rubiconBidAdapter',
            'pubmaticBidAdapter',
            'criteoBidAdapter',
            'tripleliftBidAdapter',
            'ixBidAdapter',
            'conversantBidAdapter',
            'sovrnBidAdapter',
            'adformBidAdapter'
        ]
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