<template>
  <mp-app-loader :application="application" />
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { AppManager } from '@mapgis/web-app-framework'
import { getAppInfo } from '@/services/user'
import { BASE_URL } from '@/services/api'
import { request } from '@/utils/request'
import mapgisui from '@mapgis/webclient-vue-ui'

export default {
  data() {
    return {
      application: {},
    }
  },
  computed: {
    ...mapState('setting', ['theme']),
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

      const style = this.themeStyle()

      this.setTheme({ ...this.theme, mode: style.theme, color: style.color })

      // 切换mapgisUI的主题
      // 一张图 light，dark 白底黑字，night 黑底白字
      if (style.theme === 'dark' || style.theme === 'light') {
        mapgisui.setTheme('light')
      } else {
        mapgisui.setTheme('dark')
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
            const style = this.application.theme.manifest.styles.find(
              (item) => {
                return item.name === this.application.theme.style
              }
            )

            if (style) {
              return {
                color: style.color,
                theme: style.theme,
              }
            }
          }
        } else if (this.application.theme.customStyle) {
          return this.application.theme.customStyle
        }
      }
      return { theme: 'dark', color: '#1890ff' }
    },
  },
}
</script>
