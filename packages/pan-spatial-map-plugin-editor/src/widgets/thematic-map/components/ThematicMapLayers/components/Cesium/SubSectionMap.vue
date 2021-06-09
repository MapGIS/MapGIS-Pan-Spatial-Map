<template>
  <!-- 分段专题图图层 -->
  <mapgis-3d-popup :position="position" :showed="true">
    <span v-if="!properties">暂无数据</span>
    <template v-else>
      <row-flex
        v-for="(v, k) in properties"
        :key="`label-properties-${v}`"
        :label="`${k}`"
        :span="[10, 14]"
        class="popup-row"
        >{{ `${v}` }}</row-flex
      >
    </template>
  </mapgis-3d-popup>
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { Layer } from '@mapgis/web-app-framework'
import { FeatureGeoJSON, GFeature } from '@mapgis/pan-spatial-map-store'
import RowFlex from '../../../RowFlex'
import CesiumMinxin from '../../mixins/cesium'

interface ISectionColor {
  min: number
  max: number
  sectionColor: string
}

@Component({
  components: {
    RowFlex
  }
})
export default class CesiumSubSectionMap extends Mixins(CesiumMinxin) {
  get isShow3D() {
    return this.subDataConfig?.isShow3D
  }

  get setting3D() {
    return this.subDataConfig?.setting3D || {}
  }

  get colors() {
    return this.subDataConfig?.color
  }

  get field() {
    return this.subDataConfig.field
  }

  /**
   * 获取形状
   */
  getShapePoints({ strokeWidth, sides }) {
    const positions = []
    const interval = 360 / sides
    for (let i = 0; i < 360; i += interval) {
      const radians = this.Cesium.Math.toRadians(i)
      positions.push(
        new this.Cesium.Cartesian2(
          strokeWidth * Math.cos(radians),
          strokeWidth * Math.sin(radians)
        )
      )
    }

    return positions
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
   */
  getPointEntity(coordinates, length = 0.1, material) {
    const { strokeWidth } = this.setting3D
    this.addEntityToLayer(this.thematicMapLayer, {
      position: this.getPosition(coordinates[0], coordinates[1]),
      cylinder: {
        length,
        material,
        topRadius: strokeWidth, // 圆柱体的顶部半径。
        bottomRadius: strokeWidth // 圆柱体底部的半径。
      }
    })
  }

  /**
   * 线图层
   * @param coordinates 坐标
   * @param extrudedHeight 高度
   * @param material 材质
   * @param setting3D
   */
  getLineStringEntity(coordinates, extrudedHeight = 0.1, material) {
    const { lineType, strokeWidth, sides } = this.setting3D
    const [first, second] = coordinates[0]
    const positions = this.Cesium.Cartesian3.fromDegreesArray([first, second])
    let option = {
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
          const shape = this.getShapePoints({ strokeWidth, sides })
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
    this.addEntityToLayer(this.thematicMapLayer, option)
  }

  /**
   * 区图层
   * @param coordinates 坐标
   * @param extrudedHeight 高度
   */
  getPolygonEntity(coordinates, extrudedHeight) {
    const [first, second] = coordinates[0]
    const hierarchy = this.Cesium.Cartesian3.fromDegreesArray([first, second])
    this.addEntityToLayer(this.thematicMapLayer, {
      polygon: {
        hierarchy,
        extrudedHeight,
        material: this.setting3D.material
      }
    })
  }

  /**
   * 获取图层要素数据
   */
  getGeoJSONFeaturesLayer() {
    if (!this.geojson || !this.geojson.features) return
    const { useHeightScale, heightScale } = this.setting3D
    this.geojson.features.forEach((feature: GFeature) => {
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
        switch (type) {
          case 'Point':
            this.getPointEntity(coordinates, heightScaleValue, material)
            break
          case 'LineString':
            this.getLineStringEntity(coordinates, heightScaleValue, material)
            break
          case 'Polygon':
            this.getPolygonEntity(coordinates, heightScaleValue, material)
            break
          default:
            break
        }
      }
    })
  }
}
</script>
