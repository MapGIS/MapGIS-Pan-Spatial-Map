import { ModuleType, IThematicMapBaseConfig, IState, IGetters } from './types'

export default {
  // 获取某个专题服务展示弹框的开关状态
  isVisible: (state: IState) => (type: ModuleType) =>
    state.moduleTypes.includes(type),
  // 加载
  loading: (state: IState) => state.loading,
  // 获取选中专题ID
  selected: (state: IState) => state.selected,
  // 获取选中专题集合
  selectedList: (state: IState) => state.selectedList,
  // 获取时间轴已选中的年度
  selectedTime: (state: IState) => state.selectedTime,
  // 获取属性表缓存的分页的数据
  pageDataSet: (state: IState) => state.pageDataSet,
  // 基础配置
  baseConfig: (state: IState) => state.thematicMapConfig.baseConfig,
  /**
   * 获取选中的'单个专题服务配置'的配置
   * 1.如果传入了configId,则取对应的单个专题, 如果没有传,则取勾选的最后一个专题
   * 2.融合了原有配置,将config里的字段提取出来存放
   * @return undefind | {id, title...} | {id, title, ...., configType, configTimeList, configSubData }
   * confitType=> subject.config.type
   * configTimeList => subject.config.data.map(v => v.time)
   * configSubData => subject.config.data.subData[0]
   */
  subjectConfig: (state: IState) => {
    const { selectedList, selected, selectedTime } = state
    const subject = selectedList.find(({ id }) => id === selected)
    if (!subject) return
    const { config, ...others } = subject
    let configType: string | undefined
    let configSubData: any
    const configTimeList: string[] = []
    if (config) {
      const { type, data } = config
      configType = type
      if (data && data.length) {
        data.forEach(item => {
          const { time, subData } = item
          configTimeList.push(time)
          if (time === selectedTime) {
            configSubData = subData && subData.length ? subData[0] : item
          }
        })
      }
    }
    return {
      ...others,
      configType,
      configTimeList,
      configSubData
    }
  },
  // 获取选中专题对应年度的配置数据
  configSubData: (state: IState, getters: IGetters) =>
    getters.subjectConfig(state)?.configSubData,
  // 获取选中专题的年度列表
  configTimeList: (state: IState, getters: IGetters) =>
    getters.subjectConfig(state)?.configTimeList || []
}
