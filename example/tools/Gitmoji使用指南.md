---
title: Git Emoji使用指南
date: 2020-09-03
categories:
 - 工具类
tags:
 - Git
---

大家平时提交代码是不是这样的？

![image-20200312144105727](/gitemoji/image-20200312144105727.png)

到头来想做个`changeLog`或者追溯问题都麻烦，这里推荐一款`git`提交代码规范，使用了之后你的提交记录就会变成这样，想区分`bug`或者其他更新一眼就能找到。

![image-20200312144613249](/gitemoji/image-20200312144613249.png)

那么他的集成是什么样的呢？其实`Git`默认支持了他的使用，而我们只需要按照规范书写提交信息即可：

官网：https://gitmoji.carloscuesta.me/

## 常用：

:bug:`:bug:`修复bug

:sparkles:`:sparkles:`新功能

:recycle:`:recycle:`重构

:tada:`:tada:`初始化项目

:ambulance:`:ambulance:`紧急修复

:pencil:`:pencil:`文档撰写

:fire:`:fire:`删除代码

其他的类似还有升级依赖关系、添加CI构建系统等图标，具体参考网址内说明。

此外：

要从命令行使用`gitmojis`，请安装[gitmoji-cli](https://github.com/carloscuesta/gitmoji-cli)。`gitmoji`交互式客户端，用于在提交消息上使用表情符号。

```powershell
npm i -g gitmoji-cli
```

## 全部：

| 写法                        | 说明                               |
| --------------------------- | ---------------------------------- |
| :art:`:art:`                | 改进代码的结构/格式                |
| :zap:`:zap:`                | 提高性能                           |
| :fire:`:fire:`​              | 删除代码或文件                     |
| :bug:`:bug:`​                | 修复错误                           |
| :ambulance:`:ambulance:`    | 关键修补程序                       |
| :sparkles:`:sparkles:`      | 引入新功能                         |
| :pencil:`:pencil`:          | 编写文档                           |
| :rocket:`:rocket:`          | 部署东西                           |
| :lipstick:`:lipstick:`                  | 添加或更新UI和样式文件             |
| :tada:`:tada:`                      | 开始一个项目                       |
| :white_check_mark:`:white_check_mark:`          | 添加或更新测试                     |
| :lock:`:lock:`                      | 解决安全问题                       |
| :bookmark:`:bookmark:`                  | 发布/版本标签                      |
| :rotating_light:`:rotating_light:`            | 删除棉绒警告                       |
| :construction:`:construction:`              | 工作正在进行中                     |
| :green_heart:`:green_heart:`               | 修复CI构建                         |
| :arrow_down:`:arrow_down:`                | 降级依赖性                         |
| :arrow_up:`:arrow_up:`                  | 升级依赖关系                       |
| :pushpin:`:pushpin:`                   | 将依赖项固定到特定版本             |
| :construction_worker:`:construction_worker:`       | 添加或更新CI构建系统               |
| :chart_with_upwards_trend:`:chart_with_upwards_trend:`  | 添加或更新分析或跟踪代码           |
| :recycle:`:recycle:`                   | 重构代码                           |
| :heavy_plus_sign:`:heavy_plus_sign:`           | 添加依赖项                         |
| :heavy_minus_sign:`:heavy_minus_sign:`          | 删除依赖项                         |
| :wrench:`:wrench:`                    | 添加或更新配置文件                 |
| :hammer:`:hammer:`                    | 添加或更新构建脚本                 |
| :globe_with_meridians:`:globe_with_meridians:`      | 国际化和本地化                     |
| :pencil2:`:pencil2:`                   | 修正错别字                         |
| :poop:`:poop:`                      | 编写需要改进的错误代码             |
| :rewind:`:rewind:`                    | 还原更改                           |
| :twisted_rightwards_arrows:`:twisted_rightwards_arrows:` | 合并分支                           |
| :package:`:package:`                   | 添加或更新编译的文件或包           |
| :alien:`:alien:`                     | 由于外部API的更改而更新了代码      |
| :truck:`:truck:`                     | 移动或重命名文件                   |
| :page_facing_up:`:page_facing_up:`            | 添加或更新许可证                   |
| :boom:`:boom:`                      | 介绍重大变化                       |
| :bento:`:bento:`                     | 添加或更新资产                     |
| :wheelchair:`:wheelchair:`                | 改善可访问性                       |
| :bulb:`:bulb:`                      | 在源代码中添加或更新注释           |
| :beers:`:beers:`                     | 醉酒地编写代码                     |
| :speech_balloon:`:speech_balloon:`            | 添加或更新文本和文字               |
| :card_file_box:`:card_file_box:`             | 执行数据库相关的更改               |
| :loud_sound:`:loud_sound:`                | 添加或更新日志                     |
| :mute:`:mute:`                      | 删除日志                           |
| :busts_in_silhouette:`:busts_in_silhouette:`       | 添加或更新贡献者                   |
| :children_crossing:`:children_crossing:`         | 改善用户体验/可用性                |
| :building_construction:`:building_construction:`     | 进行架构更改                       |
| :iphone:`:iphone:`                    | 致力于响应式设计                   |
| :clown_face:`:clown_face:`                | 嘲笑的东西                         |
| :egg:`:egg:`                       | 添加或更新复活节彩蛋               |
| :see_no_evil:`:see_no_evil:`               | 添加或更新.gitignore文件           |
| :camera_flash:`:camera_flash:`              | 添加或更新快照                     |
| :alembic:`:alembic:`                   | 尝试新事物                         |
| :mag:`:mag:`                       | 改善SEO                            |
| :label:`:label:`                     | 添加或更新类型（Flow，TypeScript） |
| :seedling:`:seedling:`                  | 添加或更新种子文件                 |
| :triangular_flag_on_post:`:triangular_flag_on_post:`   | 添加，更新或删除功能标志           |
| :goal_net:`:goal_net:`                  | 捕捉错误                           |
| :dizzy:`:dizzy:`                     | 添加或更新动画和过渡               |
| :wastebasket:`:wastebasket:`               | 不赞成使用的代码需要清理           |
