<template>
  <mp-app-builder
    v-if="initialized"
    :baseAPI="baseAPI"
    :appConfigPath="appConfigPath"
    :appAssetsPath="appAssetsPath"
    :themes="themes"
    :widgets="widgets"
    @theme-change="onThemeChange"
    @save="onSaveApp"
  />
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { getAppInfo } from '@/services/user'
import { getThemes, getWidgets, edit } from '@/services/app'
import { BASE_URL } from '@/services/api'
import mapgisui from '@mapgis/webclient-vue-ui'

export default {
  data() {
    return {
      initialized: false,
      baseAPI: '',
      appConfigPath: '',
      appAssetsPath: '',
      themes: [],
      widgets: [],
    }
  },
  computed: {
    ...mapState('setting', ['theme']),
  },
  async created() {
    try {
      // 获取应用信息
      const appInfo = await getAppInfo()

      this.baseAPI = BASE_URL
      this.appConfigPath = appInfo.data.configPath
      this.appAssetsPath = appInfo.data.assetsPath

      // 获取可用于搭建的主题和微件列表
      const themes = await getThemes()
      const widgets = await getWidgets()

      this.themes = themes.data
      this.widgets = widgets.data

      this.initialized = true
    } catch (error) {
      this.$message.warning('认证 token 已过期，请重新登录')
      this.$router.replace('/login')
    }
  },
  methods: {
    ...mapMutations('setting', ['setTheme']),
    onThemeChange({ theme, color }) {
      this.setTheme({ ...this.theme, mode: theme, color: color })
      // 切换mapgisUI的主题
      // 一张图 light，dark 白底黑字，night 黑底白字
      if (theme === 'dark' || theme === 'light') {
        mapgisui.setTheme('light')
      } else {
        mapgisui.setTheme('dark')
      }
    },
    onSaveApp(appConfig) {
      edit({ config: JSON.stringify(appConfig) })
        .then(() => {
          this.$message.success('保存成功')
        })
        .catch((err) => {
          this.$message.error(err.response.data.message)
        })
    },
  },
}
</script>
