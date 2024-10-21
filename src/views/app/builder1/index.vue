<template>
  <!-- <mp-app-loader v-if="themeLoaded" :application="application" /> -->
  <mp-app-builder1
    v-if="themeLoaded"
    :appConfig="application"
    :previewData="previewData"
    @theme-change="themeChange"
    @app-builder-info-improt="appBuilderInfoImprot"
  />
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
      previewData: null
    }
  },
  watch: {
    '$route.query': {
      immediate: true,
      handler(val) {
        this.appBuilderPreviewId = val.appId
        this.portalPath = val.portalPath || 'http://192.168.11.172:6260'
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
      const baseConfigData = await api.getPortalAppBuilderConfig()
      const {
        data: { configValue }
      } = baseConfigData
      const baseConfig = JSON.parse(configValue)
      Object.assign(this.application.baseConfig, baseConfig)
      Object.assign(baseConfigInstance.config, baseConfig)
      this.application.portalPath = this.portalPath

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
      // 构造document对象
      this.application.document = AppManager.getInstance().generateDocument(this.application.document.maprender)
    }

    const style = this.themeStyle()
    const opacity = this.themeOpacity()
    const payload = {
      opacity: opacity,
      primaryColor: style.color
    }
    mapgisui.setTheme(style.theme, payload)
    this.themeLoaded = true
  },
  methods: {
    appBuilderInfoImprot(appConfig) {
      const { baseConfig } = appConfig
      this.application = appConfig
      Object.assign(baseConfigInstance.config, baseConfig)
      this.application.document = AppManager.getInstance().generateDocument(this.application.document.maprender)
    },
    themeChange(themeStyle) {
      console.log('themeStyle--------------', themeStyle)
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
    }
  }
}
</script>

<style></style>
