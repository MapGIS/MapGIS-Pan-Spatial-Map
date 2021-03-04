import {
  MpPanSpatialMapHeader,
  MpPanSpatialMapSideMenu,
  MpPanSpatialMapFooter
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
  MpPanSpatialMapFooter,
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
