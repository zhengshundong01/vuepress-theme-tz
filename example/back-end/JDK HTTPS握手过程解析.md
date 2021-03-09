---
title: JDK-HTTPS握手过程解析
date: 2020-09-30
categories:
 - 后端
tags:
 - Java
 - 国密SSL
---

客户端采用浏览器，服务端采用JETTY

## 握手

### Receive => Client Hello

首先我们跳过Socket，直接来到ServerHandShaker.processMessage()，这个方法主要处理了握手过程的不同步骤的处理。

首先我们收到的是Client Hello

```java
@Override
void processMessage(byte type, int message_len)
    throws IOException {

    // check the handshake state
    handshakeState.check(type);

    switch (type) {
        case HandshakeMessage.ht_client_hello:
            ClientHello ch = new ClientHello(input, message_len);
            handshakeState.update(ch, resumingSession);
            /*
                 * send it off for processing.
                 */
            this.clientHello(ch);
            break;
         case ......
        }
｝
```

在这里我们说下这type，type的由来是通过Handshaker.processLoop()，通过读取输入流input的前几个字节获得的。此时Client Hello的`type = 1`

在这里我们创建了一个`new ClientHello(input, message_len);`实例，它将会实例化一些参数

```java
ClientHello(HandshakeInStream s, int messageLength) throws IOException {
    protocolVersion = ProtocolVersion.valueOf(s.getInt8(), s.getInt8());
    clnt_random = new RandomCookie(s);
    sessionId = new SessionId(s.getBytes8());
    sessionId.checkLength(protocolVersion);
    cipherSuites = new CipherSuiteList(s);
    compression_methods = s.getBytes8();
    if (messageLength() != messageLength) {
        extensions = new HelloExtensions(s);
    }
}
```

这些参数包括：

- protocolVersion：客户端支持的通信协议版本
- clnt_random：客户端产生的随机数（本次调试是32位）
- sessionId：这里可能会有复用
- cipherSuites：当前客户端支持的加密套件，这里将会在服务器进行一个实例匹配，如果服务器有则会显示具体实例名称，没有显示Unknown

![jdk-https/image-20200731111221393](/jdk-https/image-20200731111221393.png)

- compression_methods：SSL压缩方法
- extensions：SSL扩展的参数（看参数里面好像有签名算法）

![jdk-https/image-20200731111344676](/jdk-https/image-20200731111344676.png)

实例化完成之后开始调用`handshakeState.update(ch, resumingSession);`更新当前的握手状态，之后调用`this.clientHello(ch);`对客户端的Client Hello进行Server Hello响应。这个方法的定义：

> ClientHello向服务器提供了一堆选项，服务器通过ServerHello对这些选项进行响应，其中列出了此会话将使用的选项。如果需要，它还会写入它的证书，在某些情况下还会写入ServerKeyExchange消息。它还可以编写一个CertificateRequest来引出客户端证书。所有这些消息都被ServerHelloDone消息终止。在大多数情况下，所有这些都可以在单个记录中发送。

在这个方法内，我们先对一些参数进行了校验，之后开始Server Hello响应：

- 先创建一个ServerHello实例：`ServerHello m1 = new ServerHello();`
- 选择SSL通信协议版本

```
// select a proper protocol version.
        ProtocolVersion selectedVersion =
               selectProtocolVersion(clientRequestedVersion);
```

最后会调用：ProtocolList.selectProtocolVersion，在这里我们将会对协议进行一个选择，我们传入客户端Client Hello所支持的protocolVersion，之后再protocols里选择一个，不大于他的版本，并且是不大于他的版本里最大的一个版本返回。

```java
ProtocolVersion selectProtocolVersion(ProtocolVersion protocolVersion) {
    ProtocolVersion selectedVersion = null;
    for (ProtocolVersion pv : protocols) {
        if (pv.v > protocolVersion.v) {
            break;  // Safe to break here as this.protocols is sorted
        }
        selectedVersion = pv;
    }

    return selectedVersion;
}
```

- 创建服务端随机数，需要注意的是这个的SSLContext是在服务器初始化的时候创建的

```java
clnt_random = mesg.clnt_random;
svr_random = new RandomCookie(sslContext.getSecureRandom());
m1.svr_random = svr_random;
```

- 验证是否Session复用，如果复用就恢复上一次会话，如果不是则创建新的，并选择它的密码套件和压缩选项。除非为此连接禁用了新会话创建，这里我们先看下创建新的

![jdk-https/image-20200802224722422](/jdk-https/image-20200802224722422.png)

![jdk-https/image-20200802224835771](/jdk-https/image-20200802224835771.png)

之后创建新的session：

```java
session = new SSLSessionImpl(protocolVersion, CipherSuite.C_NULL,
                        getLocalSupportedSignAlgs(),
                        sslContext.getSecureRandom(),
                        getHostAddressSE(), getPortSE(),
                        (requestedToUseEMS &&
                                (protocolVersion.v >= ProtocolVersion.TLS10.v)),
                        getEndpointIdentificationAlgorithmSE());
```

之后，我们开始选择加密套件：

```java
private void chooseCipherSuite(ClientHello mesg) throws IOException {
    CipherSuiteList prefered;
    CipherSuiteList proposed;
    if (preferLocalCipherSuites) {
        prefered = getActiveCipherSuites();
        proposed = mesg.getCipherSuites();
    } else {
        prefered = mesg.getCipherSuites();
        proposed = getActiveCipherSuites();
    }

    List<CipherSuite> legacySuites = new ArrayList<>();
    for (CipherSuite suite : prefered.collection()) {
        if (isNegotiable(proposed, suite) == false) {
            continue;
        }

        if (doClientAuth == SSLEngineImpl.clauth_required) {
            if ((suite.keyExchange == K_DH_ANON) ||
                (suite.keyExchange == K_ECDH_ANON)) {
                continue;
            }
        }

        if (!legacyAlgorithmConstraints.permits(null, suite.name, null)) {
            legacySuites.add(suite);
            continue;
        }

        if (trySetCipherSuite(suite) == false) {
            continue;
        }

        if (debug != null && Debug.isOn("handshake")) {
            System.out.println("Standard ciphersuite chosen: " + suite);
        }
        return;
    }

    for (CipherSuite suite : legacySuites) {
        if (trySetCipherSuite(suite)) {
            if (debug != null && Debug.isOn("handshake")) {
                System.out.println("Legacy ciphersuite chosen: " + suite);
            }
            return;
        }
    }

    fatalSE(Alerts.alert_handshake_failure, "no cipher suites in common");
}
```

首先里面进行了密码套件将由谁主导循环匹配，这里一般都是服务器本地的密码套件循环匹配客户端的

```java
if (preferLocalCipherSuites) {
    prefered = getActiveCipherSuites();
    proposed = mesg.getCipherSuites();
} else {
    prefered = mesg.getCipherSuites();
    proposed = getActiveCipherSuites();
}
```

之后，开始循环检查密码套件是否匹配，这里首先将会`isNegotiable`检查此次循环中的密码套件是否可用。

```java
if (isNegotiable(proposed, suite) == false) {
	continue;
}
/**
     * Check if the given ciphersuite is enabled and available within the
     * proposed cipher suite list.
     *
     * Does not check if the required server certificates are available.
     */
final static boolean isNegotiable(CipherSuiteList proposed, CipherSuite s) {
    return proposed.contains(s) && s.isNegotiable();
}

```

如果可用，将检查当前是否有客户端验证，并且该密码套件是否满足客户端校验的需求。

```java
if (doClientAuth == SSLEngineImpl.clauth_required) {
    if ((suite.keyExchange == K_DH_ANON) ||
        (suite.keyExchange == K_ECDH_ANON)) {
        continue;
    }
}
```

之后检查该密码套件是否符合安全性要求：

```java
if (!legacyAlgorithmConstraints.permits(null, suite.name, null)) {
    legacySuites.add(suite);
    continue;
}
```

最后，尝试设置该密码套件，在这里将会对密码套件进行详细的检查，这里我们最后再说这个：

