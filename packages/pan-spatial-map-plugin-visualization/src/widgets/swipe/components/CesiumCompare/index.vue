<template>
  <div class="cesium-compare">
    <slider ref="cesium-compare-slider" v-show="showSlider" />
  </div>
</template>
<script lang="ts">
import { Component, Mixins, Provide, Prop, Watch } from 'vue-property-decorator'
import { MapMixin, Layer } from '@mapgis/web-app-framework'
import Slider from './Slider'

@Component({
  components: {
    Slider
  }
})
export default class CesiumCompare extends Mixins(MapMixin) {
  @Prop({ default: () => ({}) }) readonly aboveLayer!: Layer

  @Prop({ default: () => ({}) }) readonly belowLayer!: Layer

  @Watch('aboveLayer', { deep: true })
  watchAbove() {
    this.update()
  }

  @Watch('belowLayer', { deep: true })
  watchBelow() {
    this.update()
  }

  showSlider = false

  sliderEl = null

  beforeLayer = null

  afterLayer = null

  hiddenLayers: any[] = []

  get hiddenAlpha() {
    return this.hiddenLayers.map(({ alpha }) => alpha)
  }

  get cesiumMapEl() {
    return document.getElementsByClassName('cesium-compare')[0]
  }

  /**
   * 移动卷帘操作
   */
  move({ endPosition }, moveActive) {
    if (!moveActive) return
    const { $el, $parent } = this.sliderEl
    const splitPosition =
      ($el.offsetLeft + endPosition.x) / $parent.$el.offsetWidth
    $el.style.left = `${100 * splitPosition}%`
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
    handler.setInputAction(() => (moveActive = true), LEFT_DOWN)
    handler.setInputAction(() => (moveActive = true), PINCH_START)
    handler.setInputAction(e => this.move(e, moveActive), MOUSE_MOVE)
    handler.setInputAction(e => this.move(e, moveActive), PINCH_MOVE)
    handler.setInputAction(() => (moveActive = false), LEFT_UP)
    handler.setInputAction(() => (moveActive = false), PINCH_END)
  }

  /**
   * 开始卷帘分析
   */
  startCompare() {
    if (!this.aboveLayer || !this.belowLayer) return
    const {
      webGlobe,
      cesiumMapEl: { clientWidth, clientHeight },
      aboveLayer: { id: aboveId },
      belowLayer: { id: belowId }
    } = this
    if (!aboveId || !belowId) return
    // if (this.beforeLayer) {
    // this.removeCompare()
    // }
    console.log('webGlobe.layers', webGlobe.layers)
    webGlobe.layers._layers.forEach(l => {
      if (aboveId === l.id) {
        this.beforeLayer = l
        webGlobe.viewer.imageryLayers.raiseToTop(l)
      } else if (belowId === l.id) {
        this.afterLayer = l
      } else {
        this.hiddenLayers.push(l)
        l.alpha = 0
      }
    })
    this.compareAction()
  }

  /**
   * 移除卷帘分析
   */
  removeCompare() {
    this.showSlider = false
    this.beforeLayer = null
    this.webGlobe.viewer.scene.imagerySplitPosition = 0
    if (this.hiddenLayers.length) {
      this.hiddenLayers.forEach((item, i) =>
        this.$set(item, 'alpha', this.hiddenAlpha[i])
      )
    }
  }

  update() {
    // this.removeCompare()
    this.startCompare()
  }

  destroyed() {
    this.removeCompare()
  }
}
</script>
<style lang="less" scoped>
.cesium-map-wrapper {
  position: relative;
}
</style>
