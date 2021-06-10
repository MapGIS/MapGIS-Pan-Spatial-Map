<template>
  <div class="mapbox-marker-add-wrapper">
    <mapgis-draw
      ref="markerDrawer"
      :controls="controls"
      @added="handleAdded"
      @drawCreate="handleCreate"
    />

    <a-modal
      v-model="showInfo"
      :width="400"
      @cancel="onClickCancel"
      @ok="onClickOk"
    >
      <a-form-model :model="formData">
        <a-form-model-item label="标题:">
          <a-input v-model="formData.title" />
        </a-form-model-item>
        <a-form-model-item label="内容:">
          <a-input v-model="formData.description" />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Provide,
  Emit,
  Prop,
  Watch,
  Mixins
} from 'vue-property-decorator'
import { utilInstance, baseConfigInstance } from '@mapgis/pan-spatial-map-store'
import { MapMixin, AppMixin, UUID } from '@mapgis/web-app-framework'
import MarkerCommonMixin from '../../mixins/marker-common'

@Component({
  components: {}
})
export default class MapboxMarkerAdd extends Mixins(
  MapMixin,
  AppMixin,
  MarkerCommonMixin
) {
  @Provide()
  actions = undefined

  @Emit('addMarker')
  emitAddMarker(marker: any) {}

  private controls = {
    point: false,
    line_string: false,
    polygon: false,
    trash: false,
    combine_features: false,
    uncombine_features: false
  }

  // 编辑对话框的表单数据
  private formData = {
    title: '',
    description: '',
    img: baseConfigInstance.config.colorConfig.label.image.defaultImg
  }

  // 编辑对话框的显隐
  private showInfo = false

  // 标注工具
  private drawer: any = null

  private result = {}

  created() {
    this.$message.config({ top: '100px', duration: 2, maxCount: 1 })
  }

  // 打开标注
  openMarker(mode) {
    this.enableDrawer()
    this.setMarkerMode(mode)
  }

  // 点击dialog取消按钮回调
  private onClickCancel() {
    this.drawer.deleteAll()
    this.clearFormData()
  }

  // 点击dialog确定按钮回调
  private onClickOk() {
    if (this.formData.title === '' || this.formData.description === '') {
      this.$message.warning('标注点的标题或内容不能为空')
    } else {
      const center = utilInstance.getGeoJsonFeatureCenter(
        this.result.features[0]
      )
      const marker = {
        id: UUID.uuid(),
        title: this.formData.title,
        description: this.formData.description,
        img: '',
        iconImg: `${this.baseUrl}${baseConfigInstance.config.colorConfig.label.image.defaultImg}`,
        edit: true,
        features: [this.result.features[0]],
        center,
        coordinates: this.result.features[0].geometry.coordinates
      }

      this.drawer.delete(this.result.features[0].id)
      this.emitAddMarker(marker)
      this.clearFormData()
      this.showInfo = false
    }
  }

  // 每次添加一个标注点后，都得清空formData，避免上一个标注点的信息遗留下来
  private clearFormData() {
    this.formData.title = ''
    this.formData.description = ''
  }

  // 设置标注模式到标注工具中
  private setMarkerMode(mode) {
    switch (mode) {
      case 'point':
        if (this.drawer) {
          this.drawer.changeMode('draw_point')
        }
        break
      case 'line':
        if (this.drawer) {
          this.drawer.changeMode('draw_line_string')
        }
        break
      case 'polygon':
        if (this.drawer) {
          this.drawer.changeMode('draw_polygon')
        }
        break
      default:
        break
    }
  }

  // 使能标注
  private enableDrawer() {
    const markerComponent = this.$refs.markerDrawer

    if (markerComponent) {
      markerComponent.enableDrawer()
    }
  }

  // 标注工具准备好
  private handleAdded(e: any) {
    const { drawer } = e
    this.drawer = drawer
  }

  private handleCreate(e: any) {
    this.result = e
    this.showInfo = true
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../styles/marker.scss';
</style>
