import Vue from 'vue'
import {
  IState,
  TModuleType,
  IThematicMap,
  IThematicMapBaseConfig,
  IThematicMapSubjectConfig
} from './types'

// 专题服务
export const ThematicMapInstance = new Vue({
  data: () => {
    return {
      // 属性表|统计表|时间轴|专题添加|管理工具的开关
      visible: [],
      // 专题服务时间轴当前年度
      selectedYear: '',
      // 当前选中的专题配置数据
      selectedSujectConfig: null,
      // 专题服务数据
      thematicMapConfig: {
        baseConfig: null,
        subjectConfig: null
      }
    } as IState
  },
  computed: {
    /**
     * 获取某个开关状态
     */
    isVisible() {
      return (type: TModuleType) => this.visible.includes(type)
    },
    /**
     * 获取基本配置数据
     */
    getBaseConfig() {
      return this.thematicMapConfig.baseConfig
    },
    /**
     * 获取专题配置数据
     */
    getSubjectConfig() {
      return this.thematicMapConfig.subjectConfig
    },
    /**
     *  获取选中的专题配置数据
     */
    getSelectedSujectConfig() {
      return this.selectedSujectConfig
    },

    /**
     * 获取选中的年度
     */
    getSelectedYear() {
      return this.selectedYear
    }
  },
  methods: {
    /**
     * 设置专题服务开关
     */
    setVisible(type: TModuleType) {
      const index = this.visible.indexOf(type)
      if (index !== -1) {
        this.visible.splice(index, 1)
      } else {
        this.visible.push(type)
      }
    },

    /**
     * 设置专题服务开关
     */
    resetVisible() {
      this.visible = []
    },

    /**
     * 设置专题服务数据
     * @param config<object>
     */
    setThematicMapConfig(config: IThematicMap) {
      this.thematicMapConfig = config
    },

    /**
     * 设置选中的专题配置数据
     * @param config<object>
     */
    setSelectedSujectConfig(config: any) {
      this.selectedSujectConfig = config
    },

    /**
     * 设置选中的年度
     * @param year<string|number>
     */
    setSelectedYear(year: string | number) {
      if (this.selectedYear !== year) {
        this.selectedYear = year
      }
    },

    /**
     * 重置
     */
    reset() {
      // todo
    }
  }
})

export default ThematicMapInstance
