import VueRouter from 'vue-router'
import { Store } from 'vuex'
import {
  IScaffold,
  LayoutWidget
} from '@mapgis/pan-spatial-map-plugin-layout-ui'
import getLayout from '../utils/layout'

/**
 * 初始化路由
 * @param router VueRouter
 * @param scaffold 项目信息
 */
export default function(
  store: Store<unknown>,
  router: VueRouter,
  scaffold: IScaffold
) {
  const layout = getLayout(scaffold)
  const props = {
    scaffold,
    component: layout.component,
    blocks: layout.blocks,
    widgets: store.getters['widgets/getWidgets'],
    widgetToBlocks: store.getters['layout/getWidgetToBlocks'],
    toggleWidgetFn: (widget: LayoutWidget) => {
      store.dispatch('widgets/toggleWidget', widget)
    }
  }

  router.addRoutes([
    {
      path: '/onemap/layout',
      component: (resolve: Function) => {
        resolve({
          render(h: Function) {
            return h('MpDynamicLayoutHelper', {
              props: this.props
            })
          },
          props: {
            props: { type: Object, required: true }
          }
        })
      },
      props: () => ({ props })
    }
  ])
}
