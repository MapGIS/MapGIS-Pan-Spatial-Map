import Vue from 'vue'
import _cloneDeep from 'lodash/cloneDeep'
import _last from 'lodash/last'
import { Feature } from '@mapgis/web-app-framework'
import {
  ModuleType,
  IThematicMapBaseConfig,
  IThematicMapSubjectConfig
} from '../types'

const mutations = {
  /**
   * 设置专题服务的基础和专题配置数据
   */
  setThematicMapConfig({ state }, { baseConfig, subjectConfig }) {
    state.baseConfig = baseConfig
    state.subjectConfig = subjectConfig
  },
  /**
   * 保存专题服务展示弹框的开关
   */
  setVisible({ state }, type: ModuleType) {
    if (state.moduleTypes.indexOf(type) < 0) {
      state.moduleTypes.push(type)
    }
  },
  /**
   * 加载
   */
  setLoading({ state }, loading: boolean) {
    state.loading = loading
  },
  /**
   * 设置分页
   */
  setPage({ state }, { page, pageCount }) {
    state.pageParam = {
      page: page - 1,
      pageCount
    }
  },
  /**
   * 保存当前页的查询的要素数据
   */
  setPageDataSet({ state }, dataSet: Feature.FeatureIGS | null) {
    state.pageDataSet = _cloneDeep(dataSet)
  },
  /**
   * 查询要素
   * @param onSuccess
   * @param onError
   */
  setFeaturesQuery({ state, commit }, { onSuccess, onError }: any = {}) {
    const { pageParam, selectedSubConfig, baseConfig } = state
    if (!selectedSubConfig) return
    const { baseIp, basePort } = baseConfig as IThematicMapBaseConfig
    const { configType = 'gdbp' } = selectedSubConfig
    const {
      ip = baseIp,
      port = basePort,
      gdbp,
      docName,
      layerName,
      layerIndex: layerIdxs,
      table: { showFields }
    } = selectedSubConfig
    const fields = showFields.join(',')
    let params: any = {
      ip,
      port,
      fields,
      IncludeGeometry: true,
      cursorType: 'backward',
      f: 'json',
      ...pageParam
    }
    switch (configType.toLowerCase()) {
      case 'gdbp':
        params = {
          ...params,
          gdbp
        }
        break
      case 'doc':
        params = {
          docName,
          layerName,
          layerIdxs,
          ...params
        }
        break
      default:
        break
    }
    commit('setLoading', true)
    const fn = Feature.FeatureQuery.query(params)
    if (fn && fn.then) {
      fn.then((dataSet: Feature.FeatureIGS | any) => {
        commit('setLoading', false)
        commit('setPageDataSet', dataSet)
        onSuccess && onSuccess(dataSet)
      }).catch(e => {
        commit('setLoading', false)
        onError && onError(e)
      })
    }
  },
  /**
   * 设置选中专题的年度列表
   */
  setSelectedSubConfig({ state }, time) {
    const subject = state.selectedList.find(({ id }) => id === state.selected)
    let selectedSubConfig = null
    if (subject && subject.config) {
      const { type, data } = subject.config
      if (data && data.length) {
        const item = data.find(d => d.time === time)
        const subData =
          item.subData && item.subData.length ? item.subData[0] : item || {}
        selectedSubConfig = {
          ...subData,
          subjectType: subject.type,
          configType: type
        }
      }
    }
    state.selectedSubConfig = selectedSubConfig
  },
  /**
   * 设置选中的年度
   */
  setSelectedTime({ state, commit }, time = '') {
    state.selectedTime = time
    commit('setSelectedSubConfig', time)
  },
  /**
   * 设置选中的单个专题服务的时间轴列表数据
   */
  setSelectedTimeList({ state, commit }, id: string) {
    let selectedTimeList: string[] = []
    const subject = state.selectedList.find(item => item.id === id)
    if (subject && subject.config) {
      const { data } = subject.config
      if (data && data.length) {
        selectedTimeList = data.map(v => v.time)
      }
    }
    state.selectedTimeList = selectedTimeList
  },
  /**
   * 设置选中的单个专题服务
   */
  setSelected({ state, commit }, id = '') {
    if (state.selected !== id) {
      state.selected = id
      commit('setSelectedTimeList', id)
    }
  },
  /**
   * 设置选中的专题服务集合
   */
  setSelectedList(
    { state, commit },
    selectedList: IThematicMapSubjectConfig[]
  ) {
    state.selectedList = selectedList
    commit('setSelected', _last(selectedList)?.id)
  },
  /**
   * 重置专题服务展示弹框的开关
   */
  resetVisible({ state }, type: ModuleType) {
    if (type) {
      state.moduleTypes.splice(state.moduleTypes.indexOf(type), 1)
    } else {
      state.moduleTypes = []
    }
  }
}

export default Vue.observable(mutations)
