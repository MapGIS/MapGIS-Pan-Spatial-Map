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
      gdbp,
      docName,
      layerName,
      configType = 'gdbp',
      layerIndex: layerIdxs,
      table: { showFields }
    } = selectedSubConfig
    const _ip = ip || baseIp || baseConfigIp
    const _port = port || basePort || baseConfigPort
    const _pageParam = isPage
      ? pageParam
      : {
          page: 0,
          pageCount: 9999
        }
    let otherParams: any = {}
    switch (configType.toLowerCase()) {
      case 'gdbp':
        otherParams = {
          gdbp
        }
        break
      case 'doc':
        otherParams = {
          docName,
          layerName,
          layerIdxs
        }
        break
      default:
        break
    }
    commit('setLoading', true)
    const fn = Feature.FeatureQuery.query({
      ip: _ip,
      port: _port,
      IncludeGeometry: true,
      f: 'json',
      fields: showFields.join(','),
      ..._pageParam,
      ...otherParams
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
   */
  setSelectedSubConfig({ state }, time: string) {
    const subject = state.selectedList.find(({ id }) => id === state.selected)
    let selectedSubConfig = null
    if (subject && subject.config) {
      const {
        type: subjectType,
        config: { type: configType, data }
      } = subject
      if (Array.isArray(data)) {
        if (data.length) {
          const item = data.find(d => d.time === time)
          const subData =
            item.subData && item.subData.length ? item.subData[0] : item || {}
          selectedSubConfig = {
            ...subData,
            subjectType,
            configType
          }
        }
      } else {
        selectedSubConfig = {
          ...data,
          subjectType,
          configType
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
      const { data } = subject.config
      if (Array.isArray(data)) {
        if (data.length) {
          selectedTimeList = data.map((v: any) => v.time)
        }
      } else {
        selectedTimeList = [data.time]
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
  /**
   * 设置新增的专题图
   */
  setNodeToSubjectConfig({ state, commit }, { parentId, node }: any) {
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
    commit('setSubjectConfig', loop(state.subjectConfig))
  },
  /**
   * 重置高亮
   * @param param0
   */
  resetHighlight({ state }) {
    state.highlightItem = null
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
