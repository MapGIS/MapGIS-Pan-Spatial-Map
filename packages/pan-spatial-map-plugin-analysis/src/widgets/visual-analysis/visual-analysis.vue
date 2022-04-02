<template>
  <mapgis-3d-viewshed
    :horizontAngle="horizontAngle"
    :verticalAngle="verticalAngle"
    :unVisibleColor="unVisibleColor"
    :visibleColor="visibleColor"
    :maskColor="maskColor"
    :exHeight="exHeight"
    @load="load"
  ></mapgis-3d-viewshed>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({
  name: 'MpVisualAnalysis'
})
export default class MpVisualAnalysis extends Mixins(WidgetMixin) {
  // 观察点的水平视角
  private horizontAngle = 60

  // 观察点的垂直视角
  private verticalAngle = 60

  // 非可视区域颜色
  private unVisibleColor = '#ff0000'

  // 可视区域颜色
  private visibleColor = '#00ff00'

  // 可视遮罩颜色
  private maskColor = 'rgba(37, 218, 169, 0.2)'

  // 观察点的附加高度，单位为米
  private exHeight = 1.85

  // 可视域分析对象
  private visualAnalysis = null

  onOpen() {
    if (this.visualAnalysis) {
      this.visualAnalysis.mount()
    }
  }

  onClose() {
    this.visualAnalysis.unmount()
  }

  load(visualAnalysis) {
    this.visualAnalysis = visualAnalysis
  }
}
</script>

<style lang="less" scoped></style>
