// import vueInstance from '../event-bus'
import {
  IThematicMapClass,
  IThematicMap,
  IThematicMapKeys,
  IThematicMapSubjectConfig
} from './types'

// 专题服务
export class ThematicMap implements IThematicMapClass {
  // 专题服务数据
  thematicMapConfig?: IThematicMap

  // 当前选中的专题配置数据
  currentSujectConfig?: IThematicMapSubjectConfig

  // 专题服务时间轴当前年度
  currentYear: string | number = ''

  /**
   * 获取专题服务总配置和内部配置数据
   * @param name<string>
   * @returns any
   */
  getConfig(name: IThematicMapKeys) {
    if (this.thematicMapConfig && name in this.thematicMapConfig) {
      return this.thematicMapConfig[name]
    }
    return this.thematicMapConfig
  }

  /**
   * 获取基本配置数据
   */
  getBaseConfig() {
    return this.getConfig('baseConfig')
  }

  /**
   * 获取专题配置数据
   */
  getSubjectConfig() {
    return this.getConfig('subjectConfig')
  }

  /**
   * 获取选中的年度
   */
  getCurrentYear() {
    return this.currentYear
  }

  /**
   * 设置专题服务数据
   * @param config<object>
   */
  setThematicMapConfig(config: IThematicMap) {
    this.thematicMapConfig = config
  }

  /**
   * 设置当前选中的专题配置数据
   * @param config<object>
   */
  setCurrentSujectConfig(config: IThematicMapSubjectConfig) {
    this.currentSujectConfig = config
  }

  /**
   * 设置当前选中的年度
   * @param year<string|number>
   */
  setCurrentYear(year?: string | number) {
    if (year && this.currentYear !== year) {
      this.currentYear = year
    }
  }

  /**
   * 重置专题服务数据
   */
  resetThematicMapConfig() {
    if (this.thematicMapConfig) {
      this.thematicMapConfig = undefined
    }
  }
}

const ThematicMapInstance = new ThematicMap()

export default ThematicMapInstance
