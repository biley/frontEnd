
- [1. 居中](#1-%e5%b1%85%e4%b8%ad)
    - [1.1水平居中](#11%e6%b0%b4%e5%b9%b3%e5%b1%85%e4%b8%ad)
    - [1.2垂直居中](#12%e5%9e%82%e7%9b%b4%e5%b1%85%e4%b8%ad)
    - [1.3垂直水平居中](#13%e5%9e%82%e7%9b%b4%e6%b0%b4%e5%b9%b3%e5%b1%85%e4%b8%ad)
- [2. 盒模型(Box Model)](#2-%e7%9b%92%e6%a8%a1%e5%9e%8bbox-model)
- [3. 使用 js 获取元素宽高](#3-%e4%bd%bf%e7%94%a8-js-%e8%8e%b7%e5%8f%96%e5%85%83%e7%b4%a0%e5%ae%bd%e9%ab%98)
- [4. 画三角形](#4-%e7%94%bb%e4%b8%89%e8%a7%92%e5%bd%a2)
- [5. 清除浮动](#5-%e6%b8%85%e9%99%a4%e6%b5%ae%e5%8a%a8)

***
### 1. 居中
**flex-box 的使用不再提及**
##### 1.1水平居中
**行内/类行内元素**

`block` 元素中的行内元素，只需使用 `text-align: center`；

该方法可以让 `inline/inline/block/inline-table/flex` 等类型的元素实现水平居中。

**块级元素**

- 固定宽度：
`block` 元素可以设置 `margin: 0 auto` 实现水平居中。
多个块级元素在同一水平线上居中，可以修改 `display` 值为 `inline-block`


##### 1.2垂直居中
**行内/类行内元素**

`vertical-align: middle` 用来设置 `inline/inline-block/table-cell` 中的元素对齐方式，使用场景一般为:
1. 行内元素的垂直对齐，如一行文字中的`<img>`垂直对齐。
2. 表格单元格中内容的垂直对齐。

对父容器使用 `display: table-cell; vertical-align: middle`使其内的子元素实现垂直居中
使用伪元素：(利用 伪元素的 `display` 和 `height` 完成设置元素所在行的基线，相当于调整 `vertical-align` 的相对坐标)
```CSS
.parent:before {
  content: '';
  height: 100%;
  display: inline-block;
  vertical-align: middle;
}
.childred {
  display: inline-block;
  vertical-align: middle;
}
```

父元素高度确定：
1. 若不会换行，可以设置 `line-height` 与 `height` 相等; 换行这样设置会导致只有第一行垂直居中。
2. 设置等值的 `padding-top` 和 `padding-bottom`;

##### 1.3垂直水平居中
绝对布局记得父元素设置相对布局
1. 绝对布局加 `margin`,`top`、`left`、`right`、`bottom`的值相等即可，不一定为0
    ```CSS
    {
      margin: auto;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
    ```
    2. 绝对布局加 `transform`
    ```CSS
    {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%,-50%);
    }
    ````
    3. 已知宽高，绝对布局加 `margin`
    ```CSS
    {
      width: 300px;
      height: 100px;
      position: absolute;
      top: 50%;
      left: 50%;
      margin: -50px 0 0 -150px;
    }
    ````
参考：
- https://www.w3cplus.com/css/centering-css-complete-guide.html

---
### 2. 盒模型(Box Model)

所有 HTML 元素都可以看作盒子，包括：**margin**, **border**, **padding**, **content**

根据内容计算方式(主要是**宽度**，高度计算相同)不同，可分为标准模型和IE盒模型。高度都指 content。

- 标准盒模型(box-sizing: content-box): `width` = content
- IE 盒模型(box-sizing: border-box): `width` = content + `padding` + `border`;

所以主要区别在于一个content 的宽直接由 width 确定，另一个既使设置了 width 也还会受到 padding 和 border 影响

参考：
- https://juejin.im/entry/5a69b5f16fb9a01c96585601

---
### 3. 使用 js 获取元素宽高
1. `dom.style(.width/height)` 只能获取内联样式,也可设置
2. ~~`dom.currentStyle(.width/height)` 仅 IE 支持，**Non-standard**~~
3. `window.getComputedStyle(dom)(.width/height)` 返回的是一个**实时**的 `CSSStyleDeclaration` 对象，**只读**
4. `dom.getBoundingClientRect()`返回 element 的 size 和 相对与视窗的位置。其中在 content-box 中 size 为: width/height + padding; 而在 box-sizing 中 size 则是 width/height。
5. `dom.clientWidth/clientHeight` inline 元素(以及无 CSS 样式的元素) `clientWidth/clientHeight` 为0。`clientWidth/clientHeight = content + padding (- 滚动条)`； 只读。
6. `dom.offsetWidth/offsetHeight` 返回元素的布局位置，`offsetWidth/offsetHeight = content + padding + border + 滚动条`，被隐藏则返回0； 只读。

---
### 4. 画三角形
当 div 的宽高为0, 而 border 设置有宽度时，会出现三角形，在调整border的宽度，颜色，透明度，就可以画出不同的三角形：
```CSS
.triangle {
  width: 0;
  height: 0;
  border-top: 0px solid blue;
  border-right: 50px solid transparent;
  border-bottom: 150px solid green;
  border-left: 50px solid transparent;
}
```
---
### 5. 清除浮动
float 属性的初衷： 让文字环绕图片显示。使元素脱离文档流，按照指定方向移动，遇到父级边界或者相邻的浮动元素时停止。

清楚浮动原因：

1. 文字会围绕浮动元素排版。若想要文字排列在浮动元素下方，或不希望文字两边有浮动元素存在，则需要清楚浮动。
2. 浮动会导致父元素高度塌缩。
3. 浮动元素在父元素高度塌缩后，甚至会影响到父元素的兄弟元素的排版。

清除方法：

1. `clear` 可以使得元素两边都没有浮动元素，只解决本身遇到的浮动问题(如使得文字不再环绕)。当使用了 `clear` 的元素在浮动元素之后时，会将该元素放置在浮动元素下方，从而“正好”也解决了父元素塌缩的问题。

   `clear` 属性一般用在 `block` 元素上，因此可以在父元素的末尾加一个空的 `block` 元素(一般是 `div`)，设置其 `clear:both/left` 即可清楚浮动

   同样的，也可以在父元素上使用伪元素来清除浮动：
   ```CSS
   parent:after {
     content: '';
     display: block;
     clear: both;
   }
   ```
2. 设置父元素的 `overflow` 值**为`visible` 之外的值**，使其成为一个BFC。一般选择 `auto`,其他值可能有副作用 `srcoll` 会导致滚动条始终可见，`hidden` 则会隐藏超出内容。

参考：
- https://juejin.im/post/59e7190bf265da4307025d91
