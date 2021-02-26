import Vue from 'vue'
import App from './App.vue'
import './theme/index.less'
import Antd from 'ant-design-vue'
import Plugins from '@/plugins'
import { initI18n } from '@/utils/i18n'
import store from './store'
import { initRouter } from './router'
import 'moment/locale/zh-cn'
import Components from '@/components'

import Auth from '@mapgis/pan-spatial-map-plugin-auth'
import Launch from '@mapgis/pan-spatial-map-plugin-launch'
import Theme from '@mapgis/pan-spatial-map-plugin-Theme'

const router = initRouter()
const i18n = initI18n('CN', 'US')

Vue.use(Antd)
Vue.config.productionTip = false
Vue.use(Plugins)
Vue.use(Components)

Vue.use(Auth, {
  store,
  router,
  loginIgnore: { whiteList: ['/login'], loginPath: '/login' }
})
Vue.use(Launch, { router })
Vue.use(Theme)

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
