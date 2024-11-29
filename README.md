<h1 align="center">MapGIS Pan-Spatial Map</h1>

<div align="center">
MapGIS全空间一张图（MapGIS Pan-Spatial Map）是以全空间信息模型为基础，实现空中、地表、地上以及地下数据的二三维一体化管理、综合展示以及专业应用，为全行业一张图开发提供支撑框架。
</div>

## 线上文档

[文档](https://mapgis.github.io/mapgis-pan-spatial-map-docs/zh)

## 特性

- 🐒 **工程**：开箱即用的工程配置，支持 ES6+、TypeScript、样式方案（Less）等
- 🐌 **插件体系**：提供插件机制，可以扩展框架的核心功能
- 🐘 **TypeScript**：默认使用 TypeScript

## 目录结构

```text
|-- public						# public静态资源
|-- src				
|   |-- api						# api接口
|   |-- assets					# 静态资源
|   |-- components				# 公用组件
|   |-- config					# 配置信息
|   |-- core					# 核心依赖
|   |-- layouts					# layout组件
|   |-- locales					# 语言设置
|   |-- qiankun					# 微应用
|   |-- router					# 路由
|   |-- shared					# 微应用状态管理
|   |-- store					# vuex
|   |-- theme					# 样式文件
|   |-- utils					# 工具方法
|   |-- views					# 项目代码
|   |-- App.vue					# 项目入口文件
|   |-- global.less				# 全局样式
|   |-- main.js					# 项目入口文件
|   |-- permission.js			# 路由守卫
|-- README.md					# readme文档
|-- babel.config.js				# babel配置
|-- jest.config.js				# jest配置
|-- jsconfig.json				# js配置
|-- package.json				# npm脚本和依赖项
|-- tsconfig.json				# ts配置
|-- vue.config.js				# 项目配置文件
```

## 地址

- **主库**: https://github.com/MapGIS/MapGIS-Pan-Spatial-Map
- **码云**: https://gitee.com/osmapgis/MapGIS-Pan-Spatial-Map

## 开始

### 安装依赖

```bash
yarn install
```

### 运行项目（开发）

```bash
# develop
yarn dev
```

### 打包项目

```bash
yarn build:backend
```

### 运行项目（正式）

```bash
# start an server on App's distributables
yarn serve
```

## 在线服务

[问答社区-云听](http://www.smaryun.com/cloudlisten/index.php)

## 在线资源

[MapGIS-Pan-Spatial-Map](http://www.smaryun.com/dev/resource_center.html#/type27/tag204/page1)
