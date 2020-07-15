import {
  ActionContext,
  ActionTree,
  GetterTree,
  Module,
  MutationTree
} from 'vuex'
import { getToken, setToken, removeToken } from '../../utils/cookies'

// Interfaces
interface IUserState {
  token: string
  name: string
}

// Initial State
const userState: IUserState = (() => {
  const token = getToken() || ''

  return {
    token,
    name: ''
  }
})()

// Getters
const getters: GetterTree<IUserState, any> = {
  isAuthenticated(state: IUserState): boolean {
    return !!state.token
  },

  getName(state: IUserState): string {
    return state.name ? state.name : ''
  },

  getToken(state: IUserState): string {
    return state.token
  }
}

// Mutations
const mutations: MutationTree<IUserState> = {
  SET_TOKEN(state: IUserState, token) {
    setToken(token)
    state.token = token
  },

  SET_NAME(state: IUserState, name) {
    state.name = name
  },

  UNSET_USER(state: IUserState) {
    removeToken()
    state.name = ''
    state.token = ''
  },

  RESETE_TOKEN(state: IUserState) {
    removeToken()
    state.token = ''
  }
}

// Actions
const actions: ActionTree<IUserState, any> = {
  async login(
    { commit }: ActionContext<IUserState, any>,
    payload: () => Promise<string>
  ) {
    try {
      const name = await payload()
      commit('SET_NAME', name)
      commit('SET_TOKEN', `${name}-token`)
      return true
    } catch (e) {
      console.warn('[DEBUG]: 用户登录失败', e)
      return false
    }
  },

  logout({ commit }: ActionContext<IUserState, any>) {
    commit('UNSET_USER')
  },

  resetToken({ commit }: ActionContext<IUserState, any>) {
    return new Promise(resolve => {
      commit('RESETE_TOKEN')
      resolve()
    })
  }
}

const user: Module<IUserState, any> = {
  namespaced: true,
  state: userState,
  getters,
  actions,
  mutations
}

export default user
