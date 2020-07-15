import {
  ActionContext,
  ActionTree,
  GetterTree,
  Module,
  MutationTree
} from 'vuex'
import { LayoutComponent } from '@mapgis/pan-spatial-map-plugin-layout-ui'

// Interfaces
interface IComponentsState {
  data: LayoutComponent[]
}

// Initial State
const componentsState: IComponentsState = { data: [] }

// Getters
const getters: GetterTree<IComponentsState, any> = {
  getComponents(state: IComponentsState): LayoutComponent[] {
    return state.data
  }
}

// Mutations
const mutations: MutationTree<IComponentsState> = {
  PUSH_COMPONENT(state: IComponentsState, payload: LayoutComponent): void {
    // 防止重复添加
    if (!state.data.find(({ id }) => id === payload.id)) {
      state.data.push(payload)
    }
  }
}

// Actions
const actions: ActionTree<IComponentsState, any> = {
  pushComponent(
    { commit }: ActionContext<IComponentsState, any>,
    payload: LayoutComponent
  ): void {
    commit('PUSH_COMPONENT', payload)
  }
}

const components: Module<IComponentsState, any> = {
  namespaced: true,
  state: componentsState,
  getters,
  actions,
  mutations
}

export default components
