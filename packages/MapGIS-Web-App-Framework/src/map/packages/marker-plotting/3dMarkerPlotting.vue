<template>
  <div>
    <mp-3d-marker-set-pro
      :markers="markers"
      @mouseenter="mouseEnterEvent"
      @mouseleave="mouseLeaveEvent"
    >
      <template slot="popup" slot-scope="slotProps">
        <slot name="popup" v-bind="slotProps"></slot>
      </template>
    </mp-3d-marker-set-pro>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Prop,
  Watch,
  Inject,
  Vue,
  Emit
} from 'vue-property-decorator'
import Mp3dMarkerSetPro from '../marker-pro/3dMarkerSetPro.vue'
import { SceneOverlays } from '../../../model/overlay'
import { SceneController } from '../../../model/objects'

@Component({
  name: 'Mp3dMarkerPlotting',
  components: { Mp3dMarkerSetPro }
})
export default class Mp3dMarkerPlotting extends Vue {
  @Inject('Cesium') Cesium: any

  @Inject('CesiumZondy') CesiumZondy: any

  @Inject('webGlobe') webGlobe: any

  @Prop({
    type: Boolean,
    default: false
  })
  readonly filterWithMap!: boolean

  @Prop({
    type: Array,
    required: true
  })
  readonly markers!: Record<string, any>[]

  @Prop({
    type: Object,
    default: () => {
      return {}
    }
  })
  readonly fitBound!: Record<string, any>

  @Prop({
    type: Object,
    default: () => {
      return {}
    }
  })
  readonly selectionBound!: Record<string, any>

  @Prop({
    type: Array,
    default: () => {
      return [0, 0]
    }
  })
  readonly center!: number[]

  @Prop({
    type: Object,
    default: () => {
      return {}
    }
  })
  readonly highlightStyle!: Record<string, any>

  private entityNames: string[] = []

  @Watch('fitBound')
  changeMapBound() {
    if (this.fitBound) {
      const { xmin, ymin, xmax, ymax } = this.fitBound
      const Rectangle = new this.Cesium.Rectangle.fromDegrees(
        xmin,
        ymin,
        xmax,
        ymax
      )
      this.webGlobe.viewer.camera.flyTo({
        destination: Rectangle
      })
    }
  }

  @Watch('selectionBound')
  changeSelectionBound() {
    this.zoomOrPanTo(this.selectionBound)
  }

  currentLayer = null

  analysisManager = null

  changeFilterWithMap() {
    if (!this.filterWithMap) {
      return
    }
    const cExtent = this.sceneController.getCurrentExtent()
    const bounds = {
      xmin: cExtent.xmin,
      ymin: cExtent.ymin,
      xmax: cExtent.xmax,
      ymax: cExtent.ymax
    }
    this.emitMapBoundChange(bounds)
  }

  @Watch('center')
  changeCenter() {
    this.webGlobe.viewer.camera.flyTo({
      destination: this.Cesium.Cartesian3.fromDegrees(
        this.center[0],
        this.center[1],
        this.webGlobe.viewer.camera.positionCartographic.height
      )
    })
  }

  @Emit('map-bound-change')
  emitMapBoundChange(bound: Record<string, any>) {}

  mounted() {
    this.sceneOverlays = SceneOverlays.getInstance(
      this.Cesium,
      this.CesiumZondy,
      this.webGlobe
    )
    this.sceneController = SceneController.getInstance(
      this.Cesium,
      this.CesiumZondy,
      this.webGlobe
    )

    this.analysisManager = new this.CesiumZondy.Manager.AnalysisManager({
      viewer: this.webGlobe.viewer
    })
    this.webGlobe.viewer.camera.changed.addEventListener(
      this.changeFilterWithMap
    )
  }

  destroyed() {
    this.analysisManager = null
    this.webGlobe.viewer.camera.changed.removeEventListener(
      this.changeFilterWithMap
    )
  }

  private zoomTo(bound) {
    const Rectangle = new this.Cesium.Rectangle.fromDegrees(
      bound.xmin,
      bound.ymin,
      bound.xmax,
      bound.ymax
    )
    this.webGlobe.viewer.camera.flyTo({
      destination: Rectangle
    })
  }

  private zoomOrPanTo(bound) {
    const mapBound = this.getViewExtend()
    // 先查看是否在地图范围内
    if (
      bound.xmin > mapBound.xmin &&
      bound.ymin > mapBound.ymin &&
      bound.xmax < mapBound.xmax &&
      bound.ymax < mapBound.ymax
    ) {
      return
    }
    // 然后查看两个矩形的范围大小，如果选择集的范围较当前大，需要做缩放
    if (
      bound.xmax - bound.xmin > mapBound.xmax - mapBound.xmin ||
      bound.ymax - bound.ymin > mapBound.ymax - mapBound.ymin
    ) {
      const Rectangle = new this.Cesium.Rectangle.fromDegrees(
        bound.xmin,
        bound.ymin,
        bound.xmax,
        bound.ymax
      )
      this.webGlobe.viewer.camera.flyTo({
        destination: Rectangle
      })
    } else {
      this.webGlobe.viewer.camera.flyTo({
        destination: this.Cesium.Cartesian3.fromDegrees(
          (bound.xmin + bound.xmax) / 2,
          (bound.ymin + bound.ymax) / 2,
          this.webGlobe.viewer.camera.positionCartographic.height
        )
      })
    }
  }

