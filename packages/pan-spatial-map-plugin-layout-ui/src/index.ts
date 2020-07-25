import { VueConstructor } from 'vue'
import {
  MpAbsoluteContainer,
  MpStandardNavbar,
  MpFooter,
  MpMainContainer,
  MpClassicLeftDrawer,
  MpClassicNavbar,
  MpClassicToolbar
} from './components'

import { MpDynamicLayout, MpDynamicLayoutHelper } from './layouts'

export { LayoutComponent } from './types/component'
export { LayoutWidget } from './types/widget'
export { LayoutWidgetToBlock } from './types/widget-to-block'
export {
  ILayoutBlock,
  ILayout,
  IScaffold,
  ILayoutElementConfig
} from './types/layout'

const components = [
  MpAbsoluteContainer,
  MpStandardNavbar,
  MpFooter,
  MpMainContainer,
  MpClassicLeftDrawer,
  MpClassicNavbar,
  MpClassicToolbar,
  MpDynamicLayout,
  MpDynamicLayoutHelper
]

const install = (Vue: VueConstructor) => {
  components.forEach(component => {
    Vue.component((component as any).options.name, component)
  })
}

export default {
  install
}
