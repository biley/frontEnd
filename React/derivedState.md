# Devrived State 的使用
`getDerivedStateFromProps` 会在调用 render 方法之前调用，并且在初始挂载及后续更新时都会被调用。它应该返回一个对象来更新 state，如果返回 null 则不更新任何内容。

派生状态会导致代码冗余，并使组件难以维护。
### 1. 什么时候使用派生 State
`getDerivedStateFromProps` 的存在只有一个目的：让组件在 props 变化是更新 state(如props的offset变化时，修改当前的滚动方向或根据props变化加载外部数据)，我们应该保守使用派生state。

### 2. 派生state 的常见bug
**任何数据，都要保证只有一个数据来源，而且要避免直接复制它**

若组件用props传入数据的话，则可以被认为是受控;若数据只保存在组件内部的state的话，则是非受控组件。

常见的错误是把二者混为一谈：当一个派生state的值也被setState方法更新时，这个值就不是一个单一来源的值了。接下来的两个反面模式是 getDerivedStateFromprops 和 componentWillReceiveProps 都会出现的问题：

1. 反面模式：直接复制 prop 到 state。
   最常见的错误是以为 getDerivedStateFromProps 和 componentWillReveciveProps 只有在 'props' 变化时才会调用，而忽略了其在父级元素渲染时，二者也会调用。所以在二者中直接复制props 到 state 的话，这样做会可能会导致 state 更新的丢失：组件内 input 值对应的 state 也可由父元素传入的 props 更新。
2. 反面模式：在 props 变化后修改 state。
   对于反面模式1中的问题，可以通过只在对应prop变化时(比较nextProps.prop和this.props.prop)更新state来避免。但是这样仍然是有问题的：因为有很多组件只是抽离出来的小组件(如 EmailInput),若内部组件state被setState更新后,外部对象放生变化，但小组件所对应的 prop 和之前相同，那么 state 的更新就会被保留下来，使人困惑。

上面两个问题比较常见，有两个方案能解决这些问题。其关键就是：数据要保证只有一个数据来源，且要避免直接复制它(要记得父元素渲染时这两个方法也会调用)。
1. 建议模式：完全可控的组件。
   从组件中删除state,将其提升到父组件中。
2. 建议模式：有 key 的非可控组件。
   组件自己存放state，只从 prop 接收初始值，之后的值就和 prop 没有关系了。每次key值变化，都会创建新的子组件，并初始化state。**大部分情况下，这是处理重置state的最好的办法。**

   虽然使用 key 听起来很慢，但这点性能是可以忽略的，若在组建树的更新上有很重的逻辑，这样**反而会更快**，因为省略了子组件的 diff。
   
重置非受控组件：
1. 使用 prop 的唯一id重置非受控组件：
   
   某些情况下 key 不起作用或组件初始化开销太大，一个麻烦但可行的方案是在这两个方法中观察唯一id的变化，然后重置所有或是部分state。
2. 使用实例方法重置非受控组件：
   
   在有的情况下，即使没有合适的key, 也想要重新创建组件。一种解决方案是给一个随机值或是递增的值当做key,另一种方案是用实例方法强制重置内部状态：
   ```JS
    //子组件中提供重置方法：
    resetEmail(defaultEmail) {
      this.setState({email: defaultEmail});
    }
    //父组件中使用ref调用实例方法
    handleResetEmail = email => {
      this.chindRef.current.resetEmail(email);
    }
   ```
   使用ref重置子组件state应该谨慎使用，因为这可能会导致两次渲染(父元素渲染，子元素跟着渲染，setState渲染)而不是一次。

#### 2.1总结:
**设计组件时，重要的是确定组件时受控组件还是非受控组件。**

不要直接复制 props 的值到 state 中，而是实现一个受控组件，然后在父组件中合并二者的值，这样数据才更加明确可测。

对于不受控的组件，若想在 prop 变化(一般是id)时重置 state, 可以选择以下几种方式：
- 建议：若要重置内部所有的初始state, 使用 key 属性。
- Alternative 1：观察特殊属性的变化(如id)
- Alternative 2: 使用 ref 调用实例方法。

### 3使用 memoization
memoization 可以理解为仅仅在输入变化时，再重新计算 render 需要使用的值的技术。

一个简单的示例：组件使用一个prop(list)并在用户输入查询条件时输入匹配的项，使用 derived state 的话(管理起来很复杂，且复杂度随着需要管理的属性变得越来越庞大), 则需要保存 preList 和 preFilterText。这里也可以使用 PureComponent, 会比 derived State 的版本更加清晰简捷。只是有时候，这还不够好(对于很大的列表，过滤可能很慢;而当有其他 prop 改变时 PureComponent 不会阻止再次渲染，过滤也会再次执行(即使list对应的prop没有变化))。因此可以加入 memoization 帮助函数来阻止非必要的过滤。

memoization使用约束：
1. 大部分情况下，每个组件内都要引入 memoized 方法，以免实例之间相互影响。
2. 一般情况会限制 memoization 帮助函数的缓存空间，以免内存泄漏。
3. memoized 有多种库，可以提供多重参数及结果缓存。如 memoize-one: 调用语法为: `memoizeOne(resultFn, isEqual)`其中 isEqual 默认为 `===` 。

参考：
- [You Probable Don't Need Derived State](https://react.docschina.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#when-to-use-derived-state)