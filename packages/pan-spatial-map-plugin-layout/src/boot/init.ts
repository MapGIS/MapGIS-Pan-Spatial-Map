import axios from 'axios'
import { VueConstructor } from 'vue'
import { Store } from 'vuex'
import VueRouter from 'vue-router'
import LayoutUI, { IScaffold } from '@mapgis/pan-spatial-map-plugin-layout-ui'
import defaultScaffold from '../templates/src/statics/plugins/layout/init.json'
import initRouter from './init-router'
import importPlugin from './import-widgets'
import initTheme from './init-theme'

export default async ({
  Vue,
  router,
  store
}: {
  Vue: VueConstructor
  router: VueRouter
  store: Store<unknown>
}): Promise<void> => {
  // UI组件注册
  Vue.use(LayoutUI)

  let scaffold: IScaffold
  try {
    // 读取项目信息
    const { data: init } = await axios.get<IScaffold>(
      'statics/plugins/layout/init.json'
    )
    scaffold = init
  } catch (error) {
    console.error('[DEBUG]: error', error)
    console.warn('[WARN]: 获取初始配置信息失败，将采用默认配置信息！！！')
    // 采用默认项目信息
    scaffold = defaultScaffold as IScaffold
  }

  // 导入元数据信息
  await importPlugin(store, scaffold)

  // 初始化路由信息
  initRouter(store, router, scaffold)

  // 初始化主题
  await initTheme(scaffold)
}
