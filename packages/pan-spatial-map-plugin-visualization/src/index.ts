import {
  MpSplitScreen,
  MpSwipe,
  MpRetrospect,
  MpKibanaV,
  MpMapDataV,
  MpBookmark
} from './widgets'

const components = [
  MpSplitScreen,
  MpSwipe,
  MpRetrospect,
  MpKibanaV,
  MpMapDataV,
  MpBookmark
]

const install = Vue => {
  components.forEach(component => {
    Vue.component(component.name || component.options.name, component)
  })
}

export default {
  install
}
