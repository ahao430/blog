1. 用claude code在服务端安装配置了frps，生成token配置给客户端。配置域名解析和nginx。
2. 在客户端用claude code安装配置了frpc，填写服务端配置的token，端口号
3. 刚刚这样只有一个固定的域名，同一时间只能用一个。考虑可以多个域名同时启用，并且客户端可以快速选择配置，在服务端配置改成http，客户端使用subdomains。然后让claude code写一个客户端命令脚本。

