<template>
  <!-- <mp-app-loader v-if="themeLoaded" :application="application" /> -->
  <mapgis-ui-spin :spinning="hasReload" tip="加载中..." class="app-builder-load">
    <mp-app-builder1
      v-if="themeLoaded"
      :appConfig="application"
      :previewData="previewData"
      :dataCatalogData="dataCatalogData"
      :isManagerBuild="isManagerBuild"
      :isManagerFullScreenBuild="isManagerFullScreenBuild"
      :appLoaderBackgroud="appLoaderBackgroud"
      @theme-style-change="themeStyleChange"
      @theme-change="themeChange"
      @app-builder-info-improt="appBuilderInfoImprot"
  /></mapgis-ui-spin>
</template>

<script>
import { AppManager, MapRender, baseConfigInstance, loadConfigs, api, WidgetState } from '@mapgis/web-app-framework'
import request from '@/utils/request'
import mapgisui from '@mapgis/webclient-vue-ui'
import storage from 'store'

export default {
  data() {
    return {
      application: {},
      themeLoaded: false,
      appBuilderPreviewId: '', // 从云门户进入时的预览id
      portalPath: '', // 云门户地址
      previewData: null,
      hasReload: true, // 是否需要重新显示spin效果
      isManagerBuild: false, // 是否管理平台链接引入
      isManagerFullScreenBuild: false, // 是否管理平台链接引入并且全屏
      isPortalPreview: false,
      appLoaderBackgroud: '',
      dataCatalogData: null // 左侧数据目录树（非微件）
    }
  },
  watch: {
    '$route.query': {
      immediate: true,
      handler(val) {
        this.appBuilderPreviewId = val.appId
        this.portalPath = val.portalPath
        if (val.token) {
          storage.set('app_builder_token', val.token)
        } else {
          console.warn('未获取到云门户用户token，云门户接口无法调用！！！')
          // 如果此时localStorage中门户的token依然存在则清除
          if (storage.get('app_builder_token')) {
            storage.remove('app_builder_token')
          }
        }

        if (val.portalPath || this.portalPath) {
          api.setAppBuilderRequestInstance(this.portalPath)
        } else {
          console.warn('未获取到云门户地址，云门户接口无法调用！！！')
        }

        if (val.action) {
          switch (val.action) {
            // 管理平台通过链接的方式引入应用搭建
            case 'manager-build':
              this.isManagerBuild = true
              break
            // 通过门户进入应用搭建预览
            case 'portal-preview':
              this.isPortalPreview = true
              break
            // 通过门户进入应用搭建编辑
            case 'portal-edit':
            default:
              break
          }
        }

        if (val.mode) {
          switch (val.mode) {
            // 管理平台通过链接的方式引入应用搭建
            case 'manager-full-screen':
              this.isManagerFullScreenBuild = true
              break
            default:
              break
          }
        }
      }
    }
  },
  computed: {},
  async created() {
    const isDefaultAppProductName = window._CONFIG.productName === 'psmap'
    const publicPath = isDefaultAppProductName
      ? process.env.VUE_APP_CONTEXT_PATH
      : process.env.VUE_APP_CONTEXT_PATH.replace('psmap', window._CONFIG.productName)
    await AppManager.getInstance().loadConfig(
      window._CONFIG['domainURL'],
      `${window._CONFIG['apiPathServicesPrefix']}/system/AppResourceServer/app/config`,
      `${window._CONFIG['apiPathServicesPrefix']}/system/AppResourceServer/`,
      request,
      publicPath
    )
    await loadConfigs()

    // 获取微件信息
    const widgets = await api.getWidgetList()
    if (!this.appBuilderPreviewId) {
      this.application = AppManager.getInstance().getApplication()
      // 获取云门户应用搭建配置信息
      const baseConfigData = await api.getPortalAppBuilderConfig()
      if (baseConfigData && baseConfigData.length) {
        const portalBaseConfig = {}
        baseConfigData.forEach(config => {
          Object.assign(portalBaseConfig, JSON.parse(config.configValue))
        })
        portalBaseConfig.portalPath = this.portalPath
        Object.assign(this.application.baseConfig, portalBaseConfig)
        Object.assign(baseConfigInstance.config, portalBaseConfig)
      }

      const treeData = await api.getTreeData()

      // 初始化进入应用搭建时置空数据目录
      // 在一张图中打开时不做此操作
      // 在应用搭建预览（非云门户预览）时不做此操作
      if (!this.isManagerBuild) {
        this.application.data = []
        // 重置数据目录的数据
        treeData.data[0].children.splice(0)
        const initTreeData = treeData.data
        this.dataCatalogData = initTreeData
      } else {
        this.dataCatalogData = treeData.data
      }

      /**
       * 修改说明：退出登录，再次进入地图视图界面，这里需要初始化maprender的值
       * 修改人：龚跃健
       * 修改时间：2022/3/25
       */
      const initMode =
        baseConfigInstance.config && baseConfigInstance.config.initMode ? baseConfigInstance.config.initMode : undefined
      if (!initMode || initMode === 'map') {
        this.application.document.maprender = MapRender.MAPBOXGL
      } else if (initMode === 'globe') {
        this.application.document.maprender = MapRender.CESIUM
      }
    } else {
      const config = await api.getAppBuilderConfigById(this.appBuilderPreviewId)
      const content = JSON.parse(config.content)
      const { baseConfig, catalogTreeData } = content
      // 更新门户地址
      baseConfig.portalPath = this.portalPath
      // 直接使用保存数据中的数据目录信息
      if (catalogTreeData && catalogTreeData.length > 0) {
        this.updateCatalogTreeData(catalogTreeData)
        this.dataCatalogData = catalogTreeData
        delete content.catalogTreeData
      } else {
        this.dataCatalogData = this.getInitCatalogTree()
      }
      // content中的data记录了初始化时的数据目录微件数据
      this.application = content
      // 删除大对象
      delete config.content
      this.previewData = config
      // 合并基础配置
      Object.assign(baseConfigInstance.config, baseConfig)
      // this.application.baseConfig.initMode = this.application.document.maprender
      // baseConfigInstance.config.initMode = this.application.document.maprender
      // 构造document对象
      const initMode =
        baseConfigInstance.config && baseConfigInstance.config.initMode ? baseConfigInstance.config.initMode : undefined
      if (!initMode || initMode === 'map') {
        this.application.document = AppManager.getInstance().generateDocument(MapRender.MAPBOXGL)
      } else if (initMode === 'globe') {
        this.application.document = AppManager.getInstance().generateDocument(MapRender.CESIUM)
      }
    }

    // 1.处理widgetStructure,默认带上未分组，方便应用搭建后续处理 2.处理不存在的微件，将不存在的微件移除
    this.formatContentWidgetStructure(widgets)
    this.formatMapWidgets(widgets)

    // 更新云门户服务的token信息、组装服务全路径，保证服务能够正常访问
    this.updatePortalDataCatolog()

    // 设置应用搭建中app-loader区域的背景图地址
    this.appLoaderBackgroud = `${publicPath}appBuilder/app-loader-bg.png`

    // 门户预览直接跳转到一张图路由
    if (this.isPortalPreview) {
      // 添加预览标识
      this.application.preview = true
      localStorage.setItem('appConfig', JSON.stringify(this.application))
      const appBuilderPreviewData = {
        type: 'app-builder-portal-preview',
        appBuilderPreviewUrl: `${window.location.origin}/${window._CONFIG['productName']}/web`
      }
      window.top.postMessage(appBuilderPreviewData, '*')
      return
    }

    const style = this.themeStyle()
    const opacity = this.themeOpacity()
    const payload = {
      opacity: opacity,
      primaryColor: style.color
    }
    mapgisui.setTheme(style.theme, payload)
    this.themeLoaded = true
    this.hasReload = false
  },
  methods: {
    appBuilderInfoImprot(appConfig) {
      this.themeLoaded = false
      this.hasReload = true
      const { baseConfig } = appConfig
      this.application = appConfig
      this.application.document = AppManager.getInstance().generateDocument(this.application.document.maprender)
      Object.assign(baseConfigInstance.config, baseConfig)
      this.$nextTick(() => {
        this.themeLoaded = true
      })
      setTimeout(() => {
        this.hasReload = false
      }, 2000)
    },
    async themeChange(appConfig) {
      this.hasReload = true
      this.themeLoaded = false
      const maprender = appConfig.document.maprender
      delete appConfig.document
      // 先设置成二维模式再设置appConfig
      this.application.document.maprender = MapRender.MAPBOXGL
      this.application = Object.assign(this.application, appConfig)
      // 清除defaultMap
      this.application.document.defaultMap.removeAll()
      // 清除baseLayerMap
      this.application.document.baseLayerMap.removeAll()
      // 获取微件信息
      const widgets = await api.getWidgetList()
      this.formatContentWidgetStructure(widgets)
      this.formatMapWidgets()
      this.$nextTick(() => {
        this.themeLoaded = true
      })
      setTimeout(() => {
        this.application.document.maprender = maprender
        this.hasReload = false
      }, 2000)
    },
    themeStyleChange(themeStyle) {
      mapgisui.setTheme(themeStyle.theme, themeStyle)
    },
    themeStyle() {
      if (this.application.theme) {
        if (this.application.theme.style) {
          if (this.application.theme.manifest) {
            const style = this.application.theme.manifest.styles.find(item => {
              return item.name === this.application.theme.style
            })

            if (style) {
              return {
                color: style.color,
                theme: style.theme
              }
            }
          }
        } else if (this.application.theme.customStyle) {
          return this.application.theme.customStyle
        }
      }
      return { theme: 'dark', color: '#1890ff' }
    },
    themeOpacity() {
      if (this.application.theme) {
        return this.application.theme.opacity || 1
      }
      return 1
    },
    // 处理内容微件
    formatContentWidgetStructure(allWidgets) {
      const {
        contentWidgets: { groups }
      } = this.application
      groups.forEach(item => {
        let { widgetStructure, widgets } = item
        // 将微件的状态置为关闭
        widgets.forEach(widget => {
          widget.state = WidgetState.CLOSED
        })

        const widgetInFolderArr = []
        if (widgetStructure && widgetStructure.length >= 0) {
          // 兼容数据，对没有未分组的contentWidgets构造未分组
          const hasUnGroup = widgetStructure.find(group => !group.id)

          // 获取当前不存在的配置微件
          const invalidWidgets = widgets
            .filter(widget => {
              // 已被标记为无效的微件
              if (widget.invalid) {
                return true
              }

              // 不在微件列表中的微件
              const strs = widget.uri.split('/')
              const widgetName = strs[strs.length - 1]
              const targetWidget = allWidgets.rows.find(widget => widget.widgetName === widgetName)
              if (!targetWidget) {
                return true
              }
            })
            .map(widget => {
              return widget.id
            })

          // 处理widgetStructure中存在的无效微件
          widgetStructure.forEach(item => {
            // 处理分组
            if (item.type === 'folder' || item.children) {
              item.children.forEach(child => {
                const widget = widgets.find(widget => widget.id === child.id)
                // 如果在当前widgetStructure对应的widgets中不存在该微件，则表明该微件已删除
                if (!widget) {
                  invalidWidgets.push(child.id)
                }
              })
            } else {
              const widget = widgets.find(widget => widget.id === item.id)
              if (!widget) {
                invalidWidgets.push(item.id)
              }
            }
          })

          if (!hasUnGroup) {
            const children = []
            widgetStructure.forEach(item => {
              if (item.id && item.type !== 'folder') {
                children.push(item)
              }

              // 记录未分组中的所有微件
              if (item.id && item.type === 'folder') {
                const childrenArr = item.children
                childrenArr.forEach(widget => {
                  widgetInFolderArr.push(widget.id)
                })
              }
            })
            // 有的数据结构有问题 widgetStructure中无数据，但是widgets中有数据
            widgets.forEach((item, index) => {
              if (!widgetInFolderArr.includes(item.id) && !children.find(widget => widget.id === item.id)) {
                // 往widgetStructure前面放
                widgetStructure.splice(index, 1, { id: item.id })
                children.push({ id: item.id })
              }
            })

            // 将未分组放到所有分组之前
            const unGroupFolderIndex = widgetStructure.findIndex(item => item.type === 'folder')
            if (unGroupFolderIndex > -1) {
              widgetStructure.splice(unGroupFolderIndex, 0, { label: '未分组', children: children })
            } else {
              widgetStructure.push({ label: '未分组', children: children })
            }
          }

          if (invalidWidgets.length > 0) {
            // 删除widgets中不存在的配置微件
            widgets = widgets.filter(widget => !invalidWidgets.includes(widget.id))
            // 删除widgetStructure中不存在的配置微件
            widgetStructure = widgetStructure.filter(structure => {
              if (structure.children) {
                structure.children = structure.children.filter(widget => !invalidWidgets.includes(widget.id))
                return true
              }

              if (!invalidWidgets.includes(structure.id)) {
                return true
              }
            })
            item.widgets = widgets
            item.widgetStructure = widgetStructure
          }
        }
      })
    },
    // 处理地图微件
    formatMapWidgets(allWidgets) {
      const { mapWidgets } = this.application
      mapWidgets.widgets = mapWidgets.widgets.filter(widget => {
        // 未被标记为无效的微件
        if (!widget.invalid) {
          return true
        }
        // 在微件列表中的微件
        const strs = widget.uri.split('/')
        const widgetName = strs[strs.length - 1]
        const targetWidget = allWidgets.rows.find(widget => widget.widgetName === widgetName)
        if (targetWidget) {
          return true
        }
      })
      // 设置微件状态
      mapWidgets.widgets.forEach(widget => {
        widget.state = WidgetState.CLOSED
      })
    },
    async updateTreeData() {
      const dataCatalogData = await api.getTreeData()
      const updateData = dataCatalogData.data[0]
      updateData.children = []
      this.application.data = updateData
      await api.updateTreeData({ dataList: [updateData] })
    },
    // 定义初始化时的数据目录树
    getInitCatalogTree() {
      return [
        {
          createBy: '',
          createTime: null,
          updateBy: 'admin',
          updateTime: '',
          remark: '',
          dataId: 100,
          dataName: 'root',
          parentId: 0,
          ancestors: '0',
          orderNum: 1024,
          description: '',
          dataType: 0,
          properties: null,
          layerProperties: null,
          extendedProperties: null,
          children: []
        }
      ]
    },
    // 更新门户数据资源的token信息
    updatePortalDataCatolog() {
      const { data } = this.application
      const portalToken = storage.get('app_builder_token')

      // 更新数据目录来自门户服务的token信息
      const tokenInfo = portalToken
        ? {
            tokenKey: 'Authorization',
            tokenValue: 'Bearer ' + portalToken
          }
        : null
      if (data && data.length) {
        data.forEach(item => {
          this.updateNodeInfo(item, tokenInfo)
        })
      }
    },
    updateNodeInfo(dataNode, tokenInfo) {
      if (dataNode.children && dataNode.children.length) {
        dataNode.children.forEach(item => {
          this.updateNodeInfo(item, tokenInfo)
        })
      } else {
        let serviceSource = dataNode.extend?.serviceSource

        /**
         * 修正数据目录微件中的目录树错误数据,通过数据目录的导入接口返回的数据错误，serviceSource的值会变成 '\'fromCloudPortal'\'，保存后会有问题，为了能够正常解析保存错误的数据，此处进行修正
         */
        if (serviceSource) {
          if (serviceSource === 'fromCloudPortal' || serviceSource.includes('fromCloudPortal')) {
            serviceSource = 'fromCloudPortal'
            // 修正错误数据
            dataNode.extend.serviceSource = 'fromCloudPortal'
          } else {
            dataNode.extend.serviceSource = 'fromOther'
          }
        }
        // 来自门户的服务更新token信息
        if (serviceSource === 'fromCloudPortal') {
          // 有token信息则更新token，没有则置空节点token信息
          if (tokenInfo) {
            dataNode.tokenKey = tokenInfo.tokenKey
            dataNode.token = tokenInfo.tokenValue
          } else {
            dataNode.tokenKey = ''
            dataNode.token = ''
          }

          // 处理门户地址
          if (dataNode.serverUrl) {
            // 判断是否为完整路径
            let isFullPath
            let urlInfo
            try {
              urlInfo = new URL(dataNode.serverUrl)
              isFullPath = true
            } catch (error) {}

            if (dataNode.serverUrl.startsWith('/')) {
              // 组装完整的url路径
              dataNode.serverUrl = decodeURIComponent(this.portalPath + dataNode.serverUrl)
            } else if (isFullPath) {
              // 全路径进行域名替换
              dataNode.serverUrl = decodeURIComponent(dataNode.serverUrl.replace(urlInfo.origin, this.portalPath))
            }
          }
        }
      }
    },
    updateCatalogTreeData(data) {
      const portalToken = storage.get('app_builder_token')
      const tokenInfo = portalToken
        ? {
            tokenKey: 'Authorization',
            tokenValue: 'Bearer ' + portalToken
          }
        : null
      if (data && data.length) {
        data.forEach(item => {
          this.updateTreeNodeInfo(item, tokenInfo)
        })
      }
    },
    updateTreeNodeInfo(dataNode, tokenInfo) {
      if (dataNode.children && dataNode.children.length) {
        dataNode.children.forEach(item => {
          this.updateTreeNodeInfo(item, tokenInfo)
        })
      } else {
        let serviceSource
        if (dataNode.extendedProperties) {
          const extendedProperties = JSON.parse(dataNode.extendedProperties)
          serviceSource = extendedProperties?.serviceSource
          /**
           * 修正应用搭建左侧非微件数据目录错误数据,通过数据目录的导入接口返回的数据错误，serviceSource的值会变成 '\'fromCloudPortal'\'，保存后会有问题，为了能够正常解析保存错误的数据，此处进行修正
           */
          if (serviceSource) {
            if (serviceSource === 'fromCloudPortal' || serviceSource.includes('fromCloudPortal')) {
              if (serviceSource !== 'fromCloudPortal') {
                // 修正错误数据
                extendedProperties.serviceSource = 'fromCloudPortal'
              }
              serviceSource = 'fromCloudPortal'
            } else {
              extendedProperties.serviceSource = 'fromOther'
            }
            dataNode.extendedProperties = JSON.stringify(extendedProperties)
          }
        }
        // 左侧目录树设置token信息，补全服务url
        if (serviceSource === 'fromCloudPortal') {
          const properties = JSON.parse(dataNode.properties)

          // 有token信息则更新token，没有则置空节点token信息
          if (tokenInfo) {
            properties.tokenKey = tokenInfo.tokenKey
            properties.token = tokenInfo.tokenValue
          } else {
            properties.tokenKey = ''
            properties.token = ''
          }

          // 处理门户地址
          if (properties.serverUrl) {
            // 判断是否为完整路径
            let isFullPath
            let urlInfo
            try {
              urlInfo = new URL(properties.serverUrl)
              isFullPath = true
            } catch (error) {}
            if (properties.serverUrl.startsWith('/')) {
              // 组装完整的url路径
              properties.serverUrl = decodeURIComponent(this.portalPath + properties.serverUrl)
            } else if (isFullPath) {
              // 全路径进行域名替换
              properties.serverUrl = decodeURIComponent(properties.serverUrl.replace(urlInfo.origin, this.portalPath))
            }
          }
          dataNode.properties = JSON.stringify(properties)
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.app-builder-load {
  height: 100%;
  width: 100%;
}
</style>
