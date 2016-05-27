/**
 * @file deo-mock-server.js
 * @author deo
 *
 * mock server
 */

/* eslint-disable */

var https = require('https');
var fs = require('fs');

var fn = function (dir, config) {

    var options = {
        key: fs.readFileSync(__dirname + '/ssl/server.key'),
        cert: fs.readFileSync(__dirname + '/ssl/server.crt')
    };

    var server = https.createServer(options, function (req, res) {

        var url = req.url.replace(/(\?.+)/, '');

        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            // 解决跨域, 允许任意 origin
            'Access-Control-Allow-Origin': req.headers.origin,
            // 前端使用 withCredentials: true 来模拟 cookie 传递，同时 Origin 不能用 *
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, campo-proxy-request, x-spdy-bypass'
            // 'Access-Control-Request-Method': 'GET, POST'
        });

        var expr = /\/data\/(.+)/.exec(url);
        var file = null;

        if (expr && expr.length > 1) {
            file = dir + '/data/' + expr[1] + '.json';

            console.log(file);

            try {
                var buffer = fs.readFileSync(file);
                res.end(JSON.stringify(JSON.parse(buffer)));
            }
            catch (ex) {

            }
        }
        else {
            res.end(JSON.stringify({
                status: 0,
                data: {
                    key: 'Hello world'
                }
            }));
        }
    });

    server.listen(config.port, config.host);

};

module.exports = fn;
