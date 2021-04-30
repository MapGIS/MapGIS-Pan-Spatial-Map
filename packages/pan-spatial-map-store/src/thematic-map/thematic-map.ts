import { BaseConfig } from 'src/config/base'
import resultSet from 'src/result-set/result-set'
import Vue from 'vue'
import {
  IState,
  TModuleType,
  IThematicMapConfig,
  IThematicMapBaseConfig,
  IThematicMapSubjectConfig,
  IThematicMapSubjectNewConfig
} from './types'

// 专题服务
export const ThematicMapInstance = new Vue({
  data: () => {
    return {
      // 属性表|统计表|时间轴|专题添加|管理工具的开关集合
      moduleTypes: [],
      // 专题服务时间轴选中的年度
      selectedTime: '',
      // 选中的'单个专题服务配置'的年度列表
      selectedTimeList: [],
      // 所有选中的'单个专题服务配置'
      selected: '',
      // 所有选中的'单个专题服务配置'列表
      selectedList: [],
      // 专题服务总配置数据
      thematicMapConfig: {
        baseConfig: {},
        subjectConfig: {}
      }
    } as IState
  },
  computed: {
    /**
     * 获取某个专题服务展示弹框的开关状态
     */
    isVisible({ moduleTypes }) {
      return (type: TModuleType) => moduleTypes.includes(type)
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
     * @return undefind | {id, title..., config} | {id, title, ...., config: {
     * configType, configTimeList, configSubData
     * }}
     * confitType=> config.type
     * configTimeList => config.data.map(v => v.time)
     * configSubData => config.data.subData[0]
     */
    getSelectedConfig(): IThematicMapSubjectNewConfig | undefined {
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
     * 获取列表数据请求报文
     * @returns <object>
     */
    getRequestParams({ getBaseConfig, getSelectedConfig }) {
      const { baseIp, basePort } = getBaseConfig
      const { configType = 'gdbp', configSubData } = getSelectedConfig
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
      return (page = 0, pageCount = 9999) => {
        let params: any = {
          ip: _ip,
          port: _port,
          fields,
          page,
          pageCount,
          IncludeGeometry: true,
          cursorType: 'backward',
          f: 'json'
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
    }
  },
  methods: {
    /**
     * 保存专题服务展示弹框的开关
     */
    setVisible(type: TModuleType) {
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
    resetVisible() {
      this.moduleTypes = []
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
    },

    /**
     * 重置所有设置
     */
    reset() {
      // todo
    }
  }
})

export default ThematicMapInstance
