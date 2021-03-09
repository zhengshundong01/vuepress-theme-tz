---
title: Java8 函数式编程
date: 2020-10-02
categories:
 - 后端
tags:
 - Java8
---

## 概念：

函数式接口属于Lambda表达式的范畴，在这个接口中只能由一个抽象方法，这种接口也叫做Single Abstract Method interfaces

## 定义：

```java
    @FunctionalInterface
    interface GreetingService 
    {
        void sayMessage(String message);
    }
```

该接口可以用Lambda表达式来表示该接口的一个实现(注意：JAVA8之前一般用匿名内部类来实现)

```java
GreetingService greetService1 = message -> System.out.println("Hello " + message);
```

::: danger 注意

这里的@FunctionalInterface注解主要作用是标识编译器去检查这个是否只包含一个抽象方法

:::

## 支持的接口：

JDK 1.8 之前已有的函数式接口:

- java.lang.Runnable
- java.util.concurrent.Callable
- java.security.PrivilegedAction
- java.util.Comparator
- java.io.FileFilter
- java.nio.file.PathMatcher
- java.lang.reflect.InvocationHandler
- java.beans.PropertyChangeListener
- java.awt.event.ActionListener
- javax.swing.event.ChangeListener

JDK 1.8 新增加的函数接口：

- java.util.function

java.util.function 它包含了很多类，用来支持 Java的 函数式编程，该包中的函数式接口有

## 最佳实践：

### 例1：

```java
public interface FileFilter{
    /**
     * 判断文件是否符合规则
     * @param path
     * @return
     */
    boolean accept(Path path);
}

public interface ReadFileCall{
    /**
     * 读取文件回调
     * @param path
     * @param content
     */
    void call(Path path, byte[] content);
}
```

这里定义了两个函数式接口

```java
public static void readDirFile (Path dir, FileFilter filter, ReadFileCall reader) {
    try {
        Stream<Path> stream = Files.list(dir);
        stream.forEach(path -> {
            File file = path.toFile();
            if (file.isFile()) {
                boolean accept = filter == null ? true : filter.accept(path);
                if (accept) {
                    reader.call(path, readFileContent(path));
                }
            }
            if (file.isDirectory()) {
                readDirFile(path, filter, reader);
            }
        });
    } catch (IOException e) {
        log.error("读取文件夹中文件出错", e);
    }
}
```

这里定义了读取目录方法

```java
public List<CheckResult> check(String path, String upgrade){
    List<CheckResult> allCheckResult = new ArrayList<>();

    List<CheckItem> checkItemList = checkItemCache.getCheckItemList(upgrade);
    Util.readDirFile(Paths.get(path), (filePath) -> {
        String[] acceptTypes = new String[]{"html", "vue", "js", "css", "less"};
        for (String acceptType : acceptTypes) {
            if (filePath.toString().toLowerCase().endsWith("." + acceptType)) {
                return true;
            }
        }
        return false;
    }, (filePath, fileContent) -> {
        List<CheckResult> checkResultList = this.checkFileContent(filePath, fileContent, checkItemList);
        allCheckResult.addAll(checkResultList);
    });

    return allCheckResult;
}
```

这里重点在于需要向`readDirFile`里传入参数，其中两个参数是上面定义的函数式接口，所以这里需要去做实现，所以采用了`lambda`表达式 + 函数式接口的方式来实现。距离第三个参数：`ReadFileCall`这个参数就采用`lambda`，他的实现就变成了

```java
(filePath, fileContent) -> {
        List<CheckResult> checkResultList = this.checkFileContent(filePath, fileContent, checkItemList);
        allCheckResult.addAll(checkResultList);
})
```

也就是`ReadFileCall`这个的`call`方法的实现就变成了上面的

## 参考：

[Java 8 函数式接口]: https://www.runoob.com/java/java8-functional-interfaces.html
[JAVA 8 函数式接口-Functional Interface]: https://www.cnblogs.com/chenpi/p/5890144.html

