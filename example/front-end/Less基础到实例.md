---
title: Less基础到实例
date: 2020-07-21
categories:
 - 前端
tags:
 - Less
---

## 1. 选择器

### 1.1 父选择器

```less
.header{
    &-title{
        font-size: 26px;
    }
}
// 渲染为
.header-title{
    font-size: 26px;
}
```

### 1.2 CSS选择器

```less
// 元素选择器
html{}
h1{}
// 选择器分组 意思h1和p都是红色
h1, p{color:red}
// 类选择器
.class
p.classa{color:red;}// p标签并且class叫classa的颜色是红色
// id选择器
#app
// 属性选择器
a[href]{color:red;} // a标签并且有href
div[id="aaa"] // div并且id是aaa
// 后代选择器
h1 em{}
// 子选择器 只有第一个子strong被影响
h1 > strong{}
// 相邻兄弟选择器
h1 + p{}
```



## 2. Variables

### 2.1 概述

```less
@red: red;
@color: @red + #111;
#div{
  color: @color;
}
```

可以将值存储在一个变量(其实只能赋值一次，可以说是常量)

### 2.2 变量插值

变量其实还可以用在选择器，属性名、URL等地方

```less
@div: div;
@class: fd-header;
@images: "../xx.png";
#@{div}{
    color: green;
}
.@{class}{
    height: 200px;
}
div: {
    background: url("@{images}/white-sand.png");
}
```

常见用法：

```less
@badge-prefix-cls: ~"@{css-prefix}badge";
.@{badge-prefix-cls} {
}
```



### 2.3 导入语句

```less
// 变量
@themes: "../../src/themes";

// 用法
@import "@{themes}/tidal-wave.less";
```

常见用法：

```
一般我们在写less会把定义的变量放到一个特定文件夹内，这样也方便日后管理和主题切换。
然后在需要用变量的地方@import进来即可
```



### 2.4 属性

```less
@my-property: color;
.myclass {
  background-@{my-property}: #81f7d8;
}
```



### 2.5 变量名

```less
@fnord:  "I am jack.";
@var:    "fnord";
.myclass {
  content: @@var;
}
// 会渲染为
content: "I am jack."
```

使用实例：

参考IView源码内的badge组件，参考**实例章节**

### 2.6 延迟加载

```less
.myclass {
  width: @var;
}

@var: @a;
@a: 9%;
```

在定义一个变量两次时，只会使用最后定义的变量，Less会从当前作用域中向上搜索。这个行为类似于CSS的定义中始终使用最后定义的属性值。

### 2.7 默认变量

```less
// library
@base-color: green;
@dark-color: darken(@base-color, 10%);

// use of library
@import "library.less";
@base-color: red;
```

