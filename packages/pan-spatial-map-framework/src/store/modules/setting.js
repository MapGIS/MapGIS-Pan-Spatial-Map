import config from '@/config'
import { ADMIN } from '@/config/default'
import { formatFullPath } from '@/utils/i18n'
import { filterMenu } from '@/utils/authority-utils'
import { getLocalSetting } from '@/utils/themeUtil'

const localSetting = getLocalSetting(true)
const customTitlesStr = sessionStorage.getItem(
  process.env.VUE_APP_TBAS_TITLES_KEY
)
const customTitles = (customTitlesStr && JSON.parse(customTitlesStr)) || []

export default {
  namespaced: true,
  state: {
    isMobile: false,
    loginConfig: {},
    palettes: ADMIN.palettes,
    pageMinHeight: 0,
    menuData: [],
    activatedFirst: undefined,
    customTitles,
    ...config,
    ...localSetting,
  },
  getters: {
    menuData(state, getters, rootState) {
      if (state.filterMenu) {
        const { permissions, roles } = rootState.account
        return filterMenu(state.menuData, permissions, roles)
      }
      return state.menuData
    },
    firstMenu(state) {
      const { menuData } = state
      if (menuData.length > 0 && !menuData[0].fullPath) {
        formatFullPath(menuData)
      }
      return menuData.map((item) => {
        const menuItem = { ...item }
        delete menuItem.children
        return menuItem
      })
    },
    subMenu(state) {
      const { menuData, activatedFirst } = state
      if (menuData.length > 0 && !menuData[0].fullPath) {
        formatFullPath(menuData)
      }
      const current = menuData.find((menu) => menu.fullPath === activatedFirst)
      return (current && current.children) || []
    },
  },
  mutations: {
    setDevice(state, isMobile) {
      state.isMobile = isMobile
    },
    setLoginConfig(state, loginConfig) {
      state.loginConfig = loginConfig
    },
    setTheme(state, theme) {
      state.theme = theme
    },
    setWeekMode(state, weekMode) {
      state.weekMode = weekMode
    },
    setLang(state, lang) {
      state.lang = lang
    },
    correctPageMinHeight(state, minHeight) {
      state.pageMinHeight += minHeight
    },
    setMenuData(state, menuData) {
      state.menuData = menuData
    },
    setAsyncRoutes(state, asyncRoutes) {
      state.asyncRoutes = asyncRoutes
    },
    setActivatedFirst(state, activatedFirst) {
      state.activatedFirst = activatedFirst
    },
    setCustomTitle(state, { path, title }) {
      if (title) {
        const obj = state.customTitles.find((item) => item.path === path)
        if (obj) {
          obj.title = title
        } else {
          state.customTitles.push({ path, title })
        }
        sessionStorage.setItem(
          process.env.VUE_APP_TBAS_TITLES_KEY,
          JSON.stringify(state.customTitles)
        )
      }
    },
  },
}
