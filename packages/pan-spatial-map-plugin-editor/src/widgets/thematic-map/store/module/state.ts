import Vue from 'vue'
import { IState } from '../types'

const localSubjectConfig = JSON.parse(
  localStorage.getItem('subjectConfig') as string
)

export default Vue.observable<IState>({
  // 属性表(at)|统计表(st)|时间轴(tl)|专题添加(sa)|管理工具的开关集合(mt)
  moduleTypes: [],

  // 数据加载状态
  loading: false,

  // 页码和页容量
  pageParam: {
    page: 0,
    pageCount: 10
  },

  // 当前页的查询的要素数据
  pageDataSet: null,

  // 选中的专题的年度的专题数据
  subjectData: null,

  // 选中专题的当前选中的年度
  selectedSubjectTime: '',

  // 选中专题的年度列表
  selectedSubjectTimeList: [],

  // 选中的专题
  selectedSubject: null,

  // 所有选中的专题的集合
  selectedSubjectList: [],

  // 专题图基础配置
  baseConfig: null,

  // 专题图专题配置
  subjectConfig: localSubjectConfig,

  // 高亮的选项
  linkageItem: null
})
