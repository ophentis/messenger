var config = {
    env: 'production',
    port: 3000
};

config.targets = {

    'aladin-dev-ios': {
        type: 'apns',
        cert: 'cert/aladin-dev-cer.pem',
        key: 'cert/aladin-dev-key.pem',
        gateway: 'gateway.sandbox.push.apple.com',
        feedback: 'feedback.sandbox.push.apple.com',
        debug: true
    },

    'aladin-pro-ios': {
        type: 'apns',
        cert: 'cert/aladin-pro-cer.pem',
        key: 'cert/aladin-pro-key.pem',
        gateway: 'gateway.push.apple.com',
        feedback: 'feedback.push.apple.com',
        debug: true
    },

    'tk-front-pro-ios': {
        type: 'apns',
        cert: 'cert/tk-front-pro-cer.pem',
        key: 'cert/tk-front-pro-key.pem',
        gateway: 'gateway.push.apple.com',
        feedback: 'feedback.push.apple.com'
    },

    'tk-front-dev-ios': {
        type: 'apns',
        cert: 'cert/tk-front-dev-cer.pem',
        key: 'cert/tk-front-dev-key.pem',
        gateway: 'gateway.sandbox.push.apple.com',
        feedback: 'feedback.sandbox.push.apple.com',
        debug: true
    },

    'tk-back-pro-ios': {
        type: 'apns',
        cert: 'cert/tk-back-pro-cer.pem',
        key: 'cert/tk-back-pro-key.pem',
        gateway: 'gateway.push.apple.com',
        feedback: 'feedback.push.apple.com'
    },

    'tk-back-dev-ios': {
        type: 'apns',
        cert: 'cert/tk-back-dev-cer.pem',
        key: 'cert/tk-back-dev-key.pem',
        gateway: 'gateway.sandbox.push.apple.com',
        feedback: 'feedback.sandbox.push.apple.com',
        debug: true
    },

    'tk-front-android': {
        type: 'gcm',
        apiKey: 'AIzaSyADn-rjtNVlNpByUAzd6cXf1M4MmPBw8iE'
    },

    'tk-back-android': {
        type: 'gcm',
        apiKey: 'AIzaSyD_qSZpj0FTgpQYMzqv_sRD3ma0gTGPtKE'
    },

    'bao-front-pro-ios': {
        type: 'apns',
        cert: 'cert/bao2-front-pro-cer.pem',
        key: 'cert/bao2-front-pro-key.pem',
        gateway: 'gateway.push.apple.com',
        feedback: 'feedback.push.apple.com'
    },

    'bao-front-dev-ios': {
        type: 'apns',
        cert: 'cert/bao2-front-dev-cer.pem',
        key: 'cert/bao2-front-dev-key.pem',
        gateway: 'gateway.sandbox.push.apple.com',
        feedback: 'feedback.sandbox.push.apple.com',
        debug: true
    },

    'bao-back-pro-ios': {
        type: 'apns',
        cert: 'cert/bao2-back-pro-cer.pem',
        key: 'cert/bao2-back-pro-key.pem',
        gateway: 'gateway.push.apple.com',
        feedback: 'feedback.push.apple.com'
    },

    'bao-back-dev-ios': {
        type: 'apns',
        cert: 'cert/bao2-back-dev-cer.pem',
        key: 'cert/bao2-back-dev-key.pem',
        gateway: 'gateway.sandbox.push.apple.com',
        feedback: 'feedback.sandbox.push.apple.com',
        debug: true
    }
};

if (!config.targets.
    default) {
    config.targets.
    default = config.targets['tk-front-dev-ios'];
}

config.email = {
    type: 'smtp',
    host: 'msa.hinet.net',
    username: '',
    password: '',
    from: 'service@baohunter.com'
}

module.exports = config;