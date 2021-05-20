import Vue from 'vue'
import {
  queryFeaturesInstance,
  FeatureQueryParam,
  FeatureIGS
} from '../service'
import {
  IState,
  IMethods,
  IComputed,
  ModuleType,
  ISubjectType,
  IThematicMapConfig,
  IThematicMapBaseConfig,
  IThematicMapSubjectConfig,
  IThematicMapSubjectNewConfig
} from './types'
import isArray from 'lodash/isArray'

// 专题图类型集合
export const subjectTypes = Object.freeze<ISubjectType>([
  { value: 'SubSectionMap', label: '分段专题图' },
  { value: 'BaseMapWithGraph', label: '统计专题图' },
  { value: 'StatisticLabel', label: '等级符号专题图' },
  { value: 'Label', label: '聚合标注专题图' },
  { value: 'HeatMap', label: '热力图' },
  { value: 'HexBin', label: '蜂窝图' }
])

// 专题服务
export const thematicMapInstance = new Vue<IState, IMethods, IComputed>({
  data: () => {
    return {
      // 属性表|统计表|时间轴|专题添加|管理工具的开关集合
      moduleTypes: [],
      // 加载状态
      loading: false,
      // 页码
      page: 0,
      // 页容量
      pageCount: 10,
      // 当前页的查询的要素数据
      pageDataSet: null,
      // 专题服务时间轴选中的年度
      selectedTime: '',
      // 选中的'单个专题服务配置'的年度列表
      selectedTimeList: [],
      // 选中的'单个专题服务配置'
      selected: '',
      // 所有选中的'单个专题服务配置'列表
      selectedList: [],
      // 专题服务总配置数据
      thematicMapConfig: {
        baseConfig: {},
        subjectConfig: {}
      }
    }
  },
  computed: {
    /**
     * 获取某个专题服务展示弹框的开关状态
     */
    isVisible() {
      return (type: ModuleType) => this.moduleTypes.includes(type)
    },
    /**
     * 加载
     * @returns
     */
    isLoading() {
      return this.loading
    },
    /**
     * 属性表分页设置
     */
    pageParam() {
      return {
        page: this.page - 1,
        pageCount: this.pageCount
      }
    },
    /**
     * 当前页的查询的要素数据
     */
    getPageDataSet() {
      return this.pageDataSet
    },
    /**
     * 获取专题服务基本配置数据
     */
    getBaseConfig() {
      return this.thematicMapConfig.baseConfig
    },
    /**
     * 获取专题服务集合配置数据
     */
    getSubjectConfig() {
      return this.thematicMapConfig.subjectConfig
    },
    /**
     * 获取选中的'单个专题服务配置'的配置
     * 1.如果传入了configId,则取对应的单个专题, 如果没有传,则取勾选的最后一个专题
     * 2.融合了原有配置,将config里的字段提取出来存放
     * @return undefind | {id, title...} | {id, title, ...., configType, configTimeList, configSubData }
     * confitType=> subject.config.type
     * configTimeList => subject.config.data.map(v => v.time)
     * configSubData => subject.config.data.subData[0]
     */
    getSelectedConfig() {
      const subject = this.selectedList.find(({ id }) => id === this.selected)
      if (!subject) return
      const { config, ...others } = subject
      const result: IThematicMapSubjectNewConfig = others
      if (config) {
        const { type, data } = config
        result.configType = type
        if (data && data.length) {
          result.configTimeList = data.map(v => v.time)
          const item = data.find(v => v.time === this.selectedTime)
          if (item) {
            result.configSubData =
              item.subData && item.subData.length ? item.subData[0] : item
          }
        }
      }
      return result
    },
    /**
     * 获取选中的'单个专题服务配置'
     */
    getSelected() {
      return this.selected
    },
    /**
     * 获取选中的'单个专题服务配置'集合(属性表专题选择框需要)
     */
    getSelectedList() {
      return this.selectedList
    },
    /**
     * 获取单个专题服务中选中的年度
     */
    getSelectedTime() {
      return this.selectedTime
    },
    /**
     * 获取最后勾选的单个专题服务的年度列表(时间轴数据)
     */
    getSelectedTimeList() {
      return this.getSelectedConfig ? this.getSelectedConfig.configTimeList : []
    }
  },
  methods: {
    /**
     * 获取QueryFeature数据请求报文
     */
    parseFeatureQueryParams() {
      if (!this.getSelectedConfig) return
      const { baseIp, basePort } = this.getBaseConfig as IThematicMapBaseConfig
      const { configType = 'gdbp', configSubData } = this.getSelectedConfig
      const {
        ip = baseIp,
        port = basePort,
        gdbp,
        docName,
        layerIndex,
        layerName,
        table: { showFields }
      } = configSubData
      const fields = showFields.join(',')
      let params: any = {
        ip,
        port,
        fields,
        ...this.pageParam,
        IncludeGeometry: true,
        cursorType: 'backward',
        f: 'json',
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
            ...params,
            docName,
            layerIndex,
            layerName
          }
          break
        default:
          break
      }
      return params
    },
    /**
     * 加载
     * @param loading
     */
    setLoading(loading: boolean) {
      if (this.loading !== loading) {
        this.loading = loading
      }
    },
    /**
     * 保存专题服务展示弹框的开关
     * @param 弹框类型
     */
    setVisible(type: ModuleType) {
      const index = this.moduleTypes.indexOf(type)
      if (index !== -1) {
        this.moduleTypes.splice(index, 1)
      } else {
        this.moduleTypes.push(type)
      }
    },
    /**
     * 设置分页
     * @param page 页码
     * @param pageCount 页容量
     */
    setPage(page: number, pageCount: number) {
      if (this.page !== page) {
        this.page = page
      }
      if (this.pageCount !== pageCount) {
        this.pageCount = pageCount
      }
    },
    /**
     * 保存当前页的查询的要素数据
     * @param dataSet
     */
    setPageDataSet(dataSet: FeatureIGS) {
      this.pageDataSet = dataSet
    },

    /**
     * 查询要素
     * @param onSuccess
     * @param onError
     */
    setFeaturesQuery(
      onSuccess?: (a: FeatureIGS) => void,
      onError?: (e: Event) => void
    ) {
      return (params?: FeatureQueryParam) => {
        this.setLoading(true)
        const fn = queryFeaturesInstance.query({
          ...this.parseFeatureQueryParams(),
          ...(params || {})
        })
        if (fn && fn.then) {
          fn.then(dataSet => {
            this.setPageDataSet(dataSet)
            onSuccess && onSuccess(dataSet)
            this.setLoading(false)
          }).catch(e => {
            onError && onError(e)
            this.setLoading(false)
          })
        }
      }
    },
    /**
     * 设置专题服务的基础和专题配置数据
     * @param config 整个专题配置树
     */
    setThematicMapConfig(config: IThematicMapConfig) {
      this.thematicMapConfig = config
    },
    /**
     * 设置选中的'单个专题服务配置'
     * @param configId<string>
     */
    setSelected(configId: string) {
      if (this.selected !== configId) {
        this.selected = configId
      }
    },
    /**
     * 设置选中的'单个专题服务配置'列表
     * @param configList<array>
     */
    setSelectedList(configList: IThematicMapSubjectConfig[]) {
      this.selectedList = configList
    },
    /**
     * 设置单个专题服务中选中的年度
     * @param year<string>
     */
    setSelectedTime(year: string) {
      if (this.selectedTime !== year) {
        this.selectedTime = year
      }
    },
    /**
     * 重置专题服务展示弹框的开关
     * @param 弹框类型
     */
    resetVisible(type?: ModuleType) {
      if (type) {
        this.moduleTypes.splice(this.moduleTypes.indexOf(type), 1)
      } else {
        this.moduleTypes = []
      }
    }
  }
})

export default thematicMapInstance
