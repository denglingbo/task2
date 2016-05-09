/* eslint-disable */
var config = {

    debug: true,

    host: '127.0.0.1',

    port: 8014,

    publicPath: '/'
};

config.https = {
    
    key: null,

    cert: null
};

config.mock = {

    host: config.host,

    port: 8015,

    proxyPrefix: null,

    proxyPath: null
}

module.exports = config;