```java
if (trySetCipherSuite(suite) == false) {
    continue;
}
```

- 之后以上工作我们都完成后，将属性设置进Server Hello

```java
m1.cipherSuite = cipherSuite;
m1.sessionId = session.getSessionId();
m1.compression_method = session.getCompression();
```

之后我们添加完额外的附加参数之后，Server Hello输出：`m1.write(output);`

- 接下来，我们来到第二部分，发送证书：

```java
CertificateMsg m2 = new CertificateMsg(certs);

/*
 * Set local certs in the SSLSession, output
 * debug info, and then actually write to the client.
 */
session.setLocalCertificates(certs);
if (debug != null && Debug.isOn("handshake")) {
	m2.print(System.out);
}
m2.write(output);
```

- 第三步：我们将开始发送ServerKeyExchange消息，在这里，我们对ServerKey进行判断后进行创建ServerKeyExchange实例：

```java
case K_ECDH_ANON:
try {
    m3 = new ECDH_ServerKeyExchange(ecdh,
                                    privateKey,
                                    clnt_random.random_bytes,
                                    svr_random.random_bytes,
                                    sslContext.getSecureRandom(),
                                    preferableSignatureAlgorithm,
                                    protocolVersion);
} catch (GeneralSecurityException e) {
    throwSSLException(
        "Error generating ECDH server key exchange", e);
    m3 = null; // make compiler happy
}
break;
```

最后通过`m3.write(output);`输出

第四步：这里如果有客户端认证，客户端将会发出证书，我们将对证书做校验

```java
if (doClientAuth != SSLEngineImpl.clauth_none &&
    keyExchange != K_DH_ANON && keyExchange != K_ECDH_ANON &&
    keyExchange != K_KRB5 && keyExchange != K_KRB5_EXPORT) {

    CertificateRequest m4;
    X509Certificate caCerts[];

    Collection<SignatureAndHashAlgorithm> localSignAlgs = null;
    if (protocolVersion.v >= ProtocolVersion.TLS12.v) {
        // We currently use all local upported signature and hash
        // algorithms. However, to minimize the computation cost
        // of requested hash algorithms, we may use a restricted
        // set of signature algorithms in the future.
        localSignAlgs = getLocalSupportedSignAlgs();
        if (localSignAlgs.isEmpty()) {
            throw new SSLHandshakeException(
                "No supported signature algorithm");
        }

        Set<String> localHashAlgs =
            SignatureAndHashAlgorithm.getHashAlgorithmNames(
            localSignAlgs);
        if (localHashAlgs.isEmpty()) {
            throw new SSLHandshakeException(
                "No supported signature algorithm");
        }
    }

    caCerts = sslContext.getX509TrustManager().getAcceptedIssuers();
    m4 = new CertificateRequest(caCerts, keyExchange,
                                localSignAlgs, protocolVersion);

    if (debug != null && Debug.isOn("handshake")) {
        m4.print(System.out);
    }
    m4.write(output);
    handshakeState.update(m4, resumingSession);
}
```

第五步：发送ServerHelloDone，这里的ServerHelloDone是什么都没有的

```java
ServerHelloDone m5 = new ServerHelloDone();

if (debug != null && Debug.isOn("handshake")) {
    m5.print(System.out);
}
m5.write(output);
```

最后，我们将输出流进行刷新关闭`output.flush();`，至此，服务端的ServerHello就完成了

### Receive => Client Key Exchange

我们还是来到ServerHandshaker.processMessage()，此时进来的type状态码是16，也就是客户端交换Key，此时我们会进入：

```java
private SecretKey clientKeyExchange(ECDHClientKeyExchange mesg)
            throws IOException {

    if (debug != null && Debug.isOn("handshake")) {
        mesg.print(System.out);
    }

    byte[] publicPoint = mesg.getEncodedPoint();

    // check algorithm constraints
    ecdh.checkConstraints(algorithmConstraints, publicPoint);

    return ecdh.getAgreedSecret(publicPoint);
}
```

在这里我们可以拿到客户端发送过来的preMasterSecret，这将会为后来计算sessionKey做准备，之后我们将会进入

```java
void calculateKeys(SecretKey preMasterSecret, ProtocolVersion version) {
    SecretKey master = calculateMasterSecret(preMasterSecret, version);
    session.setMasterSecret(master);
    calculateConnectionKeys(master);
}
```

这里的方法我们最后再看

### Receive => Client HandShaker Finished

还是ServerHandshaker.processMessage()，此时进来的type状态码是20，此时我们会先创建一个Fininshed实例：

```java
case HandshakeMessage.ht_finished:
Finished cfm =
    new Finished(protocolVersion, input, cipherSuite);
handshakeState.update(cfm, resumingSession);
this.clientFinished(cfm);
break;


Finished(ProtocolVersion protocolVersion, HandshakeInStream input,
            CipherSuite cipherSuite) throws IOException {
    this.protocolVersion = protocolVersion;
    this.cipherSuite = cipherSuite;
    int msgLen = (protocolVersion.v >= ProtocolVersion.TLS10.v) ? 12 : 36;
    verifyData = new byte[msgLen];
    input.read(verifyData);
}
```

## 方法解析

### 设置密码套件：trySetCipherSuite(suite)

首先我们看下这个方法的注释：

> ```
> /**
>  * Set the given CipherSuite, if possible. Return the result.
>  * The call succeeds if the CipherSuite is available and we have
>  * the necessary certificates to complete the handshake. We don't
>  * check if the CipherSuite is actually enabled.
>  *
>  * If successful, this method also generates ephemeral keys if
>  * required for this ciphersuite. This may take some time, so this
>  * method should only be called if you really want to use the
>  * CipherSuite.
>  *
>  * This method is called from chooseCipherSuite() in this class.
>  */
> ```

大概翻译下来就是：

- 当密码套件可用，并且我们拥有整个握手过程所需要的证书，将返回true。但是我们不会检查该密码套件是否真的启用。
- 如果成功，并且该密码套件需要将会生成临时的Key，这个生成过程将会花费一点时间，所以在调用这个方法的时候确保你真的想要才调用。
- 这个方法是从chooseCipherSuite()内调用的

然后我们看下源码：

