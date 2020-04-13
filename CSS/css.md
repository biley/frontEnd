##### 1. 盒模型(Box Model)

所有 HTML 元素都可以看作盒子，包括：**margin**, **border**, **padding**, **content**

根据内容计算方式(主要是**宽度**，高度计算相同)不同，可分为标准模型和IE盒模型

- 标准盒模型(box-sizing: content-box): `width` = content
- IE 盒模型(box-sizing: border-box): `width` = content + `padding` + `border`;

所以主要区别在于一个content 的宽直接由 width 确定，另一个既使设置了 width 也还会受到 padding 和 border 影响


参考：
- https://juejin.im/entry/5a69b5f16fb9a01c96585601

##### 2.使用 js 获取元素宽高
1. `dom.style(.width/height)` 只能获取内联样式,也可设置
2. ~~`dom.currentStyle(.width/height)` 仅 IE 支持，**Non-standard**~~
3. `window.getComputedStyle(dom)(.width/height)` 返回的是一个**实时**的 `CSSStyleDeclaration` 对象，**只读**
4. `dom.getBoundingClientRect()`返回 element 的 size 和 相对与视窗的位置。其中在 content-box 中 size 为: width/height + padding; 而在 box-sizing 中 size 则是 width/height。