因为[延迟加载](https://www.html.cn/doc/less/features/#variables-feature-lazy-loading)，这上面的代码能很好的工作 - 其中base-color会被重写，而dark-color依然是暗红色。

使用示例

```
这里可以样式覆盖，比如项目有个公用样式，然而你的这里需要改点东西，可以导入进来后做覆盖
```



## 3. Extend

### 3.1 概述

extend可以附加给一个选择器，也可以放入一个规则集中。它看起来像是一个带选择器参数伪类，也可以使用关键字`all`选择相邻的选择器。

```less
h2 {
  &:extend(.style);
  font-style: italic;
}
.style {
  background: green;
}
// 会被渲染成
h2 {
  font-style: italic;
}
.style,
h2 {
  background: green;
}

扩展

.style:extend(.container, .img)
{
  background: #BF70A5;
}
.container {
  font-style: italic;
}
.img{
   font-size: 30px;
 }
 // 渲染为
 .style {
  background: #BF70A5;
}
.container,
.style {
  font-style: italic;
}
.img,
.style {
  font-size: 30px;
}

// 扩展多个可以用逗号分隔

.e:extend(.f, .g) {}
```



### 3.2 扩展到附加选择器

给选择器附加扩展看起来就像一个普通的带参数的伪类选择器。一个选择器可以包含多个扩展分支，但是所有的扩展都必须在选择器的尾部。

- 选择器之后的扩展：`pre:hover:extend(div pre)`。
- 在选择器和扩展之间有空格是允许的：`pre:hover :extend(div pre)`.
- 也允许有多个扩展: `pre:hover:extend(div pre):extend(.bucket tr)` - 注意这与 `pre:hover:extend(div pre, .bucket tr)`一样。
- 这是不允许的: `pre:hover:extend(div pre).nth-child(odd)`。因为扩展必须在最后。

如果一个规则集包含多个选择器，所有选择器都可以使用extend关键字。下面演示了一个规则集中多个带extend的选择器：

```less
.big-division,
.big-bag:extend(.bag),
.big-bucket:extend(.bucket) {
  // body
}
```



### 3.3 规则集内扩展

```less
pre:hover,
.some-class {
  &:extend(div pre);
}
// 和下面一样
pre:hover:extend(div pre),
.some-class:extend(div pre) {}
```



### 3.4 嵌套选择器中的扩展

```less
.buket{
  tr{
    color: blue;
  }
}
.a-class:extend(.buket tr){}
// 渲染为
.buket tr, .a-class{
  color: blue;
}
```



### 3.5 不能匹配

```less
nth-child(1n+3)
:extend(:nth-child(n+3))//无法匹配上
// 伪类顺序也是
// 引号类型也是
// 都必须一致
```



### 3.6 Extend all

```less
.a.b.test,
.test.c {
  color: orange;
}
.test {
  &:hover {
    color: green;
  }
}

.replacement:extend(.test all) {}
// 输出-也就是包含所有.test的都会被渲染
.a.b.test,
.test.c,
.a.b.replacement,
.replacement.c {
  color: orange;
}
.test:hover,
.replacement:hover {
  color: green;
}
```



### 3.7 示例

```less
li.list > a {
  // list styles
}
button.list-style {
  &:extend(li.list > a); // 使用相同的列表样式
}
```



## 4. Mixins

### 4.1 基础

```less
.a, #b{
  color: red;
}
.mix-a{
  .a();
}
.mix-b{
  #b();
}
// 可以得到
.a, #b{
  color: red;
}
.mix-a{
  color: red;
}
.mix-b{
  color: red;
}
// 可以不用写括号
.a() => .a;
```



### 4.2 不输出混合集
```less
.mixins{
  color: black;
}
.other-mix(){
  background: white;
}
.class{
  .mixins;
  .other-mix;
}
// 渲染为 带括号的不会渲染
.mixins{
  color: black;
}
.class{
  color: black;
  background: white;
}
```

使用实例

```less
// 常见的就是icon图标前缀
.ivu-icon() {
    display: inline-block;
    font-family: @ionicons-font-family;
    speak: none;
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
}

.ivu-icon {
    .ivu-icon();
}
```



### 4.3 带选择器的混合器
```less
.my-hover-mixin() {
  &:hover {
    border: 1px solid red;
  }
}
button {
  .my-hover-mixin();
}
// 输出
button:hover {
  border: 1px solid red;
}
```

使用示例

```
这里可以用来做常见伪类的统一样式
```



### 4.4 !important

```less
.foo (@bg: #f5f5f5, @color: #900) {
  background: @bg;
  color: @color;
}
.unimportant {
  .foo();
}
.important {
  .foo() !important;
}
```

结果为:

```css
.unimportant {
  background: #f5f5f5;
  color: #900;
}
.important {
  background: #f5f5f5 !important;
  color: #900 !important;
}
```

使用示例

```
可以用来强制覆盖样式
```



## 5. Parametric Mixins

### 5.1 基础使用

```less
.mix-fun(@radis 5px){
    border-radius: @radis;
}
#div{
    .mix-fun(4px);
}
// 渲染为
#div{
    border-radius: 4px;
    // 不穿值会用默认的5px border-radius: 5px;
}
```

### 5.2 多个参数

参数可以用*分号*或者*逗号*分割。但是推荐使用*分号*分割。因为逗号符号有两个意思：它可以解释为mixins参数分隔符或者css列表分隔符。

使用逗号作为mixin的分隔符则无法用它创建逗号分割的参数列表。换句话说，如果编译器在mixin调用或者声明中看到至少一个分号，它会假设参数是由分号分割的，而所有的逗号都属于CSS列表:

- 两个参数，并且每个参数都是逗号分割的列表：`.name(1,2,3;something, ele)`，
- 三个参数，并且每个参数都包含一个数字：`.name(1,2,3)`，
- 使用伪造的分号创建mixin，调用的时候参数包含一个逗号分割的css列表：`.name(1,2,3;)`，
- 逗号分割默认值：`.name(@param1: red, blue)`。

定义多个具有相同名称和参数数量的mixins是合法的。Less会使用它可以应用的属性。如果使用mixin的时候只带一个参数，比如`.mixin(green)`，这个属性会导致所有的mixin都会使用强制使用这个明确的参数：

```less
.mixin(@color) {
  color-1: @color;
}
.mixin(@color; @padding: 2) {
  color-2: @color;
  padding-2: @padding;
}
.mixin(@color; @padding; @margin: 2) {
  color-3: @color;
  padding-3: @padding;
  margin: @margin @margin @margin @margin;
}
.some .selector div {
  .mixin(#008000);
}
```

会编译为: 注意三个参数的没有渲染

```css
.some .selector div {
  color-1: #008000;
  color-2: #008000;
  padding-2: 2;
}
```

### 5.3 参数命名

及传参的时候声明传参的变量名

```less
.mixin(@color: black; @margin: 10px; @padding: 20px) {
  color: @color;
  margin: @margin;
  padding: @padding;
}
.class1 {
  .mixin(@margin: 20px; @color: #33acfe);
}
.class2 {
  .mixin(#efca44; @padding: 40px);
}
```

### 5.4 `@arguments` variable

`@arguments`在mixins内部有特殊意义，调用mixin时，它包含所有传入的参数。如果你不想单个单个的处理参数，这一特性是很有用的：

```less
.box-shadow(@x: 0; @y: 0; @blur: 1px; @color: #000) {
  -webkit-box-shadow: @arguments;
     -moz-box-shadow: @arguments;
          box-shadow: @arguments;
}
.big-block {
  .box-shadow(2px; 5px);
}
```

返回结果为：

```css
.big-block {
  -webkit-box-shadow: 2px 5px 1px #000;
     -moz-box-shadow: 2px 5px 1px #000;
          box-shadow: 2px 5px 1px #000;
}
```

### 5.5 无限参数

如果你希望你的mixin接受数量不定的参数，你可以使用`...`。在变量名后面使用它，它会将这些参数分配给变量。

```less
.mixin(...) {        // matches 0-N arguments
.mixin() {           // matches exactly 0 arguments
.mixin(@a: 1) {      // matches 0-1 arguments
.mixin(@a: 1; ...) { // matches 0-N arguments 因为有默认值，所以是0-N
.mixin(@a; ...) {    // matches 1-N arguments 因为没有默认值，必须传参
```

此外：

```less
.mixin(@a; @rest...) {
   // @rest is bound to arguments after @a
   // @arguments is bound to all arguments
}
```

## 6. 运算符

### 6.1 比较运算符

guards中可用的比较运算符的完整列表为： `>`, `>=`, `=`, `=<`, `<`。此外，关键字`true`是让两个mixins等价的唯一真值：

```less
.truth (@a) when (@a) { ... }
.truth (@a) when (@a = true) { ... }
```

除了关键字`true`，其他任何值都是假值：

```less
.class {
  .truth(40); // 将不符合任何上述定义。
}
```

### 6.2 逻辑运算符

使用`and`关键字来组合guards：

```less
.mixin (@a) when (isnumber(@a)) and (@a > 0) { ... }
```

你可以通过用逗号 `,` 分隔guards来模仿 *or* 运算符。如果任何 guards 为 `true`，那么它认为是匹配的：

```less
.mixin (@a) when (@a > 10), (@a < -10) { ... }
```

使用 `not` 关键字来否定条件：

```less
.mixin (@b) when not (@b > 0) { ... }
```

### 6.3 类型检查

### Type checking functions （类型检查函数）

最后，如果你想基于值类型匹配mixins，那么你可以使用`is`函数：

```less
.mixin (@a; @b: 0) when (isnumber(@b)) { ... }
.mixin (@a; @b: black) when (iscolor(@b)) { ... }
```

下面是一些基本的类型检查函数：

- `iscolor`
- `isnumber`
- `isstring`
- `iskeyword`
- `isurl`

如果你想检查一个值除了数字是否是一个特定的单位，你可以使用下列方法之一：

- `ispixel`
- `ispercentage`
- `isem`
- `isunit`

## 7. 循环

在Less中，混合可以调用它自身。这样，当一个混合递归调用自己，再结合[Guard表达式](https://www.html.cn/doc/less/features/#mixin-guards-feature)和[模式匹配](https://www.html.cn/doc/less/features/#mixins-parametric-feature-pattern-matching)这两个特性，就可以写出循环结构。

示例：

```less
.looptest(@counter) when (@counter > 0) {
  .looptest((@counter - 1));    // 递归调用自身
  width: (10px * @counter); // 每次调用时产生的样式代码
}

div {
  .looptest(5); // 调用循环
}
```

输出：

```css
div {
  width: 10px;
  width: 20px;
  width: 30px;
  width: 40px;
  width: 50px;
}
```

使用递归循环最常见的情况就是生成栅格系统的CSS：

```less
.generate-columns(4);

.generate-columns(@n, @i: 1) when (@i =< @n) {
  .column-@{i} {
    width: (@i * 100% / @n);
  }
  .generate-columns(@n, (@i + 1));
}
```

输出：

```css
.column-1 {
  width: 25%;
}
.column-2 {
  width: 50%;
}
.column-3 {
  width: 75%;
}
.column-4 {
  width: 100%;
}
```

使用实例

```
循环和递归用的好会非常好用，参考实例章节
```



## 8. 父选择器

### 8.1 多个父选择器

`&`可以在一个选择器中出现不止一次。这就使得它可以反复引用父选择器，而不是重复父选择器的类名。

```less
.link {
  & + & {
    color: red;
  }

  & & {
    color: green;
  }

  && {
    color: blue;
  }

  &, &ish {
    color: cyan;
  }
}
```

将输出：

```css
.link + .link {
  color: red;
}
.link .link {
  color: green;
}
.link.link {
  color: blue;
}
.link, .linkish {
  color: cyan;
}
```

注意，`&`代表所有的父选择器（而不只是最近的长辈），因此下面的例子：

```less
.grand {
  .parent {
    & > & {
      color: red;
    }

    & & {
      color: green;
    }

    && {
      color: blue;
    }

    &, &ish {
      color: cyan;
    }
  }
}
```

结果为：

```css
.grand .parent > .grand .parent {
  color: red;
}
.grand .parent .grand .parent {
  color: green;
}
.grand .parent.grand .parent {
  color: blue;
}
.grand .parent,
.grand .parentish {
  color: cyan;
}
```

## 9. 其他

### 9.1 转义

它动态构建选择器，并使用属性或变量值作为任意字符串。

```less
p { 
	color: ~"green";
}
// 渲染为
p { 
	color: green;
}
```

使用示例

```less
// less里的动态计算
calc(~"100% - 140px");
```



## 10. 函数

### 10.1 List 函数

**length(数据)**

> 返回长度

示例：

```less
@list: "banana", "tomato", "potato", "peach";
n: length(@list);
```

输出：

```
n: 4;
```

**extract(数据, n)**

> 返回集合中指定索引的值。

示例：

```less
@list: apple, pear, coconut, orange;
value: extract(@list, 3);
```

输出：

```
value: coconut;
```

### 10.2 类型函数

- isnumber()
- isstring()
- iscolor()
- iskeyword()
- isurl()
- ispixel() // 如果一个值是带像素长度单位的数字，返回'真(true)',否则返回'假(false)'.
- isem() // 如果一个值是带em长度单位的数字，返回'真(true)',否则返回'假(false)'.
- ispercentage() // 如果一个值是带百分比单位的数字，返回'真(true)',否则返回'假(false)'.
- isunit(data, 单位) // 如果一个值是带指定单位的数字，返回'真(true)',否则返回'假(false)'.
- isruleset() // 如果值是一个规则集合，返回'真(true)',否则返回'假(false)'。

## END: 使用实例

### 1. 递归运行 + 函数 + 变量名

```less
@colors: pink, magenta, red, volcano, orange, yellow, gold, cyan, lime, green, blue, geekblue, purple;
.make-color-classes(@i: length(@colors)) when (@i > 0) {
    .make-color-classes(@i - 1);
    @color: extract(@colors, @i);
    @lightColor: "@{color}-1";
    @lightBorderColor: "@{color}-3";
    @darkColor: "@{color}-6";
    &-@{color} {
        line-height: 20px;
        background: @@lightColor;
        border-color: @@lightBorderColor;
        .@{tag-prefix-cls}-text{
            color: @@darkColor !important;
        }
        &.@{tag-prefix-cls}-dot{
            line-height: 32px;
        }
    }
}
.make-color-classes();
```

参考：  https://www.jianshu.com/p/868d1bcbe12a 

【内置函数extract】： 返回列表中指定位置的元素。 参数：

- `list` - 逗号或空格分隔的元素列表。
- `index` - 指定列表中元素位置的数字。

返回值：列表中指定位置的元素。

案例： `extract(8px dotted red, 2);`

输出： `dotted`

案例：

```less
@list: apple, pear, coconut, orange;
value: extract(@list, 3);
```

输出：

```less
value: coconut;
```

参考： https://www.cnblogs.com/waibo/p/7918454.html 

### 2. less编译成css

这里不确定是否需要全局安装less，如果不全局，不知道本地项目内的是否可以，全局安装命令：

```shell
npm install -g less
```

然后进入你要编译的文件夹目录，执行即可编译

```shell
npx lessc ./index.less ./index.css
```

