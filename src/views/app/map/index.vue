<template>
  <mp-app-loader v-if="themeLoaded" :application="application" />
</template>

<script>
import { AppManager, MapRender, baseConfigInstance, loadConfigs } from '@mapgis/web-app-framework'
import request from '@/utils/request'
import mapgisui from '@mapgis/webclient-vue-ui'

export default {
  data() {
    return {
      application: {},
      themeLoaded: false
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
    const appConfig = localStorage.getItem('appConfig')
    if (appConfig) {
      this.application = JSON.parse(appConfig)
      localStorage.removeItem('appConfig')
      // 更新云门户服务的token信息，保证服务能够正常访问
      this.updatePortalDataCatologTokenInfo()
      this.application.document = AppManager.getInstance().generateDocument(this.application.document.maprender)
    } else {
      this.application = AppManager.getInstance().getApplication()
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
    themeChange(themeStyle) {
      mapgisui.setTheme(themeStyle.theme, { primaryColor: themeStyle.color })
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
    // 更新门户数据资源的token信息
    updatePortalDataCatologTokenInfo() {
      const { data } = this.application
      const portalToken = localStorage.getItem('app_builder_token')
      const tokenInfo = {
        tokenKey: 'Authorization',
        tokenValue: 'Bearer ' + JSON.parse(portalToken)
      }
      if (data && data.length) {
        data.forEach(item => {
          this.updateTokenInfo(item, tokenInfo)
        })
      }
    },
    updateTokenInfo(dataNode, tokenInfo) {
      if (dataNode.children && dataNode.children) {
        dataNode.children.forEach(item => {
          this.updateTokenInfo(item, tokenInfo)
        })
      } else {
        const serviceSource = dataNode.extend?.serviceSource
        // 来自门户的服务更新token信息
        if (serviceSource === 'fromCloudPortal') {
          dataNode.tokenKey = tokenInfo.tokenKey
          dataNode.token = tokenInfo.tokenValue
        }
      }
    }
  }
}
</script>

<style lang="scss"></style>
