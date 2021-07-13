import config from '@/config'
import { ADMIN } from '@/config/default'
import { getLocalSetting } from '@/utils/themeUtil'

const localSetting = getLocalSetting(true)

export default {
  namespaced: true,
  state: {
    isMobile: false,
    palettes: ADMIN.palettes,
    ...config,
    ...localSetting
  },
  getters: {},
  mutations: {
    setDevice(state, isMobile) {
      state.isMobile = isMobile
    },
    setTheme(state, theme) {
      state.theme = theme
    },
    setWeekMode(state, weekMode) {
      state.weekMode = weekMode
    }
  }
}
