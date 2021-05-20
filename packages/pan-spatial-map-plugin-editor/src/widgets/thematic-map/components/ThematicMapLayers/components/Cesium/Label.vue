<template>
  <!-- 聚合标注专题图 -->
  <mapgis-3d-popup :position="position" :container="attrTable" />
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { Layer } from '@mapgis/web-app-framework'
import {
  FeatureGeoJSON,
  GFeature,
  utilInstance
} from '@mapgis/pan-spatial-map-store'
import CesiumMinxin from '../../mixins/cesium'


@Component
export default class CesiumLabel extends Mixins(CesiumMinxin) {
  style = {
    selectedType: 'circle',
    color: 'rgba(0,255,255,1)',
    radius: 4,
    width: '',
    height: '',
    imgUrl: ''
  }

  /**
   * 获取图层要素数据
   * @param layer 图层
   * @param features 要素集合
   * @param style 样式配置
   */
  getGeoJSONFeaturesLayer(
    layer: Layer,
    features: GFeature[],
    { color, radius }: any
  ) {
    if (!features) return
    features.forEach(feature => {
      const center = utilInstance.getGeoJsonFeatureCenter(feature)
      const popupContent = this.getPopupContent(feature)
      const position = this.getPosition(center)
      const _color = this.getColor(color)
      const entity = this.addEntityToLayer({
        name: 'circle',
        label: 'circle',
        position,
        point: {
          color: _color,
          pixelSize: radius * 2
        }
      })
      if (popupContent && popupContent !== '</div>') {
        entity.attrTable = popupContent
      }
      this.popupEntity = entity
    })
  }

  /**
   * 获取移除事件
   * @param layer
   * @param color
   */
  getClusterRemoveListener(layer, color) {
    layer.clustering.clusterEvent.addEventListener(
      (clusteredEntities: any, cluster: any) => {
        cluster.label = {
          show: false
        }
        cluster.billboard = {
          show: true,
          id: cluster.label.id,
          verticalOrigin: this.Cesium.VerticalOrigin.BOTTOM
        }
        if (clusteredEntities.length > 1) {
          const _color = this.getColor(color)
          cluster.point = {
            _color,
            pixelSize: 32
          }
          cluster.label = {
            _show: true,
            _scale: 0.5,
            _font: 'bold 32px MicroSoft YaHei',
            _pixelOffset: {
              x: -5,
              y: 6
            }
          }
        }
      }
    )
  }

  /**
   * 聚合样式
   * @param layer
   * @param style
   */
  cluster(layer: Layer, { color }: any) {
    const _clustering = layer.clustering
    _clustering.enabled = true
    _clustering.pixelRange = 20
    _clustering.minimumClusterSize = 2
    let removeListener
    if (!this.Cesium.defined(removeListener)) {
      removeListener = this.getClusterRemoveListener(layer, color)
    } else {
      removeListener()
    }
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
    this.getGeoJSONFeaturesLayer(this.thematicMapLayer, features, this.style)
    this.webGlobe.viewer.scene.postProcessStages.fxaa.enabled = false
    this.webGlobe.viewer.dataSources
      .add(this.thematicMapLayer)
      .then(this.cluster(this.thematicMapLayer, this.style))
    this.clickShowPopup(this.webGlobe)
  }
}
</script>
<style lang="less" scoped></style>
