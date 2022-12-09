
- [- js中各种宽高以及位置总结](#--js中各种宽高以及位置总结)
  - [4. 画三角形](#4-画三角形)
  - [5. 清除浮动](#5-清除浮动)
  - [6. 网页布局](#6-网页布局)
  - [7. BFC](#7-bfc)
  - [8. media](#8-media)
  - [9. 栅格](#9-栅格)
  - [10. flex box](#10-flex-box)
  - [11 transform](#11-transform)
  - [12. CSS 预处理器](#12-css-预处理器)
  - [13. inline 和 block](#13-inline-和-block)
  - [14. 布局](#14-布局)
  - [15. 宽高比固定的矩形](#15-宽高比固定的矩形)
    - [15.1 height: auto](#151-height-auto)
    - [15.2 height + padding-bottom](#152-height--padding-bottom)
    - [15.3 使用 vw 或 vh 设置宽高](#153-使用-vw-或-vh-设置宽高)
  - [杂项](#杂项)

***
### 1. 居中
**flex-box 的使用不再提及**，使用时水平居中 `justify-content` 要设置为 `space-around`，设置为 `space-between` 会靠在左边。
##### 1.1水平居中
**行内/类行内元素**

`block` 元素中的行内元素，只需使用 `text-align: center`；

该方法可以让 `inline/inline-block/inline-table/flex` 等类型的元素实现水平居中。

**块级元素**

固定宽度：
- `block` 元素可以设置 `margin: 0 auto` 实现水平居中。
- 多个块级元素在同一水平线上居中，可以修改 `display` 值为 `inline-block`，并设置父元素：`text-align: center`;


##### 1.2垂直居中
**行内/类行内元素**

- `vertical-align: middle` 用来设置 `inline/inline-block/table-cell` 中的元素对齐方式(该属性定义行内元素基线与元素所在行的基线的垂直对齐)，使用场景一般为:
  1. 行内元素的垂直对齐，如一行文字中的`<img>`垂直对齐。
  2. 表格单元格中内容的垂直对齐。

- 对父容器使用 `display: table-cell; vertical-align: middle`使其内的子元素实现垂直居中。

- 使用伪元素：(利用 伪元素的 `display` 和 `height` 完成设置元素所在行的基线，相当于调整 `vertical-align` 的相对坐标)
```CSS
.parent:before {
  /* 如果子元素宽度为100%, 则可能换行，设置font-size 解决这个问题 */
  font-size: 0;
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
绝对布局记得父元素设置相对布局(父元素：非static, 可以是absolute, relative, fixed, inherit(注意继承的不是 static))。
1. 绝对布局加 `margin`，`top`、`left`、`right`、`bottom`的值相等即可，不一定为0。需要设置宽高，不然子元素会填满所设的区域。
    ```CSS
    {
      width:..;
      height:..;
      margin: auto;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
    /* 变种，多嵌套一层: */
    .child {
      position: absolute;
      left: 50%;
      top: 50%;
    }
    .inner-child {
      position: relative;
      left: -50%;
      top: -50%;
    }
    ```
    2. 绝对布局加 `transform`
    这种方式的问题在于子元素自适应宽度最大为 50%, 如果有较长文字会自动换行。当然也可以设置 `white-space: nowrap` 来强制不换行，但这样文字就可能超出父元素。
    ```CSS
    {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%,-50%);
    }
    ````
    1. 已知宽高，绝对布局加 `margin`
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
  
多个元素并排，使用 content-box 的话，再设置 border 或者 padding 就可以将部分元素挤到下一行去，border-box 就更适用。

参考：
- https://juejin.im/entry/5a69b5f16fb9a01c96585601

---
### 3. 使用 js 获取元素宽高
1. `dom.style(.width/height)` 只能获取内联样式,也可设置
2. ~~`dom.currentStyle(.width/height)` 仅 IE 支持，**Non-standard**~~
3. `window.getComputedStyle(dom)(.width/height)` 返回的是一个**实时**的 `CSSStyleDeclaration` 对象，**只读**
4. `dom.getBoundingClientRect()`返回 element 的 size 和 相对于视窗的位置。其中在 content-box 中 size 为: width/height + padding; 而在 box-sizing 中 size 则是 width/height。
5. `dom.clientWidth/clientHeight` inline 元素(以及无 CSS 样式的元素) `clientWidth/clientHeight` 为0。`clientWidth/clientHeight = content + padding (- 滚动条)`； 只读。
6. `dom.offsetWidth/offsetHeight` 返回元素的布局位置，`offsetWidth/offsetHeight = content + padding + border + 滚动条`，被隐藏则返回0； 只读。

参考：
- [js中各种宽高以及位置总结](https://juejin.im/entry/6844903557104140301)
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

1. 文字会围绕浮动元素排版。若想要文字排列在浮动元素下方，或不希望文字两边有浮动元素存在，则需要清除浮动。
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

---
### 6. 网页布局
网页布局一般可以分成3种：
- 普通流：`inline`, `block`;
- 定位流：`position`, `z-index`;
- 浮动流：`float`;

---
### 7. BFC
Block Formatting Context(块级格式化上下文)，是一个独立的渲染区域，它规定了内部的 block box 如何布局，且该布局不会影响到外部。

形成 BFC 的条件：
1. 浮动元素，`float` 除了 `none` 以外的值;
2. 定位元素，`position` 值不为 `relative/static`;
3. `display: inline-block/table-cell/table-cation`;
4. `overflow` 除了 `visible` 以外的值;

BFC 特性：
1. 内部的 block box 在垂直方向逐个放置，即使是浮动元素也会接着上一个盒子垂直排列(会受到上一个盒子的 `padding` 和 `margin` 影响)。
2. 内部的 box 会发生 `margin` 重叠。(`inline` 元素宽高设置无效，竖直方向的 `margin`, `padding` 设置无效)。
3. 不被浮动元素覆盖
   - 两栏布局：左边float, 右边 BFC 宽度自适应。
   - 三栏布局：左右float, 中间 BFC 宽度自适应(这里要注意元素排列顺序应该是：<left/></right></middle>)。
   - 防止字体环绕。与 clear 的区别在于将字体块设置为 BFC, 二者依然在同一行; 使用 clear, 则二者会换行。
4. 不会影响到外部区域，可以用来清除 margin 重叠：若两个相邻元素发生了 margin 重叠，则将其中一个放到 BFC 容器中即可。另外这个特性也可以清除浮动，使父元素包裹浮动元素，不会塌缩，也不会影响外部元素，但对文字环绕效果没有影响。
参考：
- https://juejin.im/post/5c7e142d6fb9a049c9666b23

---
### 8. media

使用 media, 可以针对不同的媒体类型定义不同的样式，在响应式页面设计方面非常有用。

早在 CSS2 开始就已经支持 media, 具体用法是在 head 标签中插入`<link>`标签，这种方法最大的问题是会增加 http 的请求次数;用 CSS3 把样式都写在一个文件中才是最佳的方法

CSS3 中使用的语法为：
```CSS
@media mediatype and|not|only (media fature) {
  ...
}
```
`mediatype` 多数已废弃，现有`all/print/screen/speech`;
`mdeia feature` 值很多，`color/device-width/device-height/max-device-width/max-resolution` 等。

---
### 9. 栅格

`float`, `inline-block`, `display: table`, `display: flex` 都可以实现栅格布局。

可以在加上 @media 实现响应式布局

实现:
1. 一个基本的栅格布局，包含 container, rows, columns, gutters。容器 containr 的宽度通常为 100%;

   - 通过浮动来制作栅格系统，行元素使用伪元素来`清除浮动`，防止列元素溢出到其他行。
   - 若列是空的，浮动的列顶部会重叠，所以为列设置 `min-height: 1px;`
   - 根据容器宽度 100%, 除以一行总列数得到单列宽度，可以得到各个列样式(`.col-1, .col-2` ...)宽度
   - 列宽固定，设置盒模型为 `border-box`, 用 `padding` 作为间隙gutter

    代码实现：
    ```CSS
    .container {
      width: 100%;
      box-sizing: border-box;
    }

    .row:after {
      content:"";
      display: block;
      clear:both;
    }

    .col-($num) {
      float: left;
      min-height: 1px;
      width: ($num * singWidth);
      padding: 12px;
    }
    ```
2. 栅格化的主要目的是把平面分成有规律的一系列格子，并借此来进行有规律的版面布局。
   - 通过 inline-block 来布局，通过给父元素设置。 `font-size: 0` 来[去掉两个 `inline-block` 之间的距离](https://www.zhangxinxu.com/wordpress/2012/04/inline-block-space-remove-%E5%8E%BB%E9%99%A4%E9%97%B4%E8%B7%9D/)。
   - 根据容器宽度 100%, 除以一行总列数得到单行宽度，可以得到各个列样式(`.col-1, .col-2` ...)宽度。
   - 列宽固定，设置盒模型为 `border-box`, 用 `padding` 作为间隙gutter。
   - [inline-block根据内容不同会有垂直对齐问题](https://www.jianshu.com/p/9e0274e0f9bd)，所以设置 `vertical-align: top` 顶部对齐。
    ```CSS
      .container {
        font-size: 0;
        box-sizing: border-box;
      }
      .col-($num) {
        vertical-align: top;
        width: ($num * singWidth);
        padding: 12px;
      }
    ```
### 10. flex box
设为 flex 布局之后，子元素的 float、clear和vertical-align属性将失效。

容器:
```CSS
{
  display: flex;
  flex-direction: row/row-reverse/column/column-reverse;
  flex-wrap: nowrap/wrap/wrap-reverse;
  flex-flow: flex-direction flex-wrap;
  justify-content: flex-start/flex-end/center/space-between/space-around;
  align-items: flex-start/flex-end/center/baseline/stretch;
  align-content: flex-start/flex-end/center/space-between/space-around/stretch;  /*定义多根轴线的对齐方式*/
}
```
项目：
```CSS
{
  order: integer; /*项目排列顺序，数值越小，排列越靠前*/
  flex-grow: number(default: 0);
  flex-shrink: number(default: 1);
  flex-basis: length/auto;
  flex: flex-grow flex-shrink flex-basis; /*简写，后两个属性可选*/
  align-self: auto/flex-start/flex-end/center/baseline/stretch;

}
```
flex-grow 定义项目放大比例：
- 默认0,不放大;
- 所有项目都为1, 等分剩余空间;
- 一个为2,其他都为1,则前者占据空间比其他多一倍;
- 一个为1, 其他都为0,占据所有剩余空间

flex-shrink 定义项目的缩小比例：
- 默认1,若空间不足，项目等比缩小
- 一个为0, 其他为1, 则空间不足时前者不缩小
- 负值无效

`flex-basis`: 定义在分配多余空间之前，项目占据的主轴空间。浏览器根据该属性计算主轴是否有多余空间:
- 默认`auto`,即项目的本来大小
- length(350px),项目占据固定空间
- 若不使用 `box-sizing` 改变盒模型，该属性决定了 flex 元素的内容盒(content box)的 size
- `flex-basis` 和 `width`(或是 `flex-basis`, `flex-direction: column`, `height`同时设置)， `flex-basis` 优先级更高

flex是简写形式，后两个属性可选：
- 默认 0 1 auto;
- auto (1 1 auto);
- none (0 0 auto);

align-self 定义单个项目的对齐方式：
- 默认 auto,表示继承父元素的 align-items; 若无，则为 stretch
- 可覆盖父元素的 align-items

参考：
- [flex布局教程：语法篇](https://www.ruanyifeng.com/blog/2015/07/flex-grammar.html)

### 11 transform
2D: 
- transition(过渡)
- transform: scale、 translate、ratate
3D:
- transform: rotateX、rotateY、rotateZ
- transform: translateX、translateY、translateZ

透视：perspective
3D呈现：transform-style

动画：
```css
@keyframes name {
  from {}
  to {}
} 
/* 百分数，steps()分段执行 */
/* animation: name 时间 次数 反向 运动曲线 延迟执行  */
```



### 12. CSS 预处理器
CSS 自诞生以来，基本语法和核心机制一直没有本质上的变化，在很长一段时间内，它的发展几乎全是表现力层面上的提升。随着网站越来越复杂，原生 CSS 已经让开发者力不从心。

当一门语言的能力不足而用户的运行环境又不支持其他选择的时候，这门语言就会沦为“编译目标”语言。开发者将选择另一门更高级的语言来进行开发，然后编译到底层语言以便实际运行。于是，在前端，CSS　预处理器应运而生。

CSS 预处理器是一个让开发者能通过预处理器独有的语法来生成 CSS 的程序，市面上有很多 CSS 预处理器可供选择，绝大多数都会增加一些原生 CSS 不具备或不完善的高级特性，这些特性让 CSS 的结构更加具有可读性且易于维护。当前有代表性的主要为：
- Sass: (2007年) 最早也最成熟的 CSS 预处理器，受LESS影响，已经全面兼容 CSS 和 SCSS。SCSS　是 Sass3　引入新的语法，其语法完全兼容CSS3, 且继承了Sass的强大功能。二者的区别在于：
  1. 文件名扩展不同：".sass"后缀和".scss"后缀。
  2. 语法书写方式不同，Sass 以严格的缩进格式语法规则来书写，不带大括号和分号；而SCSS的语法书写和CSS语法书写方式非常类似。
- Less: (2009年) 受 SASS 影响比较大，但使用 css 的语法，更容易上手。缺点是编程功能不够，优点是简单和兼容CSS, 反过来也影响到了 SASS 演变为 SCSS。
- Stylus: (2010) 主要用来给 Node 项目进行CSS预处理支持, 完全由JS实现，对Node.js 工具链极为友好。它是一种新型语言，可以创建健壮的、动态的、富有表现力的CSS。其本质上做的事情与SASS/LESS类似。

虽然各种预处理器功能强大，但使用最多的，还是以下几个特性：
1. 变量及相关操作：
   ```css
    $font-size: 10px;
    $font-family: Helvetica, sans-serif;

    body {
      font: $font-size $font-family;
    }

    .mark {
      font-size: 1.5 * $font-size;
    }
   ```
2. 代码混合(minxins)
   ```css
    @mixin clearfix {
      &:after {
        display: block;
        content: '';
        clear: both;
      }
    }

    .sidebar {
      @include clearfix;
    }
   ```
3. 嵌套(nested rules)
   ```css
    #main p {
      color: #00ff00;
      widht: 100%;

      .redbox {
        background-color: #ff0000;
        color: #000000;
      }
    }
   ```
4. 代码模块化(Modules)
   Sass 拓展了　@import 功能，允许其导入SCSS或Sass文件，被导入的文件将合并编译到同一个CSS文件中，另外，被导入的文件中所包含的变量或者混合指令都可以在导入的文件中使用。

   通常，@import 寻找Sass文件并将其导入。但在以下情况，@import 仅作为普通的 CSS 语句,不会导入Sass 文件：
   - 文件扩展名为 .css。
   - 文件名以 http:// 开头。
   - 文件名是 url()。
   - @import 包含 media requires。
   若不再上述情况，文件扩展名是 .scss 或 .sass,则导入对应的 Sass 文件。若没有指定拓展名，Sass 将会试着寻找文件名相同，后缀为 .scss 或 .sass 的文件并将其导入。
5. 工具类函数
   ```css
    $grid-width: 40px;
    $gutter-width: 10px;

    @function grid-width($n) {
      @return $n * $grid-width + ($n - 1) * $gutter-width;
    }

    #sidebar { width: grid-width(5)};
   ```
### 13. inline 和 block
block:
- 前后换行，可以包含 block 和 inline 元素。
- 可以设置宽高、padding、margin。

inline:
- 前后不换行，一系列 inline 元素在一行中显示，直到行被排满。
- 根据元素是**替换元素**还是**非替换元素**，表现会有所不同：
  - 替换元素： 浏览器根据元素的标签、属性，决定具体显示什么内容。如 image、input、textarea、object、video、embed 等等。
  - 非替换元素： 浏览器直接将其中的内容显示出来。
- 可替换的 inline 元素即使 `display`显示为 inline, 也可以认为具有 inline-block 的特性，宽高默认包裹子元素，宽高可设置，margin、padding 均可设置。
- 非替换的 inline 元素宽高默认包裹子元素，但宽高均不可设置。margin、padding 在水平方向的设置会产生间距效果，而在垂直方向不会产生间距效果；需要注意的是虽然不会产生间距，但 padding-top, padding-bottom 仍能设置成功且添加背景颜色后可以看到设置后的 padding, 而 margin-top, margin-bottom 的设置则是完全没有任何效果。

参考：
- [2019年，你是否可以抛弃CSS预处理器](https://aotu.io/notes/2019/10/29/css-preprocessor/index.html)
- [sass 中文网](https://www.sass.hk/docs/)

### 14. 布局
静态布局：px布局
流式布局：主要区域使用百分数(配合 min-*、max-*属性使用)。
弹性布局： rem + js:
```js
export const DOC_FONT_SIZE = (document.documentElement.clientWidth / 1440) * 16;
  document.documentElement.style.fontSize = DOC_FONT_SIZE;
```

### 15. 宽高比固定的矩形
#### 15.1 height: auto
若场景是一个 div 包含一个 img，则：
```css
div {
  width: 50%;
  height: auto;
}
image {
  widht: 100%;
  height: auto;
}
```
#### 15.2 height + padding-bottom
padding 和 margin 设置为百分数时是根据父元素的宽度计算的百分比。所以可以在元素 width 固定的情况下，设置其 height 为 0，使内容自然溢出，再设置 padding-top 使其具有一定高度。
```css
.father {
  width: 100%;
}

.child {
  width: 50%;
  height:0;
  padding-top: 50%;
}
```
这样只能设置一个盒子，内部没有内容，可以对内容元素设置绝对定位使填满固定宽高比的元素。
```css
.child {
  position: relative;
  width: 50%;
  padding-top: 50%;
}

.content {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}
```
#### 15.3 使用 vw 或 vh 设置宽高

### 杂项
1. table 中的 td 高度随内容自适应，但是 td 中所有 div 高度都要撑满 td。正常情况下，猜测是因为渲染时 td 的高度会随着后面内容变化，所以无法知道具体高度导致 `height: 100%` 无效。这种情况可以给 table 设置 `height: 1px`解决，然而为什么能 work 还不知道。

如果给 td 设置了固定高度，则内部的 div 就有了一个 parent 来计算百分比高度。而 td 内部的高度大于了 td 本身的高度的话，td 会自动变高，内部百分比计算的 div 也会随着变高（给 table 设置应该也是差不多的原理）。

参考：
- [如何使用纯 css 实现固定宽高比 div](https://blog.csdn.net/weixin_33727510/article/details/91435891)
- [面试官提问之CSS如何实现固定宽高比](https://www.jb51.net/css/714251.html)