```java
boolean trySetCipherSuite(CipherSuite suite) {
    /*
     * If we're resuming a session we know we can
     * support this key exchange algorithm and in fact
     * have already cached the result of it in
     * the session state.
     */
    // 如果我们session复用了，那么上一次的加密套件和算法已经被缓存了，这里不需要重新计算
    if (resumingSession) {
        return true;
    }
	// 判断当前套件是否可用，因为部分密码需要JCE Cipher支持
    if (suite.isNegotiable() == false) {
        return false;
    }

    // must not negotiate the obsoleted weak cipher suites.
    // 判断该密码套件在该协议内是否过时
    if (protocolVersion.v >= suite.obsoleted) {
        return false;
    }

    // must not negotiate unsupported cipher suites.
    // 判断该密码套件是否支持
    if (protocolVersion.v < suite.supported) {
        return false;
    }

    // 获取密钥交换，批量密码，MAC和PRF算法
    KeyExchange keyExchange = suite.keyExchange;

    // null out any existing references
    privateKey = null;
    certs = null;
    dh = null;
    tempPrivateKey = null;
    tempPublicKey = null;

    Collection<SignatureAndHashAlgorithm> supportedSignAlgs = null;
    // 如果当前的SSL协议大于等于TLS1.2，这里将设置下签名算法列表
    if (protocolVersion.v >= ProtocolVersion.TLS12.v) {
        if (peerSupportedSignAlgs != null) {
            supportedSignAlgs = peerSupportedSignAlgs;
        } else {
            SignatureAndHashAlgorithm algorithm = null;

            // we may optimize the performance
            switch (keyExchange) {
                    // If the negotiated key exchange algorithm is one of
                    // (RSA, DHE_RSA, DH_RSA, RSA_PSK, ECDH_RSA, ECDHE_RSA),
                    // behave as if client had sent the value {sha1,rsa}.
                case K_RSA:
                case K_DHE_RSA:
                case K_DH_RSA:
                    // case K_RSA_PSK:
                case K_ECDH_RSA:
                case K_ECDHE_RSA:
                    algorithm = SignatureAndHashAlgorithm.valueOf(
                        HashAlgorithm.SHA1.value,
                        SignatureAlgorithm.RSA.value, 0);
                    break;
                    // If the negotiated key exchange algorithm is one of
                    // (DHE_DSS, DH_DSS), behave as if the client had
                    // sent the value {sha1,dsa}.
                case K_DHE_DSS:
                case K_DH_DSS:
                    algorithm = SignatureAndHashAlgorithm.valueOf(
                        HashAlgorithm.SHA1.value,
                        SignatureAlgorithm.DSA.value, 0);
                    break;
                    // If the negotiated key exchange algorithm is one of
                    // (ECDH_ECDSA, ECDHE_ECDSA), behave as if the client
                    // had sent value {sha1,ecdsa}.
                case K_ECDH_ECDSA:
                case K_ECDHE_ECDSA:
                    algorithm = SignatureAndHashAlgorithm.valueOf(
                        HashAlgorithm.SHA1.value,
                        SignatureAlgorithm.ECDSA.value, 0);
                    break;
                default:
                    // no peer supported signature algorithms
            }

            if (algorithm == null) {
                supportedSignAlgs =
                    Collections.<SignatureAndHashAlgorithm>emptySet();
            } else {
                supportedSignAlgs =
                    new ArrayList<SignatureAndHashAlgorithm>(1);
                supportedSignAlgs.add(algorithm);

                supportedSignAlgs =
                    SignatureAndHashAlgorithm.getSupportedAlgorithms(
                    algorithmConstraints, supportedSignAlgs);

                // May be no default activated signature algorithm, but
                // let the following process make the final decision.
            }

            // Sets the peer supported signature algorithm to use in KM
            // temporarily.
            session.setPeerSupportedSignatureAlgorithms(supportedSignAlgs);
        }
    }

    // 校验密钥交换算法
    switch (keyExchange) {
        case K_RSA:
            // need RSA certs for authentication
            if (setupPrivateKeyAndChain("RSA") == false) {
                return false;
            }
            break;
        case K_RSA_EXPORT:
            // need RSA certs for authentication
            if (setupPrivateKeyAndChain("RSA") == false) {
                return false;
            }

            try {
                if (JsseJce.getRSAKeyLength(certs[0].getPublicKey()) > 512) {
                    if (!setupEphemeralRSAKeys(suite.exportable)) {
                        return false;
                    }
                }
            } catch (RuntimeException e) {
                // could not determine keylength, ignore key
                return false;
            }
            break;
        case K_DHE_RSA:
            // need RSA certs for authentication
            if (setupPrivateKeyAndChain("RSA") == false) {
                return false;
            }

            // get preferable peer signature algorithm for server key exchange
            if (protocolVersion.v >= ProtocolVersion.TLS12.v) {
                preferableSignatureAlgorithm =
                    SignatureAndHashAlgorithm.getPreferableAlgorithm(
                    supportedSignAlgs, "RSA", privateKey);
                if (preferableSignatureAlgorithm == null) {
                    if ((debug != null) && Debug.isOn("handshake")) {
                        System.out.println(
                            "No signature and hash algorithm for cipher " +
                            suite);
                    }
                    return false;
                }
            }

            setupEphemeralDHKeys(suite.exportable, privateKey);
            break;
        case K_ECDHE_RSA:
            // need RSA certs for authentication
            if (setupPrivateKeyAndChain("RSA") == false) {
                return false;
            }

            // get preferable peer signature algorithm for server key exchange
            if (protocolVersion.v >= ProtocolVersion.TLS12.v) {
                preferableSignatureAlgorithm =
                    SignatureAndHashAlgorithm.getPreferableAlgorithm(
                    supportedSignAlgs, "RSA", privateKey);
                if (preferableSignatureAlgorithm == null) {
                    if ((debug != null) && Debug.isOn("handshake")) {
                        System.out.println(
                            "No signature and hash algorithm for cipher " +
                            suite);
                    }
                    return false;
                }
            }

            if (setupEphemeralECDHKeys() == false) {
                return false;
            }
            break;
        case K_DHE_DSS:
            // get preferable peer signature algorithm for server key exchange
            if (protocolVersion.v >= ProtocolVersion.TLS12.v) {
                preferableSignatureAlgorithm =
                    SignatureAndHashAlgorithm.getPreferableAlgorithm(
                    supportedSignAlgs, "DSA");
                if (preferableSignatureAlgorithm == null) {
                    if ((debug != null) && Debug.isOn("handshake")) {
                        System.out.println(
                            "No signature and hash algorithm for cipher " +
                            suite);
                    }
                    return false;
                }
            }

            // need DSS certs for authentication
            if (setupPrivateKeyAndChain("DSA") == false) {
                return false;
            }

            setupEphemeralDHKeys(suite.exportable, privateKey);
            break;
        case K_ECDHE_ECDSA:
            // get preferable peer signature algorithm for server key exchange
            if (protocolVersion.v >= ProtocolVersion.TLS12.v) {
                // 获取当前最佳的签名算法，解析见下面
                preferableSignatureAlgorithm =
                    SignatureAndHashAlgorithm.getPreferableAlgorithm(
                    supportedSignAlgs, "ECDSA");
                if (preferableSignatureAlgorithm == null) {
                    if ((debug != null) && Debug.isOn("handshake")) {
                        System.out.println(
                            "No signature and hash algorithm for cipher " +
                            suite);
                    }
                    return false;
                }
            }

            // need EC cert
            // 验证是否需要证书
            if (setupPrivateKeyAndChain("EC") == false) {
                return false;
            }
            if (setupEphemeralECDHKeys() == false) {
                return false;
            }
            break;
        case K_ECDH_RSA:
            // need EC cert
            if (setupPrivateKeyAndChain("EC") == false) {
                return false;
            }
            setupStaticECDHKeys();
            break;
        case K_ECDH_ECDSA:
            // need EC cert
            if (setupPrivateKeyAndChain("EC") == false) {
                return false;
            }
            setupStaticECDHKeys();
            break;
        case K_KRB5:
        case K_KRB5_EXPORT:
            // need Kerberos Key
            if (!setupKerberosKeys()) {
                return false;
            }
            break;
        case K_DH_ANON:
            // no certs needed for anonymous
            setupEphemeralDHKeys(suite.exportable, null);
            break;
        case K_ECDH_ANON:
            // no certs needed for anonymous
            if (setupEphemeralECDHKeys() == false) {
                return false;
            }
            break;
        default:
            // internal error, unknown key exchange
            throw new RuntimeException(
                "Unrecognized cipherSuite: " + suite);
    }
    // 设置加密套件
    setCipherSuite(suite);

    // set the peer implicit supported signature algorithms
    if (protocolVersion.v >= ProtocolVersion.TLS12.v) {
        if (peerSupportedSignAlgs == null) {
            setPeerSupportedSignAlgs(supportedSignAlgs);
            // we had alreay update the session
        }
    }
    return true;
}

static SignatureAndHashAlgorithm getPreferableAlgorithm(
    Collection<SignatureAndHashAlgorithm> algorithms, String expected) {

    return SignatureAndHashAlgorithm.getPreferableAlgorithm(
        algorithms, expected, null);
}

static SignatureAndHashAlgorithm getPreferableAlgorithm(
    Collection<SignatureAndHashAlgorithm> algorithms,
    String expected, PrivateKey signingKey) {
	// 获取当前签名算法最大的加密长度，这里为null，将会获取Integer的最大值
    int maxDigestLength = getMaxDigestLength(signingKey);
    for (SignatureAndHashAlgorithm algorithm : algorithms) {
        int signValue = algorithm.id & 0xFF;
        if ((expected == null) ||
            (expected.equalsIgnoreCase("rsa") &&
             signValue == SignatureAlgorithm.RSA.value) ||
            (expected.equalsIgnoreCase("dsa") &&
             signValue == SignatureAlgorithm.DSA.value) ||
            (expected.equalsIgnoreCase("ecdsa") &&
             signValue == SignatureAlgorithm.ECDSA.value) ||
            (expected.equalsIgnoreCase("ec") &&
             signValue == SignatureAlgorithm.ECDSA.value)) {
			// 算法的优先级必须小于SUPPORTED_ALG_PRIORITY_MAX_NUM，并且长度小于最大值
            if (algorithm.priority <= SUPPORTED_ALG_PRIORITY_MAX_NUM &&
                algorithm.hash.length <= maxDigestLength) {

                return algorithm;
            }
        }
    }

    return null;
}
```



