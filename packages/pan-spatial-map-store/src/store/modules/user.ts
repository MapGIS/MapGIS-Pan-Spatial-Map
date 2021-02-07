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
    payload: () => Promise<any>
  ) {
    try {
      const res = await payload()
      let name = res.username || res.nickName

      if (res.user) {
        name = res.user.username || res.user.nickName
      }

      commit('SET_NAME', name)
      commit('SET_TOKEN', res.token || `${name}-token`)
      return true
    } catch (e) {
      return false
    }
  },

  async logout(
    { commit }: ActionContext<IUserState, any>,
    payload: () => Promise<any>
  ) {
    try {
      await payload()
      commit('UNSET_USER')
      return true
    } catch (e) {
      return false
    }
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
