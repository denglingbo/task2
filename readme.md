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

#### `怎么访问`

URL: `http://localhost:8014`

MOCK: `$.ajax('http://localhost:8015/api?id=xxx')`

`更改 host ->> febd.config.js`

`更改 mock ajax config ->> src/config.js`