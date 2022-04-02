<template>
  <mapgis-3d-heightlimited
    :color="color"
    :heightLimit='heightLimit'
    :maxSliderHeight='maxSliderHeight'
    :minSliderHeight='minSliderHeight'
    :drawStyle='drawStyle'
     @load='load'>
  </mapgis-3d-heightlimited>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import {
  WidgetMixin
} from '@mapgis/web-app-framework'

@Component({
  name: 'MpHeightLimitedAnalysis'
})
export default class MpHeightLimitedAnalysis extends Mixins(WidgetMixin) {

  private color ="rgba(255,140,0,0.6)"

  private heightLimit = 80

  private maxSliderHeight = 180

  private minSliderHeight = 0

  private drawStyle = {
    color: "#FF0000",
    opacity: 0.6
  }

  // 控高分析对象
  private heightLimitedAnalysis = undefined

  onActive() {
    this.heightLimitedAnalysis.mount()
  }

  /**
   * 打开模块
   */
  onOpen() {
    this.heightLimitedAnalysis.mount()
  }

  /**
   * 关闭模块
   */
  onClose() {
    this.heightLimitedAnalysis.unmount()
  }

  load(e){
    this.heightLimitedAnalysis = e
  }
}
</script>

<style lang='less' scoped>

</style>
