### 1. 执行环境(execution context)
##### 1.1 执行环境理解
执行环境是 ECMA-262 中用以区分不同的可执行代码的抽象概念。可执行代码可以分为:
1. 全局代码：程序载入后的默认环境
2. 函数代码
3. Eval 代码

当程序的执行流进入到一个可执行的代码时，就进入了一个执行环境中。

##### 1.2 执行环境栈
当执行流进入函数时，函数的`执行环境`会被推入一个`环境栈`中，执行完毕之后弹出，将控制权返回给之前的`执行环境`，栈的底部永远是全局执行环境。这样实现的原因是 JS 的解释器是单线程的，即同一时刻只处理一件事情，其他等待执行的上下文或事件就会在环境栈中排队等待。

##### 1.3 执行环境细节
可以将执行环境抽象为一个对象：
```javascript
ExecutionContextObj = {
  scopeChain,   //指向作用域链头结点的指针
  variableObject, //变量对象
  this:{},
}
```
每当一个函数被调用的时候，就会随之创建一个执行环境，在 JS 解释器内部处理执行环境有两个步骤：
1. 调用阶段(函数被调用之后，函数体执行之前)
   - 扫描执行上下文中的形参、函数以及变量，并依次填充变量(活动)对象的属性

      形参 —— 形参：实参 || undefined

      函数 —— 函数名：函数体 (若变量对象中已经存在同名属性，则覆盖)

      变量 —— 变量名：undefined (若变量对象中已经存在同名属性，不会影响到同名属性)
   - 求出 this 的值
   - 创建作用域链
2. 代码执行阶段
   - 给第一步中初始值为 undefined 的变量赋上相应的值(同名属性覆盖)

还可以认为有一个阶段，调用函数前，创建函数时，会创建一个预先包含外部和全局变量(活动)对象的作用域链，保存在内部的 `[[Scope]]` 属性中。在调用时再复制其中的对象构建执行环境的作用域链，此后，又一个活动对象被创建并被推入作用域链的前端。

从这里也可以清楚的知道 JS 中的变量、函数**声明提升**的原理。
##### 1.4 变量对象(variable object)
每一个执行环境都有一个与之关联的变量对象(保存了上下文中声明的变量、函数)。

变量对象是规范上的，不可在 JS 环境中访问，是执行环境中定义的，而只有进入到一个环境中，对应的变量对象才会被激活成为活动对象(activation object)(使用 `arguments` 初始化)。活动对象上的各种属性才能被访问。当在函数内调用其他函数时，当前函数的变量对象依然在激活状态，所以可以通过作用域链访问到其中的变量和函数。

变量对象值包含定义的变量和函数，活动对象还另外包含了 `arguments` 和 函数形参。

全局对象中的变量对象就是全局对象本身，因此才可以通过全局对象的属性来访问在全局上下文中声明的变量。

##### 1.5. 作用域链
作用域链本质是指向`变量对象(活动对象)`的指针列表。

当代码在一个环境中执行时，会创建`变量对象(活动对象)`的一个`作用域链`，作用域链的作用，是保证对执行环境的有序访问。若该环境是函数，则将其活动对象最为变量对象。作用域链前端的变量对象，来自当前执行环境，下一个变量对象，则来自下一个执行环境。这样，一直延续到全局执行环境。

标识符解析是沿着作用域链一级一级的搜索标识符直到找到为止的过程。

