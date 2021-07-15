import Vue from 'vue'
import { ModuleType, IState } from '../types'

const getters = {
  // 获取某个专题服务展示弹框的开关状态
  isVisible: ({ moduleTypes }: IState) => (t: ModuleType) =>
    moduleTypes.includes(t),
  // 加载
  loading: (state: IState) => state.loading,
  // 获取属性表缓存的分页的数据
  pageDataSet: (state: IState) => state.pageDataSet,
  // 基础配置
  baseConfig: (state: IState) => state.baseConfig,
  // 专题配置
  subjectConfig: (state: IState) => state.subjectConfig,
  // 获取选中专题集合
  selectedList: (state: IState) => state.selectedList,
  // 获取选中专题ID
  selected: (state: IState) => state.selected,
  // 获取时间轴已选中的年度
  selectedTime: (state: IState) => state.selectedTime,
  // 获取选中专题对应年度的subData的第一个数据
  selectedSubConfig: (state: IState) => state.selectedSubConfig,
  // 获取选中专题的年度列表
  selectedTimeList: (state: IState) => state.selectedTimeList,
  // 高亮项
  highlightItem: (state: IState) => state.highlightItem
}

export default Vue.observable(getters)
