import Vue from 'vue'
import App from './App.vue'
import { initRouter } from './router'
import './theme/index.less'
import Antd from 'ant-design-vue'
import store from './store'
import bootstrap from '@/bootstrap'
import { configService } from '@/services'

import About from '@/components/About'

import WebAppFrameworkUI from '@mapgis/web-app-framework'
import Theme from '@mapgis/pan-spatial-map-plugin-Theme'
import Workspace from '@mapgis/pan-spatial-map-plugin-workspace'
import Editor from '@mapgis/pan-spatial-map-plugin-editor'
import Analysis from '@mapgis/pan-spatial-map-plugin-analysis'
import Visualization from '@mapgis/pan-spatial-map-plugin-visualization'
import { api } from '@mapgis/pan-spatial-map-store'

const router = initRouter()

Vue.use(Antd)
Vue.config.productionTip = false

Vue.use(WebAppFrameworkUI)
Vue.use(Theme, {
  components: {
    MpPanSpatialMapAbout: About
  }
})
Vue.use(Workspace)
Vue.use(Editor)
Vue.use(Analysis)
Vue.use(Visualization)

bootstrap({ router, store, message: Vue.prototype.$message })
api.setApiProxy({ ...configService })

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
