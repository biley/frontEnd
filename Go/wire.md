## Wire
wire 是一个轻巧的依赖注入工具，通过自动生成代码的方式在编译期完成依赖注入。

### 1. 核心
provider 和 injector 使 wire 的两个核心概念。

**provider**

通过提供 provider 函数，让 wire 知道如何产生这些依赖对象。wire 根据 injector 函数签名，生成完整的 injector 函数。injector 是最终需要的函数，它将按照顺序调用 provider。

provider 就是普通的 Go 函数，可以把它看作是某对象的构造函数，通过 provider 告诉 wire 该对象的依赖情况。

**injector**

模块： 页面，版本，  应用（路由）
h1:
1. 平台水印、diff、自定义、id 校验
2. 业务支持，技改平台，业务平台

h2:
数据源（amis 原来的东西？）、


injector 是 wire 生成的函数，我们通过调用 injector 来获取所需的对象或值，injector 会按照依赖关系，顺序调用 provider 函数，按照顺序初始化依赖，之后就只需要调用 injector 方法就可以得到需要的对象了。


需要写一个函数告诉 wire 怎么生成 injector:
- 定义 injector 的函数签名。
- 在函数中使用 wire.Build 方法列举生成 injector 所需的 provider。
- 然后就根据生成对应目标值所需的依赖，再分析依赖的依赖，如此找到所有需要的 provider 并以此调用。



可以使用 wire.NewSet 将通常会一起使用的依赖组合起来


参考：
- [Golang 依赖注入框架 wire 使用详解](https://blog.csdn.net/uisoul/article/details/108776073)