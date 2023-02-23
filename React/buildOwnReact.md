# Build My Own React
### 1.基本概念
一个简单的 react app:
```js
const element = <h1 title='foo'>Hello</h1> //定义一个 react element
const container = document.getElementById('root') //拿到一个 DOM 节点
ReactDom.render(element, container) //将 react element 渲染到 DOM 节点中
```

#### React element
上面 demo 第一行使用 JSX 创建了一个 React element（以下简称 element），JSX 最终会被一些 build 工具比如 babel 转换成 js。这个转换一般都很简单，使用 React.createElement 进行转换：
```js
const element = <h1 title='foo'>Hello</h1>

const element = React.createElement(
  'h1',
  {title: 'foo'},
  'Hello'
)
```
createElement 使用传入的参数创建了一个对象，额外进行了一些验证。所以 element 实际就是一个对象，createElement 可以简单的用其输出来代替：
```js
//简化后的输出
const element = {
  type: 'h1', //传递给 document.createElement 的 tagName，也可以是一个 function
  props: {
    title: 'foo',
    children: 'Hello'
  }
}
```
**因此 react element 实际就是一个带了 type、props 以及一些其他属性的对象。** props 的 **children**是一个比较特殊的属性，通常它会是一个 element 的数组，这是 elements 也是树的原因。

