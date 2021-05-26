<template>
  <!-- 聚合标注专题图 -->
  <mapgis-popup :coordinates="coordinates" :showed="true">
    <template v-for="(child, i) in propertiesKeys">
      <div v-show="child" :key="`sub-section-map-layer-popup-properties-${i}`">
        {{ child }} : {{ properties[child] }}
      </div>
    </template>
  </mapgis-popup>
</template>
<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator'
import MapboxMinxin from '../../mixins/mapbox'

@Component
export default class MapboxLabel extends Mixins(MapboxMinxin) {
  // 聚合层基础配置
  get cluster() {
    return {
      id: `clusters-${this.id}`,
      type: 'circle',
      source: 'clusterdata',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd6',
          100,
          '#f1f075',
          750,
          '#f28cb1'
        ],
        'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
      }
    }
  }

  // 非聚合层基础配置
  get uncluster() {
    return {
      id: `unclustered-point-${this.id}`,
      type: 'circle',
      source: 'clusterdata',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#11b4da',
        'circle-radius': 4,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff'
      }
    }
  }

  // 聚合层计数基础配置
  get clusterCount() {
    return {
      id: `cluster-count-${this.id}`,
      type: 'symbol',
      source: 'clusterdata',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['黑体'],
        'text-size': 12
      }
    }
  }

  /**
   * 点击查看集群
   */
  attachEvents() {
    const clusterEl = `clusters${this.id}`
    const unclusterEl = `unclustered-point-${this.id}`
    const canvas = this.map.getCanvas()
    this.map.on('click', clusterEl, function(e: any) {
      const features = this.map.queryRenderedFeatures(e.point, {
        layers: [clusterEl]
      })
      const {
        properties: { cluster_id },
        geometry: { coordinates }
      } = features[0]

      this.map
        .getSource('clusterdata')
        .getClusterExpansionZoom(cluster_id, function(err: any, zoom: any) {
          if (err) return
          this.map.easeTo({
            center: coordinates,
            zoom
          })
        })
    })
    this.map.on('mouseenter', `clusters-${this.id}`, () => {
      canvas.style.cursor = 'pointer'
    })
    this.map.on('mouseleave', `clusters${this.id}`, () => {
      canvas.style.cursor = ''
    })
    this.map.on('mousemove', unclusterEl, this.showInfoWin)
    this.map.on('mouseout', unclusterEl, this.closeInfoWin)
  }

  /**
   * 展示图层
   */
  showMapboxLayer() {
    this.map.addSource('clusterdata', {
      type: 'geojson',
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
      data: this.geojson
    })
    const adds = [this.cluster, this.clusterCount, this.uncluster]
    adds.forEach(v => this.map.addLayer(v))
    this.attachEvents()
  }

  /**
   * 展示信息窗口
   */
  showInfoWin({ features }: any) {
    this.closeInfoWin()
    const { showFields, showFieldsTitle } = this.popupConfig
    if (!showFields || !showFields.length) return
    if (features[0] && features[0].properties) {
      const { properties, geometry } = features[0]
      this.coordinates = geometry.coordinates.slice()
      this.properties = showFields.reduce((obj, v: string) => {
        const tag = showFieldsTitle[v] ? showFieldsTitle[v] : v
        obj[tag] = properties[v]
        return obj
      }, {})
    }
  }

  /**
   * 关闭信息窗口
   */
  closeInfoWin() {
    this.coordinates = [0, 0]
    this.properties = {}
  }
}
</script>
