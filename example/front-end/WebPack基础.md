---
title: WebPack基础
date: 2020-06-09
categories:
 - 前端
tags:
 - webpack
---

## compression-webpack-plugin（GZIP压缩）

安装：

```shell
npm install compression-webpack-plugin --save-dev
```

常见压缩配置：

```js
new CompressionWebpackPlugin({
	filename: '[path].gz[query]',
	algorithm: 'gzip',
	test: ['js', 'css'],
	threshold: 10240,
	minRatio: 0.8
})
```

重点参数讲解：

| 参数名               | 类型                                  | 默认值           | 说明                                                         |
| -------------------- | ------------------------------------- | ---------------- | ------------------------------------------------------------ |
| test                 | String、RegExp、Array<String、RegExp> | -                | 匹配即将压缩的文件                                           |
| algorithm            | String、Function                      | gzip             | 压缩算法                                                     |
| filename             | String、Function                      | [path].gz[query] | 目标资源名称。`[file]` 会被替换成原资源。`[path]` 会被替换成原资源路径，`[query]` 替换成原查询字符串，`[dir]`被替换为原始资产的目录，`[name]`被替换为原始资产的文件名。 `[ext]`替换为原始资产的扩展名 |
| threshold            | Number                                | 0                | 只处理比这个值大的资源。按字节计算                           |
| minRatio             | Number                                | 0.8              | 只有压缩率比这个值小的资源才会被处理                         |
| deleteOriginalAssets | Boolean                               | false            | 是否删除原资源                                               |

参数说明传送门，看对应版本的参数可能不一样：[GitHub](https://github.com/webpack-contrib/compression-webpack-plugin)



## uglifyjs-webpack-plugin（JS压缩）

安装：

```shell
npm install uglifyjs-webpack-plugin --save-dev
```

常见压缩配置：

```js
new UglifyJsPlugin({
	uglifyOptions: {
		compress: {
			drop_console: true, // 删除所有console.*，可以增加限制条件pure_funcs
			drop_debugger: true, // 删除debugger
			pure_funcs: ['console.log'] //移除console
		},
		mangle: false,
		output: {
			beautify: true,//压缩注释 是否实际美化输出
		}
	},
	sourceMap: false,
	parallel: true,
})
```

重点参数讲解：

| 参数名          | 类型                                                         | 默认值 | 说明                       |
| --------------- | ------------------------------------------------------------ | ------ | -------------------------- |
| sourceMap       | Boolean                                                      | false  | 是否开启souceMap           |
| parallel        | Boolean、Number                                              | false  | 多线程压缩                 |
| test            | String、RegExp、Array<String、RegExp>                        | -      | 匹配即将压缩的文件         |
| include         | String、RegExp、Array<String、RegExp>                        | -      | 要包含的文件               |
| exclude         | String、RegExp、Array<String、RegExp>                        | -      | 不包含的文件               |
| uglifyOptions   | Object                                                       | 看官网 | uglifyJs minify 参数       |
| extractComments | Boolean、String、RegExp、Function<(node, comment) -> Boolean、Object> | false  | 是否将注释提取到单独的文件 |

其他参数参考：[GitHub](https://github.com/webpack-contrib/uglifyjs-webpack-plugin)

UglifyJs minify传送门：[GitHub](https://github.com/mishoo/UglifyJS2#minify-options)