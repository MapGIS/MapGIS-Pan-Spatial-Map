import { MpPanSpatialMapFooter } from './components'

import {
  MpPanSpatialMapClassicTheme,
  MpPanSpatialMapClassicNavbar,
  MpPanSpatialMapClassicToolbar,
  MpPanSpatialMapClassicLeftSidebar
} from './themes'

const components = [
  MpPanSpatialMapFooter,
  MpPanSpatialMapClassicTheme,
  MpPanSpatialMapClassicNavbar,
  MpPanSpatialMapClassicToolbar,
  MpPanSpatialMapClassicLeftSidebar
]

const install = Vue => {
  components.forEach(component => {
    Vue.component(component.name, component)
  })
}

export default {
  install
}