  private mouseEnterEvent(e: any, id) {
    // 高亮要素
    const marker = this.markers.find(marker => marker.markerId == id)

    if (marker) {
      this.highlightFeature({
        features: [marker.feature],
        type: 'FeatureCollection'
      })
    }
  }

  private mouseLeaveEvent(e: any, id) {
    this.clearHighlight()
    this.stopDisplay()
  }

  private highlightFeature(featureGeoJSON) {
    // 需要根据要素类型来使用不同的type
    if (featureGeoJSON.features[0].geometry.type === 'Point') {
      // 点要素的高亮符号怎么处理?
    } else if (featureGeoJSON.features[0].geometry.type === 'LineString') {
      const lineColor = new this.Cesium.Color.fromCssColorString(
        this.highlightStyle.feature.line.color
      )
      for (let i = 0; i < featureGeoJSON.features.length; i += 1) {
        const coords = featureGeoJSON.features[i].geometry.coordinates
        const name = `result-entity-${i}`
        this.entityNames.push(name)
        this.sceneOverlays.addLine({
          name: name,
          pointsArray: coords
            .join(',')
            .split(',')
            .map(Number),
          width: this.highlightStyle.feature.line.size,
          color: lineColor
        })
      }
    } else if (featureGeoJSON.features[0].geometry.type === 'Polygon') {
      const fillColor = new this.Cesium.Color.fromCssColorString(
        this.highlightStyle.feature.reg.color
      )
      const fillOutlineColor = new this.Cesium.Color.fromCssColorString(
        this.highlightStyle.feature.line.color
      )
      for (let i = 0; i < featureGeoJSON.features.length; i += 1) {
        const coords = featureGeoJSON.features[i].geometry.coordinates[0]
        const name = `result-entity-${i}`
        this.entityNames.push(name)
        this.sceneOverlays.addPolygon(
          name,
          coords
            .join(',')
            .split(',')
            .map(Number),
          fillColor,
          fillOutlineColor
        )
      }
    } else if (featureGeoJSON.features[0].geometry.type === '3DPolygon') {
      const { source } = this.CesiumZondy.M3DIgsManager.findSource(
        'default',
        featureGeoJSON.features[0].id
      )
      if (source && source.length > 0) {
        this.stopDisplay()
        this.currentLayer = [source[0]]
        const idList = [featureGeoJSON.features[0].properties.FID]
        const options = {
          // 高亮颜色
          color: new this.Cesium.Color.fromCssColorString(
            this.highlightStyle.feature.reg.color
          ),
          // 高亮模式：REPLACE为替换
          colorBlendMode: this.Cesium.Cesium3DTileColorBlendMode.REPLACE
        }
        // 开始闪烁查找到的模型
        this.analysisManager.startCustomDisplay(
          this.currentLayer,
          idList,
          options
        )
      }
    }
  }

  stopDisplay() {
    if (this.currentLayer) {
      this.analysisManager.stopCustomDisplay(this.currentLayer)
      this.currentLayer = null
    }
  }

  private clearHighlight() {
    for (let i = this.entityNames.length - 1; i >= 0; i -= 1) {
      this.sceneOverlays.removeEntityByName(this.entityNames[i])
      this.entityNames.pop()
    }
  }

  private getViewExtend() {
    const params = {}
    const extend = this.webGlobe.viewer.camera.computeViewRectangle()
    if (typeof extend === 'undefined') {
      // 2D下会可能拾取不到坐标，extend返回undefined,所以做以下转换
      const canvas = this.webGlobe.viewer.scene.canvas
      // canvas左上角坐标转2d坐标
      const upperLeft = new this.Cesium.Cartesian2(0, 0)
      // canvas右下角坐标转2d坐标
      const lowerRight = new this.Cesium.Cartesian2(
        canvas.clientWidth,
        canvas.clientHeight
      )

      const ellipsoid = this.webGlobe.viewer.scene.globe.ellipsoid
      // 2D转3D世界坐标
      const upperLeft3 = this.webGlobe.viewer.camera.pickEllipsoid(
        upperLeft,
        ellipsoid
      )

      // 2D转3D世界坐标
      const lowerRight3 = this.webGlobe.viewer.camera.pickEllipsoid(
        lowerRight,
        ellipsoid
      )

      // 3D世界坐标转弧度
      const upperLeftCartographic = this.webGlobe.viewer.scene.globe.ellipsoid.cartesianToCartographic(
        upperLeft3
      )
      // 3D世界坐标转弧度
      const lowerRightCartographic = this.webGlobe.viewer.scene.globe.ellipsoid.cartesianToCartographic(
        lowerRight3
      )

      // 弧度转经纬度
      const xmin = this.Cesium.Math.toDegrees(upperLeftCartographic.longitude)
      // 弧度转经纬度
      const xmax = this.Cesium.Math.toDegrees(lowerRightCartographic.longitude)

      // 弧度转经纬度
      const ymin = this.Cesium.Math.toDegrees(lowerRightCartographic.latitude)
      // 弧度转经纬度
      const ymax = this.Cesium.Math.toDegrees(upperLeftCartographic.latitude)

      params.xmin = xmin
      params.xmax = xmax
      params.ymin = ymin
      params.ymax = ymax
    } else {
      // 3D获取方式
      params.xmax = this.Cesium.Math.toDegrees(extend.east)
      params.ymax = this.Cesium.Math.toDegrees(extend.north)

      params.xmin = this.Cesium.Math.toDegrees(extend.west)
      params.ymin = this.Cesium.Math.toDegrees(extend.south)
    }
    // 返回屏幕所在经纬度范围
    return params
  }
}
</script>
<style lang="scss" scoped></style>
