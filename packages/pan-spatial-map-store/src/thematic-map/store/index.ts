import Vue from 'vue'
import stateMap from './state'
import gettersMap from './getters'
import mutationsMap from './mutations'
import { IState } from '../types'

class Store<T = any, G = any, M = any> {
  state: T

  getters: G

  mutations: M

  constructor({ state, getters, mutations }: any) {
    this.state = state
    this.getters = getters
    this.mutations = mutations
  }

  commit = (funName: keyof M, payload: any) => {
    if (funName) {
      ;(this.mutations[funName] as any)(this, payload)
    } else {
      return false
    }
  }

  // dispatch = (fun, params) => {}
}

const store = new Store<IState>({
  state: stateMap,
  getters: gettersMap,
  mutations: mutationsMap
})

export const mapGetters = (arr: Array<keyof typeof store.getters>) => {
  return Object.entries(store.getters).reduce(
    (obj, [fnName, fn]: [string, any]) => {
      if (arr.includes(fnName)) {
        obj[fnName] = () => fn(stateMap)
      }
      return obj
    },
    {}
  )
}

export const mapMutations = (arr: Array<keyof typeof store.mutations>) => {
  return Object.entries(store.mutations).reduce(
    (obj, [fnName, fn]: [string, any]) => {
      if (arr.includes(fnName)) {
        obj[fnName] = (payload: never) => fn(store, payload)
      }
      return obj
    },
    {}
  )
}

export default store
