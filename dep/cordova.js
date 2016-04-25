var CPNavigationBar = {
    redirect: function (url, data) {
        window.location.href = url;
    }  
};

var CPPubData = {
    getPubData: function (options, fn) {
        var data = [];
        var jids = options.parameter.jids;

        var randomData = function () {
            return 'Name-' + Math.floor(Math.random() * 1000);
        };

        jids.forEach(function (item) {
            data.push({
                jid: item,
                name: randomData()
            });
        });

        // fn(data);
        setTimeout(function () {
            fn(data);
        }, 100);
    }
};

console.log('hello! cordova.js');