### 1. 前端存储
随着 Web 应用程序的发展，产生了能够直接在客户端上存储用户信息的要求。属于某个特定用户的信息应该存在该用户的机器上，无论是登录信息、偏好设定或是其他数据。目前前端存储数据常用的是 Cookie, Storage, IndexDB。

#### 1.1 cookie

##### 1.1.1 set-cookie的使用：
1. 要求服务器对任意HTTP 请求发送 set-cookie HTTP 头作为响应的一部分，其中包含会话信息，实例：
   ![set-cookie-eg](/image/../Image/set-cookie-eg.png)
2. 浏览器会存储这样的会话信息，且之后通过为每个请求添加 Cookie HTTP 头将信息发送会服务器：
   ![cookie-header-eg](/Image/cookie-header-eg.png)
3. 发送会服务器的额外信息可以用于唯一验证客户来自于发送的哪个请求。

##### 1.1.2 cookie 限制和构成
1. cookie 在性质上是绑定在特定的域名下的。当设定了一个 cookie 后，在给创建它的域名发送请求时，都会包含这个 cookie。这个限制确保了储存在 cookie 中的信息只能让批准的接收者访问，而无法被其他域访问。
2. cookie 是存在客户端计算机上的，为了确保 cookie 不被恶意使用且不会占据太多磁盘空间。对单个域名的 cookie 个数和尺寸都做了限制，不同浏览器的限制有所不同，一般为50个和 4KB。

如果超出个数限制，则浏览器会请求以前设置的 cookie, 请求算法浏览器的实现也有所不同。如IE和Opera 会删除最近最少使用的 cookie, 而 Firefox 似乎是随机决定要清楚那个 cookie。

若 cookie 大小超出尺寸限制，则该 cookie 会被悄无声息的丢掉。

cookie 由浏览器保存的以下几块信息**构成**，每一段信息都作为 set-cookie 头的一部分，使用 分号加空格 分隔每一段：
1. 名称：一个唯一确定 cookie 的名称，不区分大小写(但某些服务器会有区分，因此最好看作是区分大小写的)。cookie 的名称必须是经过 URL 编码的。
2. 值： 储存在 cookie 中的字符串值，必须被 URL 编码。
3. 域： cookie 对于哪个域是有效的，所有向该域发送的请求中都会包含这个 cookie 信息。这个值可以包含子域，也可以不包含。若没有明确设定，则域会被认为来自设置 cookie 的那个域。
4. 路径： 对于指定域中的那个路径，应该向服务器发送 cookie。设置了路径之后则可能同一个域的请求也不会发送 cookie 信息。
5. 失效时间： 表示 cookie 何时应该被删除的时间戳。默认情况下，浏览器会话结束时即将所有 cookie 删除，但也可以自己设置删除时间。因此，cookie 可在浏览器关闭后依然保存在用户的机器上。若设置的失效日期是个以前的时间，则 cookie 会被立刻删除。
6. 安全标志： 指定后，cookie 只有在使用 SSL 连接的时候才发送到服务器。安全标志 secure 是 cookie 中唯一一个非键值对的部分，直接包含一个 secure 单词。

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



