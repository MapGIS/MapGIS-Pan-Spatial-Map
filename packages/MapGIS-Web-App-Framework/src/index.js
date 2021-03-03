export { AppManager, WidgetManager } from './managers'

export {
  AppMixin,
  WidgetInfoMixin,
  WidgetMixin,
  ThemeMixin,
  ThemeContentMixin,
  ThemeStyleMixin,
  PanelMixin,
  MapMixin,
  IconMixin
} from './mixins'

export { MpMapboxView, MpCesiumView } from './components'

export { WidgetState } from './utils'

import {
  MpAppLoader,
  MpMapContainer,
  MpMapWidgetButton,
  MpContentWidgetButton,
  MpMapWidgetContainer,
  MpWindow,
  MpContentWidgetPanel,
  MpMapWidgetPanel,
  MpMapboxView,
  MpCesiumView
} from './components'

const components = [
  MpAppLoader,
  MpMapContainer,
  MpMapWidgetButton,
  MpContentWidgetButton,
  MpMapWidgetContainer,
  MpWindow,
  MpContentWidgetPanel,
  MpMapWidgetPanel,
  MpMapboxView,
  MpCesiumView
]

const install = Vue => {
  components.forEach(component => {
    Vue.component(component.name, component)
  })
}

export default {
  install
}
