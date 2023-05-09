export default {
  namespaced: true,
  state: {
    theme: {
      // 主题
      color: '#1890ff', // 主题色
      mode: 'dark' // 主题模式 可选 dark、 light 和 night
    }
  },
  mutations: {
    setTheme(state, theme) {
      state.theme = theme
    }
  }
}