### 计算Master Secret：calculateKeys(SecretKey preMasterSecret, ProtocolVersion version)

> ```
> /*
>  * Single access point to key calculation logic.  Given the
>  * pre-master secret and the nonces from client and server,
>  * produce all the keying material to be used.
>  */
> ```

看注释，这个方法主要作用是：

- 根据客户端和服务端的随机数和pre-master计算所以连接需要的key

```java
void calculateKeys(SecretKey preMasterSecret, ProtocolVersion version) {
    SecretKey master = calculateMasterSecret(preMasterSecret, version);
    session.setMasterSecret(master);
    calculateConnectionKeys(master);
}
```

首先这里计算了masterSecret，然后计算了通信过程中所需要的所有key，我们先看

#### calculateMasterSecret

> ```
> /*
>  * Calculate the master secret from its various components.  This is
>  * used for key exchange by all cipher suites.
>  *
>  * The master secret is the catenation of three MD5 hashes, each
>  * consisting of the pre-master secret and a SHA1 hash.  Those three
>  * SHA1 hashes are of (different) constant strings, the pre-master
>  * secret, and the nonces provided by the client and the server.
>  */
> ```

可以发现这个方法做了：

- 这个方法适用于所有加密套件

- 这个方法计算了Master secret

- 这个Master secret是由三个不同的MD5 hash组成，每个都是由pre-master和一个SHA1 hash组成，这三个SHA1 hash用了不同的常量字符串、pre-master secret和客户端服务端的随机数组成

  > Master secret = MD5(pre-master + SHA1("const1" + pre secret + client random + server random)) + 							MD5(pre-master + SHA1("const2" + pre secret + client random + server random))  + 							MD5(pre-master + SHA1("const3" + pre secret + client random + server random))  

```java
private SecretKey calculateMasterSecret(SecretKey preMasterSecret,
                                        ProtocolVersion requestedVersion) {

    if (debug != null && Debug.isOn("keygen")) {
        HexDumpEncoder      dump = new HexDumpEncoder();

        System.out.println("SESSION KEYGEN:");

        System.out.println("PreMaster Secret:");
        printHex(dump, preMasterSecret.getEncoded());

        // Nonces are dumped with connection keygen, no
        // benefit to doing it twice
    }

    // What algs/params do we need to use?
    String masterAlg;
    PRF prf;
	// 如果是tls1.2,PRF随机数将会定义于密码套件内
    if (protocolVersion.v >= ProtocolVersion.TLS12.v) {
        masterAlg = "SunTls12MasterSecret";
        prf = cipherSuite.prfAlg;
    } else {
        masterAlg = "SunTlsMasterSecret";
        prf = P_NONE;
    }

    String prfHashAlg = prf.getPRFHashAlg();
    int prfHashLength = prf.getPRFHashLength();
    int prfBlockSize = prf.getPRFBlockSize();

    TlsMasterSecretParameterSpec spec;
    if (session.getUseExtendedMasterSecret()) {
        // reset to use the extended master secret algorithm
        masterAlg = "SunTlsExtendedMasterSecret";

        byte[] sessionHash = null;
        if (protocolVersion.v >= ProtocolVersion.TLS12.v) {
            sessionHash = handshakeHash.getFinishedHash();
        } else {
            // TLS 1.0/1.1
            sessionHash = new byte[36];
            try {
                handshakeHash.getMD5Clone().digest(sessionHash, 0, 16);
                handshakeHash.getSHAClone().digest(sessionHash, 16, 20);
            } catch (DigestException de) {
                throw new ProviderException(de);
            }
        }

        spec = new TlsMasterSecretParameterSpec(
            preMasterSecret, protocolVersion.major, protocolVersion.minor,
            sessionHash, prfHashAlg, prfHashLength, prfBlockSize);
    } else {
        spec = new TlsMasterSecretParameterSpec(
            preMasterSecret, protocolVersion.major, protocolVersion.minor,
            clnt_random.random_bytes, svr_random.random_bytes,
            prfHashAlg, prfHashLength, prfBlockSize);
    }

    try {
        KeyGenerator kg = JsseJce.getKeyGenerator(masterAlg);
        kg.init(spec);
        // 最终将会在这里调用生成MasterSecret
        return kg.generateKey();
    } catch (InvalidAlgorithmParameterException |
             NoSuchAlgorithmException iae) {
        // unlikely to happen, otherwise, must be a provider exception
        //
        // For RSA premaster secrets, do not signal a protocol error
        // due to the Bleichenbacher attack. See comments further down.
        if (debug != null && Debug.isOn("handshake")) {
            System.out.println("RSA master secret generation error:");
            iae.printStackTrace(System.out);
        }
        throw new ProviderException(iae);

    }
}
```

我们的最后将会在这里调用`kg.generateKey();`生成Master Secret

在这里我们将看下他的实现类：`TlsMasterSecretGenerator.engineGenerateKey()`，在这个方法内，它主要分成了两类：

- 小于TLS1.0的版本采用直接的MD5、SHA加密，加密方式和上面公式一样
- 大于等于TLS1.0的版本，采用指定的加密算法进行计算（加密算法由先前的类进行判断）

```java
protected SecretKey engineGenerateKey() {
    if (spec == null) {
        throw new IllegalStateException(
            "TlsMasterSecretGenerator must be initialized");
    }
    SecretKey premasterKey = spec.getPremasterSecret();
    byte[] premaster = premasterKey.getEncoded();

    int premasterMajor, premasterMinor;
    if (premasterKey.getAlgorithm().equals("TlsRsaPremasterSecret")) {
        // RSA
        premasterMajor = premaster[0] & 0xff;
        premasterMinor = premaster[1] & 0xff;
    } else {
        // DH, KRB5, others
        premasterMajor = -1;
        premasterMinor = -1;
    }

    try {
        byte[] master;
        // 当前协议如果大于等于TLS1.0
        if (protocolVersion >= 0x0301) {
            byte[] label;
            byte[] seed;
            byte[] extendedMasterSecretSessionHash =
                spec.getExtendedMasterSecretSessionHash();
            if (extendedMasterSecretSessionHash.length != 0) {
                label = LABEL_EXTENDED_MASTER_SECRET;
                seed = extendedMasterSecretSessionHash;
            } else {
                byte[] clientRandom = spec.getClientRandom();
                byte[] serverRandom = spec.getServerRandom();
                label = LABEL_MASTER_SECRET;
                seed = concat(clientRandom, serverRandom);
            }
            master = ((protocolVersion >= 0x0303) ?
                      doTLS12PRF(premaster, label, seed, 48,
                                 spec.getPRFHashAlg(), spec.getPRFHashLength(),
                                 spec.getPRFBlockSize()) :
                      doTLS10PRF(premaster, label, seed, 48));
        } else {
            master = new byte[48];
            MessageDigest md5 = MessageDigest.getInstance("MD5");
            MessageDigest sha = MessageDigest.getInstance("SHA");

            byte[] clientRandom = spec.getClientRandom();
            byte[] serverRandom = spec.getServerRandom();
            byte[] tmp = new byte[20];
            for (int i = 0; i < 3; i++) {
                sha.update(SSL3_CONST[i]);
                sha.update(premaster);
                sha.update(clientRandom);
                sha.update(serverRandom);
                sha.digest(tmp, 0, 20);

                md5.update(premaster);
                md5.update(tmp);
                md5.digest(master, i << 4, 16);
            }

        }

        return new TlsMasterSecretKey(master, premasterMajor,
                                      premasterMinor);
    } catch (NoSuchAlgorithmException e) {
        throw new ProviderException(e);
    } catch (DigestException e) {
        throw new ProviderException(e);
    }
}
```

