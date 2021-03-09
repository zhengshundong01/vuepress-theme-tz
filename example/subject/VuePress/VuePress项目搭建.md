---
title: VuePress项目搭建
date: 2020-08-22
categories:
 - 前端
tags:
 - VuePress
---

> 安装依赖

```powershell
npm install -g vuepress ## 或者 进入项目下 npm run -d vuepress
```

> 创建项目

创建项目文件夹

```powershell
mkdir vuepessdemo
```

项目目录结构

```powershell
.
├─ docs
│  ├─ README.md
│  └─ .vuepress
│     └─ config.js
└─ package.json
```

初始化项目

```powershell
npm init -y
```

创建README.md

```powershell
echo "Hello World" > README.md ## 注意这里的cmd字符集编码问题，否则一会跑起来是乱码，要是乱码删了重建一个，或者自己改下系统编码
```

创建.vuepress以及config.js

```powershell
mkdir .vuepress ## 右键新建的方式无法创建.vuepress，需要cmd操作
## 创建config.js 内容如下
module.exports = {
  title: 'Hello VuePress',
  description: 'Just playing around'
}
```

最后在package.json里添加如下脚本

```javascript
{
  "scripts": {
    "docs:dev": "vuepress dev docs",
    "docs:build": "vuepress build docs"
  }
}
```

最后启动项目

```shell
npm run docs:dev ## 如果这里报错找不到vuepress命令，你就重装下vuepress或者不要全局安装
```

