<template>
  <div class="marker-add-wrapper">
    <mp-draw-pro ref="draw" @start="onDrawStart" @finished="onDrawFinished" />
    <mp-3d-draw-pro
      ref="draw3d"
      @start="onDrawStart"
      @finished="onDrawFinished"
    >
    </mp-3d-draw-pro>
    <marker-edit-window
      :visible="editWindowVisible"
      v-if="marker"
      :marker="marker"
      @ok="onEditOk"
      @cancel="onEditCancel"
    />
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Mixins } from 'vue-property-decorator'
import { markerIconInstance } from '@mapgis/pan-spatial-map-common'
import { AppMixin, UUID } from '@mapgis/web-app-framework'
import moment from 'moment'
import MarkerEditWindow from '../MarkerWindow/MarkerEditWindow'

@Component({
  components: { MarkerEditWindow }
})
export default class MapboxMarkerAdd extends Mixins(AppMixin) {
  @Emit('added')
  emitAdded(marker) {}

  @Emit('finished')
  emitFinished() {}

  private marker = null

  // 编辑对话框的显隐
  private editWindowVisible = false

  get drawComponent() {
    return this.is2DMapMode ? this.$refs.draw : this.$refs.draw3d
  }

  // 打开标注
  openMark(mode) {
    this.drawComponent && this.drawComponent.openDraw(mode)
  }

  // 关闭标注
  closeMark() {
    this.drawComponent && this.drawComponent.closeDraw()
  }

  // 'start'响应事件(开始绘制)
  private onDrawStart() {}

  // 'finished'响应事件(结束绘制)
  private async onDrawFinished({ mode, feature, center }) {
    // 构造marker
    const unSelectIcon = await markerIconInstance.unSelectIcon()

    this.marker = {
      markerId: UUID.uuid(),
      title: `标注 ${moment().format('YYYY-MM-DD HH:mm:ss')}`,
      description: '',
      coordinates: center,
      img: unSelectIcon,
      properties: feature.properties,
      feature,
      picture: ''
    }

    // 同时弹出编辑框
    this.editWindowVisible = true
  }

  // 编辑完成
  private onEditOk(marker) {
    this.editWindowVisible = false
    this.emitAdded(marker)
    this.emitFinished()
  }

  // 编辑取消
  private onEditCancel() {
    this.editWindowVisible = false
    this.emitFinished()
  }
}
</script>
