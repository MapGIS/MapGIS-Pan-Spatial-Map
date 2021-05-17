import { Vue, Component } from 'vue-property-decorator'
import { thematicMapInstance } from '@mapgis/pan-spatial-map-store'

@Component
export default class ThematicMapMixin extends Vue {
  // 加载
  get isLoading() {
    return thematicMapInstance.isLoading
  }

  // 获取选中专题
  get selected() {
    return thematicMapInstance.getSelected
  }

  // 获取时间轴已选中的年度(回显至时间选项)
  get selectedTime() {
    return thematicMapInstance.getSelectedTime
  }

  // 获取选中专题对应年度的配置数据
  get configSubData() {
    return thematicMapInstance.getSelectedConfig?.configSubData
  }

  // 获取选中专题的年度列表
  get configTimeList() {
    return thematicMapInstance.getSelectedTimeList
  }

  // 获取属性表缓存的分页的数据
  get pageDataSet() {
    return thematicMapInstance.getPageDataSet
  }
}
