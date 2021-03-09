---
title: Java安全体系
date: 2020-09-30
categories:
 - 后端
tags:
 - Java
 - 国密SSL
---

Java的安全体系分为：JCA、JCE、JSSE、JAAS

## JCA

 Java Cryptography Architecture（  Java加密体系结构）：JCA提供基本的加密框架， 如证书、 数字签名、消息摘要和密钥对产生器。

## JCE

Java Cryptography Extension（ Java加密扩展包）：JCE在JCA的基础上作了扩展， 提供了各种加密算法、 消息摘要算法和密钥管理等功能。JCE的实现主要在javax.crypto包（ 及其子包） 中

- JCE包因为其加密算法的安全限制，受美国出口限制，我没平时用的都是oracle提供的阉割版，比如默认不允许256位密钥的AES，我们通过[oracle官网](https://www.oracle.com/java/technologies/javase-jce8-downloads.html)，可以下载完整版，下载之后放到<java_home>/lib/security包中就可以了。

- JCE并不是只有oracle提供的，有多家厂商可以提供JCE的扩展包，在我们jdk的安装目录下的java.security文件中可以看到，支持的服务提供者Provider。

![img](https://upload-images.jianshu.io/upload_images/5943394-3968adda8b857e37.png?imageMogr2/auto-orient/strip|imageView2/2/w/451/format/webp)

## JSSE

Java Secure Sockets Extension（  Java安全套接字扩展包）：JSSE提供了基于SSL（ Secure Sockets Layer，安全套接字层） 的加密功能。 在网络的传输过程中， 信息会经过多个主机（很有可能其中一台就被窃听） ， 最终传送给接收者， 这是不安全的。这种确保网络通信安全的服务就是由JSSE来提供的。

## JAAS

 Java Authentication and Authentication Service（ Java鉴别与安全服务）：JAAS提供了在Java平台上进行用户身份鉴别的功能。