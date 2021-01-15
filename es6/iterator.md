# Iterator
### 1. 概念
JS 中原有的表示集合的概念主要是 Array 和 Object，ES6 又添加了 Map 和 Set，用户还可以组合使用他们。这就需要一种统一的接口机制，来处理所有不同的数据结构。

Iterator 是一种接口，为各种不同的数据结构提供统一的访问机制。任何数据只要部署 Iterator 接口，就可以完成遍历操作。

Ietrator 作用：
1. 为各种数据结构，提供统一的、简便的访问接口；
2. 使得数据结构的成员能够按照某种次序排列。
3. ES6 提供了一种新的遍历命令 for...of 循环，Iterator 接口主要供 for...of 消费。

Iterator 主要使用 next 方法进行遍历，模拟 next 方法返回值：
```js
var it = makeIterator(['a', 'b']);

it.next() // { value: "a", done: false }
it.next() // { value: "b", done: false }
it.next() // { value: undefined, done: true }

//遍历器生成函数
function makeIterator(array) {
  var nextIndex = 0;
  return {
    next: function() {
      return nextIndex < array.length ?
        {value: array[nextIndex++], done: false} :
        {value: undefined, done: true};
    }
  };
}
```
可以看出，Ietrator 只是把接口规格加到数据结构之上，所以，遍历器与它所遍历的那个数据结构实际上时分开的。

### 2. 默认 Ietrator 接口
ES6 规定，默认的 Iterator 接口部署在数据结构的 `Symbol.iterator` 属性中，即一个数据结构，只要具有 `Symbol.iterator` 属性，就可以认为是 iterable（可遍历的）。对象之所以没有默认部署 Iterator 接口，是因为对象哪个属性先遍历，哪个后遍历是不确定的，需要开发者手动指定。

Symbol.iterator:
1. Symbol.iterator 属性本身是一个函数，就是当前数据默认的遍历器生成函数。执行这个函数，就会返回一个遍历器。`[][Symbol.iterator]().next() //{value: undefined, done: true}`。
   ```js
   function Obj() {};
   Obj.prototype[Symbol.iterator] = function() {
     return {
       next: function() {
         return {value: null, done: true}
       }
     }
   }
   ```
2. 属性名 Symbol.iterator 是一个表达式，返回 Symbol 对象的 iterator 属性，这是一个预定义好的、类型为 Symbol 的特殊值，所以需要放在方括号内。

Symbol.iterator() 方法最简单的实现，还是使用 Generoator 函数。