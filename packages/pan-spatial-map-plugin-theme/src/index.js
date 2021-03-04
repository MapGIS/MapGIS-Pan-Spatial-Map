import {
  MpPanSpatialMapHeader,
  MpPanSpatialMapSideMenu,
  MpPanSpatialMapFooter
} from './components'

import {
  MpPanSpatialMapClassicTheme,
  MpPanSpatialMapClassicHeader,
  MpPanSpatialMapClassicToolbar
} from './themes'

const components = [
  MpPanSpatialMapHeader,
  MpPanSpatialMapSideMenu,
  MpPanSpatialMapFooter,
  MpPanSpatialMapClassicTheme,
  MpPanSpatialMapClassicHeader,
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
