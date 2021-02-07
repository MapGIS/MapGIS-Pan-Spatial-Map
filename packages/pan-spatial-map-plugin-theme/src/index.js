import { MpPanSpatialMapFooter } from './components'

import {
  MpPanSpatialMapClassicTheme,
  MpPanSpatialMapClassicNavbar,
  MpPanSpatialMapClassicToolbar
} from './themes'

const components = [
  MpPanSpatialMapFooter,
  MpPanSpatialMapClassicTheme,
  MpPanSpatialMapClassicNavbar,
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
