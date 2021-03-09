# VuePress项目基础介绍

上一节我们已经介绍了，VuePress的项目基础搭建，现在我们来介绍一下项目的一些基础介绍

## 目录介绍

::: tip

.
├── docs
│   ├── .vuepress (可选的)
│   │   ├── components (可选的)
│   │   ├── theme (可选的)
│   │   │   └── Layout.vue
│   │   ├── public (可选的)
│   │   ├── styles (可选的)
│   │   │   ├── index.styl
│   │   │   └── palette.styl
│   │   ├── templates (可选的, 谨慎配置)
│   │   │   ├── dev.html
│   │   │   └── ssr.html
│   │   ├── config.js (可选的)
│   │   └── enhanceApp.js (可选的)
│   │ 
│   ├── README.md
│   ├── guide
│   │   └── README.md
│   └── config.md
│ 
└── package.json

:::

- `docs/.vuepress`: 用于存放全局的配置、组件、静态资源等。
- `docs/.vuepress/components`: 该目录中的 Vue 组件将会被自动注册为全局组件。
- `docs/.vuepress/theme`: 用于存放本地主题。
- `docs/.vuepress/styles`: 用于存放样式相关的文件。
- `docs/.vuepress/styles/index.styl`: 将会被自动应用的全局样式文件，会生成在最终的 CSS 文件结尾，具有比默认样式更高的优先级。
- `docs/.vuepress/styles/palette.styl`: 用于重写默认颜色常量，或者设置新的 stylus 颜色常量。
- `docs/.vuepress/public`: 静态资源目录。
- `docs/.vuepress/templates`: 存储 HTML 模板文件。
- `docs/.vuepress/templates/dev.html`: 用于开发环境的 HTML 模板文件。
- `docs/.vuepress/templates/ssr.html`: 构建时基于 Vue SSR 的 HTML 模板文件。
- `docs/.vuepress/config.js`: 配置文件的入口文件，也可以是 `YML` 或 `toml`。
- `docs/.vuepress/enhanceApp.js`: 客户端应用的增强。



## 常见配置

### 项目配置

::: tip

文件：`docs/.vuepress/config.js`

:::

[参考连接]: https://vuepress.vuejs.org/zh/config/#%E5%9F%BA%E6%9C%AC%E9%85%8D%E7%BD%AE



```javascript
module.exports = {
  base: '/', // 页面根路径
  title: 'T·Z', // 网站的标题，默认主题时会显示在navbar上
  description: '我们每个人都是独一无二的存在...', // 网站描述，将会渲染到meta标签内
  // theme: 'reco', // 主题配置，默认主题可不配置
  head: [ // 需要被注入到head标签内东西
      ['link', { rel: 'icon', href: '/logo.png' }]
  ],
  host: '0.0.0.0', // 绑定的dev server 主机名
  port: 80, // 端口
  temp: '/path/to/@vuepress/core/.temp', // 指定的客户端文件临时目录
  dest: '.vuepress/dist', // build时候产生的文件目录
  locales: undefined, // 多语言配置
  shouldPrefetch: () => true, // 定义哪些文件需要生成 link rel="prefetch"
  cache: true, // 缓存控制
  extraWatchFile: [], // 指定需要额外被监听的文件
  patterns: ['**/*.md', '**/*.vue'], // 指定要解析的文件模式
  // configureWebpack: {
  //   "resolve": {
  //     "alias": {
  //       '@assets': '/assets'
  //     }
  //   }
  // },
  markdown: {
    lineNumbers: true
  }
}
```

### 插件配置

::: tip

文件：`docs/.vuepress/config.js`

:::

[参考链接]: https://vuepress.vuejs.org/zh/plugin/using-a-plugin.html#%E4%BD%BF%E7%94%A8%E6%9D%A5%E8%87%AA%E4%BE%9D%E8%B5%96%E7%9A%84%E6%8F%92%E4%BB%B6

使用插件配置需要安装相应的插件才可

```javascript
mudule.export = {
  base: '/',
  title: 'xxx',
  ...
  plugins: [
    ["@vuepress-reco/vuepress-plugin-screenfull"],
    [
      "dynamic-title",
      {
        showIcon: "/picture/avator.jpg",
        showText: "(/≧▽≦/)咦！又好了！",
        hideIcon: "/failure.ico",
        hideText: "(●—●)喔哟，崩溃啦！",
        recoverTime: 2000
      }
    ],
    ["ribbon-animation", {
      size: 90, // 默认数据
      opacity: 0.3, //  透明度
      zIndex: -1, //  层级
      opt: {
        // 色带HSL饱和度
        colorSaturation: "80%",
        // 色带HSL亮度量
        colorBrightness: "60%",
        // 带状颜色不透明度
        colorAlpha: 0.65,
        // 在HSL颜色空间中循环显示颜色的速度有多快
        colorCycleSpeed: 6,
        // 从哪一侧开始Y轴 (top|min, middle|center, bottom|max, random)
        verticalPosition: "center",
        // 到达屏幕另一侧的速度有多快
        horizontalSpeed: 200,
        // 在任何给定时间，屏幕上会保留多少条带
        ribbonCount: 2,
        // 添加笔划以及色带填充颜色
        strokeSize: 0,
        // 通过页面滚动上的因子垂直移动色带
        parallaxAmount: -0.5,
        // 随着时间的推移，为每个功能区添加动画效果
        animateSections: true
      },
      ribbonShow: false, //  点击彩带  true显示  false为不显示
      ribbonAnimationShow: true // 滑动彩带
    }],
    ['@vuepress-reco/comments', {
      solution: 'valine',
      options: {
        appId: '4UG8NvleO2OAlSWUebJ6t1m6-gzGzoHsz',
        appKey: 'wbv3EfpR8fDj1a6j8yQ9LoFR',
      }
    }],
    [
      "@vuepress-reco/vuepress-plugin-kan-ban-niang",
      {
        theme: ["haruto"],
        clean: true
      }
    ],
    [
      'meting',
      {
        meting: {
          auto: "https://music.163.com/#/playlist?id=6590270169"
        },
        aplayer: {
          autoplay: true,
          lrcType: 0,
          additionAudio: [{
              name: '我们活着',
              artist: '灵笼',
              url: '/music/weAlive.mp3',
              cover: '/picture/avator.jpg',
              lrc: '/music/weAlive.lrc'
            },
            {
              name: '重生',
              artist: '灵笼',
              url: '/music/reborn.mp3',
              cover: '/picture/avator.jpg',
              lrc: '/music/reborn.lrc'
            }
          ]
        }
      }
    ]
  ]
}
```

