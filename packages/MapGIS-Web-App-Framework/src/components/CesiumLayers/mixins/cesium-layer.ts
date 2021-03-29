import { Vue, Component, Prop, Inject } from 'vue-property-decorator'
import {
  queryFeaturesInstance,
  LayerInfoQueryParam
} from '@mapgis/pan-spatial-map-store'

@Component({})
export default class CesiumLayerMixin extends Vue {
  @Inject('webGlobe') webGlobe: any

  @Inject('Cesium') Cesium: any

  @Prop({ type: String, default: '' }) readonly url?: string

  @Prop({ type: String, default: 'http' }) readonly protocol?: string

  @Prop({ type: String, default: '' }) readonly ip?: string

  @Prop({ type: String, default: '' }) readonly port?: string

  @Prop({ type: String, default: '' }) readonly serverName?: string

  @Prop({ type: String, default: '' }) readonly domain?: string

  @Prop({ type: Boolean, default: true }) readonly show?: boolean

  @Prop({ type: String, default: '' }) readonly id!: string

  @Prop({ type: String, default: undefined }) readonly token!: string

  public layer: any = undefined

  public layerInfo: any = {}

  mounted() {
    this.showLayer()
  }

  beforeDestroy() {
    this.remove()
  }

  /**
   * 显示图层，子组件在这里实现生成图层的函数
   */
  showLayer() {
    // 这里写生成图层函数
  }

  /**
   * 移除图层
   */
  remove() {}

  /**
   * 获取igs图层范围，坐标系等信息
   */
  async getIgsExtent(layerType: string) {
    const { ip, port, serverName } = this
    if (!ip || !port || !serverName) {
      return
    }
    const obj: LayerInfoQueryParam = {
      ip,
      port,
      serverName,
      layerType
    }
    this.layerInfo = await queryFeaturesInstance.getIgsLayerInfo(obj)
  }
}
