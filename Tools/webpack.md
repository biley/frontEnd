### 1.webpack
webpack：一个现代JavaScript 应用程序的静态模块打包器

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
   - ~version: 小版本
   - ^version: 中版本和小版本

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
       minimizer: [new tersetPlugin({
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
   webpack 的核心特性： 一切皆模块(所有的资源，模板，样式(css等)，图片)，通过 loader 来解析这些不属于 js 的语法。plugin 强调事件监听的能力，它可以在 webpack 中监听一些事件，并改变一些文件打包后的输出结果。

   webpack、webpack-dev-server 命令在本质上都是一个可执行文件，可以在 node_modules 的 .bin 目录下找到他们，没有全局安装的话，也可以通过调用可执行文件来执行。npm5.2 之后提供了npx,npx 会先去node_modules的.bin下检测命令是否存在，没有回尝试下载，然后再执行。webpack-dev-server根据参数可以选择不同的webpack config 文件来运行。

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

   babel 单独使用转换规则配置可以写在 package.json 中`"babel": {"presets": ["@babel/preset-env"]}`，也可以新建一个 .bablerc 文件来写入`{"preset":["@babel/preset-env"]}`。 .bab lerc 文件优先级更高。

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