参考：
- 《JavaScript 高级程序设计 第三版》
- https://www.jianshu.com/p/76ed896bbf91
- https://blog.csdn.net/thumd_lee/article/details/53523744
- [js 中的活动对象与变量对象什么区别？](https://www.zhihu.com/question/36393048/answer/71879330)

### 2. 闭包

闭包指有权访问另一个函数作用域中的变量的函数，创建闭包的常见方式，就是在一个函数内部创建另一个函数。
1. 若是内部函数被返回，且在其他地方被调用，它仍然可以访问外部函数中的变量。因为内部函数的作用域链中包含了外部函数的作用域。
2. 一般情况下，函数执行完毕,局部活动对象就被销毁，但因为内部函数的引用，外部函数的活动对象依然会留在内存中，虽然其执行环境的作用域链被销毁;直到内部(匿名)函数被销毁后(解除对其引用，设为 `null`)，外部函数的活动对象才会被销毁。
3. 副作用：闭包是通过作用域链的变量(活动)对象对变量进行访问，而不是单独保存了某些特殊变量,所以闭包只能取到变量的最新的值。在某些情况下，可以创建一个匿名立即执行函数强制让闭包的行为符合预期。
4. 匿名函数的执行环境具有全局性，所以其 `this` 通常指向 `window。`
5. `this` 和 `arguments` 不存在于作用域链的活动对象中，因此内部函数无法直接访问到外部函数的这两个变量。把外部作用域中的 `this` 保存在一个闭包能够访问到的变量中(赋值给一个变量，该变量会保存在活动对象中)，可以解决这个问题。
6. 结合闭包和匿名函数，可以模仿块级作用域：
   ```js
   function outputNumbers(count) {
     //匿名函数中定义的任何变量，都会在执行结束时被销毁。这种做法可以减少闭包占用的内存问题，因为没有指向匿名函数的引用，只要函数执行完毕，就可以立即销毁其作用域链了。
     (function() {
       //该匿名函数是一个闭包，可以访问包含作用域中的所有变量，包括count
       for(var i = 0; i < count; i++) {
         console.log(i);
       }
     })();

     console.log(i);
   }
   ```

闭包可能会占用更多的内存

### 3. 创建对象

使用Object构造函数和对象字面量可以用来创建单个对象，但创建多个对象可能会产生大量重复代码。

1. 工厂模式 将创建具体对象(使用Object构造函数和对象字面量)的过程抽象为函数。解决了创建多个相似对象的问题，却没有解决对象识别的问题(知道对象的类型)。
2. 构造函数模式 创建自定义构造函数，与工厂模式的区别在于：
   - 没有显示地创建对象;
   - 直接将属性和方法赋给 `this` 对象;
   - 没有 `return` 语句;
   - 函数名一般会大写首字母(构造函数与其他函数的唯一区别是调用方式，通过 new 操作符来调用，就可以作为构造函数);
   - 要创建实例，必须使用 new 操作符;

    使用构造函数实际上会经历4步：
    1. 创建一个对象;
    2. 对象被执行 [[prototype]] 连接; 将构造函数的作用域赋给新对象(`this` 指向该新对象);
    3. 执行构造函数中的代码(为对象添加属性);
    4. 如果函数没有返回其他对象(包含 Function, Array, Date, RegExg, Error)，返回的基本类型(Null, Undefined, Number, String, Boolean, Symbol)或没有 return 语句则返回新对象;

    使用构造函数创建的实例都有一个 `constructor` 属性指向构造函数;还可以通过 `instanceof` 验证构造函数和实例的关系。

    使用构造函数模式的优点在于可以将它的实例标识为一种特定的类型，它的主要问题是:每个方法都要在每个实例上重新创建一遍，因为在ECMAScript 中，函数也是对象。可以通过把函数定义转移到外部来解决，但若有多个这样的函数，那构造函数就没有什么封装性可言了。
3. 原型模式
   每个函数都有一个 `prototype` 属性，该属性指向一个对象。字面上来讲，`prototype` 指向通过调用构造函数创建的对象实例的原型对象，而所有的对象实例共享原型对象的属性和方法。
   原型对象特点：
   1. 默认情况下，所有原型对象都自动获得一个 `constructor` 属性，指向 `prototype` 所在函数。`constructor` 之外的其他方法，都是从 `Object` 继承而来。
   2. 调用构造函数创建的实例，内部包含一个指针[[prototype]] (内部指针)指向原型对象，脚本中无标准的访问方式，chrome、firefox 和 safari 都支持一个属性 `_proto_` 访问。重要的是，这个连接存在于实例和构造函数的原型对象之间。
   3. 动态性：实例与原型之间的连接是一个指针，而不是副本，所以对原型对象的修改能立即在实例上反应出来。但重写整个原型对象相当与把构造函数的 `prototype` 指向了另外的原型对象，再修改对之前的实例和最初原型都没有影响了。
   4. 虽然内部指针无法在所有的实现中访问到，但可以通过 `isPrototypeof()` 来确定对象之间是否存在这样的关系。通过 `Object.getPrototypeOf()` 可以方便取得一个对象的原型。
   5. 当代码读取对象的某个属性的时候，会先搜索对象实例本身，若未找到，则继续搜索内部指针指向的原型对象。这正是多个对象实例共享原型对象保存的属性和方法的基本原理。因此，给对象实例添加同名属性可以屏蔽原型中的属性;也可以使用 `delete` 操作符删除实例属性，重新访问到原型中的属性。
   6. 对实例和原型的属性检测有多种方法：
      - `hasOwnProperty()` 可以检测一个属性是否存在于对象实例中。
      - `in` 操作符有单独使用和在 `for-in` 循环中使用两种方式：  
        单独使用时，只要通过对象能够访问的属性都能返回 `ture` ，结合 `hasOwnProperty` 便可以确定属性是否存在，以及存在于实例中还是存在于原型中;  
        `for-in` 循环返回的是所有通过对象能访问的、可枚举的属性,屏蔽了原型中不可枚举属性(`[[Enumerable]]`标记为 `false` 的属性)的实例属性也会在其中，因为所有开发人员定义的属性都是可枚举的。
      - `Object.getOwnPropertyNames()` 可以得到所有的实例属性，而 `Object.keys()` 可以取得对象上所有可枚举的实例属性。

    使用原型模式更简单常见的做法是用一个包含所有属性和方法的对象字面量来重写整个原型对象，结果的区别在于 `constructor` 属性不再指向原构造函数，而是指向 `Object` 构造函数，`instanceof` 操作符能返回正确的结果。若 `constructor` 值很重要，则可以在对象字面量中显示指定 `constructor` 属性的值，这样的问题是 `constructor` 的 `[[Enumerable]]` 特性被设置为 `true`;使用 `Object.defindProperty()` 定义可以避免这个问题。

    所有原生的引用类型( `Object`, `Array`, `String` 等)都是采用原型模式创建的，因此通过原生对象的模型，可以取得所有默认方法的引用，也可以定义新方法(不推荐)。

    原型模式的问题在于：不能为构造函数传递初始化参数，会带来一些不便;更重要的是，原型中存在引用类型时，可能出现意料外的多个实例共享引用类型的情况(基本类型修改时一般会用到 "=",属于对属性的动态添加，会覆盖原型属性;而引用类型则可能使用比如 `push` 直接操作了原型数据)。

4. 组合使用构造函数模式和原型模式

   创建自定义类型最常见的方式，就是组合使用二者，构造函数模式用于定义实例属性，而原型模式用于定义方法和共享属性。

5. 动态原型模式

   组合模式构造函数和原型是独立的，可能会让人困惑。动态原型把所有的信息封装在构造函数中，通过在构造函数中初始化原型，同时兼顾了二者的优点。

   构造函数会多次调用，而原型的初始化一次就够了，可以通过检查某个应该存在的方法是否有效，来决定是否初始化原型：
   ```javascript
   function Person() {
     ...
     //不必检查每个属性和方法，只需要检查其中一个即可
     if(typeof this.sayHello != "function") {
       Person.prototype.sayHello = function() {};
     }
   }
   ```
6. 寄生构造函数模式

   该模式除了使用 `new` 操作符以及一般会大写构造函数首字母外，与工厂模式没有什么区别。它主要是在一些特殊情况下用来为对象创建构造函数;比如基于一些原生的引用类型,加上一些新的属性、方法定义新的类型。

   该模式仅仅是在构造函数中创建并返回对象，所以该构造函数产生的对象与构造函数的原型对象之间没有关系，也不能依赖 `instanceof` 来确定类型。

7. 稳妥构造函数模式

   **稳妥对象**指没有公共属性，其方法也不引用 `this` 的对象，该对象最适合在一些安全的环境(禁止使用 `this` 和 `new` )中使用,或防止数据被其他应用程序改动。该模式与寄生构造函数模式的区别在于新创建对象的实例方法不引用 `this`,也不使用 `new` 操作符调用构造函数。

   该构造函数中一般会直接用对象的方法返回传入构造函数中的原始参数，而即使有代码再给对象实例添加方法或数据成员，也没有其他属性和方法可以访问到这些参数，这种安全性使得它非常适合在某些安全执行环境下使用。

### 4. 继承
许多OO语言都支持两种继承方式：
1. 接口继承 只继承方法签名
2. 实现继承 继承实际的方法

ECMPScript 只支持实现继承，且实现主要依靠原型链来实现。

##### 4.1 原型链
使用原型链实现继承，基本思想是利用原型让一个引用类型继承另一个引用类型的属性和方法，即原型对象等于另一个类型的实例(这里注意 constructor 一般会随着原型的改变而改变)。利用原型链实现继承，属性的查找就会沿着原型链层层向上，原型链的最后指向 `Object.prototype` (Object 也只是一个构造函数)。原型链的终点是null。

特点：

1. instanceof 操作符号可以测试实例与原型链中的所有构造函数; isPrototypeOf() 方法也可以用于原型链中的所有原型。
2. 原型链最主要的问题在于包含引用类型值的原型属性会被所有实例共享，这和创建对象原型模式的主要问题相似; 另一个问题是，在创建子类型实例时，无法在不影响所有对象实例的情况下，给超类构造函数传递参数。

##### 4.2 借用构造函数
借用构造函数(也叫伪造对象或经典继承)，它的思想是在子类型构造函数的内部调用超类构造函数。函数只是在特定环境中执行的代码的对象，因此通过 apply() 和 call() 可以在(将来)新创建的对象上执行构造函数。
```JS
function SuperType(name) {
  this.name = name;
  this.colors = ["red", "blue", "green"];
}

function SubType(name, age) {
  SuperType.call(this, name);
  this.age = age;
}
```
这种方式解决了原型链引用类型值共享以及给超类构造函数传参的问题，但无法避免构造函数模式存在的问题 —— 方法都在构造函数中定义，函数无法复用;且在超类型原型中定义的方法和属性，对子类也是不可见的。

##### 4.3 组合继承
组合继承(也叫为经典继承)是JS中最常使用的继承模式，思路是使用原型链实现对原型属性和方法的继承，而通过构造函数实现对实例属性的继承。
```JS
function SuperType(name) {
  this.name = name;
  this.colors = ["red", "blue", "green"];
}

SuperType.prototype.sayName = function () {};

function SubType() {
  SuperType.call(this, 'lili');
  this.age = age;
}
SubType.prototype = new SuperType();
//SubType.prototype.constructor = SubType;
```
##### 4.4 原型式继承
原型式继承并没有严格意义上的构造函数，其想法是借助原型可以基于已有的对象创建新对象，同时还不必因此创建自定义类型。
```JS
function object(o) {
  function F() {}
  F.prototype = 0;
  return new F();
}
```
这种对象要求有一个对象作为另一个对象的基础。ECMAScript5 新增 `Object.create(object, options)` 方法规范化了原型式继承，其中参数 options 可选，它与 Object.defineProperties() 的第二个参数格式相同，它指定的属性会覆盖原型对象上的同名属性。

##### 4.5 寄生式继承
寄生式继承的思路与寄生构造函数和工厂模式类似，即创建一个仅用于封装继承过程的函数。该函数在内部以某种方式来增强对象，最后再像真是它做了所有的工作一样返回对象。
```JS
function createAnother(original) {
  var clone = Object.create(original);
  clone.sayHello = function() {};
  return clone;
}
```
在主要考虑对象而不是自定义类型和构造函数的情况下，寄生式继承也是一种有用的模式; `Object.create()` 不是必须的，任何能返回新对象的函数都适用于此模式。该模式为对象添加的函数也不能做到函数复用。

##### 4.6 寄生组合式继承

JS中最常用组合继承最大的问题是无论什么情况下，都会调用两次超类构造函数：第一次在创建子类原型的时候，第二次在子类构造函数内部。

寄生组合式继承通过借用构造函数来继承属性，通过原型链的混成形式来继承方法。其背后的思路是：不必为了指定子类型的原型而调用超类型的构造函数，需要的只是超类型原型的一个副本。本质上，就是使用寄生式继承来继承超类的原型，然后再将结果指定给子类型的原型：
```JS
//使用 inheritPrototype 来替代组合继承中，子类的原型指向超类实例的部分
function inheritPrototype(subType, superType) {
  var prototype = Object.create(superType.prototype);
  prototype.constructor = subType;
  subType.prototype = prototype;
}
```
该模式只调用一次超类构造函数，因此避免了在子类原型上创建多余的属性，同时原型链保持不变，instanceof 和 isPrototypeOf() 都能正常使用，开发人员普遍认为这是引用类型最理想的继承范式。

### 5. 垃圾收集
JS 具有自动垃圾收集机制，其原理就是找出那些不再继续使用的变量，然后释放其内存，垃圾收集器会按照固定的时间间隔(或代码执行中预定的时间)周期性的执行这一操作。

很多时候，函数执行结束，其中的局部变量就没有存在的必要了，可以回收其内存。但不是所有情况下都能如此简单的得出结论，垃圾收集器必须跟踪变量，对于不再有用的变量打上标记，以备将来回收其内存。用于标识无用变量的策略可能因实现而异同。

1. 标记清除

   标记清除是 JS 中最常用的垃圾收集方式。变量可以标记为“进入环境”和“离开环境”，从逻辑上讲，永远不能释放进入环境的变量所占用的内存。可以使用各种方式来标记变量，比如通过翻转某个特殊的位来记录一个变量合适进入环境，或使用两个列表来分别记录两种标记的变量。

   垃圾收集器在运行时会给存储在内存中的所有变量都加上标记，然后去掉环境中的变量以及被环境中的变量所引用的变量的标记。而在此之后被加上标记的变量将被视为准备删除 的变量，环境中的变量已经无法访问到这些变量了。

2. 引用计数

   引用计数不太常见，它的含义就是跟踪每个值被引用的次数，每有变量指向该值时，该值的引用次数就加1, 反之减1。当引用次数为0时，说明该值无法再被访问到，可以被o内存回收。但在循环引用的情况下，引用次数永远不为0。

垃圾收集是周期性运行的，确定其时间也是一个非常重要的问题。让触发垃圾收集的变量分配、字面量和数组元素的临界值(如256个变量，4096个对象字面量或64KB的字符串)动态修正，是一个比较好的办法：先设置一个默认值，若回收的内存分配量低于15%， 则将临界值加倍; 若回收的内存分配量高于85%，则将临界值重置回默认值。

全局变量和全局对象的属性一般不会被标记清除，要优化内存占用，则需要对它们解除引用(设置为null)。解除引用并不意味着垃圾回收，而是让值脱离执行环境，以便垃圾收集器下次运行时将其回收。

基本类型占用固定空间，被保存在栈内存中;而引用类型的值是对象，保存在堆内存中。

### 6. this
`this` 是执行环境的一个属性，它提供了一种更优雅的方式来隐式“传递”一个对象的引用
(不用给函数显示传入上下文对象)，因此可以将API设计得更加简介并且易于复用。

`this` 是在运行时被绑定的，与函数声明的位置没有任何关系，只取决于函数的调用方式(调用位置)。寻找调用位置最重要的是分析调用栈(可以使用浏览器的调试工具查看)，调用位置就在当前正在执行的函数的前一个调用中(调用/执行当前函数的位置)。找到调用位置之后，可以用一下4条规则来判断 `this` 的绑定对象：
1. 默认绑定：独立函数调用，可以把这条规则看作是无法应用其他规则时的默认规则。

   直接使用不带任何修饰的函数引用进行调用，无法应用其他规则，属于默认绑定。在非严格模式下(函数运行在非严格模式下，仅仅在严格模式下调用函数不影响，使用第三方库的时候就可能有这样的情况)`，this` 指向全局对象;否则 `this` 为 `undefined` 。
2. 隐式绑定
   当函数引用有上下文对象时，隐式绑定规则会将函数调用中的 `this` 绑定到该上下文对象，而对象引用链中只有最后一层在调用位置中起作用。

   隐式丢失：一个最常见的 this 绑定问题就是被隐式绑定的函数丢失绑定对象，也就是说会应用默认绑定。要注意函数也是对象，**赋值**、**参数传递(传入回调函数引发的错误很常见)**都是函数的引用:
   ```js
   //隐式丢失
   var sayHello = obj.sayHi;
   sayHello();
   ```
   还有一种情况 this 的行为会出乎意料：调用回调函数是可能修改 this。 在一些流行的 js 库中事件处理器常会把回调函数的 this 强制绑定到触发事件的 DOM 元素上。
3. 显示绑定
   隐式绑定必须在一个对象内部包含一个指向函数的属性，并通过属性间接引用函数，从而把 this 间接(隐式)绑定到这个对象上。若不想在对象内部包含函数引用，而想在某个对象上强制调用函数，则可以使用显示绑定。

   JS 提供的绝大多数函数已经自定义的所有函数都有 call() 和 apply() 方法，可以使用它们直接指定 this 的绑定对象。传入基本类型则会被转换成它的对象形式(装箱：new String()、new Boolean()等等)。

   - 硬绑定：对于之前隐式丢失的问题，可以使用显示绑定的一个变种来解决问题：创建函数 bar(), 并在其内部手动调用 foo.call(obj) 强制将 foo 的 this 绑定到 obj 上。之后无论如何调用 bar, 它总会手动在 obj 上调用 foo。 这种绑定是一种显示的强制绑定，因此可以称之为**硬绑定**。硬绑定的典型场景就是创建一个包裹函数，负责接收参数并返回值：
      ```js
      function foo(something) {
        return this.a + something;
      }

      const obj = {
        a: 2
      };

      const bar = function() {
        return foo.apply(obj, arguments);
      }

      var b = bar(3);
      console.log(b);  //5
      ```
      另一种方法是创建一个可以重复使用的辅助函数：
      ```js
        function foo(something) {
          return this.a + something;
        }

        //简单的辅助函数
        function bind(fn , obj) {
          return function() {
            return fn.apply(obj, arguments);
          }
        }

        const obj = {
          a: 2
        };

        const bar = bind(foo, obj)
        const b = bar(3);
        console.log(b); //5
      ```

      硬绑定是一种非常常用的模式，因此 ES5 提供了内置的方法 `Function.prototype.bind`, 它会返回一个硬编码的新函数，把指定的参数设置为 `this` 的上下文并调用原始函数。
    - API 调用的上下文： 第三方库的许多函数，以及JS语言和宿主环境中的许多新的内置函数，都提供了一个可选参数，通常称为上下文(context),其作用和 bind 一样，确保回调函数使用指定的 this。
      ```js
      //调用 foo 是把 this 绑定到 obj
      [1, 2, 3].forEach(foo, obj);
      ```
      这些函数实际上就是通过 call 或者 apply 实现了显示绑定，开发者可以少写部分代码。

4. new 绑定
   使用 new 来调用函数，或者说发生构造函数调用时，函数中的 this 会指向构造出的新对象。 new 是最后一种可以影响函数调用时 this 绑定行为的方法。

   使用硬绑定 bind 会返回一个函数，则这个函数也可以用来作为构造函数使用。而　bind 会判断硬绑定函数是否被 new 调用，若是的话就使用新创建的 this 替换硬绑定的 this。

优先级：
1. 函数使用 new 调用， this　绑定新创建的对象。
2. 函数通过 call、apply 或者硬绑定调用，this 绑定的是指定的对象。
3. 函数在某个上下文对象中调用(隐式绑定)，this 绑定那个上下文对象。
4. 若不符合以上３者，在严格模式下绑定到 undefined, 否则绑定到全局对象。

特例：
1. 被忽略的 this:　若把 null 或者 undefined 作为 this 的绑定对象传入 call、apply 或者 `bind`, 这些值在调用时会被忽略，实际应用的是默认绑定规则。若函数中确实使用了 this, 则可能会导致不可预计的后果。一种更安全的做法是传入一个特殊的对象：`Object.create(null)`,它和 `{}` 很像，但没有原型对象，因此它比 `{}` 更空，可以用它来表示“希望this是空的”。
2. 间接引用：`(p.foo = o.foo)()`,其实是单纯的调用 `foo()` 函数而不是 `p.foo()` 或者 `o.foo()`，因此这里会应用默认绑定。
3. 软绑定：使用硬绑定之后无法使用隐式绑定或显示绑定来修改 `this`,会大大降低函数的灵活性。软绑定可以给默认绑定指定一个全局对象和undefined 以外的值，实现了和硬绑定相同的效果，同时保留隐式绑定或者显示绑定修改 `this` 的能力：
   ```js
   if(！Function.prototype.softBind) {
     Function.prototype.softBind = function(obj) {
       var fn = this;
       var curried = [].slice.call(arguments, 1);
       var bound = function() {
         return fn.apply(
           (!this || this === (window || global)) ? obj : this,
           curried.concat.apply(curried, arguments)
         );
       };
       bround.prototype = Object.create(fn.prototype);
       return bound;
     }
   }
   ```
4. 箭头函数：箭头函数不适用 `this`　的四种标准规则，而是根据外层(函数或者全局)作用域来决定 `this`(对象或者for、if代码块不构成作用域)，具体来说，箭头函数会继承外层函数调用的 `this`　绑定。箭头函数可以像 `bind` 一样确保函数的 `this` 被绑定到指定对象，很多时候，`that = this` 和箭头函数都可以取代 `bind`。

在一定程度上，这也跟内存中的数据结构有关(原始的对象以字典结构保存，每一个属性名都对应一个属性描述对象)：
- 基本数据类型保存在栈内存中。
- 引用类型保存在堆内存中，再将其地址保存在栈内存中。

5. 事件处理函数中的 this 指向 DOM 元素。

函数属于引用类型，单独保存在(堆)内存中，所以可以在不同的环境中执行。而作为一个单独的存在，它执行时的上下文也和具体的调用场景相关。

关于this在理解原理的情况下，也可以使用一些更简单的方法来判断绑定的对象：[两句话理解js中的this](https://juejin.im/post/5a0d9ff4f265da432e5b91da)、[彻底理解 js 中的 this,　不必硬背](https://www.cnblogs.com/pssp/p/5216085.html)

为什么要使用 this，　this 指向 DOM　元素

```js
const obj = {
  f1: () => console.log(this),
  f2() {console.log(this)},//和 f2: function() {console.log(this)} 的区别
};
obj.f1();
obj.f2();
new obj.f1();
new obj.f2();
```

参考：
- 《你不知道的JS》

### 7. 箭头函数
使用箭头函数注意点：
1. this 的绑定：
   - 函数体内的 this 就是定义时所在的对象，而不是使用时所在的对象。在普通函数中， this 的指向是可变的，但在箭头函数中，它是固定的，这种特性很有利于封装回调函数。
   - this 指向的固定化，并不是因为将头函数内部有绑定 this 的机制，实际是因为箭头函数根本没有自己的 this, 导致内部的 this 就是外层代码的 this。正是因为它没有 this, 所以也就不能用作构造函数,也就不能用call()、apply()、bind()这些方法改变 this 的指向。所以箭头函数转为ES5的代码如下：
   ```js
   //ES6 
   function foo() {
     setTimeout(() => {
       console.log('id', this.id);
     }, 100);
   }
   //ES5
   function foo() {
     var _this = this;

     setTimeout(function() {
       console.log('id', _this.id)
     }, 100);
   }
   ```
2. 不可以当作构造函数，即不可以使用 new 操作符，否则报错。
3. 不可以使用 arguments 对象，该对象在函数体内不存在。但可以使用 rest 参数代替。实际上，this、arguments、super、new.target 在箭头函数中都是不存在的，都会指向外层函数的对应变量。
4. 不可以使用 yield 命令，因此箭头函数不能用作 Generator 函数。

不适用场合：
1. 定义对象的方法，且该方法的内部包括 this：
   ```js
   const cat = {
     lives: 9;
     jumps: () => {
       this.lives--;
     }
   }
   ```
   调用 cat.jumps() 时，若是普通函数，则该方法内部的 this 指向 cat; 若函数值普通函数，则其中的 this 指向全局对象，因此不会得到预期的结果。这是因为对象不构成单独的作用域，导致 jumps 箭头函数定义时的作用域就是全局作用域。
2. 需要动态 this 的时候，也不应该使用箭头函数：
   ```js
   var button = document.getElementById('press');
   button.addEventListener('click', () => {
     this.classList.toggle('on');
   });
   ```
   以上的代码在运行的时候，点击按钮会报错，因为监听函数中是一个箭头函数，其中的 this 指向了全局对象。若改成普通对象， this 就会动态指向被点击的按钮对象。

### 8. new、call、apply 和 bind
call()、apply() 和 bind() 都可以用来指定 this 的绑定对象：
1. 三者第一个参数都是 this 的绑定对象。
2. bind 和 call 之后传入的参数都用逗号分隔。
3. bind 返回的是一个函数, 必须调用它才会被执行。
4. apply 的所有参数都放在一个数组中传进去。

bind 使用：
1. bind() 函数的一个用处在于能使一个函数拥有预设的初始参数，即“内定”前几个参数。
2. 因为 bind() 返回的结果依然是 function, 因此可以被　new　运算符调用，此时 bind 的第一个参数无效。
3. setTimeout 中常出现隐式丢失的情况，此时除了使用引号包裹函数，也可以使用 bind 再次显示绑定 this。

new 操作父模拟实现：
```js
function newOperator(ctor) {
  if(typeof ctor !== 'function') {
    throw 'the first param must be a function';
  }
  newOperator.target = ctor;
  var newObj = Object.create(ctor.prototype);
  var argsArr = [].slice.call(arguments, 1);
  var ctorReturnResult = ctor.apply(newObj, argsArr);
  var isObject = typeof ctorReturnResult === 'object' && ctorReturnResult !== null;
  var isFunction = typeof ctorReturnResult === 'function';
  if(isObject || isFunction) {
    return ctorReturnResult;
  }
  return newObj;
}
```
不考虑 new 操作符时，bind 的 polyfills 更小，性能也更好：
```js
// 在使用 "new funcA.bind(thisArg, args)" 无效
if (!Function.prototype.bind){
  (function() {
    var slice = Array.prototype.slice;
    Function.prototype.bind = function() {
      var thatFunc = this, thatArg = arguments[0];
      var args = slice.call(arguments, 1);
      if(typeof thatFunc !== 'function') {
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }
      return function() {
        var funcArgs = args.concat(slice.call(arguments));
        return thatFunc.apply(thatArg, funcArgs);
      }
    }
  })();
}
```
需要用于 new 操作符时，bind 的 polyfills 更大，性能更差：
```js
//可以用于 "new funcA.bind(thisArg, args)"
if (!Function.prototype.bind) {
  (function() {
    var ArrayPrototypeSlice = Array.prototype.slice;
    Function.prototype.bind = function(otherThis) {
      if (typeof this !== 'function') {
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }
      var baseArgs = ArrayPrototypeSlice.call(arguments, 1),
          baseArgsLength = baseArgs.length,
          fToBind = this,
          fNOP = function() {},
          fBound = function() {
            baseArgs.length = baseArgsLength;
            baseArgs.push.apply(baseArgs, arguments);
            return fToBind.apply(
              fNOP.prototype.isPrototypeOf(this) ? this : otherThis, baseArgs
            );
          };
      if (this.prototype) {
        fNOP.prototype = this.prototype;
      }
      fBound.prototype = new fNOP();

      return fBound;
    }
  })()
}
```

参考：
- [理解 javascript 里的 bind() 函数](https://www.webhek.com/post/javascript-bind.html)
- [js的new操作符的实现](https://juejin.im/post/5bde7c926fb9a049f66b8b52#heading-5)
- [MDN bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)

### 9. 理解参数
1. ECMAScript 中的参数在内部是用一个数组来表示的，函数接收到的始终都是这个数组，而不关心其中参数具体个数以及类型。
2. 在函数体内可以通过 arguments 对象来访问在这个参数数组，从而获取传递给函数的每一个参数。arguments 对象与数组类似，可以用"[]"来访问元素，可以使用 length 属性来确定传入的参数的个数。可以通过 `Array.prototype.slice.call(arguments)` 将其转为数组。
3. 因此 ECMAScript 函数中，命名的参数只是提供便利，并不是必须的(完全可以使用 arguments 来获取传入的参数)。
4. arguments 可以与命名参数一起使用，且在非严格模式下，其元素值永远与对应命名参数的值保持同步。需要注意的是，这并不是说二者的值会访问相同的内存空间；它们的空间是独立的，但他们的值会同步。但要注意，arguments 的值由传入的参数的个数决定，而不是由定义函数时的命名参数的个数决定，所以若是修改超出 arguments 长度的值则不会反映到命名参数中。
5. 严格模式下，arguments 元素值与对应命名参数的值不同步, 且重写 arguments 的值会导致语法错误。
6. 在某些情况下，通过检查传入函数中的参数类型和个数并做出不同的反应，可以模仿方法的重载。

### 10.深拷贝
JS的原生不支持深拷贝，Object.assign 和 {...obj} 都属于浅拷贝。

JSON.stringfy 和 JSON.parse 可以很简单的实现深拷贝，原理就是先将对象转换为字符串，再通过JSON.parse重新建立一个对象，但这种方法局限也很多：
- 不能复制function、正则、Symbol
- 循环引用报错
- 相同的引用会被重复复制

递归实现：
```js
function deepCopy(target) {
  let copyed_objs = [];
  function _deepCopy(target) {
    if((typeof target !== 'object' || !target)){
      return target;
    }
    for(let i = 0; i < copyed_objs.length; i++) {
      if(copyed_objs[i].target === target) {
        return copyed_objs[i].copyTarget;
      }
    }
    let obj = {};
    if(Array.isArray(target)) {
      obj = [];
    }
    copyed_objs.push({target: target, copyTarget: obj});
    Object.keys(target).forEach(key => {
      if(obj[key]) {
        return;
      }
      obj[key] = _deepCopy(target[key]);
    });
    return obj;
  }
  return _deepCopy(target);
}
```
参考：
- [JS深拷贝总结](https://juejin.im/post/5b20c9f65188257d7d719c1c)

### 11. var、let、const
ES5 只有 var 和 function 两种声明变量的方法；而 ES6 中有 var、let、const、function、improt 和 class 共6中声明变量的方法。
var：
1. 作用域为该语句所在的函数内。
2. 存在变量提升现象:
   ```js
   var temp = 'abc';
   function f() {
     console.log(temp);
   }
   f() //abc
   console.log(temp); //abc

   //变量提升：
   var temp = 'abc';
   function f() {
     console.log(temp);
     var temp = 'def';
   }
   f(); //undefined
   console.log(temp); //abc
   ```
3. 允许重复声明同一个变量, js 会对后续的声明视而不见(但若是声明中有变量初始化的话，会执行该初始化)。
4. 在代码的最顶层使用 var 时，它会成为一个全局变量，并添加到全局对象(浏览器环境为 window, 在 Node 指的是 global)中，成为其属性。

let：
1. 块作用域。
   - ES6 的块级作用域必须有大括号，否则 js 引擎就认为不存在块级作用域。
   - 块级作用域的出现，实际上使得匿名立即执行函数表达式不再必要了。
2. 存在暂时性死区现象：只要块级作用域内存在let命令，它所声明的变量就绑定该区域，而不在受外部影响。因此，在代码块内，会使用 let 声明的变量， 在let命令声明变量之前，该变量都是不可用的。这样的设计是为了良好的编程习惯：变量一定要在声明之后使用。
3. 在for循环设置循环变量那一部分是一个父作用域，而循环体内部是一个单独的子作用域。
4. 不允许重复声明，且在函数内直接用 let 在声明一个参数变量会报错(在函数中的块作用域内可以声明相同的参数);
    ```js
    // i 在全局范围内有效，所以全局是由一个变量i,每次循环 i 的值都会改变，结合闭包原理可知输出结果
    var a = [];
    for(var i = 0; i< 10; i++) {
      a[i] = function() {
        console.log(i);
      }
    }
    a[6](); // 10

    //i 只在本轮循环中有效，所以每一次循环的 i 都是一个新的变量
    var a = [];
    for(let i = 0; i < 10; i++) {
      a[i] = function() {
        console.log(i);
      }
    }
    a[6](); // 6

    //输出3次abc,循环内部的变量 i 没有影响到循环变量。
    for(let i = 0; i < 3; i++){
      let i = 'abc';
      console.log(i);
    }
    ```
5. 在代码的最顶层使用 let 时，虽然它也会成为一个全局变量(因为其作用域是整个代码库的块)，但它不会成为全局对象的属性。

const:
1. 声明一个只读的常量，一旦声明，就不能改变。因此 const 一旦声明变量，就必须立即初始化，不能留到之后赋值。
2. const 作用域与let相同，且也存在暂时性死区，且不可重复声明。
3. const 实际上保证的，并不是变量的值不得改动，而是变量指向的内存地址所保存的数据不得改动。对于简单类型的数据，保存的数据即使值；而对于引用类型，保存的只是一个指向实际数据的指针。

### 12. 数据类型
ES6引入了新的原始数据类型 Symbol,因此当前共七种数据类型：Undefined、Null、Boolean、String、Number、Symbol、Object。

typeof 返回值： undefined、boolean、string、number、object、function

Undefined类型：
1. Undefined 类型只有一个值，也就是 undefined。当声明了变量但未对其进行初始化时，其值就为 undefined。
2. 对未声明过的变量，只能使用 typeof 操作符。 对未初始化和未声明的变量使用 typeof 操作符都会放回 undefined。但要注意， 在let 或const 的暂时性死区现象中，使用 typeof 操作符同样也会报错。
3. undefined 是一个表示'无'的原始值，转为数值时为NaN： `Number(undefined)`、`3 + undefined`； 而 null 是一个表示 "无" 的对象，转为数值时为0。

Null 类型：
1. Null 类型也只有一个值，就是 null。从逻辑角度来看，null 值表示一个空对象指针，这也是使用 typeof 操作符检测 null 值时会返回 "object"的原因。
2. 实际上，undefined 派生自 null 值，对他们的相等性测试("==")要返回true。
3. 若对应的变量准备在将来用于保存对象，则最好将其初始化为null,这样，只要检测null值就可以知道相应的变量是否已经保存了一个对象的引用。而相对的，一般是没有必要将一个变量的值显示设置为 undefined。

### 13. 跨域
参考：
- [九种跨域方式实现原理](https://juejin.im/post/5c23993de51d457b8c1f4ee1)

### 14. 节流、防抖
函数防抖：　任务频繁触发的情况下，只有在指定间隔时间内未再次触发任务，任务才会触发。

函数节流：　指定时间间隔内只会执行一次任务。

**函数防抖**
函数防抖最常见的场景是：在用户输入的时候就执行网络请求进行一些判断。这样做不仅对服务器的压力增大了，用户的体验也未必比原来的好。理想的做法应该是：当用户输入第一个字符后的一段时间内如果还有字符输入的话，就暂时不发送请求。这里使用函数防抖就能很好的解决这个问题：
```js
//不是用函数防抖
function ajax(content){
  ...//ajax 请求
}

let inputEl = document.getElementById('unDebounce');

inputEl.addEventListener('keyup', function(e) {
  ajax(e.target.value)
});

//使用函数防抖
function ajax(content) {
  ...//ajax 请求
}

function debounce(fun, delay) {
  return function(args) {
    let that = this;
    let _args = args;
    clearTimeout(fun.id);
    fun.id = setTimeout(function () {
      fun.call(that, _args)
    }, delay);
  }
}

function debounce(fun, delay) {
  return function() {
    //这里如果不是使用　fun.id 而是一个普通变量的话，则应该先在函数 debounce 中定义，然后结合闭包特点实现该功能。
    clearTimeout(fun.id);

    //这里要注意，虽然箭头函数已经绑定了 this了，但是直接调用 fn 的话，fn 中的 this　还是会指向　window　或者 undefined。因此，需要在使用 apply 绑定 this。
    fun.id = setTimeout(() => {fn.apply(this, arguments)});
  }
}

let inputEl = document.getElementById('debounce');
let debounceAjax = debounce(ajax, 500);

inputEl.addEventListener('keyup', function(e) {
  debounceAjax(e.target.value);
});
```

**函数节流**
函数节流的一个场景是：要判断页面是否滚动到底部，普通做法就是监听 window 对象的 scroll 事件，然后再在函数体中写入判断是否滚动到底部的逻辑。这样做的一个缺点是比较消耗性能，因为在滚动的时候，浏览器会持续计算是否滚动到底部的逻辑。但在实际场景中，在滚动过程中，每隔一段时间计算该判断逻辑就可以了，所以在滚动事件中引入函数的节流是一个非常好的实践：
```js
$(window).on('srcoll', throttle(function() {
  //判断是否滚动到底部的逻辑
  let pageHeight = $('body').height(),
      scrollTop = $(window).scrollTop(),
      winHeight = $(window).height(),
      thresold = pageHeight - scrollTop - winHeight;
  if(thresole > -100 && thresold <= 20) {
    console.log('end');
  }
}))

function throttle(fn, interval = 300) {
  let canRun = true;
  return function() {
    if(!canRun) return;
    canRun = false;
    setTimeout(() => {
      fn.apply(this, arguments);
      canRun = true;
    }, interval);
  }
}
```

参考：
- [函数节流与函数防抖](https://juejin.im/entry/58c0379e44d9040068dc952f)
- [７分钟理解JS的节流、防抖及使用场景](https://juejin.im/post/5b8de829f265da43623c4261)

### 15. JS 设计模式
设计模式是为了更好的代码重用性，可读性，可靠性，可维护行。

设计六大原则：
- 单一职责原则
- 里氏替换原则
- 依赖倒转原则
- 接口隔离原则
- 最少知识原则
- 开放封闭原则

设计模式分类：
1. 创建型模式：工厂方法模式、抽象工厂模式、单例模式、建造者模式、原型模式。
2. 结构性模式：适配器模式、装饰器模式、代理模式、外观模式、桥接模式、组合模式、享元模式。
3. 行为型模式：策略模式、模板方法模式、观察者模式、迭代子模式、责任链模式、命令模式、备忘录模式、状态模式、访问者模式、中介者模式、解释器模式。

常见设计模式：
1. 单例模式:保证一个类仅有一个实例，并提供一个访问它的全局访问点。

   实现上一般会用一个变量来标识实例是否已经存在，若存在，则直接返回，反之就创建一个对象。经典的实现方式是创建一个类，这个类包含一个方法，这个方法在没有对象存在的情况下，将会创建一个新对象，若对象存在，则这个方法只返回这个对象的引用。
   ```js
   //通用的惰性单例
    const getSingle = function (fn) {
      let result;
      return function() {
        return result || (result = fn.apply(this, arguments))
      }
    }

    const createLayer = function() {
      //创建一个 layer dom
      ...
    };

    const createSingleLayer = getSingle(createLayer);

    //使用
    const layer = createSingleLayer();

   ```
场景：模态框，浏览器中的window,　redux 中的 store 等。

2. 发布-订阅模式
观察者模式很有用，但在 js 中通常使用一种叫做发布-订阅模式的变体来实现观察者模式。二者很相似，本质上的却别是调度的地方不同。虽然二者都存在订阅这和发布者，但观察者模式是由具体目标调度的，而发布-订阅模式是统一由调度中心调的，所以观察者模式订阅者与发布者之间是存在依赖的，而发布-订阅模式不会。

发布订阅模式定义的是对象间一对多的依赖关系，当发布者的状态发生改变时，所有依赖与它的订阅者都会收到通知，并触发他们各自的回调函数。JS中的事件机制就是发布订阅者模式的体现？

优点：
1. 时间上的解耦。
2. 对象上的解耦。

缺点：
1. 创建订阅者要消耗时间和内存，即使订阅的消息一直不发生，订阅者也会一直存在与内存中。
2. 过渡使用会导致对象之间的关系过于弱化，程序难以跟踪维护。

实现步骤：
1. 指定一个充当发布者的对象。
2. 给发布者添加缓存列表，用于存放回调函数，以便通知订阅者。
3. 发布消息时，会遍历缓存列表中对应 key 值的数组，触发里面的回调函数的执行。

```js
//通用实现，将发布订阅功能单独提出来，放在一个对象内。观察这模式
const event = {
  clientList: {},
  listen: function(key, fn) {},
  tirgger: function() {},
  remove: function() {},
}
//给对象安装发布订阅功能的函数
const installEvent = function(obj) {
  for(let i in event) {
    obj[i] = event[i];
  }
}

const saleOffice = {};
installEvent(saleOffice);
saleOffice.listen('message', fn1 = function() {});



//全局的发布订阅模式:
//1. 节约资源，避免为每个对象添加 listen, trigger 方法，以及缓存列表
//2. 接触了耦合，在通用发布中，订阅者需要知道发布对象的名字才能订阅事件;而通过一个全局的中介，无需关心谁是发布者，谁是订阅者，这样有利于模块间的通信
const event = (function() {
  const clientList = {};
  let listen;
  let trigger;
  let remove;

  listen = function (key, fn) {
    if (!clientList[key]) {
      clientList[key] = [];
    }
    clientList[key].push(fn);
  }

  trigger = function() {
    let key = Array.prototype.shift.call(argumets);
    var fns = clientList[key];
    if (!fns || fns.length === 0) {
      return false;
    }

    for(let i = 0, fn; fn = fns[i++];) {
      fn.apply(this.arguments)
    }
  }

  remove = function (key, fn) {
    const fns = clientList[key];
    if (!fns) {
      return false;
    }

    if (!fn) {
      fns && (fns.length = 0)
    } else {
      for(let i = fns.length - 1; i >= 0; i--) {
        var _fn = fns[i];
        if (_fn === fn) {
          fns.splice(i, 1)
        }
      }
    }
  }

  return {
    listen: listen,
    trigger: trigger,
    remove: remove,
  }
})();

event.listen('message', function(value) {
  console.log('here is value: ', value);
});

event.trigger('message', 32);
```
参考：
- [JS设计模式-发布订阅模式](https://blog.csdn.net/qq_35585701/article/details/79888394)
- [JS设计模式六(发布-订阅模式)](https://blog.csdn.net/lihangxiaoji/article/details/80005794?utm_medium=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-1.nonecase&depth_1-utm_source=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-1.nonecase)

3. 策略模式
策略模式定义一系列算法，将他们一个个封装起来，并且使他们可以相互替换。它的核心是：
1. 将算法的使用和算法的实现分离开来。
2. 一个基于策略模式的程序至少由两部分组成：
   - 一组策略类，封装了具体的算法，并负责具体的计算过程。
   - 环境类 context，接受客户的请求，随后把请求委托给某一个策略类。因此， context 中要维持对某个策略对象的引用。
3. 主要解决： 在有多种算法相似的情况下，使用 if...else 所带来的复杂和难以维护。
```js
// 根据绩效 level 和 salary 决定年终奖：
const strageties = {
  S: function (salary) {
    return salary * 4;
  },
  A: function (salary) {
    return salary * 3;
  },
  B: function (salary) {
    return salary * 2;
  }
}

const calculateBouns = function (level, salary) {
  return strategies[level](salary)
}

console.log(calculateBouns('S', 20000))

//可以把算法的概念扩散开来，策略模式也可以用来封装一系列的“业务规则”。

//对表单值的检验，直接用 if-else 语句则
//1.函数庞大，包含大量 if-else 语句;
//2.缺乏弹性，增加或修改规则需要深入内部，违反开发-封闭原则;
//3.算法复用性差
const registerForm = document.getElementById('registerForm);
registerForm.onsubmit = function() {
  if (registerForm.nserName.value === '') {
    ...
  }
  if (...) {
    ...
  }
}

//用策略模式重构表单校验
//1. 将校验逻辑封装成策略对象
//2. 实现 Validator 类，作为 context 接收用户的请求并委托给 strategy
const stsrategies = {
  isNotEmpty: function (value, errorMsg) {
    if (value === '') {
      return errorMsg;
    }
  },
  minLength: function (value, length, errorMsg) {
    if (value.length < length) {
      return errorMsg;
    }
  }
  ...
}

const Validator = function() {
  this.cache = [];
}

//支持对同一个dom 添加多种校验规则
Validator.prototype.add = function (dom, rules) {
  const self = this;

  for(let i = 0, rule; rule = rules[i++];) {
    (function(rule) {
      const strategyAry = rule.strategy.split(':');
      var errorMsg = rule.errorMsg;

      self.cache.push(function() {
        const strategy = strategyAry.shift();
        strategyAry.unshift(dom.value);
        strategyAry.push(errorMsg);
        return strategies[strategy].apply(dom, strategyAry);
      })
    })(rule);
  }
}

Validator.prototype.start = function() {
  for (let i = 0, validatorFunc; validatorFunc = this.cache[i++];) {
    const errorMsg = validatorFunc(); //开始校验，并取得校验后的返回信息
    if (errorMsg) {
      return errorMsg;
    }
  }
}

//使用
const registerForm = document.getElementById('registorForm');
var validatorFunc = function() {
  var validator = new Validator();

  validator.add(registerForm.userName, [{
      stragety: 'isNotEmpty',
      errorMsg: '用户名不能为空',
    }, {
      strategy: 'minLength: 6',
      errorMsg: '用户名长度不能少于 6 位',
    }];
  );

  var errorMsg = validator.start();
  return errorMsg;
}

registerForm.onsubmit = function() {
  const errorMsg = validatorFunc();

  if (errorMsg) {
    alert(errorMsg);
    return false;
  }
}
```
策略模式的优点：
1. 利用组合、委托和多态等技术和思想，可以有效地避免多重条件选择语句
2. 提供了对开放-封闭原则的完美支持，将算法封装在独立的 strategy 总，使得它们易于切换，易于理解，易于扩展。
3. 策略模式中的算法也可以复用在系统的其他地方，从而避免许多重复的复制粘帖工作。
4. 利用组合和委托让 context 拥有执行算法的能力，这也是继承的一种更轻便的替代方案。


参考：
- []
- [JS设计模式总结](https://juejin.im/post/5c984610e51d45656702a785)
- [JS中常用的十五种设计模式](https://www.cnblogs.com/imwtr/p/9451129.html#o2)

### 16. 高级函数
一些额外的功能可以通过使用闭包来实现，此外，由于所有的函数都是对象，所以使用函数指针非常简单。这些令JS函数不仅有趣而且强大。

#### 16.1 作用域安全的构造函数
普通构造函数的问题在于当没有使用new操作符调用时，this 会指向全局对象或为 undefined。指向全局对象会导致对象属性的意外增加或对原有属性的覆盖。这个问题的解决方法就是创建一个作用域安全的构造函数：
```js
function Persion(name, age, job) {
  //在进行任何更改前，首先确认 this 对象是正确类型的实例
  if (this instanceof Person) {
    this.name = name;
    this.age = age;
    this.job = job;
  } else {
    return new Person(name, age, job);
  }
}
```
使用了作用域安全的构造函数，就锁定了可以调用构造函数的环境。其他对象无法通过 call() 方法来继承其属性和方法，要结合原型链才可以解决这个问题。

#### 16.2 惰性载入函数
有点时候在执行函数时，需要根据具体环境以及浏览器差异执行不同的代码，也就是会使用 if 分支进行判断。而这些环境和浏览器是固定的，第一次执行函数后，之后每次调用时分支的结果都不变。所以可以在第一次执行函数之后，不再进行判断，使代码运行得更快，这里的解决方案就是惰性载入。

惰性载入表示函数执行的分支仅会发生一次。有两种实现惰性载入的方式：
1. 在函数被调用时再处理函数。第一次调用时，该函数会覆盖为另外一个按合适方式执行的函数，这样之后的调用就不用再经过分支判断了。
   ```js
   function fn() {
     if(...) {
       fn = function() {
         ...
       }
     } else if(...) {
       fn = function() {
         ...
       }
     }

     return fn();
   }
   ```
2. 在声明函数时就指定适当的函数。这样，第一次调用函数时就不会损失性能了，而在代码首次加载时会损失一些性能。
   ```js
   //这里的技巧是使用一个匿名、立即执行的函数，用以确定应该使用哪一个函数实现
   const fn = (function() {
     if(...) {
       return function() {
         ...
       }
     } else if (...) {
       return function() {
         ...
       }
     }
   })();
   ```
惰性函数的优点是只在执行分支代码时牺牲一点儿性能，两种方式的选择可以根据具体需求而定，不过二者都能避免执行不必要的代码。
#### 16.3 函数绑定
函数绑定要创建一个函数，可以在特定的 this 环境中以指定参数调用另一个函数。该技巧常常和回调函数与事件处理程序一起使用，以便将函数作为变量传递的同时保留代码执行环境。使用闭包可以达到目的，但创建多个闭包可能会令代码变得难于理解和调试，因此,bind()是一个更好的选择。

#### 16.4 函数柯里化
函数柯里化与函数绑定密切相关，它用于创建已经设置好了一个或多个参数的函数。它的基本方法和函数绑定是一样的：使用一个闭包返回一个函数。二者的区别在于，当函数被调用时，返回的函数还需要设置一些传入的参数。
```js
//常见柯里化函数的通用方式
function curry(fn) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var innerArgs = Array.prototype.slice.call(arguments);
    var finalArgs = args.concat(innerArgs);
    return fn.apply(null, finalArgs);
  }
}
```
函数柯里化还常常作为函数绑定的一部分包含在其中，构造出更为复杂的bind()函数，如：
```js
//使用 bind 时，它会返回绑定到给定环境的函数，并且可能它其中某些函数参数已经被设定好。在一些场景下，比如除了 event 对象在额外给事件处理程序传递参数时，这非常有用。
funciton bind(fn, context) {
  var args = Array.prototype.slice.call(arguments, 2);
  return function() {
    var innerArgs = Array.prototype.slice.call(arguments);
    var finalArgs = args.concat(innerArgs);
    return fn.apply(context, finalArgs)
  }
}
```
ES5 的 bind() 方法也实现函数柯里化，只要在 this 的值之后再传入另一个参数即可。

ajax fetch
js 为什么单线程 块作用域 bind let const var this 原型链 构造 设计模式　

杂项：
在函数内部可以通过函数名来引用函数，对于匿名函数，唯一从内部引用自身的方式是使用 arguments.callee (已弃用)。

polyfill 就是我们常说的刮墙用的腻子，polyfill 代码主要用于旧浏览器的兼容，比如说在旧的浏览器中没有内置 bind 函数，因此可以使用 polyfill 代码在就浏览器中实现新的功能。

git rebase

参考：
- [JS正则表达式完整教程](https://juejin.im/post/5965943ff265da6c30653879)
- [JS设计模式与开发实践](https://github.com/JChehe/blog/issues/35)
