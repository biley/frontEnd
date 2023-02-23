# 1. Generator 与 async

## 1.1 Generator
基于 pdf 的补充

Generator 函数就是遍历器生成函数，因此可以直接把 Generator 赋值给对象的 [symbol.iterator] 属性。

Generator 函数需要以 function* 来定义，因此箭头函数无法成为 Generator 函数。

Generator 内部的 return 语句和 yield 类似，除了会终止函数之外，也会返回 value 为 return 表达式的值，done 为 true 的对象。

### 1.1.1 Generator 实现 ajax 的同步化表达
```js
function* main() {
  const result = yield myReq('http://xxx')
  const res = JOSN.parse(result)
  console.log(res)
  return result
}

const iter = main()
iter.next()

const myReq = url => {
  const req = new XMLHttpRequest()
  req.onreadyStateChange = () => {
    if(req.status === 200) {
      iter.next(req.responseText) //通过回调中调用 next 来模拟同步
    } else {
      iter.next(req.status)
    }
  }
  req.open('get', url)
  req.send()
}
```
```js
//基于 chunk 的方式，自动管理流程。主要还是在回调中调用 next 方法，不过这个就是把回调函数提出来做为一个通用参数了。
const chunkReq = url => {
  return function(callback) {
    const req = new XMLHttpRequest()
    req.onreadyStateChange = () => {
      if(req.status === 200) {
        callback(req.responseText)
      } else {
        callback(req.responseText)
      }
    }
    req.open('get', url)
    req.send()
  }
}

function* main() {
  const result1 = yield chunkReq('http://xxx')
  console.log(result1)
  //...
  const result2 = yield chunkReq('http://xxx')
  console.log(result2)
}

function run() {
  
  function gen(data) {
    cosnt re = iter.next(data)
    if(re.done) {
      return
    }
    re.vale(gen)
  }
  const iter = main()
  gen()
}

run()
```

## 2.async
### 2.1 顶层 await
早期 ES 规定 await 只能存在 async 函数的内部，从 ES2022 开始允许在模块的顶层独立使用 await 命令。它的主要目的是使用 await 解决模块异步加载的问题。
```js
const data = await fetch('https://api.example.com');
```
若原始模块内有异步操作，就可以让原始模块输出一个 Promise 对象，然后结合 await 来处理这类模块的引入。