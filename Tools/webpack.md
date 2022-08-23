### 1.webpack
webpack：一个现代JavaScript 应用程序的静态模块打包器

webpack 是一个打包模块化 js 的工具，它会从入口文件出发，识别出源码中的模块化导入语句，递归的寻找出入口文件的所有依赖，把入口和其所有依赖打包到一个单独的文件中。

前端工程师熟悉js，而 node.js 可以胜任所有构建需求，所以多数构建工具都是用 node.js 开发的。Webpack 构建运行在 Node.js 环境下，所以该文件最后通过 CommonJS 规范导出一个描述如何构建的 Object 对象。

由定义：
- webpack 在无其他配置时只能认识、处理JS这一语言。
- 打包：多个文件(请求开销，加载顺序)合并到一个文件。

除了打包：
- 翻译官 loader (将各种语言翻译为浏览器能解析的语言)
- 小动作 plugin
- loader 和 plugin 都是可插拔的。

重点：
- 前端模块化
- webpack 打包的核心思路
- 理解关键角色。

#### 1. 前端模块化
 -- 作用域 -- 命名空间 -- 模块化

一个文件可能包含多个模块，也可能一一对应，也可能一个模块包含多个文件。

1. 组合多个功能原始方法：
   ```html
   <body>
     <script src="a.js"></script>
     <script src="b.js"></script>
   <body>
   ```
   这种方法的问题在于：
   - 会发出多个请求
   - 需要考虑加载顺序
   - 所有的脚本会共用同一个全局作用域
   
   共用同一个作用域会导致命名冲突，可以命名使用空间来解决(使用对象包裹)：
   ```js
   //a.js
   var moduleA = {
     ...//所有定义
   }
   ```
   单纯使用命名空间时，对象中的变量可以被随意更改，可以使用立即执行函数加闭包来保护变量：
   ```js
   //避免冲突和被随意篡改，借用了函数作用域的定义来实现(也可以叫做模块定义域)
   var moduleA = (function() {
     var name = 'a';
     return {
       tell: function() {
         console.log('this is name:', name);
       }
     }
   })()

   //早期更加常用/标准的模块写法
   (function(window) {
     var name = 'a';
     function tell() {...};
     window.moduleA = {tell};
   })(window)
   ```

模块化优点/目的：
1. 作用域封装
2. 可重用性
3. 解除耦合

2. 模块化方案进化史
   -- AMD -- commonJS -- ES6 module

   AMD(Asynchronous Module Definition) 异步模块定义：
   - 使用 define 和 require。
   - 它显示地表达了每个模块依赖的其他模块，且模块的定义不再绑定到全局对象上。

   commonJs 最开始时为了定义服务端的模块标准，之后 nodeJs 在其基础上做了调整:
   - 使用 export 和 require。
   - 每个文件就是一个模块，拥有属于自己的作用域和上下文。

   AMD 和 commonJs 有一个共同的特性：强调模块的依赖必须显示引入，这时为了在维护复杂模块时，可以不用操心各个模块间引入顺序的问题。

   ES6 module 使用 import 和 export，模块化开始有了语法级别的支持。

   gulp 和 grunt 也可以用来打包，但他们的定位是自动化的构建工具(自动完成那些需要反复重复的任务，打包只是其中一小部分)，而 webPack 的定位就是一个专业的模块化打包工具。

#### 2. webpack 的打包机制

   webpack 在打包文件时，为了确保文件体积尽可能小，会将变量名替换为字母。

   webpack 的打包结果依然是立即执行函数。立即执行函数主要是要区分函数是表达式还是定义，除了使用括号使得函数为表达式之外，还可以使用！+ - 等符号。

   打包结果：
   ```js
   //大体结构
   (function(modules) {
     var installedModules = {};

     function __webpack_require__(moduleId) {
       ...
     }

     return __webpack_require__(0);  //entry file
   })([/* modules array*/])

   //核心方法，模拟了require 方法，把多个文件打包之后形成一个文件。原理是通过递归的方式不断调用自己。
   function __webPack_require__(moduleId) {
     //检查模块是否在缓存中
     if(installedModules[moduleId]) {
       return installedModules[moduleId].exports;
     }

     //创建一个新模块并放入内存
     var module = installedModues[moduleId] = {
       i: moduleId,
       l: false,
       exports: {},
     };

     //执行模块方法
     modules[moduleId].call(module.exports, module, module.exports, __webPack_require);

     // 标志模块已加载
     module.l = true;

     //返回module 的exprots
     return module.exports;
   }
   ```

   webpack 打包过程：
   1. 从入口文件开始，分析整个应用的依赖树。
   2. 将每个依赖模块包装起来，放到一个数组中等待调用。
   3. 实现模块加载的方法，并将它放到模块执行的环境中，确保模块间可以互相调用。
   4. 把执行入口文件的逻辑放在一个函数表达式中，并立即执行。

#### 3. 配置开发环境—— npm 与包管理器

   包管理器是一个可以让开发者便捷的获取和开发代码的工具。其中有很多非常成熟的包来专门解决一类问题，不必自己重复实现。

   npm 依赖 node 环境，会随着 node 的安装一同被安装。

   package.json：
   ```json
     "name": "webpack-demo"  //包上传到npm 仓库的时候的唯一标识
     "verson": "1.0.0"
     "main": "index.js"  //包执行的入口文件
     "scripts":{}  //自定义脚本命令
   ```  
   npm 仓库：遵循npm 特定包规范的站点，提供一些api给用户进行上传、下载、获取报信息等等。npm 提供了官方的仓库，当因为网络问题所以经常会访问出问题。淘宝提供了一个镜像仓库，将官方仓库的包都映射到国内，访问更加稳定。

   ```js
     //所有功能相关的依赖都应该放在 dependencies 中，而一些构建工具，质量检测工具(eslint) 之类的包则可以放在 devDependencies 中
     npm install package --save(-S) //写入 package.json 的 dependencies 中，npm5 之后称为默认参数
     npm install package --save-dev(-D)  //写入 package.json 的 devDependencies 中
     npm install --only=prod  //安装 dependencies 中的包(可以认为是默认参数)
     npm install --only=dev  //安装 devDependencies 中的包
   ```
   语义化版本：允许依赖的版本是动态的，这样可以快捷的获取到一定范围内的最新版本：
   - version: 特定版本
   - ~version: 小版本，只能改变最末尾那段。 1.15.2 <= ~1.15.2 < 1.16.0
   - ^version: 中版本和小版本，除了大版本号都可以改变。 3.3.4 <= ^3.3.4 < 4.0.0

   scripts: npm提供的脚本命令功能。可以分为两种：
   1. npm 自己的生命周期命令，即在包的发布和安装过程中，允许开发者写的钩子，如 preinstall, postinstall, prepublish, postpublish等等。
   2. 开发者自定义命令，如 `"dev": "webpack-dev-server"`、`"build": "eslint ./src && webpack"`

