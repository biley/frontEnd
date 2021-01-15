### 1. 前端存储
随着 Web 应用程序的发展，产生了能够直接在客户端上存储用户信息的要求。属于某个特定用户的信息应该存在该用户的机器上，无论是登录信息、偏好设定或是其他数据。目前前端存储数据常用的是 Cookie, Storage, IndexDB。

#### 1.1 cookie

##### 1.1.1 set-cookie的使用：
1. 要求服务器对任意HTTP 请求发送 set-cookie HTTP 头作为响应的一部分，其中包含会话信息，实例：
   ![set-cookie-eg](/image/../Image/set-cookie-eg.png)
2. 浏览器会存储这样的会话信息，且之后通过为每个请求添加 Cookie HTTP 头将信息发送回服务器：
   ![cookie-header-eg](/Image/cookie-header-eg.png)
3. 发送回服务器的额外信息可以用于唯一验证客户来自于发送的哪个请求。

##### 1.1.2 cookie 限制和构成
1. cookie 在性质上是绑定在特定的域名下的。当设定了一个 cookie 后，在给创建它的域名发送请求时，都会包含这个 cookie。这个限制确保了储存在 cookie 中的信息只能让批准的接收者访问，而无法被其他域访问。
2. cookie 是存在客户端计算机上的，为了确保 cookie 不被恶意使用且不会占据太多磁盘空间。对单个域名的 cookie 个数和尺寸都做了限制，不同浏览器的限制有所不同，一般为50个和 4KB。

如果超出个数限制，则浏览器会清除以前设置的 cookie, 清除算法浏览器的实现也有所不同。如IE和Opera 会删除最近最少使用的 cookie, 而 Firefox 似乎是随机决定要清除哪个 cookie。

若 cookie 大小超出尺寸限制，则该 cookie 会被悄无声息的丢掉。

cookie 由浏览器保存的以下几块信息**构成**，每一段信息都可以作为 set-cookie 头的一部分，使用 分号加空格 分隔每一段：
1. `<cookie-name>=<cookie-value>`：
    - `cookie-name`是一个唯一确定 cookie 的名称，不区分大小写(但某些服务器会有区分，因此最好看作是区分大小写的)。cookie 的名称一般都是经过 URL 编码的。
    - `cookie-value` 是储存在 cookie 中的字符串值，一般也会被 URL 编码。
    - 以 `__Secure-`为前缀的 cookie 必须与 secure 属性一同设置，必须应用于安全页面(即使用 https 访问的页面);以 `__Host-`为前缀的 cookie 必须与 secure 属性一同设置，必须应用于安全页面(使用 https 访问的页面)，不能设置 domain 属性(不会发送给子域)，path　属性必须为"/"。
2. `Domain=<domain-value>`： cookie 对于哪个域是有效的，所有向该域发送的请求中都会包含这个 cookie 信息。这个值可以包含子域，也可以不包含。若没有明确设定，则域会被认为来自设置 cookie 的那个域(不包含子域名)。
3. `Path=<path-value>`： 对于指定域中的那个路径(路径后可以跟下级路径)，应该向服务器发送 cookie。设置了路径之后则可能同一个域的请求也不会发送 cookie 信息。
4. `Expires=<date>`：
   - 表示 cookie 何时应该被删除的时间戳。默认情况下，浏览器会话结束时即将所有 cookie 删除，但也可以自己设置删除时间。
   - 因此，cookie 可在浏览器关闭后依然保存在用户的机器上，未过期的 cookie 可以称为 持久性cookie, 保存在硬盘上。
   - 若设置的失效日期是个以前的时间，则 cookie 会被立刻删除。
   - 有的浏览器提供会话恢复功能，即使关闭浏览器也会保留cookie, 保存在内存中。tab 还原的时候，cookie 也会恢复，就跟从来没有关闭浏览器一样。
5. `Max-Age=<non-zero-digit>`: 在 cookie 失效之前需要经过的秒数，为 0 或是 -1 会使 cookie 直接过期。若 `Expires` 和`Max-Age`同时存在，则 `Max-Age` 优先级更高。　
6. `Secure`： 指定后，cookie 只有在使用 SSL 连接的时候才发送到服务器。
7. `HttpOnly`: 设置了该属性的 cookie 不能使用 JS　通过 `Document.cookie` 属性、`XMLHttpRequest` 和 `Request` APIS 进行访问，以防范 XSS。
8. `SameSite=Strict/Lax`: 允许服务器设定，则 cookie 不随着跨域请求一起发送，这样可以在一定程度上防范跨站请求伪造攻击(CSRF)

域、路径、失效时间 和 安全标志都是服务器给浏览器的指示，以指定何时应该发送 cookie。这些参数并不会作为发送到服务器的 cookie 信息的一部分。

##### 1.3 js 中的 cookie
js 中使用 BOM 的 document.cookie 属性来处理 cookie, 该属性根据使用的方式不同而表现出不同的行为：
- 用来获取属性值时，该属性返回当前页面可用的所有 cookie的字符串(一系列由分号隔开的键值对)。所有的名称和值都是经过URL编码的，因此必须使用 `decodeURIComponent()`来解码。
- 用来设置值的时候，该属性可以设置为一个新的 cookie 字符串。设置该属性不会覆盖 cookie, 除非设置的 cookie 名称已经存在。想要为 cookie 指定额外的信息，则只要将参数追加到该字符串，和 set-cookie 头中的格式一样。

