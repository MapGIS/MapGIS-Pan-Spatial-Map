<template>
  <!-- 分段专题图图层 -->
  <mapgis-3d-popup
    v-model="showPopup"
    :position="popupPosition"
    :forceRender="true"
  >
    <span class="popup-fontsize" v-if="!popupProperties">暂无数据</span>
    <div v-else>
      <div
        v-for="(v, k) in popupProperties"
        :key="`sub-section-map-properties-${v}`"
        class="popup-row popup-fontsize"
      >
        <span>{{ `${k}：` }}</span>
        <span>{{ v }}</span>
      </div>
    </div>
  </mapgis-3d-popup>
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { Layer, Feature } from '@mapgis/web-app-framework'
import CesiumMixin from '../../mixins/cesium'

interface ISectionColor {
  min: number
  max: number
  sectionColor: string
}

@Component
export default class CesiumSubSectionMap extends Mixins(CesiumMixin) {
  get isShow3D() {
    return this.subjectData?.isShow3D
  }

  get setting3D() {
    return this.subjectData?.setting3D || {}
  }

  get colors() {
    return this.subjectData?.color
  }

  /**
   * 获取形状
   * @param 半径
   * @param 边数
   */
  getShapePoints(radius: number, sides: number) {
    const shapePoints = []
    const interval = 360 / sides
    for (let i = 0; i < 360; i += interval) {
      const radians = this.Cesium.Math.toRadians(i)
      shapePoints.push(
        new this.Cesium.Cartesian2(
          radius * Math.cos(radians),
          radius * Math.sin(radians)
        )
      )
    }

    return shapePoints
  }

  /**
   * 获取分段样式
   * @param colors 样式配置数据
   * @param value 数据
   */
  getSegmentstyle(colors: ISectionColor[], value: any) {
    let color
    let noSegColor
    for (let i = 0; i < colors.length; i += 1) {
      const { min, max, sectionColor } = colors[i]
      if (!value || value === null) {
        noSegColor = sectionColor
      } else if (Number(value) >= Number(min) && Number(value) <= Number(max)) {
        color = sectionColor
        break
      }
      if (noSegColor && value === '未参与分段的值') {
        noSegColor = sectionColor
      }
      if (!color && i === colors.length - 1 && noSegColor) {
        color = noSegColor
        break
      }
    }
    return color
  }

  /**
   * 点图层
   * @param coordinates 坐标
   * @param extrudedHeight 高度
   * @param material 材质
   * @param setting3D
   */
  getPointEntity(coordinates, length = 0.1, material, { strokeWidth }) {
    const position = this.getPosition(coordinates[0], coordinates[1])
    return {
      position,
      cylinder: {
        length,
        material,
        topRadius: strokeWidth, // 圆柱体的顶部半径。
        bottomRadius: strokeWidth // 圆柱体底部的半径。
      }
    }
  }

  /**
   * 线图层
   * @param coordinates 坐标
   * @param extrudedHeight 高度
   * @param material 材质
   * @param setting3D
   */
  getLineStringEntity(
    coordinates,
    extrudedHeight = 0.1,
    material,
    { lineType, strokeWidth, sides }
  ) {
    const positions = this.Cesium.Cartesian3.fromDegreesArray(
      coordinates[0].flat()
    )
    let option: any = {
      positions,
      material
    }
    if (this.isShow3D) {
      switch (lineType) {
        case '走廊状':
          option = {
            corridor: {
              ...option,
              width: strokeWidth,
              extrudedHeight
            }
          }
          break
        case '多边形柱': {
          const shape = this.getShapePoints(strokeWidth, sides)
          option = {
            polylineVolume: {
              shape,
              ...option
            }
          }
          break
        }
        default:
          option = {
            polyline: {
              ...option,
              width: strokeWidth
            }
          }
          break
      }
    }
    return option
  }

  /**
   * 区图层
   * @param coordinates 坐标
   * @param extrudedHeight 高度
   */
  getPolygonEntity(coordinates, extrudedHeight, material) {
    const hierarchy = this.Cesium.Cartesian3.fromDegreesArray(
      coordinates[0].flat()
    )
    return {
      polygon: {
        hierarchy,
        extrudedHeight,
        material
      }
    }
  }

  /**
   * 获取图层geo要素数据存入实体中
   * @param layer 图层
   */
  addGeoJSONFeaturesToEntity(layer: Layer) {
    if (!this.geojson || !this.geojson.features) return
    const { useHeightScale, heightScale } = this.setting3D
    this.geojson.features.forEach((feature: Feature.GFeature) => {
      const {
        properties,
        geometry: { type, coordinates }
      } = feature
      const value = properties[this.field]
      const featureColor = this.getSegmentstyle(this.colors, value)
      if (featureColor) {
        const material = this.getColor(featureColor)
        const heightScaleValue = this.isShow3D
          ? !useHeightScale
            ? value
            : value * heightScale
          : 0
        const args = [coordinates, heightScaleValue, material, this.setting3D]
        let option: any
        switch (type) {
          case 'Point':
            option = this.getPointEntity(...args)
            break
          case 'LineString':
            option = this.getLineStringEntity(...args)
            break
          case 'Polygon':
            option = this.getPolygonEntity(...args)
            break
          default:
            break
        }
        this.addEntityToLayer(layer, feature, option)
      }
    })
  }
}
</script>
<style lang="less" scoped>
.popup-row {
  line-height: 20px;
  margin-top: 8px;
}
.popup-fontsize {
  font-size: 12px;
}
</style>
