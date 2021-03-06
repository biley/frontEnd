### 1. 浏览器渲染流程
浏览器的渲染过程主要包括：
1. 解析 HTML 生成 DOM 树，可能会被 CSS 和 JS 的加载执行阻塞。
2. 解析 CSS 生成 CSSOM 规则树。
3. 将 DOM 树和 CSSOM 规则树合并在一起生成渲染树。
4. 遍历渲染树开始布局，计算每个节点的位置大小信息。
5. 将渲染树每个节点绘制到屏幕。

### 2. Load 和 DOMContentLoaded
概念：
- load: 整个页面都加载完成时触发，包括所有的资源如html，css，js，图片、子框架等等。
- DOMContentLoaded：初始的 HTML 文档被完全加载和解析完成之后被触发，无需等待图片、子框架等的加载。

**加载和解析**
这里加载和下载一个意思，就是浏览器将资源下载到本地的过程。

解析指将一个元素通过一定的方式转换成另一种形式。这里指浏览器将 html 文件中的字符串读取到内存中，按照 html 规则，对字符串进行取词编译，将字符串转化为另一种易于表达的数据结构。

浏览器会对转化后的数据结果自上而下进行分析：开启下载线程，对所有资源进行优先级排序下载（[预加载扫描器](https://developer.mozilla.org/zh-CN/docs/Web/Performance/%E6%B5%8F%E8%A7%88%E5%99%A8%E6%B8%B2%E6%9F%93%E9%A1%B5%E9%9D%A2%E7%9A%84%E5%B7%A5%E4%BD%9C%E5%8E%9F%E7%90%86#%E9%A2%84%E5%8A%A0%E8%BD%BD%E6%89%AB%E6%8F%8F%E5%99%A8)）；同时主线程会对文档进行解析。

主线程对文档进行解析时：
- 遇到 script 标签，首先会阻塞后续内容的解析，同时检查 script 是否已经下载，若已下载则执行代码。
- 遇到 link 标签时，不会阻塞后续内容的解析，检查 link 资源是否已经下载，若已下载，则构建cssom。
- 遇到 DOM 标签，则执行 DOM 构建，将该 DOM 元素添加到文档树中。

需要注意的是，在 body 中第一个 script 资源下载完成之前，浏览器会进行首次渲染，将该 script 标签前面的 DOM 树和 CSSOM 合并成一颗 Render 树，渲染到页面中，这时页面从白屏到**首次渲染**的时间节点。

**HTML 页面的首次渲染**
浏览器拿到地址对应的 html 页面之后：
1. 解析 html 页面的 DOM 结构。
2. 开启下载线程（加载扫描器）对文档中的所有资源按优先级排序下载。
3. 主线程继续解析文档，到达 head 节点，head 中的外部资源只有外链样式表和外链js:
   - 发现外链js，则停止解析后续内容，等待该资源下载完成后执行。
   - 若是外链CSS，则继续解析后续内容。
4. 解析到 body 中时，有多种情况：
   - 只有 DOM 元素。则 DOM 构建完成后，页面首次渲染。
   - 有 DOM 元素、外链js。 则若当解析到外链 js 的时候，该 js 尚未下载到本地，则该外链 js 之前的 DOM 会被渲染到页面上（首次渲染），同时该外链 js 的下载与执行会阻塞后面的 DOM 构建。
   - 有 DOM 元素、外链 css。外链 css 不会影响之后的 DOM 树构建，但会阻碍渲染，因此 css 加载解析完之前，页面还是白屏。
   - 有 DOM 元素、外链 js、外链 css。**外链 js 和外链 css 的顺序会影响页面渲染**，若外链 css 在外链 js 之前，则该外链 css 会阻塞之后的 DOM 树构建以及首次渲染，在外链 css 加载完成后，外链 js 之前的 DOM 树和 CSSOM 规则树合并渲染树，页面渲染出外链 js 之前的 DOM 结构（猜测：会比较外链 CSS 和外链 js 哪一个先完成下载。外链 css 的话，首次渲染；外链 js 的话，继续解析？  一定要等到外链 css 下载解析之后再继续执行，因为外链 js 之中可能会用到外链 css 样式）。
5. 文档解析完毕，页面重新渲染。当页面引用的所有 js（包括所有内联 js、外链 js）执行完毕（DOM 树构建完成），触发 DOMContentLoaded 事件。
6. html 文档中的图片资源，js 代码中有异步加载的 css、js、图片资源等都加载完毕（不包括 video、audio 和 flash），触发 load 事件。

参考：
- [再谈 load 与 DOMContentLoaded](https://github.com/lucefer/lucefer.github.io/issues/3)