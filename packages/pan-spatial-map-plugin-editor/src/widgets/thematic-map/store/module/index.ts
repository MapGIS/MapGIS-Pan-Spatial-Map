import Vue from 'vue'
import stateMap from './state'
import gettersMap from './getters'
import mutationsMap from './mutations'
import { State } from '../types'

type Getters<T = typeof gettersMap> = {
  [k in keyof T]: ((a: State) => any) | ((a: State) => (a: any) => any)
}

type Mutations<T = typeof mutationsMap, P = any> = {
  [k in keyof T]: (a: Store, p: P) => void
}
class Store {
  state: State

  getters: Getters

  mutations: Mutations

  constructor({ state, getters, mutations }) {
    this.state = state
    this.getters = getters
    this.mutations = mutations
  }

  commit = (funName: keyof Mutations, payload: unknown) => {
    if (funName) {
      this.mutations[funName](this, payload)
    } else {
      return false
    }
  }

  // dispatch = (fun, params) => {}
}

const store: Store = new Store({
  state: stateMap,
  getters: gettersMap,
  mutations: mutationsMap
})

export const mapGetters = (arr: Array<keyof Getters>) => {
  return Object.entries<(s: State) => unknown>(store.getters).reduce(
    (obj, [fnName, fn]) => {
      if (arr.includes(fnName as keyof Getters)) {
        obj[fnName] = () => fn(store.state)
      }
      return obj
    },
    {}
  )
}

export const mapMutations = (arr: Array<keyof Mutations>) => {
  return Object.entries<(s: Store, p: unknown) => void>(store.mutations).reduce(
    (obj, [fnName, fn]) => {
      if (arr.includes(fnName as keyof Mutations)) {
        obj[fnName] = (payload: unknown) => fn(store, payload)
      }
      return obj
    },
    {}
  )
}

export default store
