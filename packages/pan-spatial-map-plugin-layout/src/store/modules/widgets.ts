import {
  ActionContext,
  ActionTree,
  GetterTree,
  Module,
  MutationTree
} from 'vuex'
import { LayoutWidget } from '@mapgis/pan-spatial-map-plugin-layout-ui'

// Interfaces
interface IWidgetsState {
  data: LayoutWidget[]
}

// Initial State
const widgetsState: IWidgetsState = { data: [] }

// Getters
const getters: GetterTree<IWidgetsState, any> = {
  getWidgets(state: IWidgetsState): LayoutWidget[] {
    return state.data
  }
}

// Mutations
const mutations: MutationTree<IWidgetsState> = {
  PUSH_WIDGET(state: IWidgetsState, payload: LayoutWidget): void {
    if (!state.data.find(({ id }) => id === payload.id)) {
      state.data.push(payload)
    }
  },
  REMOVE_WIDGET(state: IWidgetsState, payload: string): void {
    const index = state.data.findIndex(({ id }) => id === payload)
    if (index !== -1) {
      state.data.splice(index, 1)
    }
  },
  SHOW_WIDGET(state: IWidgetsState, payload: string): void {
    const widget = state.data.find(({ id }) => id === payload)
    if (widget) {
      widget.show = true
    }
  },
  HIDE_WIDGET(state: IWidgetsState, payload: string): void {
    const widget = state.data.find(({ id }) => id === payload)
    if (widget) {
      widget.show = false
    }
  },
  MERGE_PROPS(
    state: IWidgetsState,
    payload: { id: string; props: Record<string, unknown> }
  ): void {
    const widget = state.data.find(({ id }) => id === payload.id)
    if (widget) {
      Object.assign(widget.props, { ...payload.props })
    }
  },
  CHANGE_POSITION(state: IWidgetsState, payload: LayoutWidget) {
    const widget = state.data.find(({ id }) => id === payload.id)
    if (widget) {
      Object.assign(widget.position, { ...payload.position })
    }
  }
}

// Actions
const actions: ActionTree<IWidgetsState, any> = {
  pushWidget(
    { commit }: ActionContext<IWidgetsState, any>,
    payload: LayoutWidget
  ): void {
    commit('PUSH_WIDGET', payload)
  },
  removeWidget(
    { commit }: ActionContext<IWidgetsState, any>,
    payload: string
  ): void {
    commit('REMOVE_WIDGET', payload)
  },
  toggleWidget(
    { commit, state }: ActionContext<IWidgetsState, any>,
    payload: LayoutWidget
  ): void {
    const widget = state.data.find(({ id }) => id === payload.id)
    if (payload.position) {
      commit('CHANGE_POSITION', payload)
    }
    if (widget) {
      const type = widget.show ? 'HIDE_WIDGET' : 'SHOW_WIDGET'
      commit(type, payload.id)
    }
  },
  mergeProps(
    { commit }: ActionContext<IWidgetsState, any>,
    payload: { id: string; props: Record<string, unknown> }
  ): void {
    commit('MERGE_PROPS', payload)
  }
}

const widgets: Module<IWidgetsState, any> = {
  namespaced: true,
  state: widgetsState,
  getters,
  actions,
  mutations
}

export default widgets
