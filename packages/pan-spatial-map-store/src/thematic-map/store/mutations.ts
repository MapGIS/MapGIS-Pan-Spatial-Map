import _cloneDeep from 'lodash/cloneDeep'
import { queryFeaturesInstance, FeatureIGS } from '../../service'
import {
  ModuleType,
  IThematicMapConfig,
  IThematicMapBaseConfig,
  IThematicMapSubjectConfig,
  IContext,
  IGetters
} from '../types'

const mutations = {
  /**
   * 加载
   */
  setLoading({ state }: IContext, loading: boolean) {
    state.loading = loading
  },

  /**
   * 保存专题服务展示弹框的开关
   */
  setVisible({ state }: IContext, type: ModuleType) {
    const index = state.moduleTypes.indexOf(type)
    if (index !== -1) {
      state.moduleTypes.splice(index, 1)
    } else {
      state.moduleTypes.push(type)
    }
  },
  /**
   * 设置分页
   */
  setPage({ state }: IContext, { page, pageCount }) {
    state.pageParam = {
      page: page - 1,
      pageCount
    }
  },

  /**
   * 保存当前页的查询的要素数据
   */
  setPageDataSet({ state }: IContext, dataSet: FeatureIGS | null) {
    state.pageDataSet = _cloneDeep(dataSet)
  },
  /**
   * 查询要素
   * @param onSuccess
   * @param onError
   */
  setFeaturesQuery(
    { state, getters }: IContext,
    {
      onSuccess,
      onError
    }: {
      onSuccess: (dataSet: FeatureIGS | any) => void
      onError: (e: Event) => void
    }
  ) {
    const { baseConfig, subjectConfig } = getters
    if (subjectConfig) {
      const { configType = 'gdbp', configSubData } = subjectConfig
      const { baseIp, basePort } = baseConfig as IThematicMapBaseConfig
      const {
        ip = baseIp,
        port = basePort,
        gdbp,
        docName,
        layerName,
        layerIndex: layerIdxs,
        table: { showFields }
      } = configSubData
      const fields = showFields.join(',')
      let params: any = {
        ip,
        port,
        fields,
        IncludeGeometry: true,
        cursorType: 'backward',
        f: 'json',
        ...state.pageParam
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
      state.loading = true
      const fn = queryFeaturesInstance.query(params)
      if (fn && fn.then) {
        fn.then((dataSet: FeatureIGS | any) => {
          state.loading = false
          state.pageDataSet = dataSet
          onSuccess && onSuccess(dataSet)
        }).catch(e => {
          onError && onError(e)
          state.loading = false
        })
      }
    }
  },

  /**
   * 设置专题服务的基础和专题配置数据
   */
  setThematicMapConfig({ state }: IContext, config: IThematicMapConfig) {
    state.thematicMapConfig = config
  },

  /**
   * 设置选中的'单个专题服务配置'
   */
  setSelected({ state }: IContext, id: string) {
    if (state.selected !== id) {
      state.selected = id
    }
  },

  /**
   * 设置选中的'单个专题服务配置'列表
   */
  setSelectedList(
    { state }: IContext,
    configList: IThematicMapSubjectConfig[]
  ) {
    state.selectedList = configList
  },

  /**
   * 设置单个专题服务中选中的年度
   */
  setSelectedTime({ state }: IContext, year: string) {
    if (state.selectedTime !== year) {
      state.selectedTime = year
    }
  },

  /**
   * 重置专题服务展示弹框的开关
   */
  resetVisible({ state }: IContext, type: ModuleType) {
    if (type) {
      state.moduleTypes.splice(state.moduleTypes.indexOf(type), 1)
    } else {
      state.moduleTypes = []
    }
    console.log('state.moduleTypes', state.moduleTypes)
  }
}

export default mutations
