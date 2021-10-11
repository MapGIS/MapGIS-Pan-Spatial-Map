<template>
  <mapgis-3d-sightline
    :exHeight='exHeight'
    :visibleColor='visibleColor'
    :unVisibleColor='unVisibleColor'
    @load='load'>
  </mapgis-3d-sightline>
</template>

<script lang='ts'>
import { Mixins, Component } from 'vue-property-decorator'
import {
  WidgetMixin
} from '@mapgis/web-app-framework'

@Component({ name: 'MpVisibilityAnalysis' })
export default class MpVisibilityAnalysis extends Mixins(WidgetMixin) {

  // 附加高度(米)
  private exHeight = 1.85

  // 可视区域颜色
  private visibleColor = '#008000'

  // 不可视区域颜色
  private unVisibleColor = '#ff0000'

  // 通视分析对象
  private visibilityAnalysis = null

  onClose() {
    this.visibilityAnalysis.unmount()
  }

  load(visibilityAnalysis) {
    this.visibilityAnalysis = visibilityAnalysis
  }
}
</script>

<style lang='less' scoped>
</style>
