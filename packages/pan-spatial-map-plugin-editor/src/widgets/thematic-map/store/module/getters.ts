import Vue from 'vue'
import { ModuleType, IState } from '../types'

const getters = {
  // 获取某个功能模块的开关状态
  isVisible: ({ moduleTypes }: IState) => (t: ModuleType) =>
    moduleTypes.includes(t),
  // 加载
  loading: (state: IState) => state.loading,
  // 获取要素查询当前页数据
  pageDataSet: (state: IState) => state.pageDataSet,
  // 获取选中专题对应年度的专题数据
  subjectData: (state: IState) => state.subjectData,
  // 获取选中的专题
  selectedSubject: (state: IState) => state.selectedSubject,
  // 获取选中的专题集合
  selectedSubjectList: (state: IState) => state.selectedSubjectList,
  // 获取时间轴已选中的年度
  selectedSubjectTime: (state: IState) => state.selectedSubjectTime,
  // 获取选中专题的年度列表
  selectedSubjectTimeList: (state: IState) => state.selectedSubjectTimeList,
  // 基础配置
  baseConfig: (state: IState) => state.baseConfig,
  // 专题配置
  subjectConfig: (state: IState) => state.subjectConfig,
  // 图属联动项
  linkageItem: (state: IState) => state.linkageItem
}

export default Vue.observable(getters)
