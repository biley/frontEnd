# Build My Own React
### 基本概念
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
  type: 'h1',
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

### createElement
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
### ReactDom.render
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
### Concurrent Mode
当前实现的 ReactDom.render 递归有一个问题：一旦开始渲染，不渲染完整棵树就没法停止渲染（有点像之前在适配器中写 while 来强行延迟返回）。如果 element 树很大，就可能会较长时间的阻塞主线程，此时如果有其他高优的任务比如处理用户输入或者保持动画平滑（requestAnimationFrame），就得等到渲染完之后再去处理（这里应该是事件循环机制）。

这里的思路是将整个渲染流程拆分成多个小单元，如果浏览器有其他任务需要完成，就可以在每个小单元完成之后打断渲染流程。这里可以使用 reqeuestIdleCallback 来实现，React 之前模拟实现了 reqeuestIdleCallback，目前用的是 [scheduler package](https://github.com/facebook/react/tree/main/packages/scheduler)，但是在这样的场景下整体上是类似的。