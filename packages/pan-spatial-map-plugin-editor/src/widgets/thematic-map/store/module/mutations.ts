import Vue from 'vue'
import _cloneDeep from 'lodash/cloneDeep'
import _last from 'lodash/last'
import { UUID, Feature } from '@mapgis/web-app-framework'
import {
  api,
  baseConfigInstance,
  markerIconInstance
} from '@mapgis/pan-spatial-map-store'
import {
  ModuleType,
  LinkageItem,
  PageParam,
  SubjectData,
  ThematicMapBaseConfig,
  ThematicMapSubjectConfigNode,
  NewSubjectConfig
} from '../types'
import state from './state'

const mutations = {
  /**
   * 专题图各子功能弹框的开关
   */
  setVisible({ state }, type: ModuleType) {
    if (!state.modules.includes(type)) {
      state.modules = [...state.modules, type]
    }
  },
  /**
   * 重置专题图各子功能弹框的开关
   */
  resetVisible({ state }, type: ModuleType) {
    state.modules = type
      ? state.modules.filter((t: ModuleType) => t !== type)
      : []
  },
  /**
   * 加载
   */
  setLoading({ state }, loading: boolean) {
    state.loading = loading
  },
  /**
   * 分页设置
   */
  setPage({ state }, { page, pageCount }: PageParam) {
    state.pageParam = {
      ...state.pageParam,
      page,
      pageCount
    }
  },
  /**
   * 当前页的查询的要素数据
   */
  setPageDataSet({ state }, data: Feature.FeatureIGS | null) {
    state.pageDataSet = _cloneDeep(data)
  },
  /**
   * 要素查询
   * @param isPage 是否分页
   * @param onSuccess
   * @param onError
   * 目前只支持查询格式为json, 主要因为webclient-vue的分段/统计/普通静态标注专题图暂不支持geojson的解析
   */
  setFeaturesQuery(
    { state, commit },
    { isPage = true, onSuccess, onError }: any = {}
  ) {
    const { pageParam, subjectData, baseConfig = {} } = state
    if (!subjectData) {
      commit('setPageDataSet', null)
      return
    }
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
    } = subjectData
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
        commit('setPageDataSet', dataSet)
        onSuccess && onSuccess(dataSet)
      }).catch(e => {
        commit('setLoading', false)
        onError && onError(e)
      })
    }
  },
  /**
   * 对应专题年度的配置子配置数据
   * 旧版专题配置: OldSubjectConfig
   * 新版专题配置: NewSubjectConfig
   */
  setSubjectData({ state }, data: SubjectData | null) {
    state.subjectData = data
  },
  /**
   * 选中的年度
   */
  setSelectedSubjectTime({ state, commit }, time?: string) {
    state.selectedSubjectTime = time
    const subject = state.selectedSubject
    let subjectData: SubjectData | null = null
    if (subject && subject.config) {
      const { type: subjectType, config } = subject
      if (Array.isArray(config)) {
        // 新版
        const item = config.find((d: any) => d.time === time)
        subjectData = {
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
          subjectData = {
            ...subData,
            subjectType,
            configType: type
          }
        }
      }
    }
    commit('setSubjectData', subjectData)
  },
  /**
   * 选中的单个专题图的年度列表数据
   */
  setSelectedSubjectTimeList({ state, commit }, list: Array<string>) {
    state.selectedSubjectTimeList = list
    commit('setSelectedSubjectTime', list[0])
  },
  /**
   * 选中的单个专题图
   */
  setSelectedSubject(
    { state, commit },
    subject?: ThematicMapSubjectConfigNode
  ) {
    state.selectedSubject = subject
    let selectedSubjectTimeList: Array<string> = []
    if (subject && subject.config) {
      const { config } = subject
      if (Array.isArray(config)) {
        // 新版
        selectedSubjectTimeList = config.map(({ time }) => time)
      } else {
        // 旧版
        const { data = [] } = config
        selectedSubjectTimeList = data.map(({ time }) => time)
      }
    }
    commit('setSelectedSubjectTimeList', selectedSubjectTimeList)
  },
  /**
   * 选中的专题集合
   */
  setSelectedSubjectList(
    { state, commit },
    list: Array<ThematicMapSubjectConfigNode> = []
  ) {
    state.selectedSubjectList = list
    commit('setSelectedSubject', _last(list))
  },
  /**
   * 专题图的基础配置数据
   */
  setBaseConfig({ state }, config?: ThematicMapBaseConfig) {
    state.baseConfig = config
  },
  /**
   * 存储专题图总专题配置数据
   */
  setSubjectConfig({ state }, config: Array<ThematicMapSubjectConfigNode>) {
    state.subjectConfig = config
  },
  /**
   * 更新专题配置
   */
  updateSubjectConfig(
    { state, commit },
    subjectConfig: Array<ThematicMapSubjectConfigNode>
  ) {
    return new Promise((resolve, reject) => {
      const config = {
        baseConfig: state.baseConfig,
        subjectConfig
      }
      api
        .saveWidgetConfig({
          name: 'thematic-map',
          config: JSON.stringify(config)
        })
        .then(() => {
          commit('setSubjectConfig', subjectConfig)
          resolve(true)
        })
        .catch(e => {
          reject(e)
        })
    })
  },
  /**
   * 当前高亮的要素数据项(图属联动项)
   * 高亮项使用的是geojson数据需对dataSet转换
   */
  setLinkageItem({ state }, { from, itemIndex }: LinkageItem) {
    markerIconInstance.unSelectIcon().then(img => {
      const geoJson = Feature.FeatureConvert.featureIGSToFeatureGeoJSON(
        state.pageDataSet
      )
      const feature = geoJson.features[itemIndex]
      if (feature) {
        const coordinates = Feature.getGeoJSONFeatureCenter(feature)
        const centerItems = [coordinates[0], coordinates[1]]
        const { properties } = feature
        state.linkageItem = {
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
   * 重置高亮
   */
  resetLinkage({ state }) {
    state.linkageItem = null
  }
}

export default Vue.observable(mutations)
