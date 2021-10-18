import Vue from 'vue'
import App from './App.vue'
import { initRouter } from './router'
// fixme 暂时这样引入, 后期提供了未压缩的css文件会在theme文件下@import引入
import '@mapgis/webclient-vue-cesium/dist-libs/webclient-vue-cesium.css'
import '@mapgis/webclient-vue-ui/dist-libs/webclient-vue-ui.css'
import './theme/index.less'
import MapgisUi from '@mapgis/webclient-vue-ui'
import Antd from 'ant-design-vue'
import store from './store'
import Plugins from '@/plugins'
import { initI18n } from '@/utils/i18n'
import bootstrap from '@/bootstrap'
import 'moment/locale/zh-cn'

import HeaderAvatar from '@/layouts/header/HeaderAvatar'
import About from '@/components/About'

import WebAppFrameworkUI from '@mapgis/web-app-framework'
import Theme from '@mapgis/pan-spatial-map-plugin-Theme'
import Workspace from '@mapgis/pan-spatial-map-plugin-workspace'
import Editor from '@mapgis/pan-spatial-map-plugin-editor'
import Analysis from '@mapgis/pan-spatial-map-plugin-analysis'
import Visualization from '@mapgis/pan-spatial-map-plugin-visualization'

const router = initRouter(store.state.setting.asyncRoutes)
const i18n = initI18n('CN', 'US')

Vue.use(MapgisUi)
Vue.use(Antd)
Vue.config.productionTip = false
Vue.use(Plugins)

Vue.use(WebAppFrameworkUI)
Vue.use(Theme, {
  components: {
    MpPanSpatialMapHeaderAvatar: HeaderAvatar,
    MpPanSpatialMapAbout: About
  }
})
Vue.use(Workspace)
Vue.use(Editor)
Vue.use(Analysis)
Vue.use(Visualization)

bootstrap({ router, store, i18n, message: Vue.prototype.$message })

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
