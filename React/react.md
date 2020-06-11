### 1. 虚拟DOM

简单说，虚拟DOM就是一个普通的JS对象。
使用虚拟DOM，开发者只需决定想让视图处于什么状态，而不必自己完成属性操作、事件处理、DOM更新等等，提升了开发效率。而虚拟DOM的diff 算法则使得React 不用每次都更新一整个DOM树，只需更新有变化的即可，减少了需要操作的DOM，提升了程序性能。虚拟DOM的另一大优势在于抽象了原本的渲染过程，实现了跨平台的能力。

virtual DOM 是React的一大亮点，具有batching(批处理)和高效的 Diff 算法。在React中，render 执行的结果得到的并不是真正的DOM结点，结果仅仅是轻量级的 JS对象，也就是 virtual DOM。React 基于 virtual DOM 实现了一套自己的事件机制，模拟了事件冒泡和捕获的过程，采用了事件代理，批量更新等方法，解决了各个浏览器的事件兼容性问题。

一个 VitrualDom 可以简单的认为是：
```JS
const VitrualDom = {
  type: 'div',
  props: {},
  children: [],
}
```
主流的虚拟DOM库，通常都有一个h函数，在React中也就是 `React.createElement`, JSX 只是 `React.createElement`的语法糖， React 通过 babel 将JSX转换为 `React.createElement`。

### 2. reconciliation
"stack" reconciler 是 React15 及更早的解决方案；而 Filber 从 React 开始变成了默认的 reconciler， 但是 async 特性还没有默认开启。
从某方面来看，我们可以认为 `render()` 函数创建了一个 react elements 的树;在下一次 `state` 或 `props` 更新时， 该 `render()` 函数会返回一个不同的树。React 需要基于这两棵树之间的差别来判断如何有效率的更新UI以保证当前UI与最新的树同步。

这个算法问题有一些通用的解决方案，也就是生成将一棵树转换成另一棵树的最少操作。传统diff算法需要循环比较两棵树，所有结点的循环，单纯的比较次数就是O(n^2),找到差异后还要计算最小转换方式，最终结果为O(n^3);React 基于以下两个假设提出了一套O(n)的算法：
1. 不同类型的元素会产生不同的树。
2. 开发者可以通过 key 属性来暗示哪些子元素在不同的渲染下能保持稳定。

#### 2.1 diff 算法
diff两棵树时，React会先比较两个根元素(虚拟DOM)。根据根元素的类型，比较的行为也有不同。
1. 不同类型的元素

   当两个根元素类型不同时，React 会直接销毁旧树，创建新树。销毁旧树旧的 DOM 节点被销毁，组件实例执行 `componentWillUnmount()` ;创建新树时，新的DOM节点被插入DOM,组件实例执行`componentWillMount()` 以及 `componentDidMount()`, 所有的旧的 `state` 都会丢失。

2. 同一类型的DOM元素

   当两个DOM元素类型相同时，React 会对比二者的属性，然后保持相同的，更新变化了的。

   处理完当前节点之后，递归其子节点。

3. 同一类型的组件元素(组件本身不会进入DOM树中，其render方法返回的内容才会被加入DOM树中)

   当一个组件更新时，实例保持不变，因此 `state` 在跨越不同渲染时保持一致(不会丢失？)。React 更新组件实例的 props 来跟最新的元素保持一致，并且调用组件实例的 `componentWillReceiveProps()` 和 `componentWillUpdate()`。

   然后，其 render() 方法被调用(需要递归所有子组件的 render, 递归完之后才能diff 虚拟DOM, 和 fiber 的区别？)， diff 算法将递归之前的结果和新的结果。
