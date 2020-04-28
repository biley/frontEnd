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

### 杂项
babel 在编译时会判断 JSX 中组件的首字母，当首字母为小写是，认定其为DOM标签，createElement的第一个变量被编译为字符串;当首字母为大写时，认定其为自定义组件，createElement的第一个变量被编译为对象。


concurrent mode   SSR  web worker
