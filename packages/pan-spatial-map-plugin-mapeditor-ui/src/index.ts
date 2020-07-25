import { VueConstructor } from 'vue'
import { MpMeasure, MpMarkerManager } from './components'
import startServer from './utils/server'

const components = [MpMeasure, MpMarkerManager]

const install = (Vue: VueConstructor) => {
  components.forEach(component => {
    Vue.component((component as any).options.name, component)
  })

  startServer()
}

export default {
  install
}
