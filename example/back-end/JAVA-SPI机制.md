---
title: Java Spi 机制
date: 2020-10-11
categories:
 - 后端
tags:
 - Java8
---

## 定义

SPI的英文名称是Service Provider Interface，是Java 内置的服务发现机制。

在开发过程中，将问题进抽象成API，可以为API提供各种实现。如果现在需要对API提供一种新的实现，我们可以不用修改原来的代码，直接生成新的Jar包，在包里提供API的新实现。通过Java的SPI机制，可以实现了框架的动态扩展，让第三方的实现能像插件一样嵌入到系统中。

Java的SPI类似于IOC的功能，将装配的控制权移到了程序之外，实现在模块装配的时候不用在程序中动态指明。所以SPI的核心思想就是解耦，这在模块化设计中尤其重要。

## 示例

1、定义个接口

2、实现方实现这个接口，并将自己的实现暴露出去，通过再META-INF/services下新建一个接口名的文件，内部内容是实现的文件暴露出去

3、使用方通过ServiceLoader.load(接口)来进行加载



常见的例子有JSSE、JCE、JDBC的实现扩展，是JDK及JavaEE实现的最常见扩展方法。

在这里列举一个示例：

spi-interface：定义的接口

spi-ext1：实现方一

spi-ext2：实现方二

spi-user：使用者

### spi-interface

本项目只定义一个接口

```java
package com.tz.demo.spi;


/**
 * @Author: zhengshundong
 * @Date: 2020/11/15
 * @Version: 1.0.0
 * @Description: SPI扩展核心类
 */
public interface Car {

    /**
     * 获取名称
     */
    String getCarName();

}
```

### spi-ext1

```java
package com.tz.demo.spi.ext1;

import com.tz.demo.spi.Car;

/**
 * @Author: zhengshundong
 * @Date: 2020/11/15
 * @FileName: Ford
 * @Version: 1.0
 * @Description:
 **/
public class Ford implements Car {
    public String getCarName() {
        return "I am Ford Car";
    }
}

```

然后在META-INF/services下新建一个文件`com.tz.demo.spi.Car`，内容是`com.tz.demo.spi.ext1.Ford`

### spi-ext2

```java
package com.tz.demo.spi.ext2;

import com.tz.demo.spi.Car;

/**
 * @Author: zhengshundong
 * @Date: 2020/11/15
 * @Version: 1.0
 * @Description:
 **/
public class BYD implements Car {
    public String getCarName() {
        return "I am BYD Car";
    }
}

```

然后在META-INF/services下新建一个文件`com.tz.demo.spi.Car`，内容是`com.tz.demo.spi.ext2.BYD`

### spi-user

```java
package com.tz.demo.spi.user;

import com.tz.demo.spi.Car;

import java.util.Iterator;
import java.util.ServiceLoader;

/**
 * @Author: zhengshundong
 * @Date: 2020/11/15
 * @Version: 1.0
 * @Description:
 **/
public class UserTest {

    public static void main (String[] args) {
        ServiceLoader<Car> services = ServiceLoader.load(Car.class);

        Iterator<Car> interator = services.iterator();
        while (interator.hasNext()) {
            Car car = interator.next();
            System.out.println(car.getCarName());
        }
    }
}
```

最后运行后会输出：

```
I am Ford Car
I am BYD Car
```

## 代码示例

https://github.com/zhengshundong01/spi-demo