由于 js 中读写 cookie 不是非常直观，可以写一些函数来简化 cookie 的使用, 基本的 cookie 操作有三种：读取、写入和删除：
```js
const cookieUtil = {
  get: function (name) {
    const cookieName = encodeURIComponent(name) + "=";
    const cookieStart = document.cookie.indexOf(cookieName);
    let cookieValue = null;

    if (cookieStart > -1) {
      const cookieEnd = document.cookie.indexOf(";", cookieStart);
      if (cookieEnd === -1) {
        cookieEnd = document.cookie.length;
      }
      cookieValue = decodeURIComponent(document.cookie.substring(cookieStart+ cookieName.length, cookieEnd));
    }
    return cookieValue;
  }

  set: function (name, value, expires, path, domain, secure) {
    const cookieText = endoceURIComponent(name) + "=" + endoceURIComponent(value);
    if (expires instanceof Date) {
      cookieText += "; expires=" + expires.toGMTString();
    }

    if (path) {
      cookieText += "; path=" + path;
    }

    if (domain) {
      cookieText += "; domain=" + domain;
    }

    if (secure) {
      cookieText += "; secure"
    }

    document.cookie = cookieText;
  }

  unset: function (name, path, domain, secure) {
    this.set(name, "", new Date(0), path, domain, secure)
  }
}
```

应用场景：
- 会话状态管理(用户登录状态、购物车、游戏分数等其它需要记录的信息)
- 个性化设置(用户自定义设置、主体等)
- 浏览器行为跟踪(跟踪分析用户行为等)

#### 1.2 Storage
当数据需要被严格控制在客户端上，无须持续地将数据发回服务器时，cookie 就体现了它的不足。Web Storage 克服了这些缺陷，它的两个主要目的是：
1. 提供一种在 cookie 之外存储会话数据的途径。
2. 提供一种存储大量可以跨会话存在的数据的机制。

存储在 sessionStorage 或 localStorage 中的数据特定于页面的协议，也就是说 `http://www.google.com`和`https://www.google.com`相互隔离。

Storage 类型提供存储空间来存储键值对。操作一个域名的会话存储，可以使用 `window.sessionStorage`;操作一个域名的本地存储，可以使用`window.localStorage`：
- 属性为 `length`, 表示存储在 storage 对象中的数据项数量。
- 方法有　`getItem(key)`、`setItem(key, value)`、`removeItem(key)`、`clear()`、`key()`。
- Storage 的存储上限一般为 ５MB(每个域名)。
- 要访问一个 Storage 对象，受同源协议限制(页面必须来自同一个域名(子域名无效)，使用同一种协议，在同一个端口上)。
- Storage 对象中的键值对总是以字符串的形式存储(与 js 中的对象相比，这意味着数值类型会自动转化为字符串类型)。

除了使用 getItem()、getItem()和 removeItem() 操作键值对外，也可通过 storage 对象来操作，因为每个数据项都是作为属性存储在该对象上的，所以可以通过点语法或者方括号语法访问属性来读取值。
##### 1.2.1 sessionStorage
sessionStorage 对象存储特定于某个会话的数据：
1. sessionStorage 的操作限制在单个标签页中。
2. 页面会话在标签tab打开期间一直保持，并且重新加载或恢复页面仍会保持原来的页面会话。
3. 在新标签或窗口打开一个页面时会复制顶级浏览会话的上下文作为新会话的上下文，这与 cookies 不同(可能可以访问相同的cookies)。
4. 打开多个相同 URL 的 Tabs　页面，会创建各自的 sessionStorage。
5. 关闭对应浏览器Tab, 会清除对应的 sessionStorage。
##### 1.2.2 localStorage
sessionStorage 对象应该主要用于仅针对会话的小段数据的存储，如果需要跨越会话存储数据，那么 localStorage 更为合适：
1. localStorage 中的数据会保留到通过 JavaScript 删除或者是用户清除浏览器缓存。
2. 当浏览器进入隐私浏览模式时，会创建一个新的、临时的数据库来存储 local storage 的数据，当关闭隐私浏览模式时，该数据库将被清空并丢弃。

##### 1.2.3 storage 事件
当前页面使用的 storage(localStorage) 被其他同源页面修改时会触发 storageEvent 事件，这个事件的 event 对象有５个属性：domain, key, newValue, oldValue, url。多窗口通信是一个比较好的使用场景。


参考：
- [cookies, localStorage, sessionStorage, session](https://segmentfault.com/a/1190000015988834)

### 2. html5 新标签
- 用于绘画的 canvas 元素。
- 用于媒介回放的 video 和 audio 元素对本地离线存储的更好的支持。
- 新的特殊内容元素，如：article、footer、header、nav、section。
- 新的表单控制，如：calendar、date、time、email、url、search。

参考：
- [html5新标签总结](https://juejin.im/post/5c9b45256fb9a070fb370edd)

### 3. 跨浏览器兼容
优雅降级: web 站点在所有新式浏览器中都能正常工作，再对旧版本的 IE 进行降级处理。
渐进增强：从被所有浏览器支持的基本功能开始，逐步添加新版本浏览器才支持的功能。

内核：
- Trident，IE 内核。
- Gecko，Netscape, firefox 内核。
- Presto，Opera 前内核，现改用 Google Chrome 的 Blink 内核。
- Webkit， Safari 内核
- Blink，webkit 的一个分支。Chrome，opera 内核。