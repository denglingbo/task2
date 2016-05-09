/* eslint-disable */

var https = require('https');
var fs = require('fs');

var options = {
    key: fs.readFileSync('./ssl/keys/server-key.pem'),
    // ca: [fs.readFileSync('./keys/ca-cert.pem')],
    cert: fs.readFileSync('./ssl/keys/server-cert.pem')
};

https.createServer(options,function(req,res){

    console.log(req.url);

    res.writeHead(200, {
        'Content-Type': 'application/json',
        // 解决跨域
        'Access-Control-Allow-Origin': 'https://task2.test1.com:8014',
        // 前端使用 withCredentials: true 来模拟 cookie 传递，同时 Origin 不能用 *
        'Access-Control-Allow-Credentials': true
    });

    var expr = /^\/(.+)\?/.exec(req.url);
    var file = null;
    if (expr && expr.length > 1) {
        file = './mock/data/' + expr[1] + '.json';
        console.log(file);
        var buffer = fs.readFileSync(file);
        res.end(JSON.stringify(JSON.parse(buffer)));
    }
    else {
        res.end(JSON.stringify({
            status: 0,
            data: {
                key: 'Hello world'
            }
        }));
    }

    // var buffer = fs.readFileSync('./mock/data' + url + '.json');
    // res.end(JSON.stringify(JSON.parse(buffer)));
    

}).listen(3000,'127.0.0.1');