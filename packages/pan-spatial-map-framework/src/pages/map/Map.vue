<template>
  <mp-app-loader :application="application" />
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { AppManager, MapRender } from '@mapgis/web-app-framework'
import { getAppInfo } from '@/services/user'
import { BASE_URL } from '@/services/api'
import { request } from '@/utils/request'
import mapgisui from '@mapgis/webclient-vue-ui'
import { baseConfigInstance } from '@mapgis/pan-spatial-map-common'

export default {
  data() {
    return {
      application: {}
    }
  },
  computed: {
    ...mapState('setting', ['theme'])
  },
  async created() {
    try {
      const appInfo = await getAppInfo()
      await AppManager.getInstance().loadConfig(
        BASE_URL,
        appInfo.data.configPath,
        appInfo.data.assetsPath,
        request
      )
      this.application = AppManager.getInstance().getApplication()
      /**
       * 修改说明：退出登录，再次进入地图视图界面，这里需要初始化maprender的值
       * 修改人：龚跃健
       * 修改时间：2022/3/25
       */
      const initMode =
        baseConfigInstance.config && baseConfigInstance.config.initMode
          ? baseConfigInstance.config.initMode
          : undefined
      if (!initMode || initMode === 'map') {
        this.application.document.maprender = MapRender.MAPBOXGL
      } else if (initMode === 'globe') {
        this.application.document.maprender = MapRender.CESIUM
      }

      const style = this.themeStyle()

      this.setTheme({ ...this.theme, mode: style.theme, color: style.color })

      // 切换mapgisUI的主题
      // 一张图 light，dark 白底黑字，night 黑底白字
      if (style.theme === 'dark' || style.theme === 'light') {
        const payload = {
          background: '#fff',
          cardBackground: '#fff',
          panelBackground: "#fff",
          divShadow: "#fff",
          divBackground: "#fff",
        }
        mapgisui.setTheme('light', payload)
      } else {
        const payload = {
          background: '#141414',
          cardBackground: '#14141400',
          panelBackground: "#14141400",
          divShadow: "#14141400",
          divBackground: "#14141400",
          dataCardBackground: "#141414",
        }
        mapgisui.setTheme('dark', payload)
      }
    } catch (error) {
      this.$message.warning('认证 token 已过期，请重新登录')
      this.$router.replace('/login')
    }
  },
  methods: {
    ...mapMutations('setting', ['setTheme']),
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
    }
  }
}
</script>
