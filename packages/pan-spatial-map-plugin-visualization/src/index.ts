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
    Vue.component(
      (component.options && component.options.name) || component.name,
      component
    )
  })
}

export default {
  install
}