### Markdown配置

::: tip

文件：`docs/.vuepress/config.js`

:::

[参考链接]: https://vuepress.vuejs.org/zh/config/#markdown

使用插件配置需要安装相应的插件才可

```javascript
module.export = {
    lineNumbers: true, // 是否在每个代码块左侧显示行号
    slugify: [function], // 标题文本转化为slug的函数
    anchor: { permalink: true, permalinkBefore: true, permalinkSymbol: '#' }, // markdwn-it-anchor的选项
    pageSuffix: '.html', // 选择自定义内部链接以兼容使用vuepress-plugin-clean-urls
    externalLinks: { target: '_blank', rel: 'noopener noreferrer' },
    toc: { includeLevel: [2, 3]}, // markdown-it-table-of-contents (opens new window)的选项
    plugins: undefind, // 插件
    extendMarkdown: undefind, // 用于修改当前markdown-it的默认配置
    extrachHeaders: ['h2', 'h3'], // 文章目录将会显示的标题级别
}
```



### 默认主题配置

::: tip

文件：`docs/.vuepress/config.js`

:::

[参考链接]: https://vuepress.vuejs.org/zh/theme/default-theme-config.html

```javascript
module.exports = {
  themeConfig: {
    logo: '/assets/img/logo.png', // 导航栏Logo
    nav: [{text: 'guide', link: '/guide'}], // 导航连接
    navbar: false, // 禁用导航栏
    sidebar: [
        '/',
        '/page-a',
        'page-b'
    ], // 侧边栏
    sidebar: 'auto', // 自动生成
    search: false, // 搜索
    searchMaxSuggestions: 10, // 搜索最大值
    lastUpdated: 'Last Updated', // 最后更新时间
    nextLinks: false, // 上一篇链接
    prevLinks: false, // 下一篇链接
    repo: 'vuejs/vuepress', // 假定是Github, 同时也可以是一个完整的gitlab url
    repoLabel: '查看源码', // 自定义仓库链接文字
    docsRepo: 'vuejs/vuepress', // 假如你的文档和项目不再一个仓库
    docsDir: 'docs', // 你的文件路径，也许不在根目录下
    docsBranch: 'master', // 分支
    editLinks: true, // 默认false
    editLinkText: '编辑的文字',
    smoothScroll: true, // 页面滚动效果
  }
}
```

## 样式预设

[参考链接]: https://vuepress.vuejs.org/zh/config/#index-styl

### palette.styl

默认样式预设的替换，你可以新建一个`.vuepress/styles/palette.styl` 文件，调整一些颜色变量

```stylus
// 颜色
$accentColor = #3eaf7c
$textColor = #2c3e50
$borderColor = #eaecef
$codeBgColor = #282c34
$arrowBgColor = #ccc
$badgeTipColor = #42b983
$badgeWarningColor = darken(#ffe564, 35%)
$badgeErrorColor = #DA5961

// 布局
$navbarHeight = 3.6rem
$sidebarWidth = 20rem
$contentWidth = 740px
$homePageWidth = 960px

// 响应式变化点
$MQNarrow = 959px
$MQMobile = 719px
$MQMobileNarrow = 419px
```

### index.styl

可以创建一个 `.vuepress/styles/index.styl` 文件。这是一个 [Stylus (opens new window)](http://stylus-lang.com/)文件，但你也可以使用正常的 CSS 语法。

```stylus
.content {
  font-size 30px
}
```

## Front Matter

[参考链接]: https://vuepress.vuejs.org/zh/guide/frontmatter.html#%E5%85%B6%E4%BB%96%E6%A0%BC%E5%BC%8F%E7%9A%84-front-matter



### 预定义变量

```yml
---
title: '标题'
lang: 'en-US'
description: '描述'
layout: '布局组件'
permalink: ''
metaTitle: 'mata的title'
meta: 
  - name: xxx
    content: hello
  - name: aaa
    content: ax
---
```

### 主题预定义变量

```yaml
---
navbar: false // 禁用导航栏
sidebar: 'auto' // 侧边栏配置
prev: '' // 上下文章链接
next: '' // 上下文章链接
search: true // 内置搜索
tags: undefind // 标签
---
```

