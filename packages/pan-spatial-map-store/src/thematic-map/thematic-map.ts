import Vue from 'vue'
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
      // 页码
      page: 1,
      // 页容量
      pageCount: 10,
      // 属性表|统计表|时间轴|专题添加|管理工具的开关集合
      moduleTypes: [],
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
     * 属性表分页设置
     */
    pageParam() {
      return {
        page: this.page,
        pageCount: this.pageCount
      }
    },
    /**
     * 获取某个专题服务展示弹框的开关状态
     */
    isVisible() {
      return (type: ModuleType) => this.moduleTypes.includes(type)
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
     *  获取选中的'单个专题服务配置'
     */
    getSelected() {
      return this.selected
    },
    /**
     *  获取选中的'单个专题服务配置'集合(属性表专题选择框需要)
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
      return this.selectedTimeList
    },
    /**
     * 获取选中的'单个专题服务配置'的配置
     * 1.如果传入了configId,则取对应的单个专题, 如果没有传,则取勾选的最后一个专题
     * 2.融合了原有配置,将config里的字段提取出来存放
     * @return undefind | {id, title..., config} | {id, title, ...., config: {
     * configType, configTimeList, configSubData
     * }}
     * confitType=> config.type
     * configTimeList => config.data.map(v => v.time)
     * configSubData => config.data.subData[0]
     */
    getSelectedConfig() {
      const subject = this.selectedList.find(({ id }) => id === this.selected)
      if (subject) {
        const { config, ...others } = subject
        if (config) {
          const { type, data } = config
          const result: IThematicMapSubjectNewConfig = {
            ...others,
            configType: type
          }
          if (data && data.length) {
            result.configTimeList = data.map(v => v.time)
            if (this.selectedTime) {
              const _data = data.find(v => v.time === this.selectedTime)
              if (_data && _data.subData.length) {
                result.configSubData = _data.subData[0]
              }
            }
          }
          return result
        }
      }
      return subject
    },
    /**
     * 获取QueryFeature数据请求报文
     * @returns <object>
     */
    getQueryFeatureParams() {
      const { getBaseConfig, getSelectedConfig, pageParam } = this
      if (!this.getSelectedConfig) return
      const { baseIp, basePort } = this.getBaseConfig as IThematicMapBaseConfig
      const { configType = 'gdbp', configSubData } = this.getSelectedConfig
      const {
        ip,
        port,
        gdbp,
        docName,
        layerIndex,
        layerName,
        table: { showFields }
      } = configSubData
      // 整合参数
      const _ip = ip || baseIp
      const _port = port || basePort
      const fields = showFields.join(',')
      let params: any = {
        ip: _ip,
        port: _port,
        fields,
        IncludeGeometry: true,
        cursorType: 'backward',
        f: 'json',
        ...this.pageParam
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
    }
  },
  methods: {
    /**
     * 设置分页
     * @param page<number>
     * @param pageCount <number>
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
     * 保存专题服务展示弹框的开关
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
     * 重置专题服务展示弹框的开关
     */
    resetVisible(type?: ModuleType) {
      if (type) {
        this.moduleTypes.splice(this.moduleTypes.indexOf(type), 1)
      } else {
        this.moduleTypes = []
      }
    },

    /**
     * 设置专题服务的基础和专题配置数据
     * @param config<object>
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
     * 设置选中的'单个专题服务配置'年度列表
     * @param timeList<array>
     */
    setSelectedTimeList(timeList: string[]) {
      this.selectedTimeList = timeList
    }
  }
})

export default thematicMapInstance
