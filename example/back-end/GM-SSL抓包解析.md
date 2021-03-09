# GM-SSL 抓包解析

## 准备

### 工具环境

浏览器：360安全浏览器10、版本号：10.1.12885.0、内核版本63.0.3239.132

抓包工具：https://github.com/pengtianabc/wireshark-gm/releases

访问地址：https://ebssec.boc.cn/boc15/login.html

### 基础知识

HTTPS基础知识，参考：《HTTPS通信原理与基础知识》

Wireshark基础知识，如何抓包，指定IP，这里需要解释下为什么用github的Shark，是因为国密协议一般版本抓包无法解析

## 抓包解析

### Client Hello

![gmssl-https/image-20200813180022502](/gmssl-https/image-20200813180022502.png)

可以获得以下信息：

- Version：这里国密的版本号是`0x0101`，普通的`TLS1.2`是`0x0303`
- Cipher Suites：这里只有一个就是`ECC_SM4_SM3`
- Random：这里交换了Client Random

### Server Hello

![gmssl-https/image-20200813181258588](/gmssl-https/image-20200813181258588.png)

可以获得以下信息：

- Random：交换了Server Random
- Cipher Suite：选定了密码套件

### Server Certificate，Server Key Exchange，Server Hello Done

![gmssl-https/image-20200813182145638](/gmssl-https/image-20200813182145638.png)



#### Server Certificate：

![gmssl-https/image-20200813182608967](/gmssl-https/image-20200813182608967.png)

可以获得以下信息：

- 当前的服务器证书，其内部包含了公钥，证书拥有者信息

#### Server Key Exchange，

![gmssl-https/image-20200813182753307](/gmssl-https/image-20200813182753307.png)

本次没有其他信息

#### Server Hello Done

![gmssl-https/image-20200813182759941](/gmssl-https/image-20200813182759941.png)

### Client Key Exchange，Change Cipher Spec，Encrypted Handshake Message

![gmssl-https/image-20200814104035690](/gmssl-https/image-20200814104035690.png)

#### Client Key Exchange

![gmssl-https/image-20200814131652772](/gmssl-https/image-20200814131652772.png)

这里对于平常的TLS 1.2中，这里是有DH算法的参数，但是GM的这里被移除了

这里内部应该有pre-master-key，这里看不见

#### Change Cipher Spec

![gmssl-https/image-20200814131932722](/gmssl-https/image-20200814131932722.png)

#### Encrypted Handshake Message

![gmssl-https/image-20200814131942601](/gmssl-https/image-20200814131942601.png)

这里的消息对应的应该是Client Handshake Finished

### Change Cipher Spec，Encrypted Handshake Message

![gmssl-https/image-20200814132241519](/gmssl-https/image-20200814132241519.png)

#### Change Cipher Spec

![gmssl-https/image-20200814132320301](/gmssl-https/image-20200814132320301.png)

#### Encrypted Handshake Message

![gmssl-https/image-20200814132332231](/gmssl-https/image-20200814132332231.png)

这里对应的应该是Server Handshake Fininshed