1. 获取 url 中参数，正则写法：
```js
let url = 'http://www.bilibili.com?name=long&age=25&id=1'
let match = []
let reg = /[?|&](\w+)=(\w*)/g
const params = {}
match = reg.exec(url)
while(match != null) {
  params[match[1]] = match[2] 
  match = reg.exec(url)
}
console.log('params: ', params)
```

2. 对象下划线属性转驼峰
```js
let a = {
  a_b23_d: '123',
  c_dfe_ffes: '345'
}
for(let key in a) {
  newKey = key.replace(/_(\w)/g, (_, matchChar) => matchChar.toUpperCase())
  a[newKey] = a[key]
  delete a[key]
}
console.log(a)
```
3. 把 a.b.c 变成 { a: { b: c } }
```js
//把 a.b.c 变成 { a: { b: c } }
let str = 'a.b.c.d.e.f.g'
let arr = str.split('.')
const length = arr.length
const transformToObj = index => {
  if(index >= length - 1) {
    return arr[length - 1]
  }
  let obj = {}
  obj[arr[index]] = transformToObj(index + 1)
  return obj
}
console.log(JSON.stringify(transformToObj(0)))
```
4. 模拟 bind 实现
```js
//不考虑当做构造函数使用
Function.prototype.myBind = (context) => {
  const that = this
  if(typeof that !== 'function') {
    throw new TypeError('Function.prototype.myBind: what is to be bind is not a function')
  }
  const args = Array.prototype.slice.call(arguments, 1)
  return function () {
    const bindArgs = Array.prototype.slice.call(arguments)
    return that.apply(context, args.concat(bindArgs))
  }
}

//考虑构造函数
Function.prototype.myBind = (context) => {
  const that = this
  if(typeof that !== 'function') {
    throw new TypeError('Function.prototype.myBind: what is to be bind is not a function')
  }
  const args = Array.prototype.slice.call(arguments, 1)
  const bindF = function() {
    const bindArgs = Array.prototype.slice.call(arguments)
    //除了 instanceof，使用 new.target 应该也是一样的
    return that.apply(this.instanceof bindF ? this : context , args.concat(bindArgs))
  }
  //原型对象应该是被调用函数的原型，但是这样bindF.prototype 的修改会影响到原函数
  bindF.prototype = that.prototype
  //这样可以避免影响
  bindF.prototype = Object.create(that.prototype)
  return bindF
}

```

5. 实现 promise.all
```js
Promise.prototype.all = (PromiseArr) => {
  return new Promise((resolve, reject) => {
    const result = []
    for(let i = 0; i < promiseArr.lenght; i++) {
      Promise.resolve(promiseArr[i]).then(data => {
        result[i] = data
        if(result.length === promiseArr.length) {
          resolve(result)
        }
      }).catch(err => {
        reject(err)
      })
    }
  })
}
```