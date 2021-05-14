import { Vue, Component, Inject, Prop } from 'vue-property-decorator'

@Component
export default class MapboxThematicMapLayersMinxin extends Vue {
  @Inject('map') map: any

  @Inject('mapbox') mapbox: any

  @Prop({ default: () => ({}) }) config!: any // 某个专题的配置

  thematicMapLayer: any = null

  /**
   * 初始化图层
   */
  initLayer() {
    this.showLayer()
  }

  /**
   * 显示图层，子组件在这里实现生成图层的函数
   */
  showLayer() {}

  /**
   * 移除图层
   */
  remove() {
    if (this.thematicMapLayer) {
      const id = this.thematicMapLayer.id
      if (this.map.getLayer(id)) {
        this.map.removeLayer(id)
      } else {
        this.thematicMapLayer.clear()
        this.thematicMapLayer.removeFromMap()
      }
      this.thematicMapLayer = null
    }
  }

  /**
   * 重置图层
   */
  reset() {
    this.initLayer()
  }

  mounted() {
    this.initLayer()
  }

  beforeDestroy() {
    this.remove()
  }
}
