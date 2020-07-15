import {
  ActionContext,
  ActionTree,
  GetterTree,
  Module,
  MutationTree
} from 'vuex'
import { LayoutWidgetToBlock } from '@mapgis/pan-spatial-map-plugin-layout-ui'

// Interfaces
interface ILayoutState {
  data: LayoutWidgetToBlock[]
}

// Initial State
const layoutState: ILayoutState = { data: [] }

// Getters
const getters: GetterTree<ILayoutState, any> = {
  getWidgetToBlocks(state: ILayoutState): LayoutWidgetToBlock[] {
    return state.data
  }
}

// Mutations
const mutations: MutationTree<ILayoutState> = {
  PUSH_WIDGETTOBLOCK(state: ILayoutState, payload: LayoutWidgetToBlock): void {
    // 防止重复添加
    if (!state.data.find(({ id }) => id === payload.id)) {
      state.data.push(payload)
    }
  }
}

// Actions
const actions: ActionTree<ILayoutState, any> = {
  pushWidgetToBlock(
    { commit }: ActionContext<ILayoutState, any>,
    payload: LayoutWidgetToBlock
  ): void {
    commit('PUSH_WIDGETTOBLOCK', payload)
  }
}

const layout: Module<ILayoutState, any> = {
  namespaced: true,
  state: layoutState,
  getters,
  actions,
  mutations
}

export default layout
