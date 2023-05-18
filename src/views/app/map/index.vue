<template>
  <mp-app-loader :application="application" />
</template>

<script>
// import { mapState, mapMutations } from 'vuex'
import { AppManager, MapRender, baseConfigInstance, eventBus, events, LayerType, addLayer, removeLayer } from '@mapgis/web-app-framework'
import request from '@/utils/request'
import mapgisui from '@mapgis/webclient-vue-ui'

export default {
  data() {
    return {
      application: {}
    }
  },
  computed: {
    // ...mapState('setting', ['theme'])
  },
  async created() {
    await AppManager.getInstance().loadConfig(
      window._CONFIG['domainURL'],
      `${window._CONFIG['apiPathServicesPrefix']}/system/AppResourceServer/app/config`,
      `${window._CONFIG['apiPathServicesPrefix']}/system/AppResourceServer/`,
      request,
      process.env.VUE_APP_CONTEXT_PATH
    )
    this.application = AppManager.getInstance().getApplication()
    /**
     * 修改说明：退出登录，再次进入地图视图界面，这里需要初始化maprender的�
     * 修改人：龚跃�
     * 修改时间�022/3/25
     */
    const initMode =
      baseConfigInstance.config && baseConfigInstance.config.initMode ? baseConfigInstance.config.initMode : undefined
    if (!initMode || initMode === 'map') {
      this.application.document.maprender = MapRender.MAPBOXGL
    } else if (initMode === 'globe') {
      this.application.document.maprender = MapRender.CESIUM
    }

    const style = this.themeStyle()
    const opacity = this.themeOpacity()

    const payload = {
      opacity: opacity
    }
    mapgisui.setTheme(style.theme, payload)

    // this.setTheme({ ...this.theme, mode: style.theme, color: style.color })
    // 切换mapgisUI的主�
    // 一张图 light，dark 白底黑字，night 黑底白字
    // if (style.theme === 'dark' || style.theme === 'light') {
    //   const payload = {
    // background: '#fff', // 根据项目需求修改该样式
    // cardBackground: '#fff',
    // panelBackground: '#fff',
    // divShadow: '#fff',
    // divBackground: '#fff'
    //   opacity: opacity
    // }
    // this.setTheme({ mode: 'light', color: style.color })
    //   mapgisui.setTheme('light', payload)
    // } else if (style.theme === 'night') {
    //   const payload = {
    // selectedColor: '#fff', // 根据项目需求修改该样式
    // hoverColor: '#141414',
    // clickColor: '#fff',
    // primaryColor: '#fff',
    // dangerColor: '#081a37'
    //   opacity: opacity
    // }
    // this.setTheme({ mode: 'dark', color: style.color })
    //   mapgisui.setTheme('dark', payload)
    // } else {
    //   const payload = {
    //     opacity: opacity
    //   }
    // this.setTheme({ mode: 'technology', color: style.color })
    //   mapgisui.setTheme('technology', payload)
    // }
    // cesium 加载完成回调
		this.$root.$on('cesium-load', (obj) => {
      debugger
      // obj 包含 Cesium、vueCesium �viewer 对象。将 doc 对象
      obj.document = this.application.document
      // 图层相关信息
      obj.LayerHelper = {
        LayerType, addLayer, removeLayer
      }
			// new 地矿三维 GmSceneContainer 对象
			const container = new window.GmSceneContainer(obj)
			// �containerId 挂到 application 对象的地矿配置中
			this.application.gmConfig = {
        containerId: container.containerId
      }

      console.log('obj', obj)
      console.log('this.application', this.application)

      // 监听地矿 GMLAYER 自定义图�check 事件
      eventBus.$on(events.DATA_CATALOG_EXTEND_DATA_CHECK, (nodeCfg) => {
        if (nodeCfg.extend && nodeCfg.extend.isGmLayer) {
          container.addLayer(nodeCfg)
        }
      })

      // 监听地矿 GMLAYER 自定义图�uncheck 事件
      eventBus.$on(events.DATA_CATALOG_EXTEND_DATA_UNCHECK, (nodeCfg) => {
        if (nodeCfg.extend && nodeCfg.extend.isGmLayer) {
          container.removeLayer(nodeCfg)
        }
      })
		})
  },
  methods: {
    // ...mapMutations('setting', ['setTheme']),
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
