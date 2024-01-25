import Vue from 'vue'

// base library
import '@mapgis/webclient-vue-mapboxgl/dist-libs/webclient-vue-mapboxgl.css'
import '@mapgis/webclient-vue-cesium/dist-libs/webclient-vue-cesium.css'
import '@mapgis/webclient-vue-ui/dist-libs/webclient-vue-ui.css'
import '@mapgis/web-app-framework/dist-libs/web-app-framework.css'
import '@mapgis/mapgis-pan-spatial-map-widgets/dist-libs/mapgis-pan-spatial-map-widgets.css'
import '@mapgis/mapgis-pan-spatial-map-theme/dist-libs/mapgis-pan-spatial-map-theme.css'

import MapgisUi from '@mapgis/webclient-vue-ui'
import WebAppFrameworkUI from '@mapgis/web-app-framework'
import Theme from '@mapgis/mapgis-pan-spatial-map-theme'
import WebAppWidget from '@mapgis/mapgis-pan-spatial-map-widgets'
import Antd from 'ant-design-vue/es'
import HeaderAvatar from '@/components/HeaderAvatar'
import About from '@/components/About'
// import widgetsFrame from '@mapgis/mapgis-pan-spatial-map-widgets-frame'

const WAF = require('@mapgis/web-app-framework')
const EVENT_BUS = require('@mapgis/webclient-vue-eventbus')

Vue.use(MapgisUi)
Vue.use(Antd)
Vue.use(WebAppFrameworkUI)
// Vue.use(widgetsFrame)
Vue.use(Theme, {
  components: {
    MpPanSpatialMapHeaderAvatar: HeaderAvatar,
    MpPanSpatialMapAbout: About
  }
})
Vue.use(WebAppWidget)
// Vue.component('MpPanSpatialMapHeaderAvatar', HeaderAvatar)
// Vue.component('MpPanSpatialMapAbout', About)

window['@mapgis/web-app-framework'] = WAF
window['@mapgis/webclient-vue-eventbus'] = EVENT_BUS

process.env.NODE_ENV !== 'production' && console.warn('[antd-pro] WARNING: Antd now use fulled imported.')
