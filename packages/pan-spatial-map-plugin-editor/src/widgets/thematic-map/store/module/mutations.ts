import Vue from 'vue'
import _cloneDeep from 'lodash/cloneDeep'
import _last from 'lodash/last'
import { UUID, Feature } from '@mapgis/web-app-framework'
import {
  baseConfigInstance,
  markerIconInstance
} from '@mapgis/pan-spatial-map-store'
import {
  ModuleType,
  LinkageItem,
  PageParam,
  SelectedSubConfig,
  SubjectBaseConfig,
  OldSubjectConfig,
  NewSubjectConfig
} from '../types'
import state from './state'

const mutations = {
  /**
   * 专题服务各子功能弹框的开关
   */
  setVisible({ state }, type: ModuleType) {
    if (state.moduleTypes.indexOf(type) < 0) {
      state.moduleTypes.push(type)
    }
  },
  /**
   * 重置专题服务各子功能弹框的开关
   */
  resetVisible({ state }, type: ModuleType) {
    if (!type) {
      state.moduleTypes = []
    } else {
      state.moduleTypes.splice(state.moduleTypes.indexOf(type), 1)
    }
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
      page: page - 1,
      pageCount
    }
  },
  /**
   * 当前页的查询的要素数据
   */
  setDataSet({ state }, pageDataSet: Feature.FeatureIGS | null) {
    state.pageDataSet = _cloneDeep(pageDataSet)
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
    const { pageParam, selectedSubConfig, baseConfig = {} } = state
    if (!selectedSubConfig) return
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
   * 对应专题年度的配置子配置数据
   * 旧版专题配置: OldSubjectConfig
   * 新版专题配置: NewSubjectConfig
   */
  setSelectedSubConfig({ state }, selectedSubConfig: SelectedSubConfig | null) {
    state.selectedSubConfig = selectedSubConfig
  },
  /**
   * 选中的年度
   */
  setSelectedTime({ state, commit }, time?: string) {
    state.selectedTime = time
    const subject = state.selected
    let selectedSubConfig: SelectedSubConfig | null = null
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
    commit('setSelectedSubConfig', selectedSubConfig)
  },
  /**
   * 选中的单个专题服务的年度列表数据
   */
  setSelectedTimeList({ state, commit }, selectedTimeList: Array<string>) {
    state.selectedTimeList = selectedTimeList
    commit('setSelectedTime', selectedTimeList[0])
  },
  /**
   * 选中的单个专题服务
   */
  setSelected(
    { state, commit },
    subject?: OldSubjectConfig | NewSubjectConfig
  ) {
    state.selected = subject
    let selectedTimeList: Array<string> = []
    if (subject && subject.config) {
      const { config } = subject
      if (Array.isArray(config)) {
        // 新版
        selectedTimeList = config.map(({ time }) => time)
      } else {
        // 旧版
        const { data = [] } = config
        selectedTimeList = data.map(({ time }) => time)
      }
    }
    commit('setSelectedTimeList', selectedTimeList)
  },
  /**
   * 选中的专题集合
   */
  setSelectedList(
    { state, commit },
    selectedList: Array<OldSubjectConfig | NewSubjectConfig> = []
  ) {
    state.selectedList = selectedList
    commit('setSelected', _last(selectedList))
  },
  /**
   * 专题服务的基础配置数据
   */
  setBaseConfig({ state }, baseConfig: SubjectBaseConfig) {
    state.baseConfig = baseConfig
  },
  /**
   * 存储专题服务总专题配置数据
   */
  setSubjectConfig(
    { state },
    subjectConfig: Array<OldSubjectConfig | NewSubjectConfig>
  ) {
    state.subjectConfig = subjectConfig
    localStorage.setItem('subjectConfig', JSON.stringify(subjectConfig))
  },
  /**
   * 创建新增的专题图
   */
  createSubjectConfigNode({ state, commit }, node: NewSubjectConfig) {
    state.newSubjectConfig = node
    const loop = tree => {
      for (let i = 0; i < tree.length; i++) {
        const item = tree[i]
        if (item.id === node.parentId) {
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
  /*
   * 移除专题服务树节点
   */
  removeSubjectConfigNode(
    { state, commit },
    node: OldSubjectConfig | NewSubjectConfig
  ) {
    const loop = tree => {
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
