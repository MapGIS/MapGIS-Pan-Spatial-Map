import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component({})
export default class MeasureMixin extends Vue {
  @Prop({
    type: Object,
    required: true
  })
  measureStyle!: Record<string, any>

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
  @Watch('measureStyle', { deep: true })
  measureStyleChange() {
    this.onMeasureStyleChange()
  }

  // 打开测量工具
  openMeasure(mode) {}

  // 关闭测量工具
  closeMeasure() {}

  // 距离单位变化
  onDistanceUnitChange() {}

  // 面积单位变化
  onAreaUnitChange() {}

  // 测量覆盖物样式变化
  onMeasureStyleChange() {}
}
