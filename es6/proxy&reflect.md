# Proxy

### 1. 概述
Proxy 用于修改某些操作的默认行为，等同于在语言层面做出修改，所以属于一种“元编程（meta programming）”，即对编程语言进行编程。实际 Proxy 重载了点运算符，即用自己的定义覆盖了语言的原始定义。

Proxy 可以理解为，在目标对象之外架设一层“拦截”，可以对外界的访问进行过滤和改写。

### 2. 使用
1. ES6 原生提供了 Proxy 构造函数，用于生成 Proxy 实例：
```js
const handler = {
  get: function(target, name) {}
}
const Proxy = new Proxy(target, handler)
```  
如果 `handler`没有设置任何拦截，那就等同于直接通向原对象。  

2. Proxy 实例也可以作为其他实例的原型对象，当根据原型链到 Proxy 上读取属性时，会被对应的 handler 拦截。  
3. Proxy 支持的拦截操作一共 13 种，包含 
`get(target, propKey, receiver)`;  
`set(target, propKey, value, receiver)`;  
`has(target, propKey)`，拦截 `hasProperty`操作，比如 `in`运算符（对 `for in` 不生效）；  
`deleteProperty(target, propKey)`，拦截 `delete`，;  
`apply(target, object, args)`，拦截 Proxy 实例作为函数调用的操作;  
`construct(target, args)`  
...
4. 多层嵌套，可能需要多层代理

# Reflect

### 1. 概述
Reflect 对象与 Proxy 对象一样，也是 ES6 为了操作对象而提供的新 API。设计目的：  
1. 将 Object 对象的一些明显属于语言内部的方法（如：Object.defineProperty），放到 Reflect 对象上。目前 Reflect 和 Object 二者都部署了，未来的新方法将只部署在 Reflect 对象上。
2. 修改某些 Object 方法的返回结果，让其变得更合理。如：Object.defineProperty(obj, name, desc) 在无法定义属性时会抛出错误，而 Reflect.defineProperty(obj, name, desc) 则会返回 false。
3. 让某些命令式 Object 操作都变成函数行为，如 `in`操作符 => `Reflect.has(obj, name)`；`delete` => `Reflect.deleteProperty(obj, name)`
4. Reflect 对象的方法与 Proxy 对象的方法一一对应
5. 很多操作会更易读，如 `Function.prototype.apply.call()` => `Reflect.apply()`

需要注意，Reflect 的get、set的属性如果设置了 getter，则 getter、setter 的属性会指向 reciever 参数。


/**
 * @param {string[][]} equations
 * @param {number[]} values
 * @param {string[][]} queries
 * @return {number[]}
 */
var calcEquation = function(equations, values, queries) {

};


给你一个变量对数组 equations 和一个实数值数组 values 作为已知条件，其中 equations[i] = [Ai, Bi] 和 values[i] 共同表示等式 Ai / Bi = values[i] 。每个 Ai 或 Bi 是一个表示单个变量的字符串。

另有一些以数组 queries 表示的问题，其中 queries[j] = [Cj, Dj] 表示第 j 个问题，请你根据已知条件找出 Cj / Dj = ? 的结果作为答案。

返回 所有问题的答案 。如果存在某个无法确定的答案，则用 -1.0 替代这个答案。如果问题中出现了给定的已知条件中没有出现的字符串，也需要用 -1.0 替代这个答案。

注意：输入总是有效的。你可以假设除法运算中不会出现除数为 0 的情况，且不存在任何矛盾的结果。

 

示例 1：

输入：equations = [["a","b"],["b","c"]], values = [2.0,3.0], queries = [["a","c"],["b","a"],["a","e"],["a","a"],["x","x"]]
输出：[6.00000,0.50000,-1.00000,1.00000,-1.00000]
解释：
条件：a / b = 2.0, b / c = 3.0
问题：a / c = ?, b / a = ?, a / e = ?, a / a = ?, x / x = ?
结果：[6.0, 0.5, -1.0, 1.0, -1.0 ]
示例 2：

输入：equations = [["a","b"],["b","c"],["bc","cd"]], values = [1.5,2.5,5.0], queries = [["a","c"],["c","b"],["bc","cd"],["cd","bc"]]
输出：[3.75000,0.40000,5.00000,0.20000]
示例 3：

输入：equations = [["a","b"]], values = [0.5], queries = [["a","b"],["b","a"],["a","c"],["x","y"]]
输出：[0.50000,2.00000,-1.00000,-1.00000]