这里我们主要看下大于TLS1.0的版本如何加密

```java
byte[] label; // 创建常量的字符数组
byte[] seed; // 创建Client RandomR和Server Random的固定字符数组
byte[] extendedMasterSecretSessionHash =
    spec.getExtendedMasterSecretSessionHash();
if (extendedMasterSecretSessionHash.length != 0) {
    label = LABEL_EXTENDED_MASTER_SECRET;
    seed = extendedMasterSecretSessionHash;
} else {
    byte[] clientRandom = spec.getClientRandom();
    byte[] serverRandom = spec.getServerRandom();
    label = LABEL_MASTER_SECRET;
    seed = concat(clientRandom, serverRandom);
}
master = ((protocolVersion >= 0x0303) ?
          doTLS12PRF(premaster, label, seed, 48,
                     spec.getPRFHashAlg(), spec.getPRFHashLength(),
                     spec.getPRFBlockSize()) :
          doTLS10PRF(premaster, label, seed, 48));
```

`doTLS12PRF`这个方法里有点**看不懂**

#### calculateConnectionKeys

然后我们来看下如何计算出加密过程所需要的3对key，首先我们可以看见，这个方法内做了这几件事：

- 准备需要的参数：数据加密算法，PRF算法，初始化向量，密钥长度等，然后实例化参数对象`TlsKeyMaterialParameterSpec`

```java
TlsKeyMaterialParameterSpec spec = new TlsKeyMaterialParameterSpec(
            masterKey, protocolVersion.major, protocolVersion.minor,
            clnt_random.random_bytes, svr_random.random_bytes,
            cipher.algorithm, cipher.keySize, expandedKeySize,
            ivSize, hashSize,
            prfHashAlg, prfHashLength, prfBlockSize);
```

- 生成我们所需要的长度的密码串

```java
KeyGenerator kg = JsseJce.getKeyGenerator(keyMaterialAlg);
kg.init(spec);
TlsKeyMaterialSpec keySpec = (TlsKeyMaterialSpec)kg.generateKey();
```

- 获取3对加密所需参数：服/客数据加密key，服/客数据加密初始化向量，服/客MACkey

```java
// Return null if cipher keys are not supposed to be generated.
clntWriteKey = keySpec.getClientCipherKey();
svrWriteKey = keySpec.getServerCipherKey();

// Return null if IVs are not supposed to be generated.
clntWriteIV = keySpec.getClientIv();
svrWriteIV = keySpec.getServerIv();

// Return null if MAC keys are not supposed to be generated.
clntMacSecret = keySpec.getClientMacKey();
svrMacSecret = keySpec.getServerMacKey();
```



```java
void calculateConnectionKeys(SecretKey masterKey) {
    /*
         * For both the read and write sides of the protocol, we use the
         * master to generate MAC secrets and cipher keying material.  Block
         * ciphers need initialization vectors, which we also generate.
         *
         * First we figure out how much keying material is needed.
         */
    int hashSize = cipherSuite.macAlg.size;
    boolean is_exportable = cipherSuite.exportable;
    BulkCipher cipher = cipherSuite.cipher;
    int expandedKeySize = is_exportable ? cipher.expandedKeySize : 0;

    // Which algs/params do we need to use?
    String keyMaterialAlg;
    PRF prf;

    if (protocolVersion.v >= ProtocolVersion.TLS12.v) {
        keyMaterialAlg = "SunTls12KeyMaterial";
        prf = cipherSuite.prfAlg;
    } else {
        keyMaterialAlg = "SunTlsKeyMaterial";
        prf = P_NONE;
    }

    String prfHashAlg = prf.getPRFHashAlg();
    int prfHashLength = prf.getPRFHashLength();
    int prfBlockSize = prf.getPRFBlockSize();

    // TLS v1.1 or later uses an explicit IV in CBC cipher suites to
    // protect against the CBC attacks.  AEAD/GCM cipher suites in TLS
    // v1.2 or later use a fixed IV as the implicit part of the partially
    // implicit nonce technique described in RFC 5116.
    int ivSize = cipher.ivSize;
    if (cipher.cipherType == AEAD_CIPHER) {
        ivSize = cipher.fixedIvSize;
    } else if (protocolVersion.v >= ProtocolVersion.TLS11.v &&
               cipher.cipherType == BLOCK_CIPHER) {
        ivSize = 0;
    }

    TlsKeyMaterialParameterSpec spec = new TlsKeyMaterialParameterSpec(
        masterKey, protocolVersion.major, protocolVersion.minor,
        clnt_random.random_bytes, svr_random.random_bytes,
        cipher.algorithm, cipher.keySize, expandedKeySize,
        ivSize, hashSize,
        prfHashAlg, prfHashLength, prfBlockSize);

    try {
        KeyGenerator kg = JsseJce.getKeyGenerator(keyMaterialAlg);
        kg.init(spec);
        TlsKeyMaterialSpec keySpec = (TlsKeyMaterialSpec)kg.generateKey();

        // Return null if cipher keys are not supposed to be generated.
        clntWriteKey = keySpec.getClientCipherKey();
        svrWriteKey = keySpec.getServerCipherKey();

        // Return null if IVs are not supposed to be generated.
        clntWriteIV = keySpec.getClientIv();
        svrWriteIV = keySpec.getServerIv();

        // Return null if MAC keys are not supposed to be generated.
        clntMacSecret = keySpec.getClientMacKey();
        svrMacSecret = keySpec.getServerMacKey();
    } catch (GeneralSecurityException e) {
        throw new ProviderException(e);
    }

    //
    // Dump the connection keys as they're generated.
    //
    if (debug != null && Debug.isOn("keygen")) {
        synchronized (System.out) {
            HexDumpEncoder  dump = new HexDumpEncoder();

            System.out.println("CONNECTION KEYGEN:");

            // Inputs:
            System.out.println("Client Nonce:");
            printHex(dump, clnt_random.random_bytes);
            System.out.println("Server Nonce:");
            printHex(dump, svr_random.random_bytes);
            System.out.println("Master Secret:");
            printHex(dump, masterKey.getEncoded());

            // Outputs:
            if (clntMacSecret != null) {
                System.out.println("Client MAC write Secret:");
                printHex(dump, clntMacSecret.getEncoded());
                System.out.println("Server MAC write Secret:");
                printHex(dump, svrMacSecret.getEncoded());
            } else {
                System.out.println("... no MAC keys used for this cipher");
            }

            if (clntWriteKey != null) {
                System.out.println("Client write key:");
                printHex(dump, clntWriteKey.getEncoded());
                System.out.println("Server write key:");
                printHex(dump, svrWriteKey.getEncoded());
            } else {
                System.out.println("... no encryption keys used");
            }

            if (clntWriteIV != null) {
                System.out.println("Client write IV:");
                printHex(dump, clntWriteIV.getIV());
                System.out.println("Server write IV:");
                printHex(dump, svrWriteIV.getIV());
            } else {
                if (protocolVersion.v >= ProtocolVersion.TLS11.v) {
                    System.out.println(
                        "... no IV derived for this protocol");
                } else {
                    System.out.println("... no IV used for this cipher");
                }
            }
            System.out.flush();
        }
    }
}
```

这里我们着重查看如何生成的密码串`(TlsKeyMaterialSpec)kg.generateKey();`

这个方法会调用：`TlsKeyMaterialGenerator.engineGenerateKey() -> engineGenerateKey0()`，在这个方法内主要做了这几件事：

- 定义和准备一些需要的参数，包括：客/服随机数，masterSectet、mac/key/...长度、其他

