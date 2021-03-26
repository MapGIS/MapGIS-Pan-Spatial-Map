import {
  setExternalLayoutElementComponents,
  MpPanSpatialMapHeader,
  MpPanSpatialMapSideMenu
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
  MpPanSpatialMapClassicTheme,
  MpPanSpatialMapClassicHeader,
  MpPanSpatialMapClassicLeft,
  MpPanSpatialMapClassicToolbar
]

const install = (Vue, opts = {}) => {
  components.forEach(component => {
    Vue.component(component.name, component)
  })

  if (opts.components) {
    for (const key in opts.components) {
      if (Object.hasOwnProperty.call(opts.components, key)) {
        const component = opts.components[key]
        Vue.component(key, component)
      }
    }

    setExternalLayoutElementComponents(opts.components)
  }
}

export default {
  install
}
