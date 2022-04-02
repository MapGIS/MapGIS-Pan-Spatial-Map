<template>
  <mapgis-3d-shadow
    :shadowColor="shadowColor"
    :sunColor="sunColor"
    :minHeight="minHeight"
    :stretchHeight="stretchHeight"
    :enableShadowRatio="enableShadowRatio"
    @loaded="loaded"
  ></mapgis-3d-shadow>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({
  name: 'MpShadowAnalysis'
})
export default class MpShadowAnalysis extends Mixins(WidgetMixin) {
  // 阴影颜色
  private shadowColor = 'rgba(0,255,0,255)'

  // 非阴影颜色
  private sunColor = 'rgba(255,0,0,255)'

  // 最低高程(米)
  private minHeight = 0

  // 拉伸高度(米)
  private stretchHeight = 20

  // 是否显示阴影率分析的结果
  private enableShadowRatio = true

  // 阴影分析对象
  private shadowAnalysis = null

  /**
   * 微件打开时
   */
  onOpen() {
    this.shadowAnalysis.mount()
  }

  /**
   * 微件关闭时
   */
  onClose() {
    this.shadowAnalysis.removeAll()
  }

  loaded(shadowAnalysis) {
    this.shadowAnalysis = shadowAnalysis
  }
}
</script>

<style lang="less" scoped></style>
