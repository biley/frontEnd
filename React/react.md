### 1. 虚拟DOM

简单说，虚拟DOM就是一个普通的JS对象。
React 使用虚拟DOM使得开发者只需告诉React想让视图处于什么状态，而不必自己完成属性操作、事件处理、DOM更新等等，提升了开发效率。而虚拟DOM的diff 算法则使得React 不用每次都更新一整个DOM树，只需更新有变化的即可，减少了需要操作的DOM，提升了程序性能。虚拟DOM的另一大优势在于抽象了原本的渲染过程，实现了跨平台的能力

virtual DOM 是React的一大亮点，具有batching(批处理)和高效的 Diff 算法。在React中，render 执行的结果得到的并不是真正的DOM结点，结果仅仅是轻量级的 JS对象，也就是 virtual DOM。React 基于 virtual DOM 自己实现了一套自己的事件机制，自己模拟了事件冒泡和捕获的过程，采用了事件代理，批量更新等方法，解决了各个浏览器的时间兼容性问题。

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

   当一个组件更新时，实例保持不变，因此 `state` 在跨越不同渲染时保持一致(不会丢失？)。React 更新组件实例的 props 来跟最新的元素保持一致，并且组件实例的 `componentWillReceiveProps()` 和 `componentWillUpdate()`。

   然后，其 render() 方法被调用(需要递归所有子组件的 render, 递归完之后才能diff 虚拟DOM, 和 fiber 的区别？)， diff 算法将递归之前的结果和新的结果。
