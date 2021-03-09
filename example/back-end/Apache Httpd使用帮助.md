---
title: Apache Httpd使用帮助
date: 2021-01-21
categories:
 - 后端
tags:
 - Apache
---

## 安装

### Windows

windows的安装直接下载即可：

http://httpd.apache.org/docs/current/platform/windows.html

### Linux

- linux需要先下载源码包：

http://httpd.apache.org/download.cgi

- 下载APR和APR-util

http://apr.apache.org/download.cgi

![image-20210128161019308](/apache/image-20210128161019308.png)

下载后解压并将文件夹重命名为apr和apr-util，拷贝到httpd目录/srclib/下

- 安装gcc-c++

```shell
yum install -y gcc-c++
```

- 下载pcre包

https://ftp.pcre.org/pub/pcre/

下载的是pcre不是pcre2！！！之后解压进入目录

```shell
./configure --prefix=/usr/local/pcre --enable-utf8
make && make install

```

- 安装expat-devel

```shell
yum install -y expat-devel
```

- 编译httpd

进入apache-httpd目录

```shell
./configure --prefix=/usr/local/httpd/ --with-included-apr --with-included-apr --with-included-apr-util --with-pcre=/usr/local/pcre
make && make install
```

## 启动

```
apachectl start
// 或者
httpd -k start
```

- 测试配置文件：`httpd -t`
- 查看工作模式：`apachectl -V`

## 常用文件说明

`conf/httpd.conf`：模块在这里开启配置，http端口也是

`conf/extra/httpd-ssl.conf`：SSL模块在这里配置

`conf/extra/httpd-mpm.conf`：工作模式配置文件

## 工作模式

### Preform MPM

Prefork MPM实现了一个非线程的，预派生的web服务器。它再apache启动之初，就预先派生了一些子进程，然后等待连接；可以减少频繁创建和销毁进程的开销，每个子进程只有一个线程，再一定的时间内，只能处理一个请求。
优点：成熟稳定，可以兼容新老模块，也不需要担心线程的安全问题（预先派生些进程，进程之中只有一个线程，即使某个线程故障，不影响其他进程，进程与进程之间具有相对独立性，而线程一旦出问题往往是连锁反应）
缺点：每个进程都会占用一定的资源，消耗大量内存，不擅长处理高并发（高并发就是说可以使用多个进程或者多个线程处理不同的操作）。

```properties
<IfModule mpm_prefork_module>
 StartServers       8
 MinSpareServers    5
 MaxSpareServers   20
 ServerLimit      256
 MaxClients       256
 MaxRequestsPerChild  4000
</IfModule>
```



### Worker MPM

和prefork相比，worker使用了多进程和多线程的混合模式，worker模式也同样会预先派生一些子进程，然后每个子进程会创建一些线程，同时包括一个监听线程，每个请求过来会被分配到一个线程来服务。线程比起进程会更轻量，因为线程是通过共享父进程的内存空间，因此，内存的占用会减少一些，在高并发的场景下会比prefork有更多可用的线程，表现会更优秀一些；另外，如果一个线程出现了问题也会导致同一进程下的线程出现问题，如果是多个线程出现问题，也只是影响Apache的一部分，而不是全部。由于用到多进程多线程，需要考虑到线程的安全了，在使用keep-alive长连接的时候，某个线程会一直被占用，即使中间没有请求，需要等待到超时才会被释放（该问题在prefork模式下也存在）。

```properties
<IfModule mpm_worker_module>
 StartServers         4
 MaxClients         300
 MinSpareThreads     25
 MaxSpareThreads     75
 ThreadsPerChild     25
 MaxRequestsPerChild  0
</IfModule>
```



### Event MPM

这是Apache最新的工作模式，它和worker模式很像，不同的是在于它解决了keep-alive长连接的时候占用线程资源被浪费的问题，在event工作模式中，会有一些专门的线程用来管理这些keep-alive类型的线程，当有真实请求过来的时候，将请求传递给服务器的线程，执行完毕后，又允许它释放。这增强了在高并发场景下的请求处理。

```properties
<IfModule mpm_event_module>
  StartServers               8
  MinSpareThreads         16
  MaxSpareThreads         1024
  ThreadsPerChild           64
  ServerLimit                 32
  MaxRequestWorkers     2048
  MaxConnectionsPerChild   10000
</IfModule>
```

## 缓存配置

```properties
<IfModule !mod_cache_disk.c>
  LoadModule cache_module modules/mod_cache.so
  LoadModule cache_disk_module modules/mod_cache_disk.so
  # LoadModule mem_cache_module modules/mod_mem_cache.so
</IfModule>

<IfModule mod_cache.c>
  CacheDefaultExpire 3600
  CacheIgnoreHeaders Set-Cookie Server
  CacheIgnoreURLSessionIdentifiers jsessionid JSESSIONID

  <IfModule mod_cache_disk.c>
    CacheRoot "cache"
    CacheDirLevels 2
    CacheDirLength 1
    # max file size to cache(bytes): 4000kb
    CacheMaxFileSize 4096000
    # CacheEnable disk /
    CacheEnable disk /
  </IfModule>
</IfModule>
```

## 日志滚动

```properties
<IfModule log_config_module>
  BufferedLogs On

  # log format by taslb
  LogFormat "%{%m-%d_%H:%M:%S}t %a %{JSESSIONID}C WR=%{BALANCER_WORKER_ROUTE}e SR=%{BALANCER_SESSION_ROUTE}e %T %l %u %>s %r %b \"%{Referer}i\" %{Set-Cookie}o \"%{User-Agent}i\"" taslf

  #
  # The location and format of the access logfile (Common Logfile Format).
  # If you do not define any access logfiles within a <VirtualHost>
  # container, they will be logged here.  Contrariwise, if you *do*
  # define per-<VirtualHost> access logfiles, transactions will be
  # logged therein and *not* in this file.
  #
  # CustomLog "|bin/rotatelogs logs/access_%Y%m%d.log 86400 480" taslf env=StaticFileExt
  # CustomLog "|bin/rotatelogs logs/tlb_access_%Y%m%d.log 86400 480" taslf env=!StaticFileExt
</IfModule>
```

## 监控

### balancer-manager

http://httpd.apache.org/docs/2.4/mod/mod_proxy_balancer.html

正式环境请不要使用

```properties
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_balancer_module modules/mod_proxy_balancer.so
LoadModule proxy_http_module modules/mod_proxy_http.so

# balancer
<Location /balancer-manager>
  SetHandler balancer-manager
  Order Deny,Allow
  Deny from all
  Allow from localhost
  Allow from 127.0.0.1
  # Allow from 172.16.170.123/24
</Location>
ProxyPass /balancer-manager !
```

访问http://localhost/balancer-manager

### status

http://httpd.apache.org/docs/2.4/mod/mod_status.html

```properties
LoadModule proxy_module modules/mod_status.so

ExtendedStatus on
<Location /status>
  SetHandler server-status
  Order Deny,Allow
  Deny from all
  Allow from localhost
  Allow from 127.0.0.1
</Location>
ProxyPass /status !
```



## 参考文档

[模块文档]: http://httpd.apache.org/docs/2.4/mod

