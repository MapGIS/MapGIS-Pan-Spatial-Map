<template>
  <!-- 分段专题图-->
  <mp-3d-marker-pro
    ref="marker3dProRef"
    :marker="selfMarker"
    v-if="selfMarker.fid"
  >
    <template slot="popup" slot-scope="{ properties }">
      <mp-popup-attribute :properties="properties" />
    </template>
  </mp-3d-marker-pro>
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { Layer, Feature } from '@mapgis/web-app-framework'
import CesiumMixin from '../../mixins/cesium'

interface ISectionColor {
  start: number
  end: number
  style: object
}

@Component()
export default class CesiumSubSectionMap extends Mixins(CesiumMixin) {
  // 是否展示3D效果
  get isShow3D() {
    return this.subjectData?.isShow3D
  }

  // 3D设置
  get setting3D() {
    return (
      this.subjectData?.setting3D || {
        radius: 6,
        strokeWidth: 1,
        lineType: '走廊状',
        sides: 5,
        useHeightScale: true,
        heightScale: 0.000001,
        classificationType: 'both'
      }
    )
  }

  get themeOptions() {
    if (!this.subjectData) {
      return {}
    } else {
      const { color, themeStyle } = this.subjectData
      // 兼容旧配置
      return color && color.length
        ? {
            styleGroups: color.map(({ min, max, sectionColor }) => ({
              start: min,
              end: max,
              style: {
                color: sectionColor
              }
            }))
          }
        : themeStyle || { styleGroups: [] }
    }
  }

  // 分段值设置
  get styleGroups() {
    return this.themeOptions.styleGroups || []
  }

  get classificationType() {
    let type
    const configType = this.setting3D.classificationType
    if (configType === 'terrain') {
      type = this.Cesium.ClassificationType.TERRAIN
    } else if (configType === '3DTiles') {
      type = this.Cesium.ClassificationType.CESIUM_3D_TILE
    } else if (configType === 'both') {
      type = this.Cesium.ClassificationType.BOTH
    }
    return type
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
   * @param styleGroups 样式配置数据
   * @param value 数据
   */
  getSegmentstyle(styleGroups: ISectionColor[], value: any) {
    let color
    let noSegColor
    if (styleGroups.length) {
      for (let i = 0; i < styleGroups.length; i += 1) {
        const { start, end, style } = styleGroups[i]
        if (!value || value === null) {
          noSegColor = style.color
        } else if (
          Number(value) >= Number(start) &&
          Number(value) <= Number(end)
        ) {
          color = style.color
          break
        }
        if (noSegColor && value === '未参与分段的值') {
          noSegColor = style.color
        }
        if (!color && i === styleGroups.length - 1 && noSegColor) {
          color = noSegColor
          break
        }
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
    if (this.classificationType) {
      option = {
        ...option,
        classificationType: this.classificationType
      }
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
    let option: any = {
      polygon: {
        hierarchy,
        material
      }
    }
    if (this.classificationType) {
      option = {
        ...option,
        classificationType: this.classificationType
      }
    }
    return option
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
      const featureColor = this.getSegmentstyle(this.styleGroups, value)
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
