<template>
  <div class="add-marker-wrapper">
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
import { WidgetMixin, UUID } from '@mapgis/web-app-framework'
import { baseConfigInstance } from '@mapgis/pan-spatial-map-store'
import MarkerCommonMixin from '../../mixins/marker-common'
import CesiumMarkerMixin from '../../mixins/cesium-marker.ts'

@Component({
  components: {}
})
export default class MapboxMarkerAdd extends Mixins(
  WidgetMixin,
  MarkerCommonMixin,
  CesiumMarkerMixin
) {
  private handler: any = undefined

  private drawing = false

  // 编辑对话框的表单数据
  private formData = {
    title: '',
    description: '',
    img: baseConfigInstance.config.colorConfig.label.image.defaultImg
  }

  // 编辑对话框的显隐
  private showInfo = false

  // 当前选择的标注模式
  private selectMode = ''

  // 记录点类型的移动距离
  private moveMent = {}

  // 记录线、区类型标注轨迹的坐标
  private array = []

  @Emit('addMarker')
  emitAddMarker(marker: any) {}

  created() {
    this.$message.config({ top: '100px', duration: 2, maxCount: 1 })

    if (this.Cesium) {
      this.handler = new this.Cesium.ScreenSpaceEventHandler(
        this.webGlobe.viewer.scene._canvas
      ) // 定义当前场景的画布元素的事件处理
      this.cesiumUtil.setCesiumGlobe(this.Cesium, this.webGlobe)
    }
  }

  // 开始标注
  openMarker(mode) {
    this.selectMode = mode
    this.array = []
    let positions: any[] = []

    if (mode === 'point') {
      // 设置鼠标移动事件的处理函数，这里负责监听x,y坐标值变化
      this.handler.setInputAction((movement: any) => {
        this.moveMent = movement
        // 弹出Dialog框
        this.showInfo = true
      }, this.Cesium.ScreenSpaceEventType.LEFT_CLICK)
    } else if (mode === 'line') {
      this.drawing = true
      positions = []
      this.handler.setInputAction((movement: any) => {
        if (this.drawing) {
          const currentCoor = this.coordinateConvert(movement) // 将笛卡尔坐标转换为二维经纬度
          positions.push(currentCoor)
        }
      }, this.Cesium.ScreenSpaceEventType.LEFT_CLICK)

      this.handler.setInputAction((movement: any) => {
        if (this.drawing) {
          const currentCoor = this.coordinateConvert(movement) // 将笛卡尔坐标转换为二维经纬度
          if (positions.length >= 1) {
            this.removeAllPolygonLine() // 删除线、区。。。
            this.array = []
            for (let i = 0; i < positions.length; i += 1) {
              this.array.push(positions[i])
            }
            this.array.push(currentCoor) // 添加鼠标位置
            this.appendLine(this.array) // 绘制鼠标移动轨迹
          }
        }
      }, this.Cesium.ScreenSpaceEventType.MOUSE_MOVE)

      this.handler.setInputAction(() => {
        this.removeAllPolygonLine() // 删除线、区
        if (this.drawing) {
          // 弹出Dialog框
          this.showInfo = true
        }
        this.drawing = false
      }, this.Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
    } else if (mode === 'polygon') {
      this.drawing = true
      positions = []
      this.handler.setInputAction((movement: any) => {
        if (this.drawing) {
          const currentCoor = this.coordinateConvert(movement) // 将笛卡尔坐标转换为二维经纬度
          positions.push(currentCoor)
        }
      }, this.Cesium.ScreenSpaceEventType.LEFT_CLICK)

      this.handler.setInputAction((movement: any) => {
        if (this.drawing) {
          const currentCoor = this.coordinateConvert(movement) // 将笛卡尔坐标转换为二维经纬度
          if (positions.length >= 1) {
            this.removeAllPolygonLine() // 删除线、区。
            this.array = []
            for (let i = 0; i < positions.length; i += 1) {
              this.array.push(positions[i])
            }
            this.array.push(currentCoor) // 填加鼠标位置
            this.array.push(this.array[0]) // 保证区坐标首尾一致
            this.appendPolygon(this.array) // 绘制鼠标移动轨迹
          }
        }
      }, this.Cesium.ScreenSpaceEventType.MOUSE_MOVE)

      this.handler.setInputAction(() => {
        this.removeAllPolygonLine() // 删除线、区
        if (this.drawing) {
          // 弹出Dialog框
          this.showInfo = true
        }
        this.drawing = false
      }, this.Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
    }
  }

  // 每次添加一个标注点后，都得清空formData，避免上一个标注点的信息遗留下来
  private clearFormData() {
    this.formData.title = ''
    this.formData.description = ''
  }

  // 点击dialog取消按钮回调
  private onClickCancel() {
    this.clearFormData()
  }

  // 点击dialog确定按钮回调
  private onClickOk() {
    if (this.formData.title === '' || this.formData.description === '') {
      this.$message.warning('标注点的标题或内容不能为空')
    } else {
      if (this.selectMode === 'point') {
        const currentCoor = this.coordinateConvert(this.moveMent) // 将笛卡尔坐标转换为二维经纬度
        const geojsonFeature = {
          geometry: {
            coordinates: currentCoor,
            type: 'Point'
          },
          id: UUID.uuid(),
          properties: {},
          type: 'Feature'
        }
        const marker = {
          id: UUID.uuid(),
          title: this.formData.title,
          description: this.formData.description,
          iconImg: `${this.baseUrl}${baseConfigInstance.config.colorConfig.label.image.defaultImg}`,
          edit: true,
          features: [geojsonFeature],
          coordinates: currentCoor,
          center: currentCoor,
          type: 'Point'
        }

        this.emitAddMarker(marker)
        this.clearFormData()
        this.showInfo = false
      } else if (this.selectMode === 'line') {
        // 该方法既可以绘制线型轨迹，同时也可以获取中心点坐标，此处是获取中心点坐标
        const centerCoordinates = this.appendLine(this.array)
        const geojsonFeature = {
          geometry: {
            coordinates: this.array,
            type: 'LineString'
          },
          id: UUID.uuid(),
          properties: {},
          type: 'Feature'
        }
        const marker = {
          id: UUID.uuid(),
          title: this.formData.title,
          description: this.formData.description,
          iconImg: `${this.baseUrl}${baseConfigInstance.config.colorConfig.label.image.defaultImg}`,
          edit: true,
          features: [geojsonFeature],
          coordinates: this.array,
          center: centerCoordinates,
          type: 'LineString'
        }
        this.emitAddMarker(marker)
        this.clearFormData()
        this.showInfo = false
      } else if (this.selectMode === 'polygon') {
        const centerCoordinates = this.appendPolygon(this.array) // 绘制简单区求中心点
        const geojsonFeature = {
          geometry: {
            coordinates: [this.array],
            type: 'Polygon'
          },
          id: UUID.uuid(),
          properties: {},
          type: 'Feature'
        }
        const marker = {
          id: UUID.uuid(),
          title: this.formData.title,
          description: this.formData.description,
          iconImg: `${this.baseUrl}${baseConfigInstance.config.colorConfig.label.image.defaultImg}`,
          edit: true,
          features: [geojsonFeature],
          coordinates: [this.array],
          center: centerCoordinates,
          type: 'Polygon'
        }
        this.emitAddMarker(marker)
        this.clearFormData()
        this.showInfo = false
      }
    }
  }

  // 标注点坐标转换
  private coordinateConvert(mousePoint: any) {
    // 通过指定的椭球或者地图对应的坐标系，将鼠标的二维坐标转换为对应椭球体三维坐标
    const { ellipsoid } = this.webGlobe.scene.globe
    let cartesian: any
    if (mousePoint.position) {
      // 拿到屏幕坐标  【屏幕坐标转笛卡尔坐标】
      cartesian = this.webGlobe.viewer.camera.pickEllipsoid(
        mousePoint.position,
        ellipsoid
      )
    } else {
      cartesian = this.webGlobe.viewer.camera.pickEllipsoid(
        mousePoint.endPosition,
        ellipsoid
      )
    }
    if (cartesian) {
      // 将笛卡尔坐标转换为地理坐标
      const cartographic = ellipsoid.cartesianToCartographic(cartesian)
      // 将弧度转为度的十进制度表示
      const longitudeString = this.Cesium.Math.toDegrees(cartographic.longitude) // 转换后的经度
      const latitudeString = this.Cesium.Math.toDegrees(cartographic.latitude) // 转换后的纬度
      const currentCoor = [longitudeString, latitudeString]
      return currentCoor
    }
    return null
  }
}
</script>

<style lang="less" scoped>
@import '../../styles/marker.less';
</style>