#### 4. webpack 核心特性
1. 构建简单工程
   webpack 预制了一个入口文件 `src/index.js`。需要自定义配置的话可以新建 webpack.config.js 文件，其中使用 require 和 exports。

   ```js
   const path = require('path') //node 的 path 模块
   const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
   const HtmlWebPackPlugin = require('html-webpack-plugin');
    const webpack = require('webpack');
   const terserPlugin = require('terser-webpack-plugin');
   const bundleAnalyzerPlugin = require('webpack-bundle-analyzer-plugin');
   const happyPack = require('happypack');

   const happyThreadPool = happyPack.ThreadPool({size: OscillaorNode.cups().length})  //根据cpu 数量创建线程池，用多进程实现多线程

   module.exports = {
     entry: path.resolve(__dirname, 'src/index.js')
     output: {
       path: path.join(__dirname, 'dist'), //path 必须是绝对路径
       filename: 'bundle.js',
     },
     devServer: {
       port: 3000,
       publicPath: '/dist'  //打包的结果不会生成一个实际的文件，可以认为存在于内存中
       hot: true,  //hmr
     },
     resolve: {
       extensions: ['.wasm', '.mjs', '.js', '.jsx', '.json']  //引入文件时省略文件后缀
     },
     optimization: {
       minimizer: [new terserPlugin({
         //加快构建速度，在一定时间内不会重复压缩
         cache: true,
         terserOptions: {
           compress: {
             unsed: true,
             drop_debuger: true,
             drop_console: true,
             dead_code: true,
           }
         }
       })]
     }
     module: {
       noParse: /node_modules\/(jquery\.js)/,//不解析的文件，加快构建速度
       rules: [
         {
           test: /\.js$/,
           include: path.resolve('src'),
           use: ['thread-loader'],  //thread-loader 多线程加快构建速度，配置时必须放在所有 loader 之前。
         }
         {
           test: /\.css$/,
           use: [
             'style-loader',
             'css-loader'
           ] // loader 的配置顺序和加载顺序相反，这里必须先解析css, 再使用css
         },
         {
           test: /\.jsx?/,
           exclude: /node_modules/,
           use: {
             loader: 'babel-loader',
             options: {
               babelrc: false, //不使用 .babelrc 文件
               presets: [
               require.resolve('@bable/preset-react'),  // jsx
               require.resolve('@bable/preset-env', {modules: false})  // ES6, webpack 可以识别 import/exports,可以将 modules 设为 false
               ],
               cacheDirecotry: true, //对编译结果做缓存
             }
           }
         }
       ]
     },
     plugins: [
       new UglifyJSPlugin(), //压缩--去掉注、换行、空格等等，减小代码体积
       new HtmlWebPackPlugin({
         template: path.resolve(__dirname, ''),
         filename: 'index.html', //打包之后的文件名
       }),
       new webpack.HotModuleReplaceMentPlugin(), //hmr
       new bundleAnalyzerPlugin(), // 分析打包结果
       new happyPack({
         id: 'jsx',
         threads: happyThreadPool,
         loader: ['babel-loader'],  //需要对应的loader 支持 happyPack
       }),  //提升构建速度
     ]
   }
   ```
   style-loader 允许将 css 和 js 打包在一个文件中，它的工作原理大概就是把 css 内容用 js 字符串存储起来，在网页执行 js 时通过DOM 操作动态地往 html head 标签中插入 html style 标签。这样会导致 js 文件变大，想让 webpack 单独输出 css 文件，可以使用 plugin 来实现（ExtractTextPlugin）。


   webpack 的核心特性： 一切皆模块(所有的资源，模板，样式(css等)，图片)，通过 loader 来解析这些不属于 js 的语法。plugin 强调事件监听的能力，它可以在 webpack 中监听一些事件，并改变一些文件打包后的输出结果。

   webpack、webpack-dev-server 命令在本质上都是一个可执行文件，可以在 node_modules 的 .bin 目录下找到他们，没有全局安装的话，也可以通过调用可执行文件来执行。npm5.2 之后提供了npx,npx 会先去node_modules的.bin下检测命令是否存在，没有会尝试下载，然后再执行。webpack-dev-server根据参数可以选择不同的webpack config 文件来运行。

   webpack-dev-server 启动之后，会监听文件的变化，然后自刷新。但这样每次都需要刷新浏览器，启用 hmr 之后，可以在不刷新页面的情况下同步文件中改动。使用 hmr 后，可以在项目中进行检查：
   ```js
   if(module.hot) {
     module.hot.accpt(error => {
       if (error) {
         console.log('热替换出错')
       }
     })
   }
   ```

   babel 单独使用转换规则配置可以写在 package.json 中`"babel": {"presets": ["@babel/preset-env"]}`，也可以新建一个 .bablerc 文件来写入`{"preset":["@babel/preset-env"]}`。 .bablerc 文件优先级更高。

#### 5. webpack 性能优化
webpack 的优化主要是速度和体积的优化，在这二者中又可分为自带的优化和自己实现的优化。
1. 打包结果优化
   webpack 给打包结果做了压缩，也允许我们定制自己的压缩工具：terser-webpack-plugin。

   Uglify 在 ES5 的压缩做的很好，但在 ES6 上不够好，所以出现了uglify-es。之后 uglify-es 不再维护，terser 是在 uglify-es 上的一个分支，继续维护。
2. 构建过程优化
   构建过程中的耗时操作：
   - webpack 打包时会对文件进行递归的解析处理，有的库(如echarts, jquery)非常大，又没有模块化标准，解析耗时且没有意义：`module.noParse`，要注意排除的文件不应该包含 import、require、define 这些模块化语句，否则构建出的代码中可能包含浏览器无法执行的模块化语句。
   - 查找。使用 exclude(优先级高于 test 和 include) 和 include 精确范围。
   - 使用多线程。运行在 nodejs 上的webpack 是单线程的，happyPack(多进程实现多线程) 可以把任务分成多个子进程并发执行，之后返回结果给主进程。

     thread-loader 针对 loader 进行优化，把 loader 放在线程池中运行，达到多线程构建的目的。

     nodejs、webpack 都是单线程的，想要发挥多线程的优势，必须借助进程维度的数量。
   - 预编译
   - 缓存
   - loader 的选择。sass-loader与 fast-sass-loader

3. Tree-Shaking (消除无用js代码)
   Tree-Shaking 可以认为是消除无用代码(DCE)的一种实现。它会分析ES6 modules 引入的情况，去除一些不使用的 modules 的引入，借助一些工具如(terser-plugin)对这些无用module进行删除(mode 为 prod 是才会用到)。
   
webpack 是前端发展的产物，是模块化打包方案，是工程化方案。

