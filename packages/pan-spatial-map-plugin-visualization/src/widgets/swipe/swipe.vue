<template>
  <div class="mp-widget-swipe">
    <mapbox-compare v-if="is2DMapMode" :is-open="isOpen" />
    <cesium-compare v-else :is-open="isOpen" />
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin, AppMixin } from '@mapgis/web-app-framework'
import MapboxCompare from './components/MapboxCompare'
import CesiumCompare from './components/CesiumCompare'

@Component({
  name: 'MpSwipe',
  components: {
    MapboxCompare,
    CesiumCompare
  }
})
export default class MpSwipe extends Mixins(WidgetMixin, AppMixin) {
  // 卷帘功能弹框开关
  isOpen = false

  /**
   * 卷帘弹框打开操作
   */
  onOpen() {
    this.isOpen = true
  }

  /**
   * 卷帘弹框关闭操作
   */
  onClose() {
    this.isOpen = false
  }

  @Watch('mapRender', { immediate: true })
  mapRenderChange() {
    this.$set(
      this.widget.manifest.properties,
      'windowSize',
      this.is2DMapMode ? 'max' : 'normal'
    )
  }
}
</script>

<style lang="less" scoped>
@import './swipe.less';
</style>
