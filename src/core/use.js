import Vue from 'vue'

// base library
import '@mapgis/webclient-vue-ui/dist-libs/webclient-vue-ui.css'
import MapgisUi from '@mapgis/webclient-vue-ui'

Vue.use(MapgisUi)

process.env.NODE_ENV !== 'production' && console.warn('[antd-pro] WARNING: Antd now use fulled imported.')
