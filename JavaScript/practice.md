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