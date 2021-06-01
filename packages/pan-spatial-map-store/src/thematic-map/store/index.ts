import Vue from 'vue'
import state from './state'
import getters from './getters'
import mutations from './mutations'

export const mapGetters = (arr: Array<keyof typeof getters>) => {
  return Object.entries(getters).reduce((obj, [fnName, fn]) => {
    if (arr.includes(fnName as keyof typeof getters)) {
      obj[fnName] = () => fn(state)
    }
    return obj
  }, {})
}

const commit = (funName: string, payload: any) => {
  if (funName && funName in mutations) {
    mutations[funName].call(this, payload)
  } else {
    return false
  }
}

export const mapMutations = (arr: string[]) => {
  return Object.entries(mutations).reduce((obj, [fnName, fn]) => {
    if (arr.includes(fnName)) {
      obj[fnName] = payload => fn({ state, commit }, payload)
    }
    return obj
  }, {})
}

class Store {
  state = {}

  getters = {}

  mutations = {}

  constructor({ state, getters, mutations }: any) {
    this.state = state
    this.getters = getters
    this.mutations = mutations
  }

  commit = commit

  // dispatch = (fun, params) => {}
}

const store = new Store({
  state,
  getters,
  mutations
})

export default store
