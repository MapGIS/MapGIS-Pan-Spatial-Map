<h1 align="center">MapGIS Pan-Spatial Map</h1>

<div align="center">
全空间一张图框架，提供基于 Vue 框架的定制度更高的全新一张图应用开发框架，实现全空间应用功能的组件化，增强产品的用户体验，提高功能的可复用性，能更好地支撑各事业部跨平台 Web 产品研发。
</div>

## 特性

- 🐒 **工程**：开箱即用的工程配置，支持 ES6+、TypeScript、样式方案（Sass）等
- 🐌 **插件体系**：提供插件机制，可以扩展框架的核心功能
- 🐘 **TypeScript**：默认使用 TypeScript

## 目录结构

```text
|── packages
   |── pan-spatial-map-framework              # 框架应用
   |── pan-spatial-map-mock-server            # mock
   |── pan-spatial-map-plugin-auth            # 授权插件
   |── pan-spatial-map-plugin-layout          # 布局插件
   |── pan-spatial-map-plugin-layout-ui       # 布局插件UI
   |── pan-spatial-map-plugin-theme           # 主题插件
   |── pan-spatial-map-plugin-workspace       # 工作空间插件
   |── pan-spatial-map-plugin-workspace-ui    # 工作空间插件UI
   |── pan-spatial-map-store                  # 全局上下文环境&存储结构
|── .editorconfig                             # editor配置
├── .eslintignore                             # ESlint忽略路径
├── .eslintrc.js                              # ESlint配置
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

### 运行项目

```bash
# develop
yarn dev
# mock & develop
yarn serve
```

### 打包项目

```bash
yarn build
```

### 安装插件（开发扩展中）

```bash
# 安装所有插件
yarn invoke
# 安装指定插件
yarn invoke-xxx
```

## 在线服务

[问答社区-云听](http://www.smaryun.com/cloudlisten/index.php)

## 在线资源

[MapGIS-Pan-Spatial-Map](http://www.smaryun.com/dev/resource_center.html#/type27/tag204/page1)