4. 对子节点进行递归

   默认条件下，递归 DOM节点的子元素时，React会同时遍历两个子元素列表;产生差异时，生成一个 mutation。若实现简单，则在列表头部插入会很影响性能。

   为了解决这个问题，React 支持 key 属性。当子元素拥有 key 时，React使用 key 来匹配新树上的子元素和旧树上的子元素。使用元素在数组中的下标作为key,且会对元素重新排序时，修改顺序会改变当前key,[导致非受控组件的state可能互相篡改导致无法预期的变动](https://codepen.io/pen?editors=0010)(key 和 组件 props 变化了，但非受控组件的state没有变化，而存在相同的key使得组件实例不会销毁重建，从而发生数据错乱)。
React 可以在每个 action 后对整个应用进行重新渲染，这表示在所有组件内调用 render 方法，但这不代表 React 会卸载会重建它们，React 只会根据算法来决定如何进行差异的合并。

性能稳定：
1. 保持完整的结构，有利于性能的提升。React 官方建议不要进行DOM结点的跨层级操作，这会使得整个子树被重新重新创建。
2. 开发时，可以通过CSS来隐藏、显示结点，而不是真正的删除和添加DOM节点，保持稳定的DOM结构对性能的提升有帮助。
3. Key 应该稳定，可预测且在列表内唯一。

#### 3.生命周期
每个组件都包含生命周期方法，具体可分为三个阶段：
![lifecycle-16.4](/Image/lifecycle-16.4.png)
16.4 和 16.3 的生命周期有部分区别：
![lifecycle-16.3](/Image/lifecycle-16.3.png)
所有的 legacy 生命周期都可以继续使用至React17，之后要再使用只能加上前缀 `UNSAFE_` ,可以使用 rename-unsafe-lifecycles codemod 来自动更新组件。
**挂载**
当组件实例被创建并插入DOM时，其生命周期调用顺序：
1. **`constructor()`**
  
   - 在React组件挂载之前，会调用它的构造函数。
   - 构造函数一般只做两件事：初始化 `state` (给 `this.state` 直接赋值，`this.setState()` 方法在其他地方调用)或进行方法绑定(为事件处理函数绑定实例)，否则则不需实现构造函数。
   - 在为子类实现构造函数时，应在其他语句之前调用 `super(props)`。ES6 class 继承不调用 super() 创建实例时会直接报错; 在调用 super() 之前也无法在构造函数中使用 this；super 的参数 props 可以使基类 React.Component 初始化 this.props, 若不传则 React 会在组件实例化的时候设置一遍 props，这样做就无法在构造函数中使用 this.props。
   - 避免将 `props` 的值复制给 `state`,除非是想刻意忽略相关prop更新。
2. `static getDerivedStateFromProps(props, state)`、
   - 该方法在调用 render 之前调用，且在挂载和后续更新(注意包含父级重新渲染)时都会被调用。他应该返回一个对象来更新 state, 若返回 null 则不会更新任何内容。
   - 该方法仅适用于一些罕见用例，即 state 的值在任何时候都取决于 props。
   - 该方法会导致代码冗余，并使组件难以维护。使用前先考虑替代方案：
     1. 若需要执行 side effects(数据获取或动画)来响应 props 中的更改，使用 `componentDidUpdate()`。
     2. 若只想在 prop 更改时重新计算某些数据，则使用 memoizaiton helper 代替。
     3. 若想在 props 更改时重置某些 state，则先考虑使组件完全受控或用key使组件完全不受控。
     4. 此方法无权访问组件实例。若需要，可以通过提取组件 props 的纯函数及 class 之外的状态，在此方法和其他 class 方法之间重用代码。
   `UNSAFE_componentWillMount()`
   - 此方法之前名为 componentWillMount, 这个名称可以继续使用到 React17。在挂载之前被调用，在 render() 之前调用，因此其中同步调用 setState() 不会触发额外渲染，但通常建议使用 constructor() 来初始化。
   - 不应该在此方法中引入任何副作用或订阅，若有这样的情况，则改用 componentDidMount();
   - 此方法是服务端渲染唯一会调用的生命周期函数。

3. **`render()`**
   - render 被调用时，会检查 `this.props` 和 `this.state` 的变化并返回以下类型之一：React element(通常通过JSX创建)、数组或fragments、protals、字符串或数值类型、布尔类型或null。
   - render 函数应该是纯函数，这意味着在不修改组件state的情况下，每次调用都返回相同的结果，且不会直接与浏览器交互(一般在`componentDidMount()` 或其他生命周期中执行)。
   - 若 `shouldComponentUpdate()` 返回false, 则不会调用 `render()`;
4. **`componentDidMount()`**
   - 在组件挂载后(插入DOM树中)立即调用。
   - 依赖于DOM节点的初始化应该放在这里;这里也很适合实例化网络请求;这里也比较适合添加订阅，不过要注意在 `componentWillUnmount()` 中取消订阅。
   - 可以在其中直接调用 `setState()`,这样会触发额外渲染，但此渲染会发生在浏览器更新屏幕之前。这样保证了即使 `render()` 调用了两次，用户也不会看到中间状态。这样使用可能会导致性能问题，如果渲染依赖于DOM节点的大小或位置(如实现 modals或tooltips),可以使用此方法。
  

**更新**
1. static getDerivedStateFromProps(props, state)
   
   `UNSAFE_componentWillReceiveProps()`
   - 此方法仅在父组件重新渲染时触发，而不是因为内部的 setState。此方法会在已挂载的组件接受新的 props 之前被调用，若需要更新state 来响应 props 更改,则可以比较this.props和nextProps 并在方法中使用 `this.setState()` 来执行 state 转换。
   - 若父组件导致组件重新渲染，则即使props没有更改，则也会调用此方法，所以要注意进行当前值与变更值的比较。
   - 使用此方法通常会出现 bug 和不一致性，使用时考虑 `static getDerivedStateFromProps()` 的替代选择 1,2,3即[其他使用场景](https://react.docschina.org/blog/2018/06/07/you-probably-dont-need-derived-state.html)。
2. `shouldeComponentUpdate()`
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
6. **`componentDidUpdate()`**
   - 在更新后立即被调用
   - 组件更新后，可以在此处对DOM进行操作。若对更新前后的props进行了比较，也可以选择在此处进行网络请求。
   - 可以在其中直接调用 `setState()`,但必须包裹在一个条件语句中，否则会导致死循环。它还会导致额外的重新渲染，虽然用户不可见，但会影响组件性能。[不要将props 镜像给 state, 可以考虑直接使用 props](https://zh-hans.reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html)
   - 若组件实现了　`getSnapshotBeofreUpdate()` 生命周期，则它的返回值将作为 `componentDidUpate()` 的第三个参数“snapshot”参数传递，否则此参数为 undefined。
   - 若 `shouleComponentUpdate()` 返回值为 false, 则不会调用 `componentDidUpdate()`;

**卸载**
1. componentWillUnmount()
   - 在组件卸载及销毁之前直接调用。
   - 在此方法中执行必要的清理操作，如清除 timer,取消网络请求或清楚在 componentDidMount() 中创建的订阅等。
   - 不应在此方法中在调用 setstate(), 因为该组件永远不会重新渲染;组件实例卸载后，也将永远不会再挂载它。

**错误处理**
error boundaries 是React组件，它会在其子组件树中的任何位置捕获 JavaScript 错误，并记录这些错误，展示反馈UI而不是崩溃组件树。如果 class 组件定义了生命周期方法 `static getDerivedStateFromError()` 或 `componentDidCatch()` 中的任何一个(或二者)，它就成为了error boundaries。

Error boundaries 组件仅用来从意外异常中恢复的情况，不应该用于流程控制。Error boundaries 仅捕获组件树以下组件的错误，但它本身的错误无法捕获。


1. `static getDerivedStateFromError()`
   - 此方法会在后代组件抛出错误后被调用，它将抛出的错误作为参数，并返回一个值以更新state。
   - 此方法会在渲染阶段调用，因此不允许出现副作用, 有这类需求改用 `componentDidCatch()`;
2. `componentDidCatch()`
   - 此方法在后代组件抛出错误后被调用，接受两个参数:
     1. erro —— 抛出错误
     2. info —— 带有componentStack 的对象 
   - 此方法在 "commit" 阶段被调用，因此可以执行side effects。也可以在其中通过调用 `setState` 来渲染反馈UI，但在未来的版本中不推荐这样做，可以使用 `static getDerivedStateFromError()` 来处理。

### 杂项
babel 在编译时会判断 JSX 中组件的首字母，当首字母为小写是，认定其为DOM标签，createElement的第一个变量被编译为字符串;当首字母为大写时，认定其为自定义组件，createElement的第一个变量被编译为对象。

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

Fragments：　`<React.Fragment></React.Fragement>` 允许将子列表分组，而无需向DOM添加额外节点，key是唯一可以传递给Fragment的属性。还可以使用更简短的语法来生命 Fragments: `<></>`,但这样的写法不支持 key。

purecomponent 只会在 state 或者 props 的值变化时才会再次渲染，因此父组件的渲染不一定引起子组件 purecomponent的渲染。

concurrent mode   SSR  web worker
