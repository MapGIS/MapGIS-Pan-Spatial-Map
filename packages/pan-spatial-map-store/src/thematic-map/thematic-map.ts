import { BaseConfig } from 'src/config/base'
import resultSet from 'src/result-set/result-set'
import Vue from 'vue'
import {
  IState,
  TModuleType,
  IThematicMapConfig,
  IThematicMapBaseConfig,
  IThematicMapSubjectConfig,
  ISingleSubjectConfigData
} from './types'

// 专题服务
export const ThematicMapInstance = new Vue({
  data: () => {
    return {
      // 属性表|统计表|时间轴|专题添加|管理工具的开关集合
      moduleTypes: [],
      // 专题服务时间轴选中的年度
      selectedSujectConfigTime: '',
      // 所有选中的'单个专题服务配置'列表
      selectedSujectConfigList: [],
      // 选中的'单个专题服务配置'的年度列表
      selectedSujectConfigTimeList: [],
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
     *  获取选中的'单个专题服务配置'集合(属性表专题选择框需要)
     */
    getSelectedSujectConfigList() {
      return this.selectedSujectConfigList
    },
    /**
     *  获取选中的'单个专题服务配置'的新配置, 融合了原有配置,将config里的字段提取出来存放
     * @return undefind | {id, title...,config} | {id, title, ...., configType, configData} 其中confitType=> config.type, configData => config.data
     */
    getSelectedSujectConfig() {
      return (
        configId: string,
        time?: string
      ): IThematicMapSubjectConfig | void => {
        const subject = this.selectedSujectConfigList.find(
          ({ id }) => id === configId
        )

        if (subject) {
          const { config, ...others } = subject
          if (config) {
            const { type, data } = config
            const result = {
              ...others,
              configType: type,
              configData: data
            }

            if (time) {
              const _data = data.find(v => v.time === time)
              if (_data && _data.subData.length) {
                result.configSubData = _data.subData[0]
              }
            }
            return result
          }
        }
        return subject
      }
    },

    /**
     * 获取最后勾选的单个专题服务的年度列表(时间轴数据)
     */
    getSelectedSujectConfigTimeList() {
      return this.selectedSujectConfigTimeList
    },
    /**
     * 获取单个专题服务中选中的年度
     */
    getSelectedSubjectConfigTime() {
      return this.selectedSujectConfigTime
    },

    /**
     * 获取列表数据请求报文
     * @returns <object>
     */
    getRequestParams({ getBaseConfig }) {
      const { baseIp: ip, basePort: port } = getBaseConfig

      return (params: any) => {
        return {
          ip,
          port,
          ...params
        }
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
     * 设置选中的'单个专题服务配置'列表
     * @param configList<array>
     */
    setSelectedSujectConfigList(configList: IThematicMapSubjectConfig[]) {
      this.selectedSujectConfigList = configList
    },

    /**
     * 设置选中的'单个专题服务配置'年度列表
     * @param timeList<array>
     */
    setSelectedSubjectConfigTimeList(timeList: string[]) {
      this.selectedSujectConfigTimeList = timeList
    },

    /**
     * 设置单个专题服务中选中的年度
     * @param year<string>
     */
    setSelectedSubjectConfigTime(year: string) {
      if (this.selectedSujectConfigTime !== year) {
        this.selectedSujectConfigTime = year
      }
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
