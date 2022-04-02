<template>
  <mp-app-loader :application="application" />
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { AppManager, MapRender } from '@mapgis/web-app-framework'
import {
  eventBus,
  events,
  baseConfigInstance
} from '@mapgis/pan-spatial-map-common'

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
  },

  mounted() {
    eventBus.$on(events.DATA_CATALOG_ON_IMPOSE_SERVICE_EVENT, this.emitEvent)
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
      const searchString =
        window.location.search.substring(1) ||
        window.location.hash.split('?')[1]
      const ip = this.getQueryString('ip', searchString)
      const port = this.getQueryString('port', searchString)
      const name = this.getQueryString('name', searchString)
      const type = this.getQueryString('type', searchString)
      const url = this.getQueryString('url', searchString)

      if (type === 'WMS' || type === 'WMTS') {
        if (url && type) {
          eventBus.$emit(events.IMPOSE_SERVICE_PREVIEW_EVENT, {
            url: url,
            type: type
          })
        }
      } else {
        if (ip && port && name && type) {
          eventBus.$emit(events.IMPOSE_SERVICE_PREVIEW_EVENT, {
            ip: ip,
            port: port,
            name: name,
            type: type
          })
        }
      }
    },
    getQueryString(name, searchString) {
      const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, 'i')

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
