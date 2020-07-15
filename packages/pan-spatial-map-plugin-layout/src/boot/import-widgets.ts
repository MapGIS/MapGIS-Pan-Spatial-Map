import axios from 'axios'
import { Store } from 'vuex'
import {
  IScaffold,
  ILayoutElementConfig,
  LayoutComponent,
  LayoutWidget,
  LayoutWidgetToBlock
} from '@mapgis/pan-spatial-map-plugin-layout-ui'
import getLayout from '../utils/layout'
import componentsModule from '../store/modules/component'
import widgetsModule from '../store/modules/widgets'
import layoutModule from '../store/modules/layout'

/**
 * 导入微件集合
 * @param path 资源路径
 * @param dispatch dispatch方法
 * @param components 组件
 * @param widgets 微件集合
 */
const importWidgets = (() => {
  const pathMap = new Map()
  return async (
    path: string,
    dispatch: Function,
    components: LayoutComponent[],
    widgets: LayoutWidget[]
  ): Promise<void> => {
    // 避免重复引用
    if (pathMap.has(path)) {
      await pathMap.get(path)
      return
    }

    let resolve: Function = () => {}
    pathMap.set(
      path,
      new Promise((res: Function) => {
        resolve = res
      })
    )

    // 请求json数据
    const {
      data: { type, dependencies, data }
    } = await axios.get<ILayoutElementConfig>(path)

    // 依赖项解析
    await Promise.all(
      dependencies.map(dependency =>
        importWidgets(dependency, dispatch, components, widgets)
      )
    )

    // 创建组件
    const createComponent = (info: LayoutComponent) => {
      return new LayoutComponent(info)
    }

    // 创建微件
    const createWidget = (info: LayoutWidget) => {
      let component = components.find(x => x.id === info.componentId)
      if (!component) {
        component = createComponent({
          id: info.componentId,
          icon: '',
          label: info.componentId,
          type: 'Component',
          component: info.componentId
        })
      }
      return new LayoutWidget(info, component)
    }

    // 创建微件到区块关联
    const createWidgetToBlock = (info: LayoutWidgetToBlock) => {
      let widget = widgets.find(x => x.id === info.widgetId)
      if (!widget) {
        widget = createWidget({
          id: info.widgetId,
          componentId: info.id,
          show: false,
          info: null as any
        })
      }
      return new LayoutWidgetToBlock(info, widget)
    }

    // 布局元素
    switch (type) {
      case 'Component':
        await Promise.all(
          (data as LayoutComponent[]).map(component =>
            dispatch('components/pushComponent', createComponent(component))
          )
        )
        break

      case 'Widget':
        await Promise.all(
          (data as LayoutWidget[]).map(widget =>
            dispatch('widgets/pushWidget', createWidget(widget))
          )
        )
        break

      case 'Layout':
        await Promise.all(
          (data as LayoutWidgetToBlock[]).map(widgetToBlock =>
            dispatch(
              'layout/pushWidgetToBlock',
              createWidgetToBlock(widgetToBlock)
            )
          )
        )
        break

      default:
        console.warn(`未知的布局元素类型'${type}'`)
        break
    }

    // 释放Promise
    resolve()
  }
})()

export default async function(store: Store<unknown>, scaffold: IScaffold) {
  store.registerModule('components', componentsModule)
  store.registerModule('widgets', widgetsModule)
  store.registerModule('layout', layoutModule)

  const path = getLayout(scaffold).mainJson || scaffold.defaultMainJson

  // 导入微件集合
  await importWidgets(
    path,
    store.dispatch,
    store.getters['components/getComponents'],
    store.getters['widgets/getWidgets']
  )
}
