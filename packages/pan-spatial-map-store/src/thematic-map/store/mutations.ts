import Vue from 'vue'
import _cloneDeep from 'lodash/cloneDeep'
import { queryFeaturesInstance, FeatureIGS } from '../../service'
import {
  IContext,
  ModuleType,
  IThematicMapBaseConfig,
  IThematicMapSubjectConfig
} from '../types'

const mutations = {
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
   * 加载
   */
  setLoading({ state }: IContext, loading: boolean) {
    state.loading = loading
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
  setFeaturesQuery({ state }: IContext, { onSuccess, onError }) {
    const { pageParam, selectedSubConfig, baseConfig } = state
    if (selectedSubConfig) {
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
  setThematicMapConfig({ state }: IContext, { baseConfig, subjectConfig }) {
    state.baseConfig = baseConfig
    state.subjectConfig = subjectConfig
  },

  /**
   * 设置选中的单个专题服务
   */
  setSelected({ state, commit }: IContext, id: string) {
    if (state.selected !== id) {
      state.selected = id
      const subject = state.selectedList.find(item => item.id === id)
      if (subject && subject.config) {
        const { type, data } = subject.config
        if (data && data.length) {
          commit(
            'setSelectedTimeList',
            data.map(v => v.time)
          )
          data.forEach(item => {
            const { time, subData } = item
            if (time === state.selectedTime) {
              const selectedSubConfig =
                subData && subData.length ? subData[0] : item
              commit('setSelectedSubConfig', {
                ...selectedSubConfig,
                configType: type
              })
            }
          })
        }
      }
    }
  },

  /**
   * 设置选中的年度
   */
  setSelectedTime({ state }: IContext, year: string) {
    if (state.selectedTime !== year) {
      state.selectedTime = year
    }
  },
  /**
   * 设置选中专题的年度列表
   */
  setSelectedTimeList({ state }: IContext, timeList: string[]) {
    state.selectedTimeList = timeList
  },
  /**
   * 设置选中专题的年度列表
   */
  setSelectedSubConfig({ state }: IContext, config: any) {
    state.selectedSubConfig = config
  },
  /**
   * 设置选中的专题服务集合
   */
  setSelectedList(
    { state }: IContext,
    configList: IThematicMapSubjectConfig[]
  ) {
    state.selectedList = configList
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
  }
}

export default Vue.observable(mutations)
