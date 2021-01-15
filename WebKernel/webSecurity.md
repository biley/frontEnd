### 1. XSS (Cross-Site Scripting) 跨站脚本攻击
XSS 一种代码注入方式，这类安全问题的本质原因在于浏览器错误的将攻击者提供的用户输入数据当做JS脚本执行了。根据攻击的来源，XSS 可以分为3类：
- 存储型XSS 攻击者将恶意代码提交到目标网站的数据库中。
- 反射型XSS 攻击者构造出特殊的URL,用户打开时，网站服务端将恶意代码从URL中取出，拼接在HTML中发回给浏览器。
- DOM型XSS 攻击者构造出特殊的URL,用户打开，浏览器收到响应后解析执行，前端JS取出URL中的恶意代码并执行。

XSS 攻击两大要素：
- 攻击者提交恶意代码
- 浏览器执行恶意代码

预防：
- 输入过滤(代码提交时的验证)。
  - 前端过滤，攻击者可以自行构造请求。
  - 后端过滤，因为无法确认数据需要显示在哪些地方，也就不知道所需的编码是什么。
  - 但是，对于明确的输入类型，如电话、URL、邮件等进行输入过滤还是必要的。
- 执行预防
  - 存储型和反射型：
    - 纯前端渲染，分割代码和数据。加载静态html(不包含任何业务数据) ——>执行JS ——> ajax 获取数据，使用 DOM API 更新到页面。但对于性能要求高、有SEO需求的页面，任然要拼接HTML。
  - 转义HTML。采用合适的转义库，对HTML模板各处插入点进行充分的转义(一般会转义 & < > " ' /), 但往往还需要更完善细致的转义策略。
  - DOM型：
    - 实际上是JS代码本身不够严谨，把不可信的数据当做代码执行了。使用 `.innerHTML`、`.outerHTML`、`document.write()`等时要注意不要插入不可信的数据。应尽量使用`.textContent`、`.setAttribute()`等。而Vue/React 等技术栈，不使用v-html/dangerouslySetInnerHTML功能，就在 render 阶段避免了 `.innerHTML`, `.outerHTML` 的隐患。 
    - DOM 中的内联事件监听器，如 `location`、`onclick`、`onmouseover`, JS 中的 `eval()`、`setTimeout()`等等都能把字符串作为代码运行，避免传入不可信的数据。
  - CSP(Content Security Policy)、输入内容长度控制。
  - HTTP-only Cookie、验证码。

### 2. CSRF(Cross-Site Request Forgery) 跨站请求伪造
在 session 登录系统，会将sessionId 存储到 cookie 中，而浏览器会自动在 http(s)请求中添加 cookie 一起上传到服务器端，而cookie 又过于开放。

若用户登录了A网站，在未登出的情况下又进入了B网站，则B网站可以发送一个针对A网站服务器的请求，且该请求携带了cookie 信息，可以通过用户验证。因此攻击者可以冒充用户对目标服务器进行某些操作或获取用户隐私数据等。CSRF 蠕虫。

不安全网站一般会通过 img、script 等不会跨域的元素调用 get 请求的接口; 而对于 post 接口，也可以通过 iframe 嵌入安全网站，然后通过 form 表单提交请求等其他方式来解决。

CSRF 通常从第三方网站发起，被攻击网站无法阻止攻击发生，只能通过增强自己网站的防护能力来提高安全性。

CSRF的两个特点：
- 通常发生在第三方域名。
- 攻击者不能获取到 Cookie 信息，只是使用。

针对 CSRF 的特点，可以专门定制防护策略：
- 阻止不明外域的访问：
    - 同源检测：origin header、referer header
    - Samesite Cookie：cookie 是否第三方可用。strict: 必须同源才能携带 cookie；lax：链接（<a>）、预加载（<link rel="prerender">）、get表单, none：都可以携带，但要求 https，也就是必须加上 secure 属性。
- 提交时附加本域才能获取的信息：
    - token 验证
    - 双重 Cookie 验证：CSRF 攻击实际不能获取到用户cookie，因此前端在发起请求时，可以取出 cookie 并添加到 URL 的参数中。
- 验证码，强制用户必须与应用交互，才能完成最终请求。

### 3. 网络劫持
网络劫持一般分为两种：
- DNS 劫持(涉嫌违法，已被监管，很少出现)
  - DNS 强制解析，修改运营商本地的DNS记录，引导用户流量到缓存服务器。
  - 302 跳转，监控网络出口的流量，判断出可以劫持处理的内容并发起 302 跳转的回复。
- HTTP 劫持： 因为 http 明文传输，所以运营商可以修改 http 的响应内容(比如加广告)。

DNS 出现很少，但http劫持依然盛行，最有效的办法就是全站HTTPS。

非全站的 https 也不安全，第一次通过http 或域名进行访问时(输入域名默认是 http 访问)，就可能被劫持，返回的302重定向网站可能是一个恶意网站(也可以称为SSL剥离攻击)。

HSTS(HTTP Strict TranSport Security)可以通知浏览器此网站禁止使用 http 方式加载，浏览器应该把所有的 http 请求自动替换为 https 请求。但用户首次访问或是清空了缓存的情况下，第一次访问仍可能是使用 http 明文。解决方案是 浏览器预置HSTS域名列表 或 将HSTS 信息加入到域名系统记录中。

### 4. iframe
Iframe 带来的风险有两种：
- 使用 iframe 引入其他网站时，默认情况下第三方网站不受控制，其中可以运行JS脚本、Flash插件、弹出对话框等。且第三方网站还可能出现被黑客攻破、域名过期被攻击者抢注等情况，iframe 中的内容被替换，从而利用浏览器中的安全漏洞下载安装木马、勒索病毒等。
- 攻击者也可以使用 iframe 引入某些网站达到攻击的目的。如**点击劫持(ClickJacking)**:攻击者可以使用 iframe 引入网站A，并将其透明化且覆盖在恶意网站B中某些按钮其他地方，若用户对网站A进行了保持登录等操作，则当用户点击网站B中被覆盖区域时，实际上是在不知情的情况下对对网站A进行了某些操作。

对于引入 iframe 风险的预防：
- sandbox(secure by default)

对于被引入的预防：
- X-FRAME-OPTIONS: DENY/SAMEORIGIN/ALLOW-FROM URL
- 判断是否被引入：
  ```js
  if(top.location != self.location) {
    top.location.href = '';//若被第三方引入，则强行跳转
  }
  ```
- samesite `cookie：samesite` 特性的 cookie 仅在网站是通过直接方式打开的情况下才会随 http 一起发送。

### 5. CDN 劫持
出于性能考虑，前端应用通常会把一些静态资源存放到CDN(Content Delivery Networks)上，如JS脚本和styleSheet 文件。而若是攻击者劫持了CDN或是对其中的资源进行了污染，则前端拿到的就是有问题的资源。与XSS 的区别在于攻击者从CDN开始攻击，而XSS是从有用户输入的地方下手。

防御 CDN 劫持的办法就是使用浏览器提供的 SRI(Subresource Integrity) 功能，Subresource 指的是HTML 页面中通过 `<script>` 和 `<link>` 元素所指定的资源文件。使用了 SRI 后，浏览器会检查对应文件的完整性，看是否和 integrity 属性值一致，从而判断文件是否被修改。

### 6. 其他
#### 6.1 第三方依赖包
不论应用本身的安全性多高，一些来自第三方依赖包的安全漏洞依然无法避免。

一些方案：
- 尽量选用相对成熟的依赖包
- 使用一些自动化工具对第三方代码进行检查，如NSP(Node Security Platform), Snyk 等等。

#### 6.2 opener
在项目中打开新标签一般有两种方式: `<a>`标签或`window.open()`。而被打开的页面可以通过 `window.opener.location.replace()`来将原标签导航到恶意网页或是一些欺骗性网页

方案：
- `<a>`标签中加入` rel="noopener noreferrer nofollow"`。
- window.open 使用方式：
  ```js
  function openUrl(url) {
    var newTab = window.open();
    newTab.opener = null;
    newTab.location = url;
  }
  ```

#### 6.3 错误的内容推断
场景：攻击者在上传图片时，可能实际提交了一个JS脚本文件。浏览器请求后，可能错误的推断了该响应的内容类型，将图片当做JS脚本执行，攻击成功。

关键在于，浏览器根据响应内容来推断其类型本是浏览器容错能力强的体现，却带来了风险。服务器在响应中设置的Content-Type 只是给浏览器提供了响应内容类型的建议，而浏览器可能自行进行推断。可以使用 X-Content-Type-Options(值为 `nosniff`，用于 script 和 style 文件) 来明确禁止浏览器推断响应内容。

### DNS 重绑定攻击
参考：
- [dns rebinding](域名重新绑定攻击技术)

参考：
- [前端面试与进阶指南](http://www.cxymsg.com/guide/security.html#%E6%9C%89%E5%93%AA%E4%BA%9B%E5%8F%AF%E8%83%BD%E5%BC%95%E8%B5%B7%E5%89%8D%E7%AB%AF%E5%AE%89%E5%85%A8%E7%9A%84%E7%9A%84%E9%97%AE%E9%A2%98)
- [前端安全问题汇总](https://zhuanlan.zhihu.com/p/83865185)
- [web安全漏洞之CSRF](https://juejin.im/post/6844903681591083015)
- [点击劫持](https://zh.javascript.info/clickjacking)