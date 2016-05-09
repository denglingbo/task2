/* eslint-disable */
var config = {

    debug: true,

    host: '127.0.0.1',

    port: 8014
};

config.https = {
    
    key: null,

    cert: null
};

config.mock = {

    host: config.host,

    port: config.port,

    proxyPrefix: '',

    proxyPath: ''
}