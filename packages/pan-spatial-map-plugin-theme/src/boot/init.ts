import { VueConstructor } from 'vue'
import ThemeManager from '../components/ThemeManager/index.vue'

export default ({ Vue }: { Vue: VueConstructor }) => {
  Vue.component(ThemeManager.name, ThemeManager)
}
