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
|── packages
   |── pan-spatial-map-framework              # 框架应用
   |── pan-spatial-map-framework              # 门户应用
   |── pan-spatial-map-mock-server            # mock
   |── pan-spatial-map-plugin-theme           # 主题插件
   |── pan-spatial-map-plugin-workspace       # 工作空间插件
   |── pan-spatial-map-plugin-editor          # 编辑器插件
   |── pan-spatial-map-plugin-visualization   # 可视化插件
   |── pan-spatial-map-plugin-analysis        # 分析插件
   |── pan-spatial-map-common                 # 通用模块
|── .editorconfig                             # editor配置
|── .eslintignore                             # ESlint忽略路径
|── .eslintrc.js                              # ESlint配置
|── .gitignore                                # GIT忽略路径
|── .prettierrc                               # 代码格式化配置
|── package.json                              # npm脚本和依赖项
|── README.md                                 # 您的网站/应用程序的自述文件
|── tsconfig.json                             # ts配置
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
# develop with mock
yarn dev:mock
```

### 打包项目

```bash
yarn build
```

### 运行项目（正式）

```bash
# start an server on App's distributables
yarn serve
# start an server on App's distributables with mock
yarn serve:mock
```

## 在线服务

[问答社区-云听](http://www.smaryun.com/cloudlisten/index.php)

## 在线资源

[MapGIS-Pan-Spatial-Map](http://www.smaryun.com/dev/resource_center.html#/type27/tag204/page1)
