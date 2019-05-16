# web-mobile-webpack-cli
webpack构建的基于zepto的多页应用脚手架，本项目是由[web-mobile-cli](https://github.com/sihai00/web-mobile-cli)而来，是它的升级版，由[webpack](https://webpack.js.org/)构建。

## 一：由来
[web-mobile-cli](https://github.com/sihai00/web-mobile-cli)是由gulp来构建的，在实际的开发当中有不少的诟病，例如：
1. 需要兼容低版本浏览器，只能采用`promise`，不能使用`await`、`generator`等。（因为`babel-runtime`需要模块化）
2. 浏览器缓存不友好（只能全缓存而不是使用资源文件的后缀哈希值来达到局部缓存的效果）
3. 项目的结构不友好（可以更好的结构化）
4. 开发环境下的构建速度（内存）
5. `gulp`插件少且久远，维护成本高等等

webpack能很好的处理以上问题，它有一下优点：
1. 使用`babel-runtime`搭配`babel-plugin-transform-runtime`做到兼容最新特性，并且按需加载
2. 使用资源文件后缀加哈希值达到局部缓存目的
3. 项目结构更加友好
4. 开发环境使用`webpack-dev-server`，文件保存在运存中，构建速度更快
5. `webpack`插件多，生态丰富等等

## 二：使用
``` bash
# 进入项目，运行前请先安装所需依赖
npm install

# 运行以下命令启动服务器 localhost:8000
npm start

# 打包（dist文件）
npm run build

# config.js的配置
端口号 port: 8000 
开发环境下默认指向 serverIndex: ''
打包文件名 outputPath: 'dist',
缓存服务器地址 publicPath: '/',
html标题 title: 'webpack-web-mobild-cli'
```

## 三：目录
- dist: 打包后文件（默认打包后为```dist```目录，默认浏览器打开首页为```dist/index.html```）
- config: 项目配置文件
- src
  - common: 公共文件
  	- assets: 图片等资源文件
  	- html: 提取公共的html文件（ejs）
  	- js: 提取公共的js文件
  	- lib: 插件
  	- sass: 提取公共的scss文件
> 开发目录src有两种目录结构，可并存！

### 目录结构一
（结构一：兼容旧版本目录结构）
- src
	- html（ejs文件，支持ejs语法）
		- page.ejs
	- js
		- page.js
	- sass
		- page.scss
		
### 目录结构二
（结构二：新版本目录结构）
- src
	- index
		- html（ejs文件，支持ejs语法）
			- index.ejs
		- js
			- index.js
		- sass
			- index.scss
	- index2
		- html（ejs文件，支持ejs语法）
			- index2.ejs
		- js
			- index2.js
		- sass
			- index2.scss

这种结构的好处是当不需要的时候可以一并删除

## 四：html
项目使用了ejs作为开发的模板，好处是可以抽离出公共模块使用例子如下：
```html
<!DOCTYPE html>
<html lang="en">
<% include ../common/html/header.ejs %>
<body>
	<!-- page -->
	<div class="index-page" id="js-page">
		<i class="iconfont icon-jian"></i>index
	</div>
</body>
<script src="<%= publicPath %>lib/zepto.js"></script>
</html>
```
`publicPath`的值是在`config.js`中定义的，用于全局cdn引用路径

## 五：sass
默认设计图为750，通过[vw方案](https://www.w3cplus.com/css/vw-for-layout.html)自动适配

```scss
$baseFontSize: 7.5;
@function pxToVw($px) {
  @return $px / $baseFontSize * 1vw;
}
```

## 六：javascript
可以使用es7语法，打包后经过babel转译为es5

### 6-1：生命周期
- constructor
  - this.state：储存当前页面的变量
  - this.init：初始化
- init：
  - load：用于数据请求、数据渲染
  - ready：用于事件的绑定（只有当load执行完才可调用）

```javascript
class index extends parent{
  constructor(){
    super()
    
    this.state = {
      $list: $('#js-page'),
      arr: []
    }

    // 初始化
    this.init()
  }
  async init(){
    // 加载前 - 用于请求数据
    await this.load()

    // 加载后 - 用于绑定事件
    this.ready()
  }
  async load(){
    const data = await this.fetchData()

    this.state.arr = data.data
    // 拿到数据后渲染render()
  }
  ready(){
    // 在此初次渲染后可绑定事件
  }
  fetchData(){
    // parent类中的fetch方法
    return this.fetch({
      method: 'get',
      url: `${this.baseUriApi}/topics`,
      params: {
        limit: 10
      }
    })
  }
}
```

### 6-2：parent类
page中的js都继承自parent，parent可以存放一些全局的方法和变量给子类调用

```javascript
class parent {
  constructor(){
    this.baseUri = 'https://cnodejs.org'
    this.baseUriApi = this.baseUri + '/api/v1'
    this.windowUrl = window.location.href
    this.origin = window.location.origin
    this.params = this.getUrlParams()
  }
  // 获取url参数
  getUrlParams(url){
    var uri = url || this.windowUrl
    var match = uri && uri.match(/([^?=&]+)=([^?&]+)/g)

    return match && match.reduce(function(a, b){
      var val = b.split(/([^?=&]+)=([^?&]+)/g)
      a[val[1]] = val[2]
      return a
    }, {})
  }
  // 请求数据
  fetch(option){
    return new Promise((resolve, reject) => {
      $.ajax({
        type: option.method,
        url: option.url,
        data: option.method === 'get' ? option.params : JSON.stringify(option.params),
        contentType: 'application/json',
        success: function(data){
          resolve(data)
        },
        error: function(xhr, type) {
          reject(JSON.parse(xhr.response)['error']['message'])
        }
      })
    }).catch(err => alert(`错误信息: ${err}`))
  }
}
```

#### 6-2-1：getUrlParams获取地址栏的参数
```javascript
// 转化为
// { a: 1, b: 2 }

this.getUrlParams('http://localhost:3000?a=1&b=2')
```

#### 6-2-2：fetch请求数据
请求错误做统一处理，调用this.fetch()后返回请求的数据
- method：请求方法
- url：请求地址
- params: 请求参数

```javascript
const data = this.fetch({
  method: 'get',
  url: `${this.baseUriApi}/topics`,
  params: {
    limit: 10
  }
})
```
