import { VueConstructor } from 'vue'
import { Store } from 'vuex'
import VueRouter from 'vue-router'
import MapEditorUI from '@mapgis/pan-spatial-map-plugin-mapeditor-ui'

export default ({
  Vue,
  router,
  store
}: {
  Vue: VueConstructor
  router: VueRouter
  store: Store<unknown>
}) => {
  // UI组件注册
  Vue.use(MapEditorUI)
}
