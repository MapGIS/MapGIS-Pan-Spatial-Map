import Vue from 'vue'
import { ModuleType, State } from '../types'

const getters = {
  // 获取某个功能模块的开关状态
  isVisible: ({ modules }: State) => (t: ModuleType) => modules.includes(t),
  // 加载
  loading: (state: State) => state.loading,
  // 获取要素查询当前页数据
  pageGeojson: (state: State) => state.pageGeojson,
  // 获取选中专题对应年度的专题数据
  subjectData: (state: State) => state.subjectData,
  // 获取选中的专题
  selectedSubject: (state: State) => state.selectedSubject,
  // 获取选中的专题集合
  selectedSubjectList: (state: State) => state.selectedSubjectList,
  // 获取时间轴已选中的年度
  selectedSubjectTime: (state: State) => state.selectedSubjectTime,
  // 获取选中专题的年度列表
  selectedSubjectTimeList: (state: State) => state.selectedSubjectTimeList,
  // 基础配置
  baseConfig: (state: State) => state.baseConfig,
  // 专题配置
  subjectConfig: (state: State) => state.subjectConfig,
  // 图属联动项
  linkageFid: (state: State) => state.linkageFid
}

export default Vue.observable(getters)
