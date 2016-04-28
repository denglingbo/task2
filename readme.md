##### `如何使用`

```javascript
// 全局安装 webpack
npm install webpack -g

// 全局安装 gulp
npm install gulp -g

// 全局安装 fecs，用于代码检查
npm install fecs -g
```

#### `启动服务`

```javascript
// 安装依赖包
npm install

// 开发模式
gulp dev

// 模拟发布模式
gulp release
```

##### `dev 模式加入了 source map`
##### `请不要在意 dev 模式下的js 过大问题，这里没有对文件进行任何处理，release 模式处理了文件大小问题`
##### `document.addEventListener('deviceready', fn, false) 该方法已经封装到了 page.js 中，同时也在 page.js 中对模板进行了预编译`
##### `debug 模式在 page.js 的 post 方法中加入了模拟的请求延迟，如果不需要可自己删掉`
##### `根目录下 cordova.js 用于模拟，同时在模拟 release 中会拷贝一份到 dist 中，如果不需要请在 gulpfile.js 中删除 maker.setReleaseMock()`

#### `怎么访问`

URL: `http://localhost:8014`

MOCK: `$.ajax('http://localhost:8015/api?id=xxx')`

`webpack config ->> febd.config.js`

`host && mock-ajax config ->> src/config.js`