---
title: Linux基础常见问题
date: 2020-10-19
categories:
 - 工具类
tags:
 - Linux
---

## Linux ping www.baidu.com 报name or service not known

https://blog.csdn.net/weixin_38214171/article/details/85330179

主要是修改

```shell
vi /etc/resolv.conf
```

## Linux创建软连接

```shell
ln -s /bin/less /usr/local/bin/less
```

## 查看依赖关系

```shell
ldd -l node
```

添加linux服务后，service命令无法启动

```
// 首先 /etc/init.d/下面有了对应的文件
// 然后执行service xx status/start 报错这个
Unit tas_tas286solution.service could not be found.
// 解决方案：
// 安装服务后需要重启下配置表：
systemctl daemon-reload
```

## 如果ping 不通，修改dns

```
vi /etc/resolv.conf

nameserver 172.16.1.7
nameserver 172.20.1.241
nameserver 8.8.8.8

/etc/init.d/networking restart
```

## 看系统架构：

```
dpkg --print-architecture
```

## ssh root登录

```
#sudo vim /etc/ssh/sshd_config

找到并用#注释掉这行：PermitRootLogin prohibit-password

新建一行 添加：PermitRootLogin yes

重启服务

#sudo service ssh restart

sudo passwd root   #设置密码

然后ssh root@192.168.2.21就可以登录了
```

