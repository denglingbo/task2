
/**
 * webpack config
 */

var path = require('path');

// Webapck utils
var Webpacker = require('./tool/webpack-lib/index');

var config = {
    debug: false,
    publicPath: '/'
};

var root = path.join(__dirname, '/');

var webpacker = new Webpacker(config, root);

module.exports = webpacker.webpackConfig;
