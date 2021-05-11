import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component({})
export default class MeasureMixin extends Vue {
  @Prop({
    type: Object,
    default: () => {
      return {
        textType: '宋体',
        textColor: '#3300CC',
        textSize: 16,
        lineColor: '#CC3333',
        lineType: '实线',
        lineOpacity: 100,
        lineWidth: 3
      }
    }
  })
  measureSetting!: Record<string, any>

  @Prop({
    type: String,
    default: ''
  })
  distanceUnit!: string

  @Prop({
    type: String,
    default: ''
  })
  areaUnit!: string

  private measureMode = ''

  // 距离单位改变
  @Watch('distanceUnit')
  distanceUnitChange() {
    this.onDistanceUnitChange()
  }

  // 面积单位改变
  @Watch('areaUnit')
  areaUnitChange() {
    this.onAreaUnitChange()
  }

  // 测量覆盖物样式设置改变
  @Watch('measureSetting', { deep: true, immediate: true })
  measureSettingChange() {
    this.onMeasureSettingChange()
  }

  // 打开测量
  openMeasure(mode) {}

  // 清除测量
  clearMeasure() {}

  // 距离单位变化
  onDistanceUnitChange() {}

  // 面积单位变化
  onAreaUnitChange() {}

  // 测量覆盖物样式变化
  onMeasureSettingChange() {}
}
