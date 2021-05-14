import '../../../../libs/zondyclient/webclient-mapboxgl-plugin.min.js'
import { Vue, Component, Inject } from 'vue-property-decorator'
import {
  utilInstance,
  thematicMapInstance
} from '@mapgis/pan-spatial-map-store'

@Component
export default class MapboxThematicMapLayersMinxin extends Vue {
  @Inject('map') map: any

  @Inject('mapbox') mapbox: any

  thematicMapLayer: any = null

  // 获取某个专题某个年度的subData
  get subDataConfig() {
    return thematicMapInstance.getSelectedConfig?.configSubData
  }

  // 获取参数
  get featureParams() {
    return thematicMapInstance.getQueryFeatureParams
  }

  /**
   * 初始化图层
   */
  initLayer() {
    return utilInstance.debounce(this.showLayer, 1000)
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