```java
byte[] masterSecret = spec.getMasterSecret().getEncoded();

byte[] clientRandom = spec.getClientRandom();
byte[] serverRandom = spec.getServerRandom();

SecretKey clientMacKey = null;
SecretKey serverMacKey = null;
SecretKey clientCipherKey = null;
SecretKey serverCipherKey = null;
IvParameterSpec clientIv = null;
IvParameterSpec serverIv = null;

int macLength = spec.getMacKeyLength();
int expandedKeyLength = spec.getExpandedCipherKeyLength();
boolean isExportable = (expandedKeyLength != 0);
int keyLength = spec.getCipherKeyLength();
int ivLength = spec.getIvLength();

int keyBlockLen = macLength + keyLength
    + (isExportable ? 0 : ivLength);
keyBlockLen <<= 1;
byte[] keyBlock = new byte[keyBlockLen];

// These may be used again later for exportable suite calculations.
MessageDigest md5 = null;
MessageDigest sha = null;
```

- 根据不同的SSL协议采用不同的加密算法，这里会采用和刚才生成MasterSecret同样的方法进行生成

```java
if (protocolVersion >= 0x0303) {
    // TLS 1.2
    byte[] seed = concat(serverRandom, clientRandom);
    keyBlock = doTLS12PRF(masterSecret, LABEL_KEY_EXPANSION, seed,
                          keyBlockLen, spec.getPRFHashAlg(),
                          spec.getPRFHashLength(), spec.getPRFBlockSize());
} else if (protocolVersion >= 0x0301) {
    // TLS 1.0/1.1
    md5 = MessageDigest.getInstance("MD5");
    sha = MessageDigest.getInstance("SHA1");
    byte[] seed = concat(serverRandom, clientRandom);
    keyBlock = doTLS10PRF(masterSecret, LABEL_KEY_EXPANSION, seed,
                          keyBlockLen, md5, sha);
} else {
    // SSL
    md5 = MessageDigest.getInstance("MD5");
    sha = MessageDigest.getInstance("SHA1");
    keyBlock = new byte[keyBlockLen];

    byte[] tmp = new byte[20];
    for (int i = 0, remaining = keyBlockLen;
         remaining > 0;
         i++, remaining -= 16) {

        sha.update(SSL3_CONST[i]);
        sha.update(masterSecret);
        sha.update(serverRandom);
        sha.update(clientRandom);
        sha.digest(tmp, 0, 20);

        md5.update(masterSecret);
        md5.update(tmp);

        if (remaining >= 16) {
            md5.digest(keyBlock, i << 4, 16);
        } else {
            md5.digest(tmp, 0, 16);
            System.arraycopy(tmp, 0, keyBlock, i << 4, remaining);
        }
    }
}
```

- 然后计算对应的key值

```java
int ofs = 0;
if (macLength != 0) {
    byte[] tmp = new byte[macLength];

    // mac keys
    System.arraycopy(keyBlock, ofs, tmp, 0, macLength);
    ofs += macLength;
    clientMacKey = new SecretKeySpec(tmp, "Mac");

    System.arraycopy(keyBlock, ofs, tmp, 0, macLength);
    ofs += macLength;
    serverMacKey = new SecretKeySpec(tmp, "Mac");
}

if (keyLength == 0) { // SSL_RSA_WITH_NULL_* ciphersuites
    return new TlsKeyMaterialSpec(clientMacKey, serverMacKey);
}

String alg = spec.getCipherAlgorithm();

// cipher keys
byte[] clientKeyBytes = new byte[keyLength];
System.arraycopy(keyBlock, ofs, clientKeyBytes, 0, keyLength);
ofs += keyLength;

byte[] serverKeyBytes = new byte[keyLength];
System.arraycopy(keyBlock, ofs, serverKeyBytes, 0, keyLength);
ofs += keyLength;

if (isExportable == false) {
    // cipher keys
    clientCipherKey = new SecretKeySpec(clientKeyBytes, alg);
    serverCipherKey = new SecretKeySpec(serverKeyBytes, alg);

    // IV keys if needed.
    if (ivLength != 0) {
        byte[] tmp = new byte[ivLength];

        System.arraycopy(keyBlock, ofs, tmp, 0, ivLength);
        ofs += ivLength;
        clientIv = new IvParameterSpec(tmp);

        System.arraycopy(keyBlock, ofs, tmp, 0, ivLength);
        ofs += ivLength;
        serverIv = new IvParameterSpec(tmp);
    }
} else {
    // if exportable suites, calculate the alternate
    // cipher key expansion and IV generation
    if (protocolVersion >= 0x0302) {
        // TLS 1.1+
        throw new RuntimeException(
            "Internal Error:  TLS 1.1+ should not be negotiating" +
            "exportable ciphersuites");
    } else if (protocolVersion == 0x0301) {
        // TLS 1.0
        byte[] seed = concat(clientRandom, serverRandom);

        byte[] tmp = doTLS10PRF(clientKeyBytes,
                                LABEL_CLIENT_WRITE_KEY, seed, expandedKeyLength, md5, sha);
        clientCipherKey = new SecretKeySpec(tmp, alg);

        tmp = doTLS10PRF(serverKeyBytes, LABEL_SERVER_WRITE_KEY, seed,
                         expandedKeyLength, md5, sha);
        serverCipherKey = new SecretKeySpec(tmp, alg);

        if (ivLength != 0) {
            tmp = new byte[ivLength];
            byte[] block = doTLS10PRF(null, LABEL_IV_BLOCK, seed,
                                      ivLength << 1, md5, sha);
            System.arraycopy(block, 0, tmp, 0, ivLength);
            clientIv = new IvParameterSpec(tmp);
            System.arraycopy(block, ivLength, tmp, 0, ivLength);
            serverIv = new IvParameterSpec(tmp);
        }
    } else {
        // SSLv3
        byte[] tmp = new byte[expandedKeyLength];

        md5.update(clientKeyBytes);
        md5.update(clientRandom);
        md5.update(serverRandom);
        System.arraycopy(md5.digest(), 0, tmp, 0, expandedKeyLength);
        clientCipherKey = new SecretKeySpec(tmp, alg);

        md5.update(serverKeyBytes);
        md5.update(serverRandom);
        md5.update(clientRandom);
        System.arraycopy(md5.digest(), 0, tmp, 0, expandedKeyLength);
        serverCipherKey = new SecretKeySpec(tmp, alg);

        if (ivLength != 0) {
            tmp = new byte[ivLength];

            md5.update(clientRandom);
            md5.update(serverRandom);
            System.arraycopy(md5.digest(), 0, tmp, 0, ivLength);
            clientIv = new IvParameterSpec(tmp);

            md5.update(serverRandom);
            md5.update(clientRandom);
            System.arraycopy(md5.digest(), 0, tmp, 0, ivLength);
            serverIv = new IvParameterSpec(tmp);
        }
    }
}
```

- 最后封装成实体类就可以返回了

```java
return new TlsKeyMaterialSpec(clientMacKey, serverMacKey,
    clientCipherKey, clientIv, serverCipherKey, serverIv);
```

