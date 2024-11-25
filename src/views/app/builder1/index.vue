<template>
  <!-- <mp-app-loader v-if="themeLoaded" :application="application" /> -->
  <mapgis-ui-spin :spinning="hasReload" tip="加载中..." class="app-builder-load">
    <mp-app-builder1
      v-if="themeLoaded"
      :appConfig="application"
      :previewData="previewData"
      :isManagerBuild="isManagerBuild"
      :isManagerFullScreenBuild="isManagerFullScreenBuild"
      @theme-style-change="themeStyleChange"
      @theme-change="themeChange"
      @app-builder-info-improt="appBuilderInfoImprot"
  /></mapgis-ui-spin>
</template>

<script>
import { AppManager, MapRender, baseConfigInstance, loadConfigs, api } from '@mapgis/web-app-framework'
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
      isPortalPreview: false
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
            case 'portal-preview':
              this.isPortalPreview = true
              break
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
    if (!this.appBuilderPreviewId) {
      this.application = AppManager.getInstance().getApplication()
      // 获取云门户应用搭建配置信息
      const baseConfigData = await api.getPortalAppBuilderConfig()
      if (baseConfigData) {
        const { data } = baseConfigData
        const portalBaseConfig = {}
        Object.keys(data).forEach(item => {
          const config = data[item]
          Object.assign(portalBaseConfig, JSON.parse(config.configValue))
        })
        portalBaseConfig.portalPath = this.portalPath
        Object.assign(this.application.baseConfig, portalBaseConfig)
        Object.assign(baseConfigInstance.config, portalBaseConfig)
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
      const { baseConfig } = content
      this.application = content
      // 删除大对象
      delete config.content
      this.previewData = config
      // 合并基础配置
      Object.assign(baseConfigInstance.config, baseConfig)
      baseConfigInstance.config.initMode = this.application.document.maprender
      // 构造document对象
      this.application.document = AppManager.getInstance().generateDocument(this.application.document.maprender)
    }

    // 处理widgetStructure,默认带上未分组，方便应用搭建后续处理
    this.formatContentWidgetStructure()

    // 门户预览直接跳转到一张图路由
    if (this.isPortalPreview) {
      localStorage.setItem('appConfig', JSON.stringify(this.application))
      this.$router.push('/')
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
    themeChange(appConfig) {
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
    formatContentWidgetStructure() {
      const {
        contentWidgets: { groups }
      } = this.application
      groups.forEach(item => {
        const { widgetStructure, widgets } = item
        const widgetInFolderArr = []
        if (widgetStructure && widgetStructure.length >= 0) {
          // 兼容数据，对没有未分组的contentWidgets构造未分组
          const hasUnGroup = widgetStructure.find(group => !group.id)
          if (!hasUnGroup) {
            const children = []
            widgetStructure.forEach(item => {
              if (item.id && item.type !== 'folder') {
                children.push(item)
              }

              // 记录未分组中的所有微件
              if (item.id && item.type === 'folder') {
                const { children } = item
                children.forEach(widget => {
                  widgetInFolderArr.push(widget.id)
                })
              }
            })
            // 有的数据结构有问题 widgetStructure中无数据，但是widgets中有数据
            widgets.forEach((item, index) => {
              if (!widgetInFolderArr.includes(item.id)) {
                // 往widgetStructure前面放
                widgetStructure.splice(index, 1, { id: item.id })
                children.push({ id: item.id })
              }
            })

            widgetStructure.push({ label: '未分组', children: children })
          }
        }
      })
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