4. 对子节点进行递归

   默认条件下，递归 DOM节点的子元素时，React会同时遍历两个子元素列表;产生差异时，生成一个 mutation。若实现简单，则在列表头部插入会很影响性能。

   为了解决这个问题，React 支持 key 属性。当子元素拥有 key 时，React使用 key 来匹配新树上的子元素和旧树上的子元素。使用元素在数组中的下标作为key,且会对元素重新排序时，修改顺序会改变当前key,[导致非受控组件的state可能互相篡改导致无法预期的变动](https://codepen.io/pen?editors=0010)(key 和 组件 props 变化了，但非受控组件的state没有变化，而存在相同的key使得组件实例不会销毁重建，从而发生数据错乱)。
React 可以在每个 action 后对整个应用进行重新渲染，这表示在所有组件内调用 render 方法，但这不代表 React 会卸载会重建它们，React 只会根据算法来决定如何进行差异的合并。

性能稳定：
1. 保持完整的结构，有利于性能的提升。React 官方建议不要进行DOM结点的跨层级操作，这会使得整个子树被重新创建。
2. 开发时，可以通过CSS来隐藏、显示结点，而不是真正的删除和添加DOM节点，保持稳定的DOM结构对性能的提升有帮助。
3. Key 应该稳定，可预测且在列表内唯一。

### 3. 生命周期
每个组件都包含生命周期方法，具体可分为三个阶段：
![lifecycle-16.4](/Image/lifecycle-16.4.png)
16.4 和 16.3 的生命周期有部分区别：
![lifecycle-16.3](/Image/lifecycle-16.3.png)
所有的 legacy 生命周期都可以继续使用至React17，之后要再使用只能加上前缀 `UNSAFE_` ,可以使用 rename-unsafe-lifecycles codemod 来自动更新组件。
react 16.3之前：
![pre-lifecycle](/Image/pre-lifecycle.png)
![pre-lifecycle-summary](/Image/pre-lifecycle-summary.png)

**挂载**

当组件实例被创建并插入DOM时，其生命周期调用顺序：
1. **`constructor(props)`**
  
   - 在React组件挂载之前，会调用它的构造函数。
   - 构造函数一般只做两件事：初始化 `state` (给 `this.state` 直接赋值，`this.setState()` 方法在其他地方调用)或进行方法绑定(为事件处理函数绑定实例)，否则则不需实现构造函数。
   - 在为子类实现构造函数时，应在其他语句之前调用 `super(props)`。ES6 class 继承不调用 super() 创建实例时会直接报错; 在调用 super() 之前也无法在构造函数中使用 this；super 的参数 props 可以使基类 React.Component 初始化 this.props, 若不传则 React 会在组件实例化的时候设置一遍 props，这样做就无法在构造函数中使用 this.props。
   - 避免将 `props` 的值复制给 `state`,除非是想刻意忽略相关prop更新。
2. `static getDerivedStateFromProps(props, state)`
   - 该方法在调用 render 之前调用，且在挂载和后续更新(注意包含父级重新渲染)时都会被调用。他应该返回一个对象来更新 state, 若返回 null 则不会更新任何内容。
   - 该方法仅适用于一些罕见用例([props 的offset变化时，修改当前的滚动方向](https://zh-hans.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props)和　[根据 props变化加载外部数据](https://zh-hans.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#fetching-external-data-when-props-change))，即 state 的值在任何时候都取决于 props(根据 nextProps 以及 prevState 来进行判断，将变化映射到 state)。
   - 该方法会导致代码冗余，并使组件难以维护。使用前先考虑替代方案：
     1. 若需要执行 side effects(数据获取或动画)来响应 props 中的更改，使用 `componentDidUpdate()`。
     2. 若只想在 prop 更改时重新计算某些数据，则使用 memoizaiton helper 代替。
     3. 若想在 props 更改时"重置"某些 state，则先考虑使组件完全受控或用key使组件完全不受控。
     4. 此方法无权访问组件实例。若需要，可以通过提取组件 props 的纯函数及 class 之外的状态，在此方法和其他 class 方法之间重用代码。

   `UNSAFE_componentWillMount()`
   - 在挂载之前被调用，在 render() 之前调用，因此其中同步调用 setState() 不会触发额外渲染，但通常建议使用 constructor() 来初始化。
   - 不应该在此方法中引入任何副作用或订阅，若有这样的情况，则改用 componentDidMount();
   - 此方法是服务端渲染唯一会调用的生命周期函数。

3. **`render()`**
   - 此方法是 react 组件中唯一必须实现的方法。
   - render 被调用时，会检查 `this.props` 和 `this.state` 的变化并返回以下类型之一：React element(通常通过JSX创建)、数组或fragments、protals、字符串或数值类型、布尔类型或null。
   - render 函数应该是纯函数，这意味着在不修改组件state的情况下，每次调用都返回相同的结果，且不会直接与浏览器交互(一般在`componentDidMount()` 或其他生命周期中执行)。
   - 若 `shouldComponentUpdate()`(只在更新时调用) 返回false, 则不会调用 `render()`;
4. **`componentDidMount()`**
   - 在组件挂载后(插入DOM树中)立即调用。
   - 依赖于DOM节点的初始化应该放在这里;这里也很适合实例化网络请求;这里也比较适合添加订阅，不过要注意在 `componentWillUnmount()` 中取消订阅。
   - 可以在其中直接调用 `setState()`,这样会触发额外渲染，但此渲染会发生在浏览器更新屏幕之前(重新 diff 该子节点树？diff 是一个递归的过程，只有在所有子组件完成挂载之后，父组件的render函数才算结束，才能产生父组件的虚拟DOM)。这样保证了即使 `render()` 调用了两次，用户也不会看到中间状态。这样使用可能会导致性能问题，如果渲染依赖于DOM节点的大小或位置(如实现 modals或tooltips),可以使用此方法。
  

**更新**
1. `static getDerivedStateFromProps(props, state)`
   
   `UNSAFE_componentWillReceiveProps(nextProps)`
   - 此方法会在已挂载的组件接受新的 props 之前被调用，若需要更新state 来响应 props 更改,则可以比较this.props和nextProps 并在方法中使用 `this.setState()` 来执行 state 转换。要注意若父组件导致组件重新渲染，即使 props 没有更改，也会调用此方法，而组件内调用 `this.setState()` 则通常不会触发此方法。
   - 若父组件导致组件重新渲染，则即使props没有更改，则也会调用此方法，所以要注意进行当前值与变更值的比较。
   - 使用此方法通常会出现 bug 和不一致性，使用时考虑 `static getDerivedStateFromProps()` 的替代选择 1,2,3即[其他使用场景](https://react.docschina.org/blog/2018/06/07/you-probably-dont-need-derived-state.html)。
   - 该方法每次 props 变化都会调用，不会合并，因此如果 props 频繁变化，而在该方法中有 side effects 的话，就会影响性能。
2. `shouldeComponentUpdate(nextProps, nextState)`
   - 当 props　或 state 变化时，该方法在渲染执行之前被调用，返回值默认为 true。首次渲染或使用 forceUpdate() 时不会调用该方法。
   - 根据该方法的返回值，判断 React 组件的输出是否受当前 state 或 props　更改的影响，默认每次更改都会重新渲染。
   - 此方法仅作为性能优化的方式而存在，不要依靠它来阻止渲染，这可能产生bug,返回 false 时，仍可能导致组件重新渲染。
   - 应该考虑内置的 pureComponent(而不是手动编写 `shouldeComponentUpdate()`), 它会对props和state进行浅层比较，并减少了跳过必要跟新的可能性)。
   - 不建议在该方法中进行深层比较或使用 JSON.stringify()。这样非常影响效率，且会损害性能。
   - 目前，若该方法返回 false, 则不会调用 `UNSAFE_componentWillUpdate()`, `render()` 和 `componentDidUpdate()`
3. `UNSAFE_componentWillUpdate()`
   - 组件在收到新的 props 或 state 时，会在渲染之前调用此方法，使用此作为在更新发生之前执行准备的机会。初始渲染不会调用此方法。
   - 不应该在此方法中执行 `this.setState()`; 在此方法返回之前，也不应该执行任何其他操作(如dispatch Redux 的 action)触发对React 组件的更新。
   - 若shouldComponentUpdate() 返回 false, 则不会调用此方法。
4. **`render()`**
5. `getSnapshotBeforeUpdate(prevProps, prevState)`
   - 此方法在最近一次渲染输出(提交到DOM节点)之前调用。它使得组件能在发生更改之前从DOM中捕获一些信息(如滚动位置)。此方法的返回值将作为参数传递给 `componentDidUpdate()`。
6. **`componentDidUpdate(prevProps, prevState, snapshot)`**
   - 在更新后立即被调用
   - 组件更新后，可以在此处对DOM进行操作。若对更新前后的props进行了比较，也可以选择在此处进行网络请求。
   - 可以在其中直接调用 `setState()`,但必须包裹在一个条件语句中，否则会导致死循环。它还会导致额外的重新渲染，虽然用户不可见，但会影响组件性能。[不要将props 镜像给 state, 可以考虑直接使用 props](https://zh-hans.reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html)
   - 若组件实现了　`getSnapshotBeofreUpdate()` 生命周期，则它的返回值将作为 `componentDidUpate()` 的第三个参数“snapshot”参数传递，否则此参数为 undefined。
   - 若 `shouleComponentUpdate()` 返回值为 false, 则不会调用 `componentDidUpdate()`;

**卸载**
1. `componentWillUnmount()`
   - 在组件卸载及销毁之前直接调用。
   - 在此方法中执行必要的清理操作，如清除 timer,取消网络请求或清除在 `componentDidMount()` 中创建的订阅等。
   - 不应在此方法中在调用 `setstate()`, 因为该组件永远不会重新渲染;组件实例卸载后，也将永远不会再挂载它。

**错误处理**

error boundaries 是React组件，它会在其子组件树中的任何位置捕获 JavaScript 错误，并记录这些错误，展示反馈UI而不是崩溃组件树。如果 class 组件定义了生命周期方法 `static getDerivedStateFromError()` 或 `componentDidCatch()` 中的任何一个(或二者)，它就成为了error boundaries。

Error boundaries 组件仅用来从意外异常中恢复的情况，不应该用于流程控制。Error boundaries 仅捕获组件树以下组件的错误，但它本身的错误无法捕获。

1. `static getDerivedStateFromError(error)`
   - 此方法会在后代组件抛出错误后被调用，它将抛出的错误作为参数，并返回一个值以更新state。
   - 此方法会在渲染阶段调用，因此不允许出现副作用, 有这类需求改用 `componentDidCatch()`;
2. `componentDidCatch(error, info)`
   - 此方法在后代组件抛出错误后被调用，接受两个参数:
     1. error —— 抛出错误
     2. info —— 带有componentStack 的对象 
   - 此方法在 "commit" 阶段被调用，因此可以执行side effects。也可以在其中通过调用 `setState` 来渲染反馈UI，但在未来的版本中不推荐这样做，可以使用 `static getDerivedStateFromError()` 来处理。

**父子组件生命周期执行顺序：**
1. 子组件自身状态改变，不对父组件产生副作用的情况下，不会触发父组件生命周期。
2. 父组件中状态发生变化时，会触发自身对应的生命周期以及子组件的更新:
   - render 及其之前的生命周期，父组件先执行。
   - render 之后的生命周期，子组件先执行，且与父组件交替执行。这里应该是与render 阶段、Pre-commit 阶段、Commit 阶段有关;在执行完子组件和父组件的 Pre-commit 阶段的生命周期后，才会执行子组件和父组件的 Commit 阶段的生命周期。

*react生命周期介绍，怎么执行。说一下下面的组件生命周期执行顺序【描述】
```
<A> <B /> </A>
a.willMount 3
b.willMount 1
a.didMount 4
b.didMount 2
```
react16前是递归的，是这个顺序。react16后改成fiber架构，是反过来的了，没有像栈那样fifo*

参考：
- [三张图对比React组件生命周期](https://zhuanlan.zhihu.com/p/60168527)
- [React 组件生命周期详解](https://juejin.im/post/5c4575626fb9a049ca37aac2)

### 4. setState
生命周期由 React 主动调用，而 `setState()` 和 `forceUpdate()` 则是开发者在组件中调用的方法。

`setState` 并不总是立即更新组件，它会批量推迟更新。因此想要在调用 `setState()` 后立即读取 this.state，可以使用 `componentDidUpdate` 或者 `setState` 的回调函数(`setState(updater, callback)`)。

`setState`(`setState(updater, callback)`)的使用：
1. 参数 1 为带有形参的 updater 函数： `(state, props) => statechange`，其中 state 和 props 都**保证为最新**，该函数的返回值会与 state 进行浅合并。
2. 参数 2 为可选的回调函数，它将在 `setState` 完成合并并重新渲染组件后执行，通常建议使用 `componentDidUpdate()` 来代替此方式。
3. 参数 1 除了接收函数外，还可以接受对象类型。这种形式的 `setState()` 也是异步的，并且在同一周期内会对多个 `setState()` 进行批处理，后调用的 `setState()` 将覆盖同一周期内先调用的 `setState()` 的值。若后续状态取决于当前状态，则建议使用 updater 函数的形式代替：
   ```JS
    constructor(props) {
      super(props);
      this.state = {
        num: 1
      };
    }

    //使用对象类型的参数，render 中 this.state.num 值为 2
    handleClick() {
      this.setState({ num: this.state.num + 1 });
      this.setState({ num: this.state.num + 1 });
      this.setState({ num: this.state.num + 1 });
    }

    //使用 updater 函数，render 中 this.state.num 值为 4
    handleClick() {
      this.setState(state => {
        return { num: state.num + 1 };
      });
      this.setState(state => {
        return { num: state.num + 1 };
      });
      this.setState(state => {
        return { num: state.num + 1 };
      });
    }

    //对象参数“异步更新”，可以认为覆盖了前面所有函数参数对state 的更新，而对象参数更新后的函数参数更新则按照正常情况更新。render 中 this.state.num的值为３。
    handleClick() {
      this.setState({ num: this.state.num + 1 });
      this.setState({ num: this.state.num + 1 });
      this.setState({ num: this.state.num + 1 });
      this.setState(state => {
        return { num: state.num + 1 };
      });
      this.setState(state => {
        return { num: state.num + 1 };
      });
      this.setState({ num: this.state.num + 1 });
      this.setState({ num: this.state.num + 1 });
      this.setState(state => {
        return { num: state.num + 1 };
      });
    }
   ```
虽然 setState 并非使用了 setTimeout 或 Promise 的那种进入到事件循环(Event loop)的异步执行，但它的执行行为在 react 库中时，确实是异步的，即有延时行为。文档上的说法是 state 的 update 可能是异步的，这样做有两个主要原因：
1. 通过异步的方式，可以把批量的 setState 对 state 的改变合并到一次 render 中，可以提升性能。
2. 保持内部的一致性。即使state可以同步更新，props 也做不到。比如：很多时候会出现子组件的状态提升到父组件的情况，此时即使在子组件中通过回调函数对 props 的值做了改变，props 也会等到父组件 render 之后才会做出改变。

需要注意的是，setState 并不是真正意义上的异步操作，它只是模拟了异步的行为(本身执行的过程和代码都是同步的，只是合成事件和钩子函数的调用顺序在更新之前)。React 会维护一个标识(isBatchingUpdates),用它来判断是直接更新还是先暂存state进队列。在合成事件和react生命周期函数中，受React控制，在使用 setState 时会将 isBatchingUpdates 设置为 true, 从而走类似异步的流程。

而在原生事件(如使用 addEventListener　绑定的事件)以及 setTimeout, setInterval, Promise 等的异步回调中，setState 对于 state 的修改是同步的。也就是每一次setState都会导致组件的render,而且可以在 setState 后直接通过 this.state 获取到更新后的 state 的值。

使用 add EventListener 的 callback 中使用的 state 值不会更新。

### 5. class 组件和 function 组件
class 组件和 function 组件最大的区别在于：函数组件捕获了渲染所用的值(与 hooks 无关)。

在React 中，Props 是不可变的，但 this 是可变的。事实上，这就是class 组件中 this 存在的意义。React 本身会随着时间的推移而改变，this 让我们可以在渲染方法以及生命周期方法中得到最新的实例。

因此每一次重新渲染，this.props 都会改变。这里就引出了一个问题：如果说UI在概念上是当前应用状态的一个函数，那么事件处理程序也是针对的当前UI,属于一个拥有特定 props 和　state 的特定渲染。但若是在事件处理函数中使用 setTimeout 调用一个回调来读取 this.props, this.props 却会随着渲染更新，从而使得回调函数“失去”了正确的 props。从 this 中读取数据的行为，切断了这样的联系。

若不考虑 function 组件，解决上面问题的方法：
1. 在调用事件之前读取 this.props, 并将需要的值显示地传递到回到函数中去。这样可以解决问题，但使得代码明显变得更加冗长，容易出错。
2. 使用闭包，在render 内部定义方法，在特定的渲染中捕获对应的 props 或者 state
   ```js
   class profilePage extends Component {
     render() {
       //capture props
       const props = this.props;

       const callback = () => {
         alert(props);
       }

       const handleClick = () => {
         setTimeout(callback, 3000);
       }

       return (<button onClick = {handleClick} >click</button>)
     }
   }
   ```
   这样在渲染的时候就已经捕获了 props。但在 render 方法中定义各种函数，而不是使用 class 的方法，就没有使用类的意义了。事实上，我们可以通过删除类的"包裹"来简化代码：
   ```js
   function profilePage(props) {
     const callback = () => {
       alert(props);
     }

     const handleClick = () => {
       setTimeout(callback, 3000);
     }

     return <button onClick = {handleClick} >click</button>
   }
   ```
   父组件使用不同的props 来渲染 profilepage 时，React 会再次调用profilePage 函数。而我们点击的事件处理函数属于有自己独特 props 的渲染，且回调函数能够访问到该 props 对应的值。因此这就是 class 组件和 function 组件之间最大的差别：**function 组件捕获了渲染所使用的值。使用 hooks, 同样的原则也适用于 state**。

现在我们知道，默认情况下 react 中的函数会捕获 props 和　state, 但若是想要读取并不属于此次特定渲染而是最新的 props 和 state 呢。在class组件中，this　可变，因此可以使用 this 来实现。而在 funciton 组件中，也可以拥有一个在所有的组件渲染帧中共享的可变变量：ref。相比　“DOM's refs”，　ref 在概念上更为广泛通用，它只是一个可以放东西进去的盒子。就表现上来说，`this.something` 就像是 `something.current` 的一个镜像。
```js
function profilePage() {
  const [message, setMessage] = useState('');
  const latestMessage = useRef('')

  const callback = () => {
    alert(latestMessage.current)
  };

  //想要特定 props 或 state 保持最新值，手动更新比较麻烦，可以使用一个 effect 来自动化实现它：
  useEffect(() => {
    lastMessage.current = message;
  });

  const handleClick = () => {
    setTimeout(callback, 3000);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    //手动更新
    latestMessage.current = e.target.value;
  }
}
```


参考：
- [How Are Function components Different from classes?](https://overreacted.io/how-are-function-components-different-from-classes/)


### 杂项
babel 在编译时会判断 JSX 中组件的首字母，当首字母为小写时，认定其为DOM标签，createElement的第一个变量被编译为字符串;当首字母为大写时，认定其为自定义组件，createElement的第一个变量被编译为对象。

JSX防止注入攻击，React 在渲染所有输入内容之前，默认会进行转义。所有内容在渲染之前都被转换成了字符串，这样可以有效地防止XSS(cross-site-scription)攻击。

`React.createElement()` 创建的对象称为“React elements”(虚拟DOM?):
```JS
//简化后的形式
const element = {
  type: 'div',
  props: {
    className: 'container',
    children: 'Hello, world!'
  }
}
```


Fragments：　`<React.Fragment></React.Fragement>` 允许将子列表分组，而无需向DOM添加额外节点，key是唯一可以传递给Fragment的属性。还可以使用更简短的语法来声明 Fragments: `<></>`,但这样的写法不支持 key。

purecomponent 只会在 state 或者 props 的值变化时才会再次渲染，因此父组件的渲染不一定引起子组件 purecomponent的渲染。
　

组件渲染：初始化，props或 state 变化，父组件渲染(reconcilation diff算法会递归所有子组件，这里可以通过 pureComponent或者 shouldComponentUpdate 避免重复渲染)

setState　的同步与异步：　https://juejin.im/post/5b45c57c51882519790c7441#heading-7  setState 是一个异步方法，一个生命周期中所有的 setState 方法会合并操作。

concurrent mode   SSR  web worker　fiber的render和commit 　 setState和props的批量更新。
