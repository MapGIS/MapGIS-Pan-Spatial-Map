import Vue from 'vue'
import { IState } from '../types'

export default Vue.observable<IState>({
  // 属性表|统计表|时间轴|专题添加|管理工具的开关集合
  moduleTypes: [],

  // 加载状态
  loading: false,

  // 页码
  pageParam: {
    page: 0,
    pageCount: 10
  },

  // 当前页的查询的要素数据
  pageDataSet: null,

  // 选中的单个专题服务
  selected: '',

  // 专题服务时间轴选中的年度
  selectedTime: '',

  // 选中的单个专题服务的第一个subData
  selectedSubConfig: null,

  // 选中的单个专题服务的年度列表
  selectedTimeList: [],

  // 所有选中的专题服务集合
  selectedList: [],

  // 专题服务配置
  subjectConfig: null,

  // 基础配置
  baseConfig: null
})
