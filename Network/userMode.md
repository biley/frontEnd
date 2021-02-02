### 1. JWT（JSON Web Token）
JWT 是一个基于 JSON 的开放标准，用于在各方之间安全地传输信息（信息可以被验证和信任，因为它是数字签名的）。Token 被设计为紧凑且安全的，特别适用于分布式站点的单点登录场景。

#### 1.1 使用 sesssion 的验证
使用 session 的用户认证一般流程：
1. 用户登录
2. 服务器验证通过后，保存一个 session，其中包含了相关数据如用户角色、登录时间等等。
3. 服务器返回一个 session_id 写入用户的 Cookie。
4. 之后的用户的请求都会通过 cookie 将 session_id 传回服务器。
5. 服务器收到 session_id,找到前期保存的数据，由此得知用户的身份。

使用 session 这种模式的问题在于，扩展性不好。若是服务器集群，或是跨域的服务导向架构，就要求 session 数据共享，每台服务器都能够读取 session。解决方案：
1. session 数据持久化，写入数据块或别的持久层。
2. 另一种方案是服务器不保存 session 数据，所有数据都保存在客户端，每次请求都发回服务器，JWT 就是这种方案的一个代表。

#### 1.2 JWT 原理
JWT 的原理就是服务器认证之后，生成一个 JSON 对象给客户端，客户端与服务器通信时，都要发送这个 JSON 对象。服务器完全只靠这个JSON 对象认定用户的身份。

服务器不再保存任何 session 数据，即服务器变成无状态了。

**JWT 的数据结构**

JWT 是一个很长的字符串，中间用点（`.`）分割成三个部分：
- header: 一个JSON 对象，描述 JWT 的元数据，包含的属性比如：
  - alg 签名使用是算法，默认 `"HS256"`。
  - typ 表示该 token 的类型，JWT 令牌统一写为 `"JWT"`。
- payload 一个 JSON 对象，用来存放实际需要传递的数据。JWT 规定了 7 个官方字段：iss、exp、sub、aud、nbf、iat、jti；此外，还可以在这里定义私有字段。JWT 默认是不加密的，任何人都可以读到，所以不要把秘密信息放在这个部分。
- signature 对前两部分的签名，防止数据篡改。首先，指定一个秘钥（secrect），这个秘钥只有服务器才知道，不能泄露给用户。然后，使用 Header 中指定的签名算法（默认 HMAC SHA256，即 alg 值写为 HS256），按照公式产生签名：`HMACSHA256(base64UrlEncode(header) + '.' + base64UrlEncode(payload), secret)`。

Base64URL 与 Base64算法类似，因为 token 可能会被放到 URL 中。而 Base64 有三个字符 `+`、`/`、`=` 在 URL 中有特殊含义，所以要被替换掉：`=`被省略、`+`替换成 `-`、`/`替换成 `_`。这就是 Base64URL 算法。

JWT 可以放在 Cookie 中自动发送，但这样不能跨域，所以更好的做法是放在 HTTP 请求 header 的 `Authorization` 字段中：`Authorization: Bearer <token>`

#### 1.3 JWT 的几个特点
1. JWT默认不加密，这种情况下，不能将秘密数据写入 JWT；需要加密的话，可以在生成原始 Token 后，用秘钥再加密一次。
2. JWT 不仅可用于认证，也可用于交换信息。有效使用 JWT 可以降低服务器查询数据库的次数。
3. 使用 JWT 时，由于服务器不保存 session 状态，所以无法在使用过程中废止某个 token 或更改 token 权限。因此，除非服务器添加额外的逻辑，否则 JWT 签发之后，在到期之前就会始终有效。
4. JWT 本身包含了认证信息，为了减少盗用，JWT 的有效期应该设置得比较短，且不应该使用 http 协议明码传输。甚至对于一些比较重要的操作，使用时应该再次对用户进行认证。

JWT 和 session：
- 都是存储用户信息，然而 session 是在服务器端的，而 JWT 是在 客户端的。
- session 方式最大的问题在于会增加服务器开销（存储和查找），而 JWT 则是将用户状态分散到了客户端中，可以明显减轻服务器端的压力。
- 使用 session 一般将 session-id 放在 cookie 中，需要解决跨域问题。

JWT 解决的最大问题时跨域，如果业务不涉及跨域完全没有必要使用 jwt, session 已经足够；若有跨域需要，则改造 session 实现跨域访问，要比改造 jwt 实现单用户登录复杂的多。

jwt 解决最大的问题不是跨域，而是前后端分离后，纯接口方面的用户认证问题。

1. session+jwt 结合
2. session 只存：uid:lastTime, 别什么数据都往session 丢。用lastTime确定是否过期
3. 密码修改、A/B登录，lastTime都要更新。
4. 类似腾讯这种，同时支持pc+mobile，就用：uid:{pc:lastTime, mobile:lastTime}

jwt 的一大问题时服务器端无法控制, 场景：用户在一个设备登录后，之前登录的设备token 失效。要做到这点，就必须让服务器维护一个记录账号是否已经签发 token 的清单，这样又回到 session 的老路了。防止重复登录，都是通过其他策略，如互斥ip控制，互斥设备控制等， token 更多的是认证，而不是防重复。

好处：不用在后端存储用户状态

jwt的最大有点应该是应用于分布式系统和减轻服务器存储状态信息的开销
不过缺点也很明显：
1. 服务器无法控制token失效
2. token到期失效后的自动刷新
解决方案：
一 token的到期后失效的问题可以使后台服务器针对每次请求都刷新过期时间（即使有是服务器集群也没关系，拿到刷新后的token在前端直接覆盖就行）。
二 服务器控制token失效这个问题必须在后台记录已经颁发的token，但一般这种操作是允许有延迟的并且频率不是太高，所以并发的问题不是太严重。



参考：
- [五分钟带你了解啥是JWT](https://zhuanlan.zhihu.com/p/86937325)
- [什么是JWT](https://www.jianshu.com/p/576dbf44b2ae)
- [JWT 入门教程](http://www.ruanyifeng.com/blog/2018/07/json_web_token-tutorial.html)