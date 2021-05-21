<template>
  <!-- 等级符号专题图 -->
  <mapgis-3d-popup :position="position" :container="attrTable" />
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { Layer } from '@mapgis/web-app-framework'
import { FeatureGeoJSON, utilInstance } from '@mapgis/pan-spatial-map-store'
import CesiumMinxin from '../../mixins/cesium'

@Component
export default class CesiumStatisticLabel extends Mixins(CesiumMinxin) {
  get labelStyle() {
    return this.subDataConfig.labelStyle
  }

  get field() {
    return this.subDataConfig.field
  }

  /**
   * 11
   */
  setPopupEntity(
    globe: any,
    layer: Layer,
    labelStyle: any,
    value: any,
    center: number[],
    popupContent: string
  ) {
    if (!center) return
    const {
      textStyle: { fillColor },
      radius
    } = labelStyle
    const { min, max, radiu } = radius[0]
    const plus = max - min
    const maxR = Number(radiu)
    const _radius = value * 150 * (max && plus > 0 ? maxR / plus : maxR)
    const material = this.getColor(fillColor)
    const position = this.getPosition(center[0], center[1])
    const entity = this.addEntityToLayer(layer, {
      position,
      cylinder: {
        material,
        length: 0.001, // 圆柱体高度
        topRadius: _radius, // 圆柱体顶部半径
        bottomRadius: _radius // 圆柱体底部半径
      }
    })
    if (popupContent && popupContent !== '</div>') {
      entity.attrTable = popupContent
    }
    this.popupEntity = entity
  }

  /**
   * 获取图层要素数据
   * @param webGlobe
   * @param layer 图层
   * @param features 要素集合
   * @param labelStyle 样式配置
   */
  getGeoJSONFeaturesLayer(
    webGlobe: any,
    layer: Layer,
    { features }: FeatureGeoJSON,
    labelStyle: any
  ) {
    if (!features) return
    features.forEach((feature: GFeature) => {
      const value = feature.properties[this.field]
      const center = utilInstance.getGeoJsonFeatureCenter(feature)
      const popupContent = this.getPopupContent(feature)
      this.setPopupEntity(
        webGlobe,
        layer,
        labelStyle,
        value,
        center,
        popupContent
      )
    })
  }

  /**
   * 展示图层
   */
  showCesiumLayer() {
    this.getGeoJSONFeaturesLayer(
      this.webGlobe,
      this.thematicMapLayer,
      this.geojson,
      this.labelStyle
    )
    this.webGlobe.viewer.dataSources.add(this.thematicMapLayer)
    this.clickShowPopup(this.webGlobe)
  }
}
</script>
