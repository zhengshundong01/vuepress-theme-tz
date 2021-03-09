---
title: RateLimer单应用限流
date: 2021-01-08
categories:
 - 后端
tags:
 - RateLimer
 - 限流
---

## RateLimter限流原理

### 漏桶算法原理

![image-20210111154032281](image-20210111154032281.png)

漏桶算法原理如图所示，就像一个桶一样，当访问桶内的请求过多时会溢出(拒绝请求)，但是在实际的使用过程中，往往都是会有突发的流量访问，比如上一秒300人访问，下一秒600人访问，此时漏桶算法就会拒绝下一秒600人中的300人，因为它处理的速率是恒定300的。所以就出现了令牌桶算法

### 令牌桶原理

![image-20210111154435009](image-20210111154435009.png)

令牌桶算法是创建了一个固定存放令牌的桶，这个桶有个最大容量(可设置，超出便会丢弃令牌)，固定增加令牌速率(每隔多少时间往桶中放入令牌)，当一个请求来了，将会分配一个令牌去处理。这样的话便可以解决流量突发问题的限流。

那我们现在来看下上面的问题，假设桶内最大容量是1000，每秒恒定增加500令牌。前一秒300人访问，桶内有500令牌，那么消耗300后剩余200还在桶内，下一秒添加500令牌，之后600个请求来了消耗了600个令牌，桶内还有100个令牌。所以这样便解决了流量突发问题。

## IP限流

### 依赖

```xml
<!--guava RateLimiter限流-->
<!-- https://mvnrepository.com/artifact/com.google.guava/guava -->
<dependency>
    <groupId>com.google.guava</groupId>
    <artifactId>guava</artifactId>
    <version>29.0-jre</version>
</dependency>
```

### 定义注解

```java
@Inherited
@Documented
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimit {
}

```

### 定义缓存

```java
@Service
public class IpCacheService {

    private LoadingCache<String, RateLimiter> ipCacheRateLimiter = CacheBuilder.newBuilder()
            .expireAfterWrite(30, TimeUnit.MINUTES)
            .maximumSize(1000)
            .build(new CacheLoader<String, RateLimiter>() {
                @Override
                public RateLimiter load(String s) throws Exception {
                    // 新的IP初始化 (限流每秒1/60个令牌响应,即60s一个令牌)
                    return RateLimiter.create(0.01);
                }
            });

    public RateLimiter getIpLimiter (String ip) throws ExecutionException {
        return ipCacheRateLimiter.get(ip);
    }
}

```

### 定义切面

```java
@Aspect
@Component
@Slf4j
public class RateLimitAspect {

//    private ConcurrentHashMap<String, RateLimiter> map = new ConcurrentHashMap();

    private RateLimiter rateLimiter;

    @Autowired
    private IpCacheService ipCacheService;

    @Autowired
    private HttpServletRequest request;

    @Pointcut("@annotation(com.thunisoft.tas.annotation.RateLimit)")
    public void serviceLimit(){
    }

    @Around("serviceLimit()")
    public Object arround(ProceedingJoinPoint point) throws ExecutionException {

        Object object = null;
        // 1、IP限流
        String remoteIp = IPUtil.getIpAddr(request);
        rateLimiter = ipCacheService.getIpLimiter(remoteIp);
        try {
            if (rateLimiter.tryAcquire()) {
                object = point.proceed();
            } else {
                // 异常可控
                log.info("【IP限流】Method has been limited: {}", remoteIp);
                throw new RateLimitException("Method has been limited: " + remoteIp);
            }
        } catch (Throwable e) {
            if (e instanceof RateLimitException) {
                throw (RateLimitException)e;
            } else {
                log.error("【IP限流】获取限流桶获取数据失败", e);
            }
        }
        return object;

    }
}

public class IPUtil {

	/**
	 * 客户端真实IP地址的方法一：
	 */
	public static String getRemortIP(HttpServletRequest request) {
		if (request.getHeader("x-forwarded-for") == null) {
			return request.getRemoteAddr();
		}
		return request.getHeader("x-forwarded-for");
	}

	/**
	 * 客户端真实IP地址的方法二：
	 */
	public static String getIpAddr(HttpServletRequest request) {
		String ip = "";
		if (request != null) {
			ip = request.getHeader("x-forwarded-for");
			if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
				ip = request.getHeader("Proxy-Client-IP");
			}
			if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
				ip = request.getHeader("WL-Proxy-Client-IP");
			}
			if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
				ip = request.getRemoteAddr();
			}
		}
		return ip;
	}

}

```

### 使用

```java
@ResponseBody
@PostMapping("/submit")
@RateLimit
public Response submit(@RequestBody @Valid ApplicationForm applicationForm) {
    int result = applicationFormService.submit(applicationForm);
    return ResponseUtil.fail();
}
```



## 速率限流

### 依赖

```xml
<!--guava RateLimiter限流-->
<!-- https://mvnrepository.com/artifact/com.google.guava/guava -->
<dependency>
    <groupId>com.google.guava</groupId>
    <artifactId>guava</artifactId>
    <version>29.0-jre</version>
</dependency>
```

### 定义注解

```java
@Inherited
@Documented
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimit {

    /**
     * 注释内容为速率限流，先不用
     * 每秒放入桶中的token
     * @return
     */
    double limitNum() default 10;

    String name() default "";
}

```

### 定义切面

```java
@Aspect
@Component
@Slf4j
public class RateLimitAspect {

    private ConcurrentHashMap<String, RateLimiter> map = new ConcurrentHashMap();

    private RateLimiter rateLimiter;

    @Pointcut("@annotation(com.thunisoft.tas.annotation.RateLimit)")
    public void serviceLimit(){
    }

    @Around("serviceLimit()")
    public Object arround(ProceedingJoinPoint point) throws ExecutionException {

        Object object = null;



//         获取拦截的方法名
        Signature signature = point.getSignature();
//         转化下
        MethodSignature methodSignature = (MethodSignature)signature;
//         返回被织入的对象
        Object target = point.getTarget();
//         为了获取注解信息
        Method currentMethod = target.getClass().getMethod(methodSignature.getName(), methodSignature.getParameterTypes());
//         获取注解信息
        RateLimit rateLimit = currentMethod.getAnnotation(RateLimit.class);
//         限流的token数
        double limitNum = rateLimit.limitNum();
//         注解所在方法名称，用于区分不同的方法限流
        String name = rateLimit.name();

//         2、速率限流
        if (!map.containsKey(name)) {
            map.put(name, RateLimiter.create(limitNum));
        }
        rateLimiter = map.get(name);

        try {
            if (rateLimiter.tryAcquire()) {
                System.out.println("你没被限流了");
                object = point.proceed();
            } else {
                System.out.println("你被限流了");
                throw new RateLimitException("Method has been limited: " + name);
            }
        } catch (Throwable e) {
            if (e instanceof RateLimitException) {
                throw (RateLimitException)e;
            }
        }
        return object;

    }
}

```



### 使用

```java
@ResponseBody
@PostMapping("/submit")
@RateLimit(limitNum = 5, name = "formLimter")
public Response submit(@RequestBody @Valid ApplicationForm applicationForm) {
    int result = applicationFormService.submit(applicationForm);
    return ResponseUtil.fail();
}
```

## 参考资料

令牌桶原理：https://cloud.tencent.com/developer/article/1408819

http://ifeve.com/guava-ratelimiter/