JSX 写的代码会被转换成使用 React.createElement()的形式，因此使用了 JSX 一般就不会再直接调用 React.createElement() 了。不过 React.createElement() 仍然是可以使用的。 参考 [createElement](https://zh-hans.reactjs.org/docs/react-api.html#createelement)。

#### 整体替换
ReactDom.render 是 react 改变 DOM 的地方，因此可以用原生 DOM 操作替代。

### 2.createElement
`React.createElement(type,[props],[...children])`

createElement 主要就是根据传入的参数返回一个 element 对象。
```js
const element = (
  <div>
    <a>bar</a>
    <b/>
  </div>
)
//使用 React.createElement
const element = React.createElement(
  'div',
  {id: 'foo'},
  React.createElement('a', null, 'bar'),
  React.createelement('b')
)
//自定义 createElement
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => typeof child === 'object' ? child : createTextElement(child))
    }
  }
}
//处理一些原始的值，比如字符串或者数字。react 没有包装原始值，也不会在没有 children 时创建一个空数组；但相比效率，这里更追求简单的代码。
function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}
```
### 3.ReactDom.render
`render(element, container[, callback])`

主要负责 DOM 的改变，目前只考虑添加，之后再来看更新和删除。
```js
function render(element, domContainer) {
  //处理一些原始的值
  const dom = element.type == 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(element.type)
  Object.keys(element.props).filter(key => key !== 'children').forEach(name => {dom[name] = element.props[name]})
  element.props.children.forEach(child => render(child, dom))
  container.appendChild(dom)
}
```
### 4.Concurrent Mode
当前实现的 ReactDom.render 递归有一个问题：一旦开始渲染，不渲染完整棵树就没法停止渲染（有点像之前在适配器中写 while 来强行延迟返回）。如果 element 树很大，就可能会较长时间的阻塞主线程，此时如果有其他高优的任务比如处理用户输入或者保持动画平滑（requestAnimationFrame），就得等到渲染完之后再去处理（这里应该是事件循环机制）。

这里的思路是将整个渲染流程拆分成多个小单元，如果浏览器有其他任务需要完成，就可以在每个小单元完成之后打断渲染流程。这里可以使用 reqeuestIdleCallback 来实现，React 之前模拟实现了 reqeuestIdleCallback，目前用的是 [scheduler package](https://github.com/facebook/react/tree/main/packages/scheduler)，但是在这样的场景下整体上是类似的。

requestIdleCallback 和 setTimeout 类似，但：
1. 浏览器会在主线程空闲的时候(idle)执行回调，而不是定时执行。
2. 它会给回调一个时间参数，告诉回调离浏览器下一次执行其他任务还有多长时间。

```js
let nextUnitOfwork = null

function workLoop(deakline) {
  let shouldYield = false
  //如果还有渲染任务且有剩余时间，则继续渲染
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    )
    shouldYield = deadline.timeRemaining() < 1
  }
  //这里应该有一个判断，如果是时间不够，则等待下一次浏览器空闲的时候继续执行渲染任务；否则则是nextUnitOfWork 为空，渲染任务已经完成
  requestIdleCallback(workLoop)
}
​
requestIdleCallback(workLoop)
​
function performUnitOfWork(nextUnitOfWork) {
  // TODO 执行渲染任务单元，并返回下一个任务单元
}
```

这种方式可以理解为处理一个或几个渲染 unit 之后，就通过 requestIdleCallback 去查看一下是否有优先级更高的任务需要处理，有的话则先处理其他任务，没有的话继续处理之后的渲染 unit。

到 2019 年 10 月，concurrent mode 依然是不稳定的，属于实验功能（最终好像是没有更新到正式版本之上）。而当时的稳定版就是不但的递归，所有树大的话可能会有卡顿现象。类似于：
```js
while(nextUnitOfWork) {
  nextUnitofWork = preformUnitOfWork(nextUnitOfWork)
}
```

### 5.Fibers
fiber 树是用来组织这些任务单元的一种数据结构（链表树），每个 element 对应一个 fiber，每个 fiber 都是一个任务单元。

```js
//属性
{
  dom: null,
  props: {
    children: []
  },
  child: null,
  sibling: null,
  parent: null,
  alternate: null, //指向之前的节点
  effectTag: '' //DOM 对应的更改 UPDATE, PLACEMENT，DELETION
}
```

对应的，可以将 root fiber 设置为初始的 nextUnitOfWork，而 performUnitOfWork 中需要实现的是：
1. 将 element 添加到 DOM
2. 为所有的 children  创建对应的 fiber
3. 选择对应的 nextUnitOfWork

为了更容易的找到 nextUnitOfWork，每个 fiber 都保存了指向第一个子 fiber、下一个兄弟 fiber 和父 fiber 的指针。nextUnitOfWork 优先选择第一个子 fiber，其次是兄弟 fiber，最后是父 fiber 的兄弟 fiber；这样一直找回到 root，意味着渲染结束。
```js
function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
​
  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom)
  }
​
  const elements = fiber.props.children
  let index = 0
  let prevSibling = null
​
  while (index < elements.length) {
    const element = elements[index]
​
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    }
​
    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }
​
    prevSibling = newFiber
    index++
  }
​
  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}
​
```
### 6.render 和 commit 阶段
直接在 fiber 树的生成阶段操作 dom 还是有问题：如果在递归中途，浏览器要去处理其他优先级更高的任务，那么用户会看到一个不完整的界面。

**React 核心原则之一是一致性，它总是一次性更新 DOM,不会显示部分结果**

所以要把将 element 添加到 dom 这一步骤从 performUnitOfWork 中去掉。取而代之的是，保留这棵 fiber 树的 root，一旦 fiber 完全生成，则可以将递归的将整棵树中的节点 commit 到 DOM 中去。

render 阶段在遍历生成新 fiber 树的同时，会同时遍历旧的树，以确定 DOM 是否需要做修改，并保存在 effectTag 属性中。在这里，如果是 UPDATE 的话，就会直接用 dom 属性保留就 fiber 的dom，因为只更新 props。

### 7.reconciliation
commit 阶段不仅仅是将添加节点到 DOM 中，还有更新和删除。这里就是直接根据 fiber 节点的 effectTag 来做对应的处理了。

https://github.com/peoplesing1832/build-your-own-react-cn

### 8.Function 组件
Function 组件和 DOM 主要有两个不同：
1. Function 组件的 Fiber 没有 DOM 节点
2. children 来自 Function, 而不是直接从 DOM 中直接获取（render 阶段）。

### 9.hooks
hooks 的处理，是要在生成 Function fiber  的时候，初始化全局变量，`hookIndex = 0`,`hooks = []`。组件在 render 的时候，需要从这里检查之前是否有 hook，若有则将旧的 hook 复制到新的 hook；没有则用初始值初始化 hook。这也是组件更新时，虽然看起来执行了 useState()，但对应的 state 并没有变成初始值的原因。
```js
const hook = {
  state: oldHook ? oldHook.state : initial,
  queue: []
}
const actions = oldHook ? oldHook.queue: []
actions.forEach(action => {
  hook.state = action(hook.state)
})
const setState = action => {
  hook.queue.push(action)
  nextUnitOfWork = wipRoot // 下一次更新 state
}

return [hook.state, setState]
```
