import Vue from 'vue'
import App from './App.vue'
import './theme/index.less'
import Antd from 'ant-design-vue'
import Plugins from '@/plugins'
import { initI18n } from '@/utils/i18n'
import store from './store'
import { initRouter } from './router'
import 'moment/locale/zh-cn'

import Auth from '@mapgis/pan-spatial-map-plugin-auth'

const router = initRouter()
const i18n = initI18n('CN', 'US')

Vue.use(Antd)
Vue.config.productionTip = false
Vue.use(Plugins)
Vue.use(Auth, {
  store,
  router,
  loginIgnore: { whiteList: ['/login'], loginPath: '/login' }
})

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
