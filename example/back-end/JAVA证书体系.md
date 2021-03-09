---
title: JAVA证书体系
date: 2020-09-30
categories:
 - 后端
tags:
 - Java
 - 国密SSL
---

## 一、JDK与证书

### 1.1 证书生成

这里我们jdk自带的keytool工具生成PCKS12的证书：

```shell
keytool -genkey -v -alias root -keyalg RSA -storetype PKCS12 -keystore test.pfx
输入密钥库口令:
再次输入新口令:
您的名字与姓氏是什么?
  [Unknown]:  tz
您的组织单位名称是什么?
  [Unknown]:  tz
您的组织名称是什么?
  [Unknown]:  tz.com
您所在的城市或区域名称是什么?
  [Unknown]:  beijing
您所在的省/市/自治区名称是什么?
  [Unknown]:  beijing
该单位的双字母国家/地区代码是什么?
  [Unknown]:  china
CN=tz, OU=tz, O=tz.com, L=beijing, ST=beijing, C=china是否正确?
  [否]:  y

正在为以下对象生成 2,048 位RSA密钥对和自签名证书 (SHA256withRSA) (有效期为 90 天):
         CN=tz, OU=tz, O=tz.com, L=beijing, ST=beijing, C=china
[正在存储test.pfx]
```

JKS证书也是一样，修改`-storetype JKS -keystore test.jks`就行

### 1.2 JDK加载读取证书

```java
KeyStore keyStore = KeyStore.getInstance(keyStoreType);
keyStore.load(new FileInputStream(new File(keyPath)), password.toCharArray());
KeyManagerFactory keyManagerFactory = KeyManagerFactory.getInstance(algorithm);
keyManagerFactory.init(keyStore, password.toCharArray());
for (KeyManager keyManager : keyManagerFactory.getKeyManagers()) {
    if (keyManager instanceof X509ExtendedKeyManager) {
        X509ExtendedKeyManager x509 = (X509ExtendedKeyManager)keyManager;
        PrivateKey privateKey = x509.getPrivateKey(alias);
        System.out.println(privateKey);
        for (X509Certificate certificate : x509.getCertificateChain(alias)) {

            System.out.println("版本号：" + certificate.getVersion());
            System.out.println("序列号：" + certificate.getSerialNumber());
            System.out.println("证书类型：" + certificate.getType());
            System.out.println("证书信息：" + certificate.getSubjectDN().getName());
            System.out.println("证书用途：" + certificate.getKeyUsage());
            System.out.println("证书用途扩展字段：" + certificate.getExtendedKeyUsage());
            System.out.println("证书签发者信息：" + certificate.getIssuerDN().getName());

            System.out.println("签名算法名称：" + certificate.getSigAlgName());
            System.out.println("签名算法OID：" + certificate.getSigAlgOID());
            System.out.println("签名算法参数：" + certificate.getSigAlgParams());
            System.out.println("证书颁发者：" + certificate.getIssuerDN());
            System.out.println("签名算法：" + Arrays.toString(certificate.getSignature()));

            System.out.println("公钥算法：" + certificate.getPublicKey().getAlgorithm());
            System.out.println("公钥：" + Arrays.toString(certificate.getPublicKey().getEncoded()));
            System.out.println("公钥Format：" + certificate.getPublicKey().getFormat());

        }

    }
}
```

### 1.3 源码解析

加载KeyStore是通过JDK的Provider扩展机制来进行加载的，这里通过`KeyStore.getInstance(keyStoreType);`可以根据不同的KeyStoreType加载不同的证书解析类。

```java
public static KeyStore getInstance(String type)
        throws KeyStoreException
{
    try {
        Object[] objs = Security.getImpl(type, "KeyStore", (String)null);
        return new KeyStore((KeyStoreSpi)objs[0], (Provider)objs[1], type);
    } catch (NoSuchAlgorithmException nsae) {
        throw new KeyStoreException(type + " not found", nsae);
    } catch (NoSuchProviderException nspe) {
        throw new KeyStoreException(type + " not found", nspe);
    }
}
```

然后这里通过JDK的Security来获取实现类，这里通过获取`KeyStore`获取他的算法实现类，这里将会遍历注册的所有Provider，来获取所有的算法实现类

```java
static Object[] getImpl(String algorithm, String type, String provider)
    throws NoSuchAlgorithmException, NoSuchProviderException {
    if (provider == null) {
        return GetInstance.getInstance
            (type, getSpiClass(type), algorithm).toArray();
    } else {
        return GetInstance.getInstance
            (type, getSpiClass(type), algorithm, provider).toArray();
    }
}

public static Instance getInstance(String type, Class<?> clazz,
                                   String algorithm) throws NoSuchAlgorithmException {
    // in the almost all cases, the first service will work
    // avoid taking long path if so
    ProviderList list = Providers.getProviderList();
    Service firstService = list.getService(type, algorithm);
    if (firstService == null) {
        throw new NoSuchAlgorithmException
            (algorithm + " " + type + " not available");
    }
    NoSuchAlgorithmException failure;
    try {
        return getInstance(firstService, clazz);
    } catch (NoSuchAlgorithmException e) {
        failure = e;
    }
    // if we cannot get the service from the preferred provider,
    // fail over to the next
    for (Service s : list.getServices(type, algorithm)) {
        if (s == firstService) {
            // do not retry initial failed service
            continue;
        }
        try {
            return getInstance(s, clazz);
        } catch (NoSuchAlgorithmException e) {
            failure = e;
        }
    }
    throw failure;
}
```

然后我们可以看下Provider的实现类如何将算法添加进去的，这里以BC为例，添加了一些算法类：

```java
BouncyCastleProvider bc = new BouncyCastleProvider();
bc.addAlgorithm("KeyStore.TestKeyStore", TestKeyStore.class.getName());
```

之后我们可以将找个Provider注入到Provider列表内

```java
Security.addProvider(bc);
```

