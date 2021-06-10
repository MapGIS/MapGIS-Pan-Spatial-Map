<template>
  <div class="cesium-marker-dialog-wrapper">
    <mapgis-3d-popup
      :position="{
        longitude: popupPosition.longitude,
        latitude: popupPosition.latitude
      }"
      :showed="showMarkerDialog"
      v-on:load="bindEvent"
    >
      <div slot="default">
        <a-form-model :model="marker">
          <a-form-model-item label="标题:">
            <span>{{ marker.title }}</span>
          </a-form-model-item>
          <a-form-model-item label="内容:">
            <span>{{ marker.description }}</span>
          </a-form-model-item>
          <a-form-model-item label="图片:">
            <a-avatar :src="`${baseUrl}${marker.img}`" />
            <a-button
              class="popup-button"
              type="primary"
              shape="circle"
              icon="edit"
            >
            </a-button>
          </a-form-model-item>
        </a-form-model>
      </div>
    </mapgis-3d-popup>

    <a-modal v-model="showInfo" :width="400" @ok="onClickOk">
      <a-form-model :model="formData">
        <a-form-model-item label="标题:">
          <a-input v-model="formData.title" />
        </a-form-model-item>
        <a-form-model-item label="内容:">
          <a-input v-model="formData.description" />
        </a-form-model-item>
        <a-form-model-item label="图片:">
          <a-avatar :src="`${baseUrl}${formData.img}`" />
          <a-button
            type="primary"
            shape="circle"
            icon="picture"
            @click="onClickImg"
          >
          </a-button>
        </a-form-model-item>
      </a-form-model>
    </a-modal>

    <a-modal v-model="showUploader" :width="300" :footer="null">
      <uploader
        :url="baseUrl + '/api/local-storage/pictures'"
        label="图片上传"
        @success="successHandleUploader"
      ></uploader>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch, Emit } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import {
  baseConfigInstance,
  eventBus,
  markerIconInstance
} from '@mapgis/pan-spatial-map-store'
import CesiumMarkerMixin from '../../mixins/cesium-marker'
import uploader from '../Uploader/uploader'
import MarkerInfoMixin from '../../mixins/marker-info'

@Component({
  components: {
    uploader
  }
})
export default class CesiumMarkerDialog extends Mixins(
  WidgetMixin,
  CesiumMarkerMixin,
  MarkerInfoMixin
) {
  // 当前标注点
  @Prop({ type: Object, required: true }) marker!: Record<string, any>

  // 当前显示弹出框的标注点id
  @Prop({ type: String, required: true }) currentMarkerId!: string

  // 标注信息窗口的显隐
  private showMarkerDialog = false

  // 标注点是否被勾选了
  private isMarkerSelected = false

  // popup显示的位置
  get popupPosition() {
    if (!this.marker) {
      return {}
    }
    const position = {
      longitude: +this.marker.center[0],
      latitude: +this.marker.center[1]
    }
    return position
  }

  @Emit('currentMarkerId')
  emitId(id: string) {}

  // 当该标注点的icon变化时，重新渲染三维视图下的标注点
  @Watch('marker.iconImg')
  markerSelectedChange(newVal) {
    if (newVal.includes('selected')) this.isMarkerSelected = true
    else this.isMarkerSelected = false

    this.updateMarker()
  }

  // 只显示当前鼠标悬浮在其上的标注点的信息窗口，其余标注点的信息窗口都隐藏
  @Watch('currentMarkerId', { deep: true })
  currentMarkerChange() {
    if (this.currentMarkerId !== this.marker.id) {
      this.showMarkerDialog = false
    }
  }

  @Watch('showMarkerDialog')
  showMarkerDialogChange(newVal) {
    if (!newVal) this.removeAllPolygonLine() // 删除线、区
  }

  created() {
    // 监听渲染器切换事件，切换回二维时，隐藏三维标注点的信息窗口
    eventBus.$on('emitMapRenderChange', () => {
      this.showMarkerDialog = false
    })

    // 标注点默认图标
    this.marker.img =
      baseConfigInstance.config.colorConfig.label.image.defaultImg

    if (this.Cesium) {
      this.cesiumUtil.setCesiumGlobe(this.Cesium, this.webGlobe)
      this.updateMarker()
    }
  }

  beforeDestroy() {
    this.removeAllPolygonLine() // 删除线、区
    this.cesiumUtil.removeEntityByName(this.marker.id)
  }

  // 为三维popup里的内容绑定事件
  private bindEvent() {
    const editBtn = document.getElementsByClassName('popup-button')

    if (editBtn.length > 0)
      editBtn[0].addEventListener('click', this.handleClickEdit.bind(this))
  }

  // 点击popup内部的编辑按钮响应事件
  private handleClickEdit() {
    this.showInfo = true
  }

  // 渲染该标注点
  private async updateMarker() {
    this.cesiumUtil.removeEntityByName(this.marker.id)
    const marker: any = { ...this.marker }
    // 获取缓存的标注点的图标单例
    const defaultImg = await markerIconInstance.unSelectIcon()
    const selectedImg = await markerIconInstance.selectIcon()

    marker.name = marker.id
    marker.img = this.isMarkerSelected ? selectedImg : defaultImg
    marker.mouseOver = event => {
      this.mouseOver(event, marker)
    }
    marker.mouseOut = event => {
      this.mouseOut(event, marker)
    }

    this.cesiumUtil.addMarkerByFeature(marker)
  }

  // 鼠标悬浮在标注点上时回调事件
  private mouseOver(event: any, marker: any) {
    this.showMarkerDialog = true
    this.emitId(marker.id)
    this.removeAllPolygonLine()
    if (marker.type === 'LineString') {
      this.appendLine(marker.coordinates)
    } else if (marker.type === 'Polygon') {
      this.appendPolygon(marker.coordinates[0])
    }
  }

  private mouseOut(event, marker) {
    // this.$emit('mouseleave', event, marker.markerId)
  }
}
</script>
<style lang="scss" scoped>
@import '../../../../styles/marker.scss';
</style>
