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

Vue.use(MapgisUi)
Vue.use(WebAppFrameworkUI)
Vue.use(Theme, {
  components: {}
})
Vue.use(WebAppWidget)

process.env.NODE_ENV !== 'production' && console.warn('[antd-pro] WARNING: Antd now use fulled imported.')
