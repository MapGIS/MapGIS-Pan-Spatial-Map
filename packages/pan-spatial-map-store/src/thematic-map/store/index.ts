import Vue from 'vue'
import state from './state'
import getters from './getters'
import mutations from './mutations'
import { IGetters } from '../types'

export const mapGetters = (arr: Array<keyof IGetters>) => {
  return Object.entries(getters).reduce((obj, [fnName, fn]) => {
    if (arr.includes(fnName as keyof IGetters)) {
      obj[fnName] = () => fn(state, getters)
    }
    return obj
  }, {})
}

export const mapMutations = (arr: string[]) => {
  return Object.entries(mutations).reduce((obj, [fnName, fn]) => {
    if (arr.includes(fnName)) {
      obj[fnName] = (payload: never) => {
        const _getters = Object.entries(getters).reduce((obj, [fnName, fn]) => {
          obj[fnName] = fn(state, getters)
          return obj
        }, {} as Record<keyof IGetters, any>)
        return fn(
          {
            state,
            getters: _getters
          },
          payload
        )
      }
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

  commit = (fun, payload) => {
    if (fun) {
      this.mutations[fun].call(this, payload)
    } else {
      return false
    }
  }

  dispatch = (fun, params) => {}
}

const store = new Store({
  state,
  getters,
  mutations
})

export default store
