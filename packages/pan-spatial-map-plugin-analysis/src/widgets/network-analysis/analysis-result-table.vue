<template>
  <q-table
    class="my-sticky-header-table"
    :data="data"
    :columns="columns"
    separator="cell"
    flat
    no-data-label="暂无数据"
    rows-per-page-label="条数："
    :pagination-label="
      (firstRowIndex, endRowIndex, totalRowsNumber) =>
        `${firstRowIndex}~${endRowIndex} 共${totalRowsNumber}条`
    "
  >
    <template v-slot:body="props">
      <q-tr :props="props" class @click="rowClick(props.row)">
        <q-td key="index" :props="props">{{ props.rowIndex + 1 }}</q-td>
        <q-td key="name" :props="props">{{ props.row.name || '--' }}</q-td>
      </q-tr>
    </template>
  </q-table>
</template>
<script lang="ts">
import { Vue, Prop, Component, Emit, Watch } from 'vue-property-decorator'
import { utilInstance } from '@mapgis/pan-spatial-map-store'

@Component({ name: 'MpAnakysisResultTable' })
export default class MpCoordinateTable extends Vue {
  @Prop(Object) map!: object

  // @Prop(Function) showDialogFuc!: function

  @Prop(String) color!: string

  @Prop(Object) circleColor!: object

  pointSourceId = 'analysisPointSourceId'

  pointLayerId = 'analysisPointLayerId'

  lineSourceId = 'analysisLineSourceId'

  lineLayerId = 'analysisLineLayerId'

  lineClickSourceId = 'analysisClickLineSourceId'

  lineClickLayerId = 'analysisClickLineLayerId'

  columns = [
    { name: 'index', label: '', field: 'index' },
    { name: 'name', label: '名称', field: 'name', align: 'center' }
  ]

  data = []

  onValueChange(result) {
    // $("#na-loading").hide();
    // 线图层数据源
    const layerLine = {
      type: 'FeatureCollection',
      features: []
    }
    // 点图层数据源
    const layerPoint = {
      type: 'FeatureCollection',
      features: []
    }
    if (!result.results) {
      // this.showDialogFuc('分析失败')
      this.$q.notify({
        position: 'center',
        message: '分析失败'
      })
      return
    }
    const value = result.results[0].Value
    if (!value) {
      return
    }
    const res = JSON.parse(value)
    const path = utilInstance.isArrayFn(res) ? res[0].Paths[0] : res.Paths[0]
    const edgeFieldNameArray = utilInstance.isArrayFn(res)
      ? res[0].edgeFieldNameArray
      : res.edgeFieldNameArray
    const lines = path.Edges
    const points = path.Nodes
    // const map = this.getBaseMap();
    if (!lines || !points) {
      // this.showDialogFuc('未分析出结果')
      this.$q.notify({
        position: 'center',
        message: '未分析出结果'
      })
      return
    }
    const max1 = lines.length > 100 ? 100 : lines.length
    const lineArr = []
    for (let i = 0; i < max1; i++) {
      const data = []
      const dots = lines[i].Dots
      for (let j = 0; j < dots.length; j++) {
        data.push([dots[j].x, dots[j].y])
      }
      lineArr.push(data)
    }
    // 线的数据集
    layerLine.features.push({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'MultiLineString',
        coordinates: lineArr
      }
    })
    const max2 = points.length > 100 ? 100 : points.length
    const pointArr = []
    for (let i = 0; i < max2; i++) {
      const dot = points[i].Node
      pointArr.push([dot.x, dot.y])
    }
    // 点的数据集
    layerPoint.features.push({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'MultiPoint',
        coordinates: pointArr
      }
    })

    // 添加点图层
    this.map.addSource(this.pointSourceId, {
      type: 'geojson',
      data: layerPoint
    })
    this.map.addLayer({
      id: this.pointLayerId,
      type: 'circle',
      source: this.pointSourceId,
      paint: this.circleColor
    })

    // 添加线图层
    this.map.addSource(this.lineSourceId, {
      type: 'geojson',
      data: layerLine
    })
    this.map.addLayer({
      id: this.lineLayerId,
      type: 'line',
      source: this.lineSourceId,
      paint: {
        'line-color': this.color,
        'line-width': 4
      }
    })

    // 添加高亮图层
    this.map.addSource(this.lineClickSourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    })
    this.map.addLayer({
      id: this.lineClickLayerId,
      type: 'line',
      source: this.lineClickSourceId,
      paint: {
        'line-color': 'blue',
        'line-width': 4
      }
    })

    this.initTableAndPage(lines, edgeFieldNameArray)
  }

  initTableAndPage(data, nameArray) {
    let index = 0
    for (let i = 0; i < nameArray.length; i++) {
      if (nameArray[i].toLowerCase().indexOf('name') >= 0) {
        index = i
      }
    }

    const total = data.length
    const dataArray = []
    for (let i = 0; i < data.length; i++) {
      dataArray.push({
        name: data[i].FieldValus[index],
        dots: data[i].Dots
      })
    }
    this.data = dataArray
  }

  rowClick(row) {
    if (this.map.getSource(this.lineClickSourceId)) {
      const array = []
      const { dots } = row
      let allX = 0
      let allY = 0
      for (let j = 0; j < dots.length; j++) {
        array.push([dots[j].x, dots[j].y])
        allX += dots[j].x
        allY += dots[j].y
      }
      const center = [allX / dots.length, allY / dots.length]
      this.map.panTo(center)
      this.map.getSource(this.lineClickSourceId).setData({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: array
            }
          }
        ]
      })
    }
  }

  clearLayer() {
    this.data = []
    if (this.map.getLayer(this.pointLayerId)) {
      this.map.removeLayer(this.pointLayerId)
      this.map.removeSource(this.pointSourceId)
    }
    if (this.map.getLayer(this.lineLayerId)) {
      this.map.removeLayer(this.lineLayerId)
      this.map.removeSource(this.lineSourceId)
    }

    if (this.map.getLayer(this.lineClickLayerId)) {
      this.map.removeLayer(this.lineClickLayerId)
      this.map.removeSource(this.lineClickSourceId)
    }
  }
}
</script>
<style lang="scss" scoped>
.my-sticky-header-table {
  // height: 250px;
  max-height: 100%;
  ::v-deep thead tr th {
    position: sticky;
    z-index: 2;
  }

  ::v-deep thead tr:first-child th {
    background-color: white;
  }

  ::v-deep thead tr:first-child th {
    top: 0;
    z-index: 2;
  }
  ::v-deep td:last-child {
    background-color: white;
  }

  ::v-deep th:last-child,
  td:last-child {
    position: sticky;
    right: 0;
    z-index: 1;
  }
}
</style>
