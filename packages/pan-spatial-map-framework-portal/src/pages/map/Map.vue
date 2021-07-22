<template>
  <mp-app-loader :application="application" />
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { AppManager } from '@mapgis/web-app-framework'
import { eventBus } from '@mapgis/pan-spatial-map-store'

import { BASE_URL } from '@/services/api'
import { request } from '@/utils/request'

export default {
  data() {
    return {
      application: {},
      url:
        'http://192.168.17.59:9039/portal/public/map/index.html#/map?ip=xx&port=xx&type=5&name=portal_Hubei4326'
    }
  },
  computed: {
    ...mapState('setting', ['theme'])
  },
  async created() {
    await AppManager.getInstance().loadConfig(
      BASE_URL,
      '/map-app/app.json',
      '/map-app/',
      request
    )

    this.application = AppManager.getInstance().getApplication()

    const style = this.themeStyle()

    this.setTheme({ ...this.theme, mode: style.theme, color: style.color })
  },

  mounted() {
    window.setTimeout(this.emitEvent, 3000)
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
    },
    emitEvent() {
      const name = this.getQueryString('name')

      const type = this.getQueryString('type')

      eventBus.$emit('emitImposeService', { name: name, type: type })
    },
    getQueryString(name) {
      const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, 'i')
      const searchString = this.url.split('?')[1]
      const r = searchString.match(reg)
      if (r !== null) {
        return decodeURIComponent(r[2])
      }
      return null
    }
  }
}
</script>
