import Vue from 'vue'
import { State } from '../types'

export default Vue.observable<State>({
  // 属性表|统计表|时间轴|专题新建|工具栏
  modules: [],

  // 数据加载状态
  loading: false,

  // 当前页的查询的要素GeoJSON数据
  pageGeojson: null,

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
  subjectConfig: [],

  // 联动时的要素fid
  linkageFid: ''
})
