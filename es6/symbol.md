# Symbol
### 1. 概述
ES5 的对象属性名都是字符串，当多个人操作同一个对象的时候，容易冲突。ES6 引入 Symbol，是为了保证可以使得属性名独一无二，这可以从根本上防止属性名的冲突。

Symbol 的使用与特点：
1. Symbol 也是一种原始数据类型（不能用作构造函数，symbol 值不是对象，不能添加属性）
2. Symbol 值通过 Symbol 函数生成，因此对象的属性名现在可以有两种类型：
   - 原来就存在的字符串。
   - 新增的 Symbol 类型, `typeof Symbol() === 'symbol'`;
3. `Symbol()` 函数接收一个字符串作为参数，表示对 symbol 实例的描述，主要是为了在控制台显示，或转为字符串时比较容易区分：`Symbol('test').toString === 'Symbol(test)'`；若参数是一个对象，则会调用对象的 toString 方法将其转为字符串。
4. Symbol() 函数的参数只表示对当前 Symbol 值的描述，因此相同参数的 Symbol 函数返回值不等:
   ```js
   Symbol('te') === Symbol('te');  //false
   Symbol('te') == Symbol('te');  //false

   ```
5. ES2019 提供了一个实例属性：`Symbol('te').description === 'te'` 直接返回 Symbol 的描述更加方便。

### 2. 作为属性名的 Symbol
使用 Symbol 意味着能保证不会出现同名的属性，这对于一个对象由多个模块构成的情况非常有用。一般使用会将 Symbol() 赋值给一个变量，再将变量作为属性名，之后也是使用属性名来访问，这样既不会冲突，也方便自己使用。使用：
```js
let mySymbol = Symbol();

//属性写法一
let a = {};
a[mySymbol] = 'test';

//属性写法二
let a = {
  [mySymbol]: 'test';
}

//属性写法三：
let a = {};
Object.defineProperty(a, mySymbol, { value: 'test' });

//方法写法一：
let obj = {
  [mySymbol]: function (args) {}
}

//方法写法二（增强的对象写法）：
let obj = {
  [mySymbol](args) {}
}

//访问
a[mySymbol];
obj[mySymbol]('test');
```
点运算符后面总是字符串，因此 Symbol 值作为对象属性名时，需要使用方括号。

### 3. 属性名的遍历
Symbol 作为属性名，遍历对象的时候，不会出现在 `for...in`、`for...of`循环中，也不会被 Object.keys()、Object.getOwnPropertyNames()、JSON.stringify()返回。

新的api:
1. 使用 `Object.getOwnPropertySymbols()` 方法可以获取指定对象的所有 Symbol 属性名，它返回一个数组，成员是当前对象的所有用作属性名的 Symbol 值（typeof 结果为 'symbol'）。
2. `Reflect.ownKeys()` 方法返回所有类型的键名，包括常规和 Symbol 键名。

### 4. Symbol.for()，Symbol().keyfor()
想要使用同一个 Symbol 值，可以使用 Symbol.for()。它接收一个字符串为参数，然后搜索有没有以该参数作为描述的 Symbol 值（似乎是在全局搜索，而不是当前作用域）。若有，则返回这个 Symbol 值；否则就新建一个以该字符串为描述的 Symbol 值，并将其注册到全局。
```js
let s1 = Symbol.for('test');
let s2 = Symbol.for('test');
s1 === s2; //true
```

`Symbol.keyFor()`方法返回一个已登记的 Symbol 类型的值的 key，没有登记到全局会返回 undefined.
```js
let s = Symbol.for('foo');
Symbol.keyFor(s); //foo
```

Symbol.for() 的这个全局登记特性，可以在不同的 iframe 或 service worker 中取到同一个值。