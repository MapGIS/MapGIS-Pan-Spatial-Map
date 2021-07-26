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
      application: {}
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
      const ip = this.getQueryString('ip')
      const port = this.getQueryString('port')
      const name = this.getQueryString('name')
      const type = this.getQueryString('type')

      eventBus.$emit('emitImposeService', {
        ip: ip,
        port: port,
        name: name,
        type: type
      })
    },
    getQueryString(name) {
      const url = window.location.href
      const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, 'i')
      const searchString = url.split('?')[1]
      if (searchString) {
        // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
        const r = searchString.match(reg)
        if (r !== null) {
          return decodeURIComponent(r[2])
        }
        return null
      }
    }
  }
}
</script>
