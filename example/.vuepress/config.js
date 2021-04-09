module.exports = {
  title: 'T·Z',
  description: '我们每个人都是独一无二的存在...',
  theme: require.resolve('../../vuepress-theme-tz'),
  port: 80,
  // configureWebpack: {
  //   "resolve": {
  //     "alias": {
  //       '@assets': '/assets'
  //     }
  //   }
  // },
  markdown: {
    lineNumbers: true
  },
  themeConfig: {
    author: 'zhengshundong',
    type: 'blog',
    authorAvatar: '/picture/avator.jpg',
    subSidebar: false,
    sidebar: true,
    // 备案
    record: '黔ICP备20000712号-1',
    recordLink: 'http://www.beian.miit.gov.cn/',
    startYear: '2019',
    search: true,
    prev: true,
    next: true,
    searchMaxSuggestions: 10,
    lastUpdated: "Last Updated",
    // mode: 'dark',
    nav: [{
        text: '主页',
        link: '/'
      },
      {
        text: '时间轴',
        link: '/timeline/',
        icon: 'reco-date'
      },
      {
        text: '留言板',
        link: '/messageBoard/',
        icon: 'reco-message'
      },
      {
        text: "关于",
        link: "/about/",
        icon: "reco-account"
      }
    ],
    friendLink: [{
      title: 'Vinsea',
      desc: 'Vinsea | 不会跳舞的前端工程师不是一个优秀的文身师',
      logo: "https://www.vinxea.com/img/logo.f663fc01.png",
      link: 'https://www.vinxea.com/'
    }],
    blogConfig: {
      category: {
        location: 2,
        text: '博客'
      },
      tag: {
        location: 3,
        text: '标签'
      }
    },
    socials: {
      "github": "https://github.com/zhengshundong01",
      "gitlub": false,
      "gitee": "https://gitee.com/zhengshundong",
      "jianshu": false,
      "zhihu": false,
      "toutiao": false,
      "juejin": false,
      "segmentfault": false,
      "csdn": false,
      "wechat": false,
      "qq": false
    },
    mottos: [{
        "zh": "凡人皆有一死, 凡人皆需侍奉。",
        "en": "Valar Morghulis, Valar Dohaeris."
      },
      {
        "zh": "一旦害怕失去，你就不再拥有。",
        "en": "The man who fears losing has already lost."
      },
      {
        "zh": "“但是”之前的话都是废话。",
        "en": "Nothing someone says beforethe word“but”really counts."
      },
      {
        "zh": "权力存于人心。信则有，不信则无。惑人的把戏，如浮影游墙。即便是矮小之人，也能投射出巨大的影子。",
        "en": "Power resides where men believe it resides. It's a trick, a shadow on the wall. And a very small man can cast a very large shadow."
      },
      {
        "zh": "与其装腔作势企图影响别人，不如咬牙切齿狠命修理自己。",
        "en": "Rather than pretending to influence others, it's better to grind your teeth and repair yourself."
      }, {
        "zh": "上天是公平的，只要努力就会有收获，否则就是你不够努力。",
        "en": "God is fair, as long as effort will include results, otherwise is you hard enough."
      },
      {
        "zh": "人生没有后悔，我们只能尽力去不让自己后悔。",
        "en": "Life without regret, we can only do our best to not to regret."
      }
    ],
    covers: [
      '/picture/2029582.jpg',
      '/picture/2009005.jpg',
      '/picture/325105.jpg',
      '/picture/2022431.jpg',
      '/picture/2039301.jpg',
      '/picture/2041075.jpg',
      '/picture/2029582.jpg',
      '/picture/1000158.jpg',
      '/picture/wallhaven-3z97yd.jpg',
      '/picture/wallhaven-76voxv.jpg',
      '/picture/wallhaven-83zy82.jpg',
      '/picture/wallhaven-j5gkgw.jpg',
      '/picture/wallhaven-oxd32l.jpg',
      '/picture/wallhaven-q66z35.jpg',
      '/picture/wallhaven-rddrw7.jpg'
    ],
    anchorType: 7,
    loadingType: 1
  },
  plugins: [
    require.resolve("../../@vuepress-tz/vuepress-plugin-autobar/lib/index.js", [
      'autobar',
      {
        setHomepage: "top"
      },
    ]),
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
          autoplay: false,
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