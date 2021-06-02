<template>
  <!-- 聚合标注专题图 -->
  <mapgis-popup :coordinates="coordinates" :showed="true" v-if="showPopup">
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
  </mapgis-popup>
</template>
<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator'
import { utilInstance } from '@mapgis/pan-spatial-map-store'
import RowFlex from '../../../RowFlex'
import MapboxMinxin from '../../mixins/mapbox'

@Component({
  components: {
    RowFlex
  }
})
export default class MapboxLabel extends Mixins(MapboxMinxin) {
  get clustersId() {
    return `clusters-${this.id}`
  }

  get clusterCountId() {
    return `cluster-count-${this.id}`
  }

  get unclustersId() {
    return `unclustered-point-${this.id}`
  }

  // 聚合层基础配置
  get cluster() {
    return {
      id: this.clustersId,
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
        'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
        'circle-stroke-color': '#FFFFFF',
        'circle-stroke-width': 5
      }
    }
  }

  // 非聚合层基础配置
  get uncluster() {
    return {
      id: this.unclustersId,
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
      id: this.clusterCountId,
      type: 'symbol',
      source: 'clusterdata',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['黑体', '黑体'],
        'text-size': 12
      }
    }
  }

  /**
   * 点击查看集群
   */
  attachEvents() {
    this.map.on('click', this.clustersId, function(e: any) {
      const features = this.map.queryRenderedFeatures(e.point, {
        layers: [this.clustersId]
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
    const canvas = this.map.getCanvas()
    this.map.on('mouseenter', this.clustersId, () => {
      canvas.style.cursor = 'pointer'
    })
    this.map.on('mouseleave', this.clustersId, () => {
      canvas.style.cursor = ''
    })
    this.map.on(
      'mousemove',
      this.unclustersId,
      utilInstance.debounce(this.showInfoWin, 200)
    )
    this.map.on('mouseout', this.unclustersId, this.closeInfoWin)
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
  showMapboxInfoWin({ features }: any) {
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
}
</script>
<style lang="less" scoped>
.popup-row {
  min-width: 100px;
}
</style>
