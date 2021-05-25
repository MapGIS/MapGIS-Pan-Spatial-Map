<template>
  <div class="cesium-compare">
    <mp-cesium-view :document="document" />
    <slider ref="cesium-compare-slider" v-show="showSlider" />
  </div>
</template>
<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import {
  MapMixin,
  MpCesiumView,
  Document,
  Layer
} from '@mapgis/web-app-framework'
import takeRight from 'lodash/takeRight'
import Slider from './Slider'

@Component({
  components: {
    Slider
  }
})
export default class CesiumCompare extends Mixins(MapMixin) {
  @Prop({ default: () => ({}) }) readonly document!: Document

  @Prop({ default: () => ({}) }) readonly aboveLayer!: Layer

  @Prop({ default: () => ({}) }) readonly belowLayer!: Layer

  @Watch('aboveLayer', { deep: true })
  watchAbove() {
    this.topLayer = null
    this.startCompare()
  }

  @Watch('belowLayer', { deep: true })
  watchBelow() {
    this.startCompare()
  }

  showSlider = false

  sliderEl = null

  topLayer = null

  get cesiumMapEl() {
    return document.getElementsByClassName('cesium-compare')[0]
  }

  /**
   * 移动卷帘操作
   */
  move({ endPosition }) {
    const { $el } = this.sliderEl
    const { offsetWidth } = this.cesiumMapEl
    const splitPosition = ($el.offsetLeft + endPosition.x) / offsetWidth
    let left = `${100 * splitPosition}%`
    if (splitPosition >= 1) {
      left = '100%'
    } else if (splitPosition <= 0) {
      left = 0
    }
    $el.style.left = left
    this.webGlobe.viewer.scene.imagerySplitPosition = splitPosition
  }

  /**
   * 卷帘事件
   */
  compareAction() {
    this.showSlider = true
    this.sliderEl = this.$refs['cesium-compare-slider']
    const handler = new this.Cesium.ScreenSpaceEventHandler(this.sliderEl.$el)
    const {
      LEFT_UP,
      LEFT_DOWN,
      PINCH_START,
      PINCH_END,
      PINCH_MOVE,
      MOUSE_MOVE
    } = this.Cesium.ScreenSpaceEventType
    let moveActive = false
    const setMoveTrue = () => (moveActive = true)
    const setMoveFalse = () => (moveActive = false)
    const setMove = e => (moveActive ? this.move(e) : false)
    const actions = [
      {
        type: LEFT_DOWN,
        fn: setMoveTrue
      },
      {
        type: PINCH_START,
        fn: setMoveTrue
      },
      {
        type: MOUSE_MOVE,
        fn: setMove
      },
      {
        type: PINCH_MOVE,
        fn: setMove
      },
      {
        type: LEFT_UP,
        fn: setMoveFalse
      },
      {
        type: PINCH_END,
        fn: setMoveFalse
      }
    ]
    actions.forEach(({ type, fn }) => handler.setInputAction(fn, type))
  }

  /**
   * 开始卷帘分析
   */
  startCompare() {
    console.log('startCompare', this.webGlobe.layers._layers)
    console.log('this.aboveLayer', this.aboveLayer)
    this.webGlobe.layers._layers.forEach(layer => {
      if (this.aboveLayer.id === layer.id) {
        this.topLayer = layer
        this.webGlobe.viewer.imageryLayers.raiseToTop(layer)
      }
    })
    this.webGlobe.viewer.imageryLayers.raiseToTop(
      this.webGlobe.layers._layers[1]
    )
    this.compareAction()
  }

  /**
   * 移除卷帘分析
   */
  removeCompare() {
    this.showSlider = false
    this.topLayer = null
    this.webGlobe.viewer.scene.imagerySplitPosition = 0
  }

  mounted() {
    this.startCompare()
  }

  destroyed() {
    this.removeCompare()
  }
}
</script>
<style lang="less" scoped>
.cesium-compare {
  position: relative;
}
</style>
