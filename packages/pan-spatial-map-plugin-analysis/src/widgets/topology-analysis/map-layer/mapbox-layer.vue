<template>
  <div>
    <mp-draw-pro ref="draw" @finished="onDrawFinished" />
  </div>
</template>

<script lang="ts">
import {
  Component,
  Vue,
  Mixins,
  Emit,
  Prop,
  Watch
} from 'vue-property-decorator'
import { LayerType, WidgetMixin } from '@mapgis/web-app-framework'

@Component
export default class MapboxLayer extends Mixins(WidgetMixin) {
  get drawComponent() {
    return this.$refs.draw
  }

  // 打开绘制，点击图标激活对应类型的绘制功能
  private onOpenDraw() {
    this.drawComponent && this.drawComponent.openDraw('draw-point')
  }

  private stopDraw() {
    this.drawComponent && this.drawComponent.closeDraw()
  }

  @Emit()
  finishDraw(e) {}

  flyToHigh(val) {
    this.map.panTo(val)
  }

  onDrawFinished(e) {
    this.finishDraw(e)
  }
}
</script>

<style scoped></style>
