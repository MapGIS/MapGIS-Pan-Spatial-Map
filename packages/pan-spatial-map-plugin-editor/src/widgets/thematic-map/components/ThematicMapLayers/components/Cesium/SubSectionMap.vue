<template>
  <!-- 分段专题图图层 -->
  <mapgis-3d-popup :position="position" :container="attrTable" />
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { Layer } from '@mapgis/web-app-framework'
import { FeatureGeoJSON, GFeature } from '@mapgis/pan-spatial-map-store'
import CesiumMinxin from '../../mixins/cesium'

interface ISectionColor {
  min: number
  max: number
  sectionColor: string
}

@Component
export default class CesiumSubSectionMap extends Mixins(CesiumMinxin) {
  get isShow3D() {
    return this.subDataConfig?.isShow3D
  }

  get setting3D() {
    return this.subDataConfig?.setting3D
  }

  get colors() {
    return this.subDataConfig?.color
  }

  get field() {
    return this.subDataConfig.field
  }

  /**
   * 获取形状
   * @param setting3D
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
   * PointEntity
   * @param layer 图层
   * @param coordinates 坐标
   * @param extrudedHeight 高度
   * @param material 材质
   * @param setting3D
   */
  getPointEntity(layer, coordinates, length = 0.1, material, { strokeWidth }) {
    return this.addEntityToLayer(layer, {
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
   * LineStringEntity
   * @param layer 图层
   * @param coordinates 坐标
   * @param extrudedHeight 高度
   * @param material 材质
   * @param setting3D
   */
  getLineStringEntity(
    layer,
    coordinates,
    extrudedHeight = 0.1,
    material,
    { lineType, strokeWidth, sides }
  ) {
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
    return this.addEntityToLayer(layer, option)
  }

  /**
   * PolygonEntity
   * @param layer 图层
   * @param coordinates 坐标
   * @param extrudedHeight 高度
   * @param material 材质
   */
  getPolygonEntity(layer, coordinates, extrudedHeight, material) {
    const [first, second] = coordinates[0]
    const hierarchy = this.Cesium.Cartesian3.fromDegreesArray([first, second])
    return this.addEntityToLayer(layer, {
      polygon: {
        hierarchy,
        extrudedHeight,
        material
      }
    })
  }

  /**
   * 获取图层要素数据
   * @param layer 图层
   * @param features 要素集合
   * @param colors 分段样式配置集合
   */
  getGeoJSONFeaturesLayer(
    layer: Layer,
    features: GFeature[],
    colors: ISectionColor[]
  ) {
    if(!features) return
    const { useHeightScale, heightScale } = this.setting3D
    features.forEach((feature: GFeature) => {
      const {
        properties,
        geometry: { type, coordinates }
      } = feature
      const value = properties[this.field]
      const featureColor = this.getSegmentstyle(colors, value)
      if (featureColor) {
        const material = this.getColor(featureColor)
        const heightScaleValue = this.isShow3D
          ? !useHeightScale
            ? value
            : value * heightScale
          : 0
        const args = [
          layer,
          coordinates,
          heightScaleValue,
          material,
          this.setting3D
        ]
        let entity = {}
        switch (type) {
          case 'Point':
            entity = this.getPointEntity(...args)
            break
          case 'LineString':
            entity = this.getLineStringEntity(...args)
            break
          case 'Polygon':
            entity = this.getPolygonEntity(...args)
            break
          default:
            break
        }
        const popupContent = this.getPopupContent(feature)
        if (popupContent && popupContent !== '</div>') {
          entity.attrTable = popupContent
        }
        this.popupEntity = entity
      }
    })
  }

  /**
   * 更新图层
   * @param 要素数据
   */
  updateLayer({ features }: FeatureGeoJSON) {
    this.removeLayer()
    if (!this.thematicMapLayer) {
      this.thematicMapLayer = new this.Cesium.CustomDataSource(this.id)
    }
    this.getGeoJSONFeaturesLayer(this.thematicMapLayer, features, this.colors)
    this.webGlobe.viewer.dataSources.add(this.thematicMapLayer)
    this.clickShowPopup(this.webGlobe)
  }
}
</script>
