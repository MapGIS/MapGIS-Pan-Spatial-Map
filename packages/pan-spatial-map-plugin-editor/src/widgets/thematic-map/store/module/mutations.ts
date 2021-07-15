import Vue from 'vue'
import _cloneDeep from 'lodash/cloneDeep'
import _last from 'lodash/last'
import { UUID, Feature } from '@mapgis/web-app-framework'
import {
  baseConfigInstance,
  markerIconInstance
} from '@mapgis/pan-spatial-map-store'
import { ModuleType, IHighlighItem, IThematicMapSubjectConfig } from '../types'
import state from './state'

const mutations = {
  /**
   * 设置专题服务的基础配置数据
   */
  setBaseConfig({ state }, baseConfig: any) {
    state.baseConfig = baseConfig
  },
  /**
   * 设置专题服务专题配置数据
   */
  setSubjectConfig({ state }, subjectConfig: IThematicMapSubjectConfig[]) {
    state.subjectConfig = subjectConfig
    localStorage.setItem('subjectConfig', JSON.stringify(subjectConfig))
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
  setDataSet({ state }, pageDataSet: Feature.FeatureIGS | null) {
    state.pageDataSet = _cloneDeep(pageDataSet)
  },
  /**
   * 查询要素
   * @param isPage 是否分页
   * @param onSuccess
   * @param onError
   */
  setFeaturesQuery(
    { state, commit },
    { isPage = true, onSuccess, onError }: any = {}
  ) {
    if (!state.selectedSubConfig) return
    const { pageParam, selectedSubConfig, baseConfig = {} } = state
    const { ip: baseConfigIp, port: baseConfigPort } = baseConfigInstance.config
    const { baseIp, basePort } = baseConfig
    const {
      ip,
      port,
      configType,
      gdbp,
      docName,
      layerName,
      layerIndex,
      table
    } = selectedSubConfig
    const _ip = ip || baseIp || baseConfigIp
    const _port = port || basePort || baseConfigPort
    const _pageParam = isPage
      ? pageParam
      : {
          page: 0,
          pageCount: 9999
        }
    const fields = table ? table.showFields.join(',') : ''
    let params = {}
    if (
      (configType && configType.toLowerCase() === 'gdbp') ||
      (!configType && gdbp)
    ) {
      params = {
        ...params,
        gdbp
      }
    }
    if (
      (configType && configType.toLowerCase() === 'doc') ||
      (!configType && docName)
    ) {
      params = {
        ...params,
        docName,
        layerName,
        layerIdxs: layerIndex
      }
    }
    commit('setLoading', true)
    const fn = Feature.FeatureQuery.query({
      ip: _ip,
      port: _port,
      fields,
      IncludeGeometry: true,
      f: 'json',
      ..._pageParam,
      ...params
    })
    if (fn && fn.then) {
      fn.then((dataSet: Feature.FeatureIGS | any) => {
        commit('setLoading', false)
        commit('setDataSet', dataSet)
        onSuccess && onSuccess(dataSet)
      }).catch(e => {
        commit('setLoading', false)
        onError && onError(e)
      })
    }
  },
  /**
   * 设置选中专题的年度列表
   * 旧版: config:{type, data: [{time, subData:[{...}]}]}或者config: {type, data: [{time, ...}]}
   * 新版: config:[{time...}]
   */
  setSelectedSubConfig({ state }, time: string) {
    const subject = state.selectedList.find(({ id }) => id === state.selected)
    let selectedSubConfig = null
    if (subject && subject.config) {
      const { type: subjectType, config } = subject
      if (Array.isArray(config)) {
        // 新版
        const item = config.find((d: any) => d.time === time)
        selectedSubConfig = {
          ...item,
          subjectType
        }
      } else {
        // 旧版
        const { type = 'gdbp', data } = config
        if (data && data.length) {
          const item = data.find((d: any) => d.time === time)
          const subData =
            item.subData && item.subData.length ? item.subData[0] : item || {}
          selectedSubConfig = {
            ...subData,
            subjectType,
            configType: type
          }
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
    const subject = state.selectedList.find(
      (item: IThematicMapSubjectConfig) => item.id === id
    )
    if (subject && subject.config) {
      if (Array.isArray(subject.config)) {
        // 新版
        selectedTimeList = subject.config.map(({ time }: any) => time)
      } else {
        // 旧版
        const { data = [] } = subject.config
        selectedTimeList = data.map(({ time }: any) => time)
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
    selectedList: IThematicMapSubjectConfig[] = []
  ) {
    state.selectedList = selectedList
    commit('setSelected', _last(selectedList)?.id)
  },
  /**
   * 设置新增的专题图
   */
  setSubjectConfigNode(
    { state, commit },
    {
      parentId,
      node
    }: {
      parentId: string
      node: IThematicMapSubjectConfig
    }
  ) {
    const loop = (tree: IThematicMapSubjectConfig[]) => {
      for (let i = 0; i < tree.length; i++) {
        const item = tree[i]
        if (item.id === parentId) {
          if (item.children && item.children.length) {
            item.children.push(node)
          } else {
            item.children = [node]
          }
        } else if (item.children && item.children.length) {
          loop(item.children)
        }
      }
      return tree
    }
    const subjectConfig = loop(_cloneDeep(state.subjectConfig))
    commit('setSubjectConfig', subjectConfig)
  },
  /**
   * 设置高亮项
   */
  setHighlightItem({ state }, { from, itemIndex }: IHighlighItem) {
    markerIconInstance.unSelectIcon().then(img => {
      const geoJson = Feature.FeatureConvert.featureIGSToFeatureGeoJSON(
        state.pageDataSet
      )
      const feature = geoJson.features[itemIndex]
      if (feature) {
        const coordinates = Feature.getGeoJSONFeatureCenter(feature)
        const centerItems = [coordinates[0], coordinates[1]]
        const { properties } = feature
        state.highlightItem = {
          from,
          itemIndex,
          marker: {
            img,
            coordinates,
            feature,
            markerId: UUID.uuid(),
            fid: properties.fid,
            properties
          }
        }
      }
    })
  },
  /*
   * 移除专题图
   */
  removeSubjectConfigNode({ state, commit }, node: IThematicMapSubjectConfig) {
    const loop = (tree: IThematicMapSubjectConfig[]) => {
      for (let i = 0; i < tree.length; i++) {
        const item = tree[i]
        if (item.children && item.children.length) {
          const index = item.children.findIndex(({ id }) => id === node.id)
          if (index !== -1) {
            item.children.splice(index, 1)
          } else {
            loop(item.children)
          }
        }
      }
      return tree
    }
    const subjectConfig = loop(_cloneDeep(state.subjectConfig))
    commit('setSubjectConfig', subjectConfig)
  },
  /**
   * 重置高亮
   * @param param0
   */
  resetHighlight({ state }) {
    state.highlightItem = null
  },
  /**
   * 重置专题服务所有的弹框的开关
   */
  resetVisible({ state }, type: ModuleType) {
    if (!type) {
      state.moduleTypes = []
    } else {
      state.moduleTypes.splice(state.moduleTypes.indexOf(type), 1)
    }
  }
}

export default Vue.observable(mutations)
