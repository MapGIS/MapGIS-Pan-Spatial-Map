<template>
  <mp-app-loader :application="application" />
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { AppManager } from '@mapgis/web-app-framework'
import {
  envInstance,
  loadEnv,
  api,
  loadConfigs
} from '@mapgis/pan-spatial-map-store'

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
    await loadEnv()

    await loadConfigs()

    const appInfo = await api.getAppInfo()

    await AppManager.getInstance().loadConfig(
      envInstance.config.baseApi,
      appInfo.configPath,
      appInfo.assetsPath
    )

    this.application = AppManager.getInstance().getApplication()

    const style = this.themeStyle()

    this.setTheme({ ...this.theme, mode: style.theme, color: style.color })

    console.log(this.application)
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
