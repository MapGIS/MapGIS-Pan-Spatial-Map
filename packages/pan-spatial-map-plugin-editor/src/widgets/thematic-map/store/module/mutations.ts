import Vue from 'vue'
import { UUID, Feature } from '@mapgis/web-app-framework'
import { api, baseConfigInstance } from '@mapgis/pan-spatial-map-common'
import _cloneDeep from 'lodash/cloneDeep'
import _last from 'lodash/last'
import {
  FeatureFormatType,
  ConfigType,
  ModuleType,
  ISubjectData,
  IBaseConfig,
  ISubjectConfigNode,
  IFeatureQueryParams
} from '../types'

/**
 * 要素查询
 * @param {object} params 请求参数
 * @param {string} [f = geojson] f <json | geojson> 格式化
 * @description 不直接请求geojson数据而是请求json数据再转GeoJSON数据的原因是：
 * 直接使用f=geojson请求数据中，目前发现bound参数内容和f=json的不一致，导致统计专题图错误
 * 此外totalCount参数也没有，导致属性表分页错误
 * @returns <FeatureIGSGeoJSON | FeatureIGS>
 */
export const featureQueryFn:
  | Feature.FeatureIGS
  | Feature.FeatureIGSGeoJSON = async (
  {
    ip,
    port,
    docName,
    layerName,
    layerIndex,
    gdbp,
    configType,
    page,
    pageCount,
    ...others
  }: IFeatureQueryParams,
  f = FeatureFormatType.geojson
) => {
  const { ip: baseConfigIp, port: baseConfigPort } = baseConfigInstance.config
  const serverParams = (configType
  ? configType === ConfigType.doc
  : !!docName)
    ? {
        docName,
        layerName,
        layerIdxs: layerIndex
      }
    : { gdbp }

  const dataSource = await Feature.FeatureQuery.query({
    ip: ip || baseConfigIp,
    port: port || baseConfigPort,
    page: page || 0,
    pageCount: pageCount || 9999,
    IncludeGeometry: true,
    f: FeatureFormatType.json,
    ...serverParams,
    ...others
  })
  return f === FeatureFormatType.geojson
    ? dataSource
      ? Feature.FeatureConvert.featureIGSToFeatureGeoJSON(dataSource)
      : null
    : dataSource
}

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
   * 加载（控制属性表、统计表、时间轴的加载提示）
   */
  setLoading({ state }, loading: boolean) {
    state.loading = loading
  },
  /**
   * 缓存当前页的查询的要素geojson数据
   */
  setPageData({ state }, geojson: Feature.FeatureIGSGeoJSON | null) {
    state.pageGeojson = _cloneDeep(geojson)
  },
  /**
   * 根据选中的专题配置，查询要素并决定是否缓存
   * @param {boolean} isCache 是否缓存
   * @param {object} params 其他参数（例如分页参数等，不在state.subjectData中的参数）
   * @param {function} onSuccess 成功回调
   * @param {function} onError 失败回调
   */
  async setFeaturesQuery(
    { state, commit },
    { isCache = true, params = {}, onSuccess, onError }: any = {}
  ) {
    try {
      const { subjectData, baseConfig, pageParam } = state
      if (!subjectData) {
        commit('setPageData', null)
        return
      }
      const { baseIp, basePort } = baseConfig
      const { ip, port, table, ...others } = subjectData
      const fields = table ? table.showFields.join(',') : ''

      commit('setLoading', true)
      const geojson = await featureQueryFn({
        ip: ip || baseIp,
        port: port || basePort,
        fields,
        ...others,
        ...params
      })
      onSuccess && onSuccess(geojson)
      isCache && commit('setPageData', geojson)
      commit('setLoading', false)
    } catch (e) {
      commit('setLoading', false)
      onError && onError(e)
    }
  },
  /**
   * 对应专题年度的配置子配置数据
   */
  setSubjectData({ state }, data: ISubjectData | null) {
    state.subjectData = data
  },
  /**
   * 选中的年度
   */
  setSelectedSubjectTime({ state, commit }, time?: string) {
    state.selectedSubjectTime = time
    const subject = state.selectedSubject
    let subjectData: ISubjectData | null = null
    if (subject && subject.config) {
      const { type: subjectType, config } = subject
      if (Array.isArray(config)) {
        // 新版
        const item = config.find((d: any) => d.time === time)
        const configType = item.docName ? ConfigType.doc : ConfigType.gdbp
        subjectData = {
          ...item,
          subjectType,
          configType
        }
      } else {
        // 旧版
        const { type: configType = ConfigType.gdbp, data } = config
        if (data && data.length) {
          const item = data.find((d: any) => d.time === time)
          const subData =
            item.subData && item.subData.length ? item.subData[0] : item || {}
          subjectData = {
            ...subData,
            subjectType,
            configType
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
  setSelectedSubject({ state, commit }, subject?: ISubjectConfigNode) {
    state.selectedSubject = subject
    let selectedSubjectTimeList: Array<string> = []
    if (subject && subject.config) {
      const { config } = subject
      if (Array.isArray(config)) {
        // 新版
        selectedSubjectTimeList = config.map(({ time }: any) => time)
      } else {
        // 旧版
        const { data = [] } = config
        selectedSubjectTimeList = data.map(({ time }: any) => time)
      }
    }
    commit('setSelectedSubjectTimeList', selectedSubjectTimeList)
  },
  /**
   * 选中的专题集合
   */
  setSelectedSubjectList(
    { state, commit },
    list: Array<ISubjectConfigNode> = []
  ) {
    state.selectedSubjectList = list
    commit('setSelectedSubject', _last(list))
  },
  /**
   * 专题图的基础配置数据
   */
  setBaseConfig({ state }, config?: IBaseConfig) {
    state.baseConfig = config
  },
  /**
   * 存储专题图总专题配置数据
   */
  setSubjectConfig({ state }, config: Array<ISubjectConfigNode>) {
    state.subjectConfig = config
  },
  /**
   * 更新专题配置
   * fixme 未实现真实的保存
   * 不能保存在pan-spatial-map-mock-server/widgets/thematic-map/config.json
   */
  updateSubjectConfig(
    { state, commit },
    subjectConfig: Array<ISubjectConfigNode>
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
   */
  setLinkage({ state, commit }, fid: string) {
    if (!fid) {
      commit('resetLinkage')
    } else {
      state.linkageFid = fid
    }
  },
  /**
   * 重置高亮
   */
  resetLinkage({ state }) {
    state.linkageFid = ''
  }
}

export default Vue.observable(mutations)
