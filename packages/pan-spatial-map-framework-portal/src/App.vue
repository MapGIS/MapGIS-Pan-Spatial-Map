<template>
  <a-config-provider :locale="locale" :get-popup-container="popContainer">
    <router-view />
  </a-config-provider>
</template>

<script>
import { enquireScreen } from './utils/util'
import { mapState, mapMutations } from 'vuex'
import themeUtil from '@/utils/themeUtil'

export default {
  name: 'App',
  data() {
    return {
      locale: {}
    }
  },
  created() {
    this.setHtmlTitle()
    this.setLanguage(this.lang)
    enquireScreen(isMobile => this.setDevice(isMobile))
  },
  mounted() {
    this.setWeekModeTheme(this.weekMode)
  },
  watch: {
    weekMode(val) {
      this.setWeekModeTheme(val)
    },
    lang(val) {
      this.setLanguage(val)
      this.setHtmlTitle()
    },
    $route() {
      this.setHtmlTitle()
    },
    'theme.mode': function(val) {
      const closeMessage = this.$message.loading(
        `您选择了主题模式 ${val}, 正在切换...`
      )
      themeUtil.changeThemeColor(this.theme.color, val).then(closeMessage)
    },
    'theme.color': function(val) {
      const closeMessage = this.$message.loading(
        `您选择了主题色 ${val}, 正在切换...`
      )
      themeUtil.changeThemeColor(val, this.theme.mode).then(closeMessage)
    },
    layout: function() {
      window.dispatchEvent(new Event('resize'))
    }
  },
  computed: {
    ...mapState('setting', ['layout', 'theme', 'weekMode', 'lang'])
  },
  methods: {
    ...mapMutations('setting', ['setDevice']),
    setWeekModeTheme(weekMode) {
      if (weekMode) {
        document.body.classList.add('week-mode')
      } else {
        document.body.classList.remove('week-mode')
      }
    },
    setLanguage(lang) {
      switch (lang) {
        case 'CN':
          this.locale = require('ant-design-vue/es/locale-provider/zh_CN').default
          break
        case 'HK':
          this.locale = require('ant-design-vue/es/locale-provider/zh_TW').default
          break
        case 'US':
        default:
          this.locale = require('ant-design-vue/es/locale-provider/en_US').default
          break
      }
    },
    setHtmlTitle() {
      document.title = `${process.env.VUE_APP_NAME}`
    },
    popContainer() {
      return document.getElementById('popContainer')
    }
  }
}
</script>

<style lang="less" scoped>
#id {
}
</style>
