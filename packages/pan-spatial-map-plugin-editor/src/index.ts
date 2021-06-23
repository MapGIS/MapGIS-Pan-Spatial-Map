import {
  MpMeasurement,
  MpMarkerManager,
  MpAddData,
  MpComprehensiveQuery,
  MpThematicMap,
  MpVectorTileCarto,
  MpFeatureQuery
} from './widgets'

const components = [
  MpMeasurement,
  MpMarkerManager,
  MpAddData,
  MpComprehensiveQuery,
  MpThematicMap,
  MpVectorTileCarto,
  MpFeatureQuery
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