```java
private SecretKey engineGenerateKey0() throws GeneralSecurityException {
    byte[] masterSecret = spec.getMasterSecret().getEncoded();

    byte[] clientRandom = spec.getClientRandom();
    byte[] serverRandom = spec.getServerRandom();

    SecretKey clientMacKey = null;
    SecretKey serverMacKey = null;
    SecretKey clientCipherKey = null;
    SecretKey serverCipherKey = null;
    IvParameterSpec clientIv = null;
    IvParameterSpec serverIv = null;

    int macLength = spec.getMacKeyLength();
    int expandedKeyLength = spec.getExpandedCipherKeyLength();
    boolean isExportable = (expandedKeyLength != 0);
    int keyLength = spec.getCipherKeyLength();
    int ivLength = spec.getIvLength();

    int keyBlockLen = macLength + keyLength
        + (isExportable ? 0 : ivLength);
    keyBlockLen <<= 1;
    byte[] keyBlock = new byte[keyBlockLen];

    // These may be used again later for exportable suite calculations.
    MessageDigest md5 = null;
    MessageDigest sha = null;

    // generate key block
    if (protocolVersion >= 0x0303) {
        // TLS 1.2
        byte[] seed = concat(serverRandom, clientRandom);
        keyBlock = doTLS12PRF(masterSecret, LABEL_KEY_EXPANSION, seed,
                              keyBlockLen, spec.getPRFHashAlg(),
                              spec.getPRFHashLength(), spec.getPRFBlockSize());
    } else if (protocolVersion >= 0x0301) {
        // TLS 1.0/1.1
        md5 = MessageDigest.getInstance("MD5");
        sha = MessageDigest.getInstance("SHA1");
        byte[] seed = concat(serverRandom, clientRandom);
        keyBlock = doTLS10PRF(masterSecret, LABEL_KEY_EXPANSION, seed,
                              keyBlockLen, md5, sha);
    } else {
        // SSL
        md5 = MessageDigest.getInstance("MD5");
        sha = MessageDigest.getInstance("SHA1");
        keyBlock = new byte[keyBlockLen];

        byte[] tmp = new byte[20];
        for (int i = 0, remaining = keyBlockLen;
             remaining > 0;
             i++, remaining -= 16) {

            sha.update(SSL3_CONST[i]);
            sha.update(masterSecret);
            sha.update(serverRandom);
            sha.update(clientRandom);
            sha.digest(tmp, 0, 20);

            md5.update(masterSecret);
            md5.update(tmp);

            if (remaining >= 16) {
                md5.digest(keyBlock, i << 4, 16);
            } else {
                md5.digest(tmp, 0, 16);
                System.arraycopy(tmp, 0, keyBlock, i << 4, remaining);
            }
        }
    }

    // partition keyblock into individual secrets

    int ofs = 0;
    if (macLength != 0) {
        byte[] tmp = new byte[macLength];

        // mac keys
        System.arraycopy(keyBlock, ofs, tmp, 0, macLength);
        ofs += macLength;
        clientMacKey = new SecretKeySpec(tmp, "Mac");

        System.arraycopy(keyBlock, ofs, tmp, 0, macLength);
        ofs += macLength;
        serverMacKey = new SecretKeySpec(tmp, "Mac");
    }

    if (keyLength == 0) { // SSL_RSA_WITH_NULL_* ciphersuites
        return new TlsKeyMaterialSpec(clientMacKey, serverMacKey);
    }

    String alg = spec.getCipherAlgorithm();

    // cipher keys
    byte[] clientKeyBytes = new byte[keyLength];
    System.arraycopy(keyBlock, ofs, clientKeyBytes, 0, keyLength);
    ofs += keyLength;

    byte[] serverKeyBytes = new byte[keyLength];
    System.arraycopy(keyBlock, ofs, serverKeyBytes, 0, keyLength);
    ofs += keyLength;

    if (isExportable == false) {
        // cipher keys
        clientCipherKey = new SecretKeySpec(clientKeyBytes, alg);
        serverCipherKey = new SecretKeySpec(serverKeyBytes, alg);

        // IV keys if needed.
        if (ivLength != 0) {
            byte[] tmp = new byte[ivLength];

            System.arraycopy(keyBlock, ofs, tmp, 0, ivLength);
            ofs += ivLength;
            clientIv = new IvParameterSpec(tmp);

            System.arraycopy(keyBlock, ofs, tmp, 0, ivLength);
            ofs += ivLength;
            serverIv = new IvParameterSpec(tmp);
        }
    } else {
        // if exportable suites, calculate the alternate
        // cipher key expansion and IV generation
        if (protocolVersion >= 0x0302) {
            // TLS 1.1+
            throw new RuntimeException(
                "Internal Error:  TLS 1.1+ should not be negotiating" +
                "exportable ciphersuites");
        } else if (protocolVersion == 0x0301) {
            // TLS 1.0
            byte[] seed = concat(clientRandom, serverRandom);

            byte[] tmp = doTLS10PRF(clientKeyBytes,
                                    LABEL_CLIENT_WRITE_KEY, seed, expandedKeyLength, md5, sha);
            clientCipherKey = new SecretKeySpec(tmp, alg);

            tmp = doTLS10PRF(serverKeyBytes, LABEL_SERVER_WRITE_KEY, seed,
                             expandedKeyLength, md5, sha);
            serverCipherKey = new SecretKeySpec(tmp, alg);

            if (ivLength != 0) {
                tmp = new byte[ivLength];
                byte[] block = doTLS10PRF(null, LABEL_IV_BLOCK, seed,
                                          ivLength << 1, md5, sha);
                System.arraycopy(block, 0, tmp, 0, ivLength);
                clientIv = new IvParameterSpec(tmp);
                System.arraycopy(block, ivLength, tmp, 0, ivLength);
                serverIv = new IvParameterSpec(tmp);
            }
        } else {
            // SSLv3
            byte[] tmp = new byte[expandedKeyLength];

            md5.update(clientKeyBytes);
            md5.update(clientRandom);
            md5.update(serverRandom);
            System.arraycopy(md5.digest(), 0, tmp, 0, expandedKeyLength);
            clientCipherKey = new SecretKeySpec(tmp, alg);

            md5.update(serverKeyBytes);
            md5.update(serverRandom);
            md5.update(clientRandom);
            System.arraycopy(md5.digest(), 0, tmp, 0, expandedKeyLength);
            serverCipherKey = new SecretKeySpec(tmp, alg);

            if (ivLength != 0) {
                tmp = new byte[ivLength];

                md5.update(clientRandom);
                md5.update(serverRandom);
                System.arraycopy(md5.digest(), 0, tmp, 0, ivLength);
                clientIv = new IvParameterSpec(tmp);

                md5.update(serverRandom);
                md5.update(clientRandom);
                System.arraycopy(md5.digest(), 0, tmp, 0, ivLength);
                serverIv = new IvParameterSpec(tmp);
            }
        }
    }

    return new TlsKeyMaterialSpec(clientMacKey, serverMacKey,
                                  clientCipherKey, clientIv, serverCipherKey, serverIv);
}
```



## 常用类解析

### CipherSuite

**包位置：** sun.security.ssl.CipherSuite

#### 作用

密码套件实体类，他定义了在SSL/TLS过程中所使用的密码套件的实体类型，如果客户端与服务端的密码套件匹配成功那么将会产生定义的示例，否则将会获得一个Unknown

#### 组成

**static enum KeyExchange**

定义了秘钥交换算法，秘钥交换算法将用户客户端与服务端之间的秘钥交换过程，主要是用于交换preMasterSecret参数，用于Server Certificate发布的证书内包含公钥，Client Key Exchange用公钥加密PreMasterSecret返回给服务端，服务端再用私钥解密获取参数

```java
static enum KeyExchange {

    // key exchange algorithms
    K_NULL       ("NULL",       false,      false),
    K_RSA        ("RSA",        true,       false),
    K_RSA_EXPORT ("RSA_EXPORT", true,       false),
    K_DH_RSA     ("DH_RSA",     false,      false),
    K_DH_DSS     ("DH_DSS",     false,      false),
    K_DHE_DSS    ("DHE_DSS",    true,       false),
    K_DHE_RSA    ("DHE_RSA",    true,       false),
    K_DH_ANON    ("DH_anon",    true,       false),

    K_ECDH_ECDSA ("ECDH_ECDSA",  ALLOW_ECC, true),
    K_ECDH_RSA   ("ECDH_RSA",    ALLOW_ECC, true),
    K_ECDHE_ECDSA("ECDHE_ECDSA", ALLOW_ECC, true),
    K_ECDHE_RSA  ("ECDHE_RSA",   ALLOW_ECC, true),
    K_ECDH_ANON  ("ECDH_anon",   ALLOW_ECC, true),

    // Kerberos cipher suites
    K_KRB5       ("KRB5", true,             false),
    K_KRB5_EXPORT("KRB5_EXPORT", true,      false),

    // renegotiation protection request signaling cipher suite
    K_SCSV       ("SCSV",        true,      false);

    // name of the key exchange algorithm, e.g. DHE_DSS
    final String name;
    final boolean allowed;
    final boolean isEC;
    private final boolean alwaysAvailable;

    KeyExchange(String name, boolean allowed, boolean isEC) {
        this.name = name;
        this.allowed = allowed;
        this.isEC = isEC;
        this.alwaysAvailable = allowed &&
            (!name.startsWith("EC")) && (!name.startsWith("KRB"));
    }

    boolean isAvailable() {
        if (alwaysAvailable) {
            return true;
        }

        if (isEC) {
            return (allowed && JsseJce.isEcAvailable());
        } else if (name.startsWith("KRB")) {
            return (allowed && JsseJce.isKerberosAvailable());
        } else {
            return allowed;
        }
    }

    @Override
    public String toString() {
        return name;
    }
}
```