参考：
- [webpack 从原理到实战完整版](https://www.bilibili.com/video/BV1a741197Hn?from=search&seid=4425922462000877036)

### 2. webpack 核心
核心概念([具体联系](http://webpack.wuhaolin.cn/1%E5%85%A5%E9%97%A8/1-7%E6%A0%B8%E5%BF%83%E6%A6%82%E5%BF%B5.html))
#### 2.1 entry
entry 是配置模块的入口，webpack 执行构建的第一步将从入口开始搜寻及递归解析出所有入口依赖的模块。

webpack 在寻找相对路径的文件时会以 context 为根目录，默认为执行启动 webpack 时所在的当前工作目录。

entry 类型可以是有三种：
- String: 一个入口文件，打包成一个文件。
- Array: 有多个入口文件，最终打包成一个文件。
- Object: 最完整的 entry 配置，其他形式只是它的简化形式。用来配置多个入口，每个入口生成一个 chunk。Object 的 key 对应 `output.filename` 配置中的 `[name]` 变量（key 可以是路径字符串，此时 webpack 会自动生成路径目录，并将最后的路径作为 `[name]`），value 是对应的入口文件路径，可以为数组。

一个 entry 和其所有依赖的 module 被分到一个组也就是一个 chunk。webpack 会为每个生成的 chunk 取一个名称：若 entry 是 String 或 Array，则 chunk 名称为 main；若是一个 Object，就可能出现多个 Chunk，名称对应 Object 中的 key。

项目中页面数不固定时，可以将 entry 设置为一个函数来动态返回 string、Array 或 Object。

#### 2.2 output
output 配置如何输出最终想要的代码，是一个 Object，包含了一系列的配置：
- filename: 输出文件名称。有多个 chunk 输出时，会借助模板和变量: id（从0开始）、name、hash（id hash）、chunkhash 和 query。
- chunkFilename 指定在运行过程中生成的 chunk 在输出时的文件名称。
- path 输出文件存放的目录，绝对路径。
- publicPath: 复杂项目中一些构建出的资源需要异步加载，publicPath 为对应的 URL 地址。比如将构建出的资源文件上传到 CDN 上，加快页面的打开速度，相应的发布到线上的 HTML 会根据对应的 publicPath 来引入文件。
- crossOriginLoading: webpack 输出的部分代码块需要一部加载，通过 JSONP 方式实现时（动态向 HTML 中插入 script 标签去加载异步资源）。crossOriginLoading 用于设置 script 标签的 crossorigin 值: anonymous（加载脚本时不会带上 cookies）、use-credentials（加载脚本资源时带上 cookies）。
- libraryTarget（以何种方式导出库） 和 library（导出库的名称）：构建一个可以被其他模块导入使用的库时需要用到。libraryTarget 是字符串的枚举类型，支持：var、commonjs、commonjs2、this、window、global
- libraryExport 配置要导出的模块中哪些子模块需要被导出，只有在 libraryTarget 被设置为 commonjs 或 commonjs2 时才有意义。

#### 2.3 module
module 配置如何处理模块。

**url-loader 和 file-loader**

**配置loader**：rules 配置模块的读取和解析规则，通常用来配置 loader。其类型是一个数组，数组中每一项都描述了如何去处理部分文件。
```js
module: {
  rules: [
    {
      //条件： test, include, exclude, resource(前面三者的结合，只能使用一种方式) 是对引入模块匹配；issuer 对引入模块的文件匹配
      //结果：loader, options（值可以传入到 loader 中，可以将其理解为 loader 的参数）, use 以及两个兼容属性 query 和 laoders 规定应用的 loader；parse 为模块创建解析器的选项对象。
      //嵌套 rule: rules 属性和 oneof（使用第一个匹配到的） 属性
    }
  ]
}
```
此外：使用 `use` 配置 loader 时，会按照从后往前的顺序应用一组 loader。`enforce` 属性（ 值可以为post/pre）可以让其中一个 loader 的执行顺序放到最前或最后。

**noParse**：noparse 配置项可以让 webpack 忽略对部分没采用模块化的文件的递归解析和处理，可以提高构建性能。类型：RegExp、[RegExp]、function。

**parser**：Webpack 是以模块化的 js 文件为入口，所以内置了模块化 js 的解析功能，支持 AMD, CommonJS，SystemJS, ES6。parser 可以更细粒度的配置要解析的模块化语法。和 noParse 的区别在于它可以精确到语法层面，而 noParse 只能控制哪些文件不被解析(将选项设置为 false 将禁用解析器)。

#### 2.4 resolve
webpack 在启动后会从配置的入口模块出发找出所有依赖的模块，resolve 配置 webpack 如何寻找模块所对应的文件。webpack 内置模块化语法解析功能，默认会采用模块化标准中约定的规则去寻找。常用属性：
- alias 通过别名把原导入路径映射成一个新的导入路径。支持 `$` 符号来缩小命中范围，即只命中以关键字结尾的导入语句。
- mainFields  一些第三方模块会针对不同环境提供几份代码，不同环境的入口文件一般会在 package.json 中声明。webpack 会根据 mainFields 的配置去决定优先采用哪份代码，如 `mainFields: ['browser', 'main']`。webpack 会按数组中的顺序去 package.json 文件中去找。target 为 webworker, web 是， 默认值为 `['browser', 'module', 'main']`；其他 target，默认值为 `['module', 'main']`
- extensions 导入语句没带文件后缀时， webpack 会自动按顺序使用 extensions 配置的后缀去尝试访问文件是否存在。
- modules 告诉 webpack 解析模块时应该搜索的目录（默认只去 node_modules 目录下寻找，应该适用于直接使用模块而不是通过路径引入的情况）。与 alias 都可用于省略路径书写，但 alias 需要设置别名。
- descriptionFiles 定义用于描述的 JSON 文件。
- enforceExtension 为 true 时所有导入语句都必须要带文件后缀。
- enforceModuleExtension 与 enforceExtension 作用类似，但只对 node_modules 下的模块生效。二者经常搭配使用。在 `enforceExtension: true` 时，因为安装的第三方模块中大多数导入语句没带文件后缀，所以一般会配置 `enforceModuleExtension: false` 来兼容第三方模块。

相对路径和绝对路径的模块引入通常容易理解，但以模块路径的形式引入的模块如:`import react from 'react'` 的解析就比较复杂：
- 首先搜索 modules 配置的目录进行查找。
- 找到之后，根据中 resolve.description 配置，找到用于描述的 JSON 文件，一般为 `['package.json']`。
- 若找到 JSON 文件，JSON 文件中一般会包含描述路径的字段如: main、module 等，此时需要根据自身webpack resolve.mainFields 来决定选用哪一个作为入口文件。
- 若 package.json 不存在或其 mainFields 对应的字段没有返回一个有效的路径，则可以使用 resolve.mainFiles，会按照顺序查找 resolve.mainFiles 中配置的文件名。

参考：
- [webpack 之 resolve](https://zhuanlan.zhihu.com/p/138288718)

#### 2.5 plugin
Plugin 用于扩展 webpack 功能。它的配置项接受一个数组，数组中每一项都是一个要使用的 plugin 的实例，plugin 需要的参数通过构造函数传入。

使用 plugin 的难点在于掌握 plugin 本身提供的配置项。几乎所有 webpack 无法直接实现的功能都能在社区找到开源 plugin 去解决。

#### 2.6 DevServer
DevServer 是官方提供的开发工具，在开发时，需要另外安装。

##### 2.6.1 DevServer 概述
实际开发中，比较常见的需求：
1. 提供 http 服务而不是使用文件预览(使用 浏览器打开 html)。
2. 监听文件变化并自动刷新网页，做到实时预览。
3. 支持 source map，以方便调试。

Sebpack 原生支持 第3 点内容，再结合 DevServer 可以方便地做到第 1、2 点。DevServer 特点：
-  DevServer 会启动一个 HTTP 服务器用于服务网页请求。同时会帮助启动 webpack，并接受 webpack 发出的文件变更信号，通过 websocket 协议自动刷新网页做到实时预览。
-  DevServer 会把 webpack 构建出的文件保存在内存中（不会输出到 dist 目录），要访问这些文件，必须通过 HTTP 服务访问。
-  DevServer 不会理会 webpack.config.js 中配置的 output.path 属性，所以 index.html 中要注意引入了正确的文件。

**实时预览**

Webpack 在启动时可以开启监听模式，在本地文件系统发生变化时重新构建出新的结果。监听模式默认关闭，可以在启动 webpack 时通过 `webpack --watch` 来开启监听模式。

实时预览要点：
- DevServer 启动的 webpack 会开启监听模式，在发生变化时会重新执行构建，构建完成后会通知 DevServer。- DevServer 会让 webpack 在构建出的 JS 代码中注入一个代理客户端用于控制网页，网页和 DevServer 之间通过 webSocket 协议通信。
- DevServer 在收到来自 Webpack 的文件变化通知时通过注入的客户端(websocket) 控制网页刷新。
- Webpack 在启动时会以配置中的 entry 为入口去递归解析出 entry 依赖的文件，只有 entry 本身和依赖的文件才会被 webpack 添加到监听依赖表中。（所以一般修改 index.html 文件并保存，并不会触发实时预览）。

**模块热替换(HMR)**

除了通过刷新整个页面来实现实时预览，DevServer 支持模块热替换。

模块热替换能在不重新加载整个网页的情况下，通过用更新的模块替换老的模块，再重新执行一次来实现实时预览，提供了更快的响应和更好的开发体验。HMR 默认关闭，要开启需要在启动 DevServer 是带上 --hot 参数。

**Source Map**

在浏览器中运行的 JS 代码都是编译器输出的代码，可读性很差。在开发过程中遇到 bug，可能需要通过断点调试去找出问题。webpack 支持生成 source Map，使用 chrome 的开发者工具，可以在 sources 栏中看到可调试的代码。

##### 2.6.2 devServer 配置
配置 devServer，可以通过命令行传入参数，也可以在配置文件中通过 `devServer` 传入参数。只有在通过 DevSrever 启动 webpack 是配置文件中的 `devServer` 才会生效，webpack 本身并不认识 `devServer` 配置项。

**hot**

是否启动HMR。要完启用 HMR，需要 `webpack.HotModuleReplacementPlugin`。使用 --hot 启动 webpack 或 webpack-dev-server，该插件将自动添加。

**historyApiFallback**

`historyApiFallback` 主要用于方便的开发使用了 html5 history api 的单页应用。设为 true 是，所有的 404 请求都会响应 index.html（一般在使用 history api 的 router 应用中，用户手动刷新页面时会出现）。

对于其他的情况，如应用由多个单页应用组成，也可以传递一个对象，并配置  `rewrites` 来根据不同的请求来返回不同的 HTML 文件。

**contentBase**

contentBase 配置 devServer HTTP 服务器的文件根目录，仅在需要提供静态文件时才进行配置。默认情况下为当前执行目录，通常为项目根目录，设置为 false 禁用。

DevServer 服务器通过 HTTP 服务暴露出的文件分为两类：
- 暴露 webpack 构建出的结果（构建结果交给了 DevServer，在本地找不到构建出的文件）。
- 暴露本地文件。

也可以配合 contentBasePublicPath 来告诉服务器使用哪个 URL 服务 contentBase 静态内容。

**headers**

为所有请求添加响应标头。

**host**

指定要使用的 host，默认为 'localhost'(127.0.0.1)，只有本地可以访问 devServer 的HTTP 服务；如果希望局域网中的其他设备可以访问到本地服务，可以设置为 '0.0.0.0' 或在启动 devServer 时带上 `--host 0.0.0.0`。

**port**

配置 devServer 服务监听的端口，默认使用 8080 端口。

**allowedHosts**

配置一个白名单，只有 http 请求的 host 在列表里才正常返回。

**disableHostCheck**

配置是否关闭用于 DNS 重绑定的 HTTP 请求的 HOST 检查，设置为 true 时会跳过 host 检查（不检查 host 的应用容易受到 DNS 重新绑定攻击）。

**https、http2**

配置 https、http2 协议服务，devServer 会自动生成一份 https 证书。

**clientLogLevel**

配置在客户端的日志等级，会影响在浏览器开发者工具控制台中看到的日志内容，枚举类型：`none | error | warning | info`，默认为 info，即输出所有日志。

**compress**

配置是否启用 gzip 压缩，boolean 类型，默认为 false。

**open**

告诉 dev-server 在服务器启动后打开浏览器，设置为 `true` 打开默认浏览器，也可以提供要使用的浏览器名称，如：`Google Chrome`。 同时提供了 `devServer.openpage` 用于打开指定 URL 的网页。也可以通过命令行使用。

#### 2.7 其它配置项
除了上面的配置项，Webpack 还提供了一些零散的配置项。

**target**

配置 JS 的应用场景：`web | node | async-node | webworker | electron-main | electron-render`。运行在不同环境的 JS 代码存在一些差异，webpack 在构建时会做出一些不同的操作。

**devtool**

配置 webpack 如何生成 source map，默认为 `false`，即不生成 Source Map。想要生成 source map 以方便调试，可以设置为 `source-map`。

**watch、watchOptions**

watch 设置为 true，webpack 会监听文件更新，在文件发生变化时重新编译。使用 webpack 时默认关闭，使用 devServer 时，默认开启。

webpack 还提供了 watchOptions 去更灵活的控制监听模式。如 
- `ignored` 不监听的文件或文件夹。
- `aggregateTimeout` 编译延迟时间，防止文件更新频繁导致编译频率太高。
- `poll` 轮询间隔，webpack 通过轮询系统指定文件是否变化判断文件是否变化。

**externals**

告诉 webpack 要构建的代码中使用了哪些不用被打包的模块，也就是说这些模块是外部环境提供的，在打包时可以忽略他们。

防止将某些 import 的包打包到 bundle 中，而是在运行时再去从外部获取这些扩展依赖（如从 CDN 引入 jQuery，若不适用 externals，则输出的 Chunk 中包含了 jQuery 的内容，而 CDN 还会再导入一次，浪费加载流量）。

通过 externals 可以告诉 webpack JS 运行环境已经内置了部分全局变量，针对这些全局变量不用打包进代码中而是直接使用全局变量即可。

**resolveLoader**

在使用 loader 时是通过其包名去引用的，webpack 需要根据其配置的 loader 包名去找到 loader 的实际代码，以调用 loader 去处理源文件。resolverLoader 用来告诉 webpack 如何去寻找 loader。

#### 2.8 多种配置类型
除了通过导出一个 Object 来描述 webpack 所需的配置外，还有其他更灵活的方式：

**导出一个 function**

大多数时候需要从同一份源代码中构建出多份代码，如一份用于开发，一份用于发布到线上。若是采用导出一个 Object 来描述 webpack 所需的配置方法，需要写两个文件，再在启动时通过 `webpack --config` 指定使用哪个配置文件。

采用导出 function 的方式，能通过 js 灵活的控制配置，只用写一个配置文件即可。主要通过运行 webpakck 时传入的参数来进行控制。

**导出一个返回 promise 的函数**

不能以同步的方式返回一个描述配置的 object 时使用。

**导出多份配置**

webpack 还支持导出一个数组，数组中的每份配置都会执行一遍构建。适合于用 webpack 构建一个要上传到 npm 仓库的库，库中可能需要包含多种模块化根式的代码，如 commonJS、UMD等。



参考：
- [Webpack 4 - entry与output（一）](https://zhuanlan.zhihu.com/p/40810439)
- [令人困惑的webpack之entry](https://segmentfault.com/a/1190000008288240)
- [深入浅出 Webpack](http://webpack.wuhaolin.cn/)

### 3.webpack 优化
webpack 优化可以分为两个部分：
1. 优化开发体验。
2. 优化输出质量。

**优化开发体验**

目的是提升开发效率，又可以分为：
1. 优化构建速度（开发中会经常构建，每次构建的耗时加起来也会是个大数目）
   - 缩小文件搜索范围
   - 使用 DllPlugin
   - 使用 HappyPack
   - 使用 parallelUglifyPlugin
2. 优化使用体验（通过自动化手段完成一些重复的工作）。
   - 使用自动刷新
   - 开启模块热替换

**优化输出质量**

目的是为了给用户呈现体验更好的网页，如减少首屏加载时间、提升性能流畅度等。本质是优化构建输出的要发布到线上的代码，可以分为：
1. 减少用户能感知到的加载时间，也就是首屏加载时间： 
   - 区分环境
   - 压缩代码
   - CDN 加速
   - 使用 Tree Shaking
   - 提取公共代码
   - 按需加载
2. 提升流畅度，也就是提升代码性能：
   - 使用 Prepack
   - 开启 Scope Hoisting

#### 3.1 缩小文件搜索范围
在遇到导入语句时 webpack 会做两件事：
1. 根据导入语句去寻找对应的要导入的文件。
2. 根据找到的导入文件的后缀，使用配置的 Loadre 去处理。

这两件事虽然处理一个文件很快，但文件量多了以后，构建速度慢的问题就会暴露出来。应当尽量减少以上两件事的发生：
1. 优化 loader 配置： 对文件的转换操作很耗时，需要让尽可能少的文件被 Loader 处理。使用 loader 时可以通过 include、exclude 配置去缩小命中范围。
2. 优化 resolve.modules 配置：默认值 `[node_modules]`，先去当前 ./node_modules 下寻找，没有找到再去 ../node_moudles、../../node_modules 中找，依次类推。可以指明第三方模块的决定路径，以减少寻找：`modules: [path.resolve(__dirname, 'node_modules')]` 其中 __dirname 表示当前工作目录，也就是项目根目录。
3. 优化 resolve.mainFields 配置：配置安装的第三方模块采用 package.json 哪个字段作为入口文件，默认值与 target 配置有关系。为了减少搜索，在明确第三方模块的入口文件描述字段时，可以把它设置的尽量少（大多都是 `main`）。

使用此字段优化时，需要考虑到所有运行时依赖的第三方模块的入口文件描述字段，只要有一个出错都可能造成构建出的代码无法正常运行。

4. 优化 resolve.alias 配置：大多数库发布到 npm 仓库时都会包含打包好的完整文件（如 react.min.js），使用这些文件可以跳过耗时的递归解析操作。

对于有些库使用此优化会影响到 Tree-Shaking 的优化，因为打包好的完整文件中部分代码可能项目中永远用不上。一般对整体性较强的库可以采用此方法优化；但对于一些工具类库如 lodash，项目中可能只用到其中几个工具函数，就不应该使用此方法去优化。
5. 优化 resolve.extensions 配置：这个列表越长或正确的后缀越在后面，就会造成尝试的次数越多。所以使用此配置时，要注意：
   - 后缀尝试列表要尽可能小。
   - 频率出现最高的文件后缀放到最前面。
   - 在源代码中写导入语句时，要尽可能带上后缀，从而避免寻找过程。
6. 优化 module.noParse 配置：让 webpack 忽略对部分没采用模块化的文件的递归解析处理，能提高构建性能。一些库如 Jquery，庞大且没有采用模块化标准，webpack 去解析耗时且没有意义。

另外上文提到的 resolve.alias 配置的 react.min.js 文件也没有采用模块化，也是可以忽略的对象。

#### 3.2 使用 DllPlugin
在一个 dll 中可以包含给其他模块调用的函数和数据，dll 主要用于帮助提升开发效率。主要是因为包含大量复用的模块的 dll 只需要编译一次，在之后的构建过程中 dll 包含的模块不会再重新编译，而是直接使用 dll 中的代码，这样可以大幅加快构建过程（大大减少 dev-server 的启动时间）。只要不升级 dll 中模块的版本，dll 就不用重新编译。

优点：
- 一旦 dll 生成，只要依赖不变，dll 文件就不会改变。
- dll 中的依赖包只需要在文件生成的时候进行一次编译打包，之后的构建过程就可以跳过这些依赖，加快构建过程。

缺点：
- 需要增加一份生成 dll 文件的webpack 配置，并需要修改原来的配置项去引入 dll 文件。
- 需要多一次 webpack 构建，打破原先的项目构建流程。
- dll 中的依赖有版本改变的时候，需要重新生成 dll 文件。

webpack 内置了对 dll 的支持，需要通过两个插件接入：
- DllPlugin 插件：用于打包出一个个单独的动态链接库文件。
- DllReferencePlugin 插件：用于在主要配置文件中去引入 DllPlugin 插件打包好的动态链接库文件。

基本过程：
1. 安装需要的两个插件。
2. 新建一个 webpack 的打包配置文件，用来生成 dll 文件（包含大量模块的代码）和对应的 manifest.json 文件（描述 dll 文件中包含哪些模块），这里要用到 DllPlugin 插件。
3. 在主配置文件中引入对应的 manifest.json 文件。这里要用到 DllReferencePlugin 插件。
4. 在两个 webpack 配置文件修改好之后，需要重新执行构建。这时要先把dll 相关的文件编译出来。
5. 之后只要 dll 包含的模块不升级，dll 文件也存在，就不需要再去编译 dll 相关的文件了。

#### 3.3 使用 happypack
构建时通常有大量文件需要解析和处理，而运行在 node.js 之上的 webpack 是单线程模型的，即需要处理的任务要一件件挨着做，不能并行。

Happypack 就是把任务分解给多个子进程去并发的执行，子进程处理完后再把结果发送给主进程（因为 JS 是单线程模型，想发挥多核 CPU 的能力，只能通过多进程去实现，而无法通过多线程实现）。

分解任务和管理线程的是 happypack 都会做好，只需要接入 happypack 即可。主要是结合 loader 和 plugin，plugin 中实例化 happypack，而 loader 中使用 id 选择使用哪个 happypack 实例去处理文件。

在实例化 happypack 插件时，支持参数：id、loader、threads、verbose、threadPool。使用 happyPack 需要安装依赖：happypack。

**原理**

在整个 webpack 构建中，最耗时的流程可能就是 loader 对文件的转换操作了。因为要转换的文件数量大，且这些转化操作只能一个个挨着处理。Happypack 的核心原理就是把这部分任务分解到多个进程去并行处理，从而减少了总的构建时间。

每通过 `new HappyPack()` 实例化一个 happypack 就是告诉 happypack 核心调度器如何通过一系列 loader 去转换一类文件，并且可以指定如何给这类转换操作分配子进程。

#### 3.4 使用 parallelUglifyPlugin
在使用 webpack 构建出用于发布到线上的代码时，都会有压缩代码这一流程。最常见的 js 代码压缩工具是 uglifyjs，且 webpack 也内置了它。

构建用于开发的代码很快就能完成，而构建用于线上的代码时会卡在代码压缩迟迟没有反应。因为压缩 js 代码需要先把代码解析成 AST，再去应用各种规则分析和处理 AST，导致这个过程计算量巨大，耗时非常多。

parallelUglifyPlugin 如 happypack 一样，将多进程并行处理的思想引入到了代码压缩中。当 webpack 有多个 JS 文件需要输出和压缩时，原本会使用 uglifyJs 去一个个挨着压缩再输出；而 paralleUglifyPlugin 则会开启多个子进程，把对多个文件的压缩工作分配给多个子进程去完成，而每个子进程其实还是通过 uglifyJs 去压缩代码，但是变成了并行执行，所以 paralleUglifyPlugin 能更快的完成对多个文件的压缩工作。

#### 3.5 使用自动刷新
在监听到本地源码文件变化时，自动重新构建出可运行的代码后再控制浏览器刷新。

在webpack 中监听一个文件发生变化的原理是定时去获取这个文件的最后编辑时间，每次都存下最新的最后编辑时间。若发现当前获取的和最后一次保存的最后编辑时间不一致，就认为该文件发生了变化。watchOptions.poll 和 watchOptions.aggregateTimeout 用于设置定时检查的周期和收集变化的时间。

默认情况下 webpack 会从配置的 entry 文件出发，递归解析出 entry 文件所依赖的文件，把这些依赖的文件都加入到监听列表中。保存文件路径和最后编辑时间需要占用内存，定时检查需要占用 CPU 以及文件 I/O，所以最好减少需要监听的文件数量和降低检查频率。

**优化监听性能**

默认情况下，entry 文件和其递归依赖的文件有很多会存在于 node_modules 下，导致 node_modules 中的这些文件也会被监听，而这一般是不必要的。通过 `watchOptions.ignored: /node_modules/` 忽略 node_modules下的文件，不去监听他们，webpack 消耗的内存和CPU将大大降低。

**自动刷新**

控制浏览器刷新有三种方法：
1. 借助浏览器扩展区通过浏览器提供的接口刷新，WebStorm IDE 的 LiveEdit 功能就是这样实现的。
2. 往要开发的网页注入代理客户端代码，通过代理客户端去刷新整个页面。
3. 把要开发的网页装进一个 iframe 中，通过刷新 iframe 去得到最新结果。

devServer 支持第2、3种方法（inline 值为 true 和 false）。

在开启 inline 时，DevServer 会为每个输出的 Chunk 中注入代理客户端的代码（因为不知道某个网页依赖那几个 Chunk），所以当项目需要输出的 Chunk 有多个时，这会导致构建缓慢。而这时关闭 inline 通过 iframe 的方式自动刷新，可以减少构建时间。不想使用 iframe 的话，需要手动往网页中注入代理客户端脚本。

#### 3.6 开启热模块替换
实时预览除了刷新整个网页外，DevServer 还支持模块热更新，可以在不刷新整个网页的情况下做到超灵敏的实时预览。原理是当源码发生变化时，只重新编译发生变化的模块，再用新输出的模块替换掉浏览器中对应的老模块。

模块热替换的优势：
- 反应更快，等待时间更短
- 不刷新网页能保留当前网页的运行状态，如使用 redux 时能够保持 store 中数据不变。

模块热替换技术很大程度上提高了开发效率和体验。

要开启 devServer 的模块热替换模式，有两种方式：
1. 启动 devServer 时带上参数 `--hot`（自动完成插件配置）。
2. 在 webpack.config.js 中接入 `HotModuleReplacement` 插件，设置 devServer.hot 为 true。
3. 做完步骤 1 或 2 之后，还需要在入口文件加上：
```js
if(module.hot) {
  module.hot.accept();
}
```

`module.hot.accept()` 接收两个参数：
- 第一个指出当前文件接受那些子模块的替换；
- 第二个是一个回调函数，用于指定在新的子模块加载完毕后需要执行的逻辑。

所以若是修改的文件在 `hot.accept()`第一个参数依赖之外，其更新事件一直往上抛到最外层也没有被 appcpt，就会直接刷新网页。

**优化模块热替换**

在发生模块热替换时，在浏览器控制台中会出现 `Updated modules: 68` 这样的内容，表示替换了 ID 为 68 的模块；这对开发者来说并不友好，最好是显示替换的模块的名称。可以使用 webpack 内置的插件 NamedModulesPlugin 来解决这个问题。

监听更少的文件也可以提升 HMR 的性能；但关闭 inline 模式，然后手动注入代理客户端的优化方法不能用于 HMR，因为 HMR 的运行依赖在每个 Chunk 中都包含代理客户端的代码。

#### 3.7 区分环境
开发网页的时候，一般都会有多套运行环境，如开发中方便调试的环境和线上的运行环境，这两套不同的环境都是由同一套源码编译而来，但代码内容不同，差异包括：
- 线上代码会被压缩。
- 开发环境的代码包含一些提示开发者的日志。
- 开发连接的后端数据接口地址和线上环境不同。

为了复用代码，在构建的过程中需要根据目标代码运行的环境输出不同的代码，因此需要一套机制在源码中区分环境。webpack 提供了实现：
```js
if(process.env.NODE_ENV === 'production') {

} else {

}
```
大概原理是借助环境变量的值去判断执行哪个分支。当代码中使用了 `process` 模块的语句时，Webpack 就会自动打包进 process 模块的代码以支持非 Node.js 的运行环境。这个注入的 process 模块作用是为了模拟 Node.js 中的 process，以支持 `process.env.NODE_ENV`的使用。

在 webpack 中可以使用 DefinePlugin 定义 NODE_ENV 环境变量的值，这里还要注意环境变量的值需要是一个由双引号包裹的字符串，如 `'"production"'`，可以使用 `JSON.stringify('production')`来生成。

执行构建后，输出的文件内容会变成：
```js
if(true) {

} else {

}
```
定义的环境变量的值被带入到源码中，`process.env.NODE_ENV` 被直接替换成了 true。且由于此时访问 process 的语句被替换了而没有了，webpack 也不会打包进 process 模块了。

注意：
- DefinePlugin 定义的环境变量只对 webpack 需要处理的代码有效，而不会影响 node.js 运行时的环境变量的值。
- 通过 Shell 脚本的方式定义的环境变量，如: `NODE_ENV=production webpack`，webpack 是不认识的，对 webpack 需要处理的代码中的环境区分语句是没有作用的。

**结合 UglifyJs**

构建出的代码还可以进一步优化，因为 `if(true)` 用于只会执行一个分支。webpack 没有实现去除死代码功能，但 UgilfyJs 可以做到。

**第三发库中的环境区分**

很多第三方库也做了环境区分的优化，如react：
1. 开发环境：包含类型检查、HTML 元素检查等针对开发者的警告日志代码。如：
   ```js
   if (process.env.NODE_ENV !== 'production') {
     warning(false, '%s(...): Can only ...')
   }
   ```
2. 线上环境：值保留 react 能正常运行的部分，以优化大小和性能。

环境判断语句`process.env.NODE_ENV !== 'production'` 中的 `NODE_ENV` 和 `production` 两个值都是社区的约定，通常用该判断语句区分开发环境和线上环境。

#### 3.8 压缩代码
浏览器从服务器访问网页是获取的 JS、CSS 资源都是文本形式的，文件越大网页加载时间越长。为了提升网页加载速度和减少网络传输的流量，可以对这些资源进行压缩。压缩方法可以分为两种：
1. 通过 GZIP 算法对文件压缩。
2. 对文本本省进行压缩。除了有提升网页加载速度的优势，还有混淆源码的作用。

**压缩 JS**

目前最成熟的 JS 代码压缩工具是 UglifyJS，它会分析 JS 代码语法树，理解代码含义，从而能做到如：去掉无效代码、去掉日志输出代码、缩短变量名等优化。

在 webpack 中引入 UglifyJS 需要通过插件的形式，目前有两种方式：
- UglifyJsPlugin: 通过封装 UglifyJS 实现压缩。
- ParallelUglifyPlugin: 多进程并行处理压缩。

UglifyJs 提供了非常多的选择用于配置在压缩过程中采用哪些规则，如 sourceMap， output.beautify， output.comments, compress.warning，compress.drop_console 等等。具体见[uglify-js 文档](http://www.suoniao.com/article/52)

**压缩 ES6**

在运行环境允许的情况下，应尽可能使用原生的 ES6 代码去运行，而不是转换后的 ES5 代码。压缩 ES6 需要专门针对 ES6 代码的 UglifyES，它和 UglifyJs 来自同一个项目的不同分支，使用 UglifyESPlugin 时要注意不让 babel-loader 输出 ES5 的语法，需要去掉 .babelrc 配置文件中的 babel-preset-env，但其他 babel 插件，如 babel-preset-react 还是要保留。

**压缩 CSS**

CSS 代码也可以像 JS 那样被压缩，以达到提升加载速度和代码混淆的作用，目前比较成熟可靠的 CSS 压缩工具是 cssnano。

#### 3.9 CDN 加速
实际上最影响用户体验的还是网页首次打开时的加载等待，导致这个问题的根本原因是网络传输过程耗时过大，CDN 的作用就是加速网络传输。

CDN 有加内容分发网络，通过把资源部署到世界各地，用户在访问时按照就近原则从离用户最近的服务器获取资源，从而加速资源的获取速度。

要给网站接入 CDN，需要把网页的静态资源上传到 CDN 服务上去，在访问这些静态资源的时候需要通过 CDN 服务提供的 RUL 地址去访问。

CDN 一般会给资源开启很长时间的缓存，为了避免新发布的内容不能立即生效，一般会：
1. 将 HTML 放到自己的服务器上，而不是 CDN 服务上，同时关闭自己服务器上的缓存。自己的服务器只提供 HTML 文件和数据接口。
2. 针对静态的 JS、CSS、图片等文件，则上传到 CDN，开启缓存，同时给每个文件带上由文件内容算出的 Hash 值。只要文件内容变化，其对应的 URL 就会变化，就可以获取到新的文件。

资源 URL 省略掉 `http:` 或 `https:` 的好处是在访问这些资源的时候会自动的根据当前 HTML 的 URL 是采用什么协议去决定采用哪一个协议。

浏览器对同一个域名的资源的并行请求有限制的，要解决这个问题，可以把这些静态资源分散到不同的 CDN 服务上去，如根据文件类型：js.cdn.com、css.cdn.com、img.cdn.com。多域名的一个问题时域名解析会增加域名解析时间，一个解决办法是在 HTML head 标签中加入 `<link rel="dns-prefetch" href="//js.cdn.com">` 去与解析域名，降低域名解析带来的延迟。

所以用 webpack 实现 CDN  的接入时，构建需要实现：
1. 静态资源导入的 URL 从相对于html 文件的路径变成指向指向 CDN 服务的绝对路径。
2. 静态资源文件名称需要带上根据文件内容算出的 hash 值。
3. 不同类型的资源放到不同域名的 CDN 服务上。

webpack 最核心的部分是通过 publicPath 参数设置存放静态资源的 CDN 目录 URL，为了让不同类型的资源输出到不同的 CDN，需要分别在：
- output.publicPath 中设置 JS 的地址。
- css-loader.publicPath 中设置 CSS 导入的资源的地址。
- webplugin.stylePublicPath 中设置 CSS 文件的地址。

#### 3.10 使用 tree shaking
Tree shaking 可以用来剔除 JS 中用不上的死代码，它依赖静态的 ES6 模块化语法。

要让 Tree Shaking 正常工作的语法的前提是交给 Webpack 的 JS 代码必须是采用 ES6 模块化语法的，因为 ES6 模块化语法是静态的（导入导出语句中的路径必须是静态的字符串，而且不能放入其他代码块中），所以 webpack 可以简单的分析出哪些 export 的被 import 了。而采用 ES5 中的模块化，webpack 无法分析出哪些代码可以剔除。

目前 Tree Shaking 的局限性：
- 不会对 entry 入口文件做 tree shaking。
- 不会对异步分割出去的代码做 tree shaking。

**接入 tree shaking**

webpack 配置 tree shaking:
1. 为了把采用 ES6 模块化的代码交给 webpack，需要配置 babel 让其保留 ES6 模块化语句，设置 .babelrc 的 presets 中 `"modules": false` 来关闭 babel 的模块转化功能，保留原本的 ES6 模块化语法。
2. 重新运行 webpack，启动 webpack 是带上 `--display-used-exports` 参数，可以在控制台中看到 `[only some exports used: funA]` 类似的提示，索命 webpack 确实分析出了死代码。
3. 但是在构建出的文件中，依然存在没有用上的代码。webpack 只是指出了哪些代码用上了，哪些没用上。而要剔除死代码还的经过 UglifyJS 处理一遍。
4. 使用 UglifyJS 即可以通过加入 UglifyJSPlugin 实现，也可以简单的通过在启动 webpack 时带上 `--optimize-minimize` 参数实现。

大部分 npm 中的代码都是采用的 CommonJS 语法，所以对于项目中使用的大量第三方库，tree shaking 并不能很好的处理。然后有些库考虑到了这点，在发布到 npm 上时会同时提供两份代码，一份采用 commonJS 模块化语法，一份采用 ES6 模块化语法，并在 package.json 中分别指出了这两份代码的入口（社区约定为 `main`和`jsnext:main`）。所以在 webpack 中可以配置 `resolve.mainFields: ['jsnext:main','browser','main']`，尽量优化提供了 ES6 模块化语法的库。

#### 3.11 提取公共代码
大型网站通常会由多个页面（每个页面都是一个独立的单页应用）组成。这些页面大都采用同样的技术栈，以及使用同一套样式代码，这导致这些页面之间有很多相同的代码。

若每个页面都包含这些公共的代码，则或造成：
1. 相同的资源被重复加载，浪费用户的流量和服务器成本。
2. 每个页面需要加载的资源太大，导致网页首屏加载缓慢，影响用户体验。

将多个页面公共的代码抽离成单独的文件，就能优化这个问题。用户第一次访问后，这些公共代码的文件就被浏览器缓存起来，在用户切换到其它页面时，就可以直接从缓存中获取公共代码。这样做的好处：
1. 减少网络传输的流量，降低服务器成本。
2. 用户第一次打开网站的速度没有得到优化，但之后访问其它页面的速度将大大提升。

提取公共代码的原则：
1. 根据技术栈，找出共用的基础库，将他们提取到一个单独的文件（一般命名为 base.js）。
2. 除了 base.js 中的代码，再找出所有页面都依赖的公共代码，提取出来放到 common.js 中。之所以要将基础库提取到 base.js 中去，是为了长期缓存这个文件，只要不升级基础库的版本，就不用更新缓存；且 base.js 通常很大，对网页加速能起到很大的效果。
3. 最后为每个网页生成一个单独的文件，文件中不再包含 base.js 和 common.js 中的代码，而只包含各个页面单独需要的部分代码。

**使用 webpack 提取公共代码**

webpack 内置了专门用于提取多个 Chunk 中公共部分的插件 CommonsChunkPlugin，使用它可以选择从哪些 chunk 中提取公共代码（默认从所有已知 chunk 中提取），以及定义提取出的公共部分的名称。

直接使用 CommonsChunkPlugin，输出的 chunk 中还会包含所有页面都依赖的基础运行库，为了进一步将基础库从 common 中抽离到 base 中去，还需要：
1. 实现一个 base.js 文件，其中引入所有依赖的基础库。
2. 使用 AutoWebPlugin，提取出所有页面公共的代码，将 chunk 命名为 common。
3. 在 webpack 配置文件的 entry 中加入 base.js，使用 CommonsChunkPlugin 再次提取 common chunk 和 base chunk 中的公共部分到 base chunk 中。这样可以从 common chunk中提取出 base chunk 中也包含的部分，从而让 common 变得更小， 而 base 则保持不变。

针对 CSS 资源，这样的方法依然有效。

很多时候，除基础库外很难再找到所有页面都会用上的模块，这可能会导致 common.js 中没有代码。这时可以：
1. CommonsChunkPlugin 提供 minChunks 选项，表示在所有 chunk 中，只要被 minChunks 个 chunk 引用则文件就会被提取。minChunks 越小，会导致页面加载到的不相关代码越多；minChunks 越大，common.js 变小，效果变弱。
2. 根据各个页面之间的相关性选取其中的部分页面使用 CommonsChunkPlugin 去提取公共部分，而不是提取所有页面的公共部分，这样的操作可以叠加多次。这样效果会很好，但缺点是配置复杂，需要根据页面之间的关系去思考如何配置。

#### 3.12 分割代码按需加载
对于采用单页应用作为前端架构的网站来说，会面临着一个网页需要加载的代码量很大的问题，因为许多功能都集中的做到了一个 HTML 中。这会导致网页加载缓慢、交互卡顿，降低用户体验。

导致这个问题的原因在于一次性的加载所有功能对应的代码，但其实用户每一阶段只可能使用其中一部分功能。所以解决这个问题的方法就是用户当前需要用什么功能就只加载这个功能对应的代码，也就是所谓的按需加载。

**使用按需加载**

给单页应用做按需加载优化时，一般采用的原则：
1. 将整个网站划分成一个个小功能，再按照每个功能的相关程度把他们分为几类。
2. 将每一类合并为一个 Chunk，按需加载对应的 Chunk。
3. 对于用户首次打开网站时看到的内容所对应的功能，不需要按需加载，而是放到执行入口所在的 Chunk 中，以降低用户能感知的网页加载时间。
4. 对于个别依赖大量代码的功能点，如依赖 chart.js 画图，依赖 flv.js 播放视频，可再对其进行按需加载。

被分割出去的代码的按需加载需要一定的时机去触发，一般是用户操作到或即将操作到对应的功能时再去加载对应的代码，这些加载时机需要开发者自己根据网页的需求来衡量和确定。

由于按需加载的代码在加载的过程中也需要耗时，所以可以预言用户接下来可能会进行的操作，并提前加载好对应的代码，从而让用户感知不到网络加载时间。

webpack 内置了强大的分割代码的功能来实现按需加载：
- 在代码中可以通过 `import(/* webpackChunkName: "show" */ './show').then()` 类似的代码来实现按需加载，因为 webpack 内置了对 `import(*)` 语句的支持，当 webpack 遇到类似的语句时，会：
- 以 .show.js 为入口新生成一个 Chunk；
- 当代码执行到 `import` 所在语句时才会去加载有 Chunk 对应生成的文件。
- import 返回一个 Promise，当文件加载成功时可以在 Promise 的 then  方法中获取到 show.js 导出的内容。

使用 import() 分割代码后，要注意：
- 浏览器支持 Promise API 才能让代码正常运行。
- `/*webpackChunkName: "show"*/` 的含义是为动态生成的 Chunk 赋予一个名称，以方便追踪和调试代码。若不指定动态生成的 Chunk 的名称，默认为 `[id].js`。
- 为了正确输出 `/* webpackChunkName: "show" */` 中配置的 ChunkName，还需要配置 webpack 配置文件中 `output.chunkFilename: '[name].js'` 来为动态加载的 Chunk 配置输出的文件的名称。

搭配 react-router 可以使用高阶组件来封装需要异步加载的组件。同时 react-router 还有自己的 [代码分割和懒加载的建议](https://reactrouter.com/web/guides/code-splitting)

#### 3.13 使用 Prepack
代码的压缩或分块等等，都是在网络加载层面的优化，除此之外还可以优化代码在运行时的效率，Prepack 就是为此而生。

Prepack 由 Facebook 开源，采用较为激进的方法：在保持运行结果一致的情况下，改变源代码的运行逻辑，输出性能更高的 JS 代码。实际上 Prepack 就是一个部分求值器，编译代码时提前将计算结果放到编译后的代码种，而不是在代码运行时采取求值。

Prepack 通过在编译阶段预先执行了源码得到执行结果，再直接把结果输出来以提升性能。工作原理和流程大致为：
1. 通过 Babel 把 JS 源码解析为 AST，以方便更细粒度地分析源码；
2. Prepack 实现了一个 JS 解释器，用于执行源码。借助解释器 Prepack 才能掌握源码具体是如何执行的，并把执行过程中的结果返回到输出中。

Prepack 还处于初期，有很多局限（Webpack3 的时候，现在可能有了优化），如：
- 不能识别 DOM API 和部分 Node.js API，若源码中有调用依赖运行环境的 API 就会导致 Prepack 报错；
- 存在优化后代码性能反而更低的情况。
- 存在优化后代码文件尺寸大大增加的情况。

暂时不推荐把 Prepack 用于线上环境。

要在 webpack 中实现 Prepack 的话，社区中有相应的插件：prepack-webpack-plugin，只需在配置文件中添加该插件实例即可。

#### 3.14 开启 Scope Hoisting
Scope Hositing 可以让 Webpack 打包出来的代码文件更小、运行得更快，又译作“作用域提升”。

Scope Hoisting 的原理是：分析出模块之间的依赖关系，尽可能的把打散的模块合并到一个函数中去，但前提是不能造成代码冗余，因此只有那些被引用了一次的模块才能被合并。这样做的好处是：
1. 代码体积更小，因为函数声明语句会产生大量代码。
2. 代码在运行时因为创建的函数作用域变少（函数变少），内存开销也随之变小。

Scope Hoisting 需要分析出模块之间的依赖关系，因此源码必须采用 ES6 模块化语句，这与 TreeShaking 类似，而同样要对第三方库也做这些处理的话，还需要配置 resolve.mainFields 属性，尽量对提供了 ES6 模块化代码的第三方库做 Scope Hoisting。

而在 webpack 中使用 scope hoisting 也非常简单，只需配置插件 ModuleConcatenationPlugin 即可。

#### 3.15 输出分析
除了常用的优化方法，也可以对输出结果做出分析，来决定具体的优化方向：
1. 最直接的分析方法时阅读 webpack 输出的源码，但可读性非常差且文件非常大。
2. 社区出现了许多可视化的分析工具，可以把结果更加直观的展示出来。使用 `webpack --profile --json > stats.json`（--profile 记录构建过程中的耗时信息，--json 表示已JSON 的格式输出构建结果，这个文件中包含所有构建相关的信息） 来生成一个 stats.json 文件，并将这个文件给可视化分析工具使用：
   - webpack 官方可视化分析工具 Webpack Analyse，是一个在线web 应用。它不会发送文件到服务器，而是在浏览器本地解析。上传 stats.json 文件，会解析出具体信息（包含 modules, chunks, assets, warnings, errors, hints（从 hints 可以看出每个文件在处理过程中的开始时间和结束时间） 几个板块）。
   - webpack-bundle-analyzer，虽然没有官方那么多功能，但比官方更加直观。能方便看出打包文件包含内容，文件尺寸在总体占比，模块之间的包含关系，每个文件的 Gzip 后的大小。

接入 webpack-bundle-analyzer 需要：
1. 安装 webpack-bundle-analyzer 到全局。
2. 生成 stats.json 文件。
3. 在项目根目录执行 webpack-bundle-analyzer 后，浏览器会打开对应网页。



参考：
- [webpack 优化](http://webpack.wuhaolin.cn/4%E4%BC%98%E5%8C%96/)
- [webpack 升级优化小记：happy+dll 初体验](https://juejin.cn/post/6844903734007300109)