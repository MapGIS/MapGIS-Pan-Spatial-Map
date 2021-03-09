import {
  MpPanSpatialMapHeader,
  MpPanSpatialMapSideMenu,
  MpAttributeTable
} from './components'

import {
  MpPanSpatialMapClassicTheme,
  MpPanSpatialMapClassicHeader,
  MpPanSpatialMapClassicLeft,
  MpPanSpatialMapClassicToolbar
} from './themes'

const components = [
  MpPanSpatialMapHeader,
  MpPanSpatialMapSideMenu,
  MpAttributeTable,
  MpPanSpatialMapClassicTheme,
  MpPanSpatialMapClassicHeader,
  MpPanSpatialMapClassicLeft,
  MpPanSpatialMapClassicToolbar
]

const install = Vue => {
  components.forEach(component => {
    Vue.component(component.name, component)
  })
}

export default {
  install
}