**static enum CipherType**

主要分为：流加密、块加密、关联数据认证加密

```java
static enum CipherType {
    STREAM_CIPHER,         // null or stream cipher
    BLOCK_CIPHER,          // block cipher in CBC mode
    AEAD_CIPHER            // AEAD cipher
}
```

**static class BulkCipher**

批量加密算法，用于密钥交换后的数据的加密解密

```java
final static class BulkCipher {

    // descriptive name including key size, e.g. AES/128
    final String description;

    // JCE cipher transformation string, e.g. AES/CBC/NoPadding
    final String transformation;

    // algorithm name, e.g. AES
    final String algorithm;

    // supported and compile time enabled. Also see isAvailable()
    final boolean allowed;

    // number of bytes of entropy in the key
    final int keySize;

    // length of the actual cipher key in bytes.
    // for non-exportable ciphers, this is the same as keySize
    final int expandedKeySize;

    // size of the IV
    final int ivSize;

    // size of fixed IV
    //
    // record_iv_length = ivSize - fixedIvSize
    final int fixedIvSize;

    // exportable under 512/40 bit rules
    final boolean exportable;

    // Is the cipher algorithm of Cipher Block Chaining (CBC) mode?
    final CipherType cipherType;

    // size of the authentication tag, only applicable to cipher suites in
    // Galois Counter Mode (GCM)
    //
    // As far as we know, all supported GCM cipher suites use 128-bits
    // authentication tags.
    final int tagSize = 16;

    // The secure random used to detect the cipher availability.
    private final static SecureRandom secureRandom;

    // runtime availability
    private final boolean isAvailable;

    static {
        try {
            secureRandom = JsseJce.getSecureRandom();
        } catch (KeyManagementException kme) {
            throw new RuntimeException(kme);
        }
    }

    BulkCipher(String transformation, CipherType cipherType, int keySize,
               int expandedKeySize, int ivSize,
               int fixedIvSize, boolean allowed) {

        this.transformation = transformation;
        String[] splits = transformation.split("/");
        this.algorithm = splits[0];
        this.cipherType = cipherType;
        this.description = this.algorithm + "/" + (keySize << 3);
        this.keySize = keySize;
        this.ivSize = ivSize;
        this.fixedIvSize = fixedIvSize;
        this.allowed = allowed;

        this.expandedKeySize = expandedKeySize;
        this.exportable = true;

        // availability of this bulk cipher
        //
        // Currently all supported ciphers except AES are always available
        // via the JSSE internal implementations. We also assume AES/128 of
        // CBC mode is always available since it is shipped with the SunJCE
        // provider.  However, AES/256 is unavailable when the default JCE
        // policy jurisdiction files are installed because of key length
        // restrictions.
        this.isAvailable =
            allowed ? isUnlimited(keySize, transformation) : false;
    }

    BulkCipher(String transformation, CipherType cipherType, int keySize,
               int ivSize, int fixedIvSize, boolean allowed) {
        this.transformation = transformation;
        String[] splits = transformation.split("/");
        this.algorithm = splits[0];
        this.cipherType = cipherType;
        this.description = this.algorithm + "/" + (keySize << 3);
        this.keySize = keySize;
        this.ivSize = ivSize;
        this.fixedIvSize = fixedIvSize;
        this.allowed = allowed;

        this.expandedKeySize = keySize;
        this.exportable = false;

        // availability of this bulk cipher
        //
        // Currently all supported ciphers except AES are always available
        // via the JSSE internal implementations. We also assume AES/128 of
        // CBC mode is always available since it is shipped with the SunJCE
        // provider.  However, AES/256 is unavailable when the default JCE
        // policy jurisdiction files are installed because of key length
        // restrictions.
        this.isAvailable =
            allowed ? isUnlimited(keySize, transformation) : false;
    }

    /**
         * Return an initialized CipherBox for this BulkCipher.
         * IV must be null for stream ciphers.
         *
         * @exception NoSuchAlgorithmException if anything goes wrong
         */
    CipherBox newCipher(ProtocolVersion version, SecretKey key,
                        IvParameterSpec iv, SecureRandom random,
                        boolean encrypt) throws NoSuchAlgorithmException {
        return CipherBox.newCipherBox(version, this,
                                      key, iv, random, encrypt);
    }

    /**
         * Test if this bulk cipher is available. For use by CipherSuite.
         */
    boolean isAvailable() {
        return this.isAvailable;
    }

    private static boolean isUnlimited(int keySize, String transformation) {
        int keySizeInBits = keySize * 8;
        if (keySizeInBits > 128) {    // need the JCE unlimited
            // strength jurisdiction policy
            try {
                if (Cipher.getMaxAllowedKeyLength(
                    transformation) < keySizeInBits) {

                    return false;
                }
            } catch (Exception e) {
                return false;
            }
        }

        return true;
    }

    @Override
    public String toString() {
        return description;
    }
}
```

**static class MacAlg**

MAC算法，用于在加密过程中验证报文的完整性

```java
final static class MacAlg {

    // descriptive name, e.g. MD5
    final String name;

    // size of the MAC value (and MAC key) in bytes
    final int size;

    // block size of the underlying hash algorithm
    final int hashBlockSize;

    // minimal padding size of the underlying hash algorithm
    final int minimalPaddingSize;

    MacAlg(String name, int size,
           int hashBlockSize, int minimalPaddingSize) {
        this.name = name;
        this.size = size;
        this.hashBlockSize = hashBlockSize;
        this.minimalPaddingSize = minimalPaddingSize;
    }

    /**
         * Return an initialized MAC for this MacAlg. ProtocolVersion
         * must either be SSL30 (SSLv3 custom MAC) or TLS10 (std. HMAC).
         *
         * @exception NoSuchAlgorithmException if anything goes wrong
         */
    MAC newMac(ProtocolVersion protocolVersion, SecretKey secret)
        throws NoSuchAlgorithmException, InvalidKeyException {
        return new MAC(this, protocolVersion, secret);
    }

    @Override
    public String toString() {
        return name;
    }
}
```

**static enum PRF**

伪随机数算法，这里需要注意的是：

- 在TLS1.1中，使用的是MD5/SHA1
- 在TLS1.2中，所有现有的/已知的密码套件都使用SHA256，但是新的密码套件(RFC 5288)可以定义特定的PRF散列算法

```java
static enum PRF {

    // PRF algorithms
    P_NONE(     "NONE",  0,   0),
    P_SHA256("SHA-256", 32,  64),
    P_SHA384("SHA-384", 48, 128),
    P_SHA512("SHA-512", 64, 128);  // not currently used.

    // PRF characteristics
    private final String prfHashAlg;
    private final int prfHashLength;
    private final int prfBlockSize;

    PRF(String prfHashAlg, int prfHashLength, int prfBlockSize) {
        this.prfHashAlg = prfHashAlg;
        this.prfHashLength = prfHashLength;
        this.prfBlockSize = prfBlockSize;
    }

    String getPRFHashAlg() {
        return prfHashAlg;
    }

    int getPRFHashLength() {
        return prfHashLength;
    }

    int getPRFBlockSize() {
        return prfBlockSize;
    }
}
```

### TlsMasterSecretGenerator

### TlsKeyMaterialGenerator

## 国密算法分类

### 非对称算法

#### SM2椭圆曲线密码算法

#### SM9椭圆曲线密码算法

### 对称算法

#### SM1分组密码算法[不公开]

#### SM4分组密码算法

#### SM7分组密码算法[不公开]

### 摘要算法

#### SM3消息摘要算法

#### 