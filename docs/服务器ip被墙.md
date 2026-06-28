今天用Royal TSX连接racknerd发现连不上，在终端ping服务器ip也超时。

去[https://ping.pe/](https://ping.pe/)检查了一下，服务器ip在国内被墙了。

![](https://cdn.nlark.com/yuque/0/2026/png/373268/1781343212526-9a83a362-c9c4-4cb9-8c00-79163e46eb2f.png)



racknerd是可以提工单更换ip。新购买72小时内可以免费换一次。后续要3美元一次。

这里我的网站服务是通过cloudflare小黄云保护，可以正常访问。只是ssh登录不上。



开启系统代理，Royal TSX还是连接不上，但是开启TUN模式就可以了。



ssh解决办法，申请ipv6地址：

racknerd可以提工单申请ipv6地址，然后重新设置下网络就可以了。

ipv6申请后，梯子可能还是会被墙，但是ssh使用ipv6地址就可以正常访问了。



梯子解决办法，CF CDN + WS+TLS

让claude code处理，添加一个子域名开启小黄云用来转发。

