<template>
  <div class="analysis-result-table-container">
    <a-table
      :columns="columns"
      :data-source="data"
      size="small"
      :pagination="{ size: 'small' }"
      :class="isFullScreen === true ? '' : 'fixed-table'"
      :scroll="{
        y: 160,
        x: '100%'
      }"
      rowKey="id"
      bordered
      :customRow="
        record => ({
          on: {
            // 事件
            click: event => {
              rowClick(record)
            } // 点击行
          }
        })
      "
    >
      <span slot="index" slot-scope="text">{{ text + 1 }} </span>
      <span slot="name" slot-scope="text" :title="text">{{ text }} </span>
    </a-table>
  </div>
</template>
<script lang="ts">
import { Vue, Prop, Component, Emit, Watch } from 'vue-property-decorator'

@Component({ name: 'MpAnakysisResultTable' })
export default class MpCoordinateTable extends Vue {
  @Prop(Boolean) isFullScreen!: boolean

  columns = [
    {
      title: '',
      key: 'id',
      dataIndex: 'id',
      scopedSlots: { customRender: 'index' },
      width: '80px',
      align: 'center'
    },
    {
      title: '名称',
      dataIndex: 'name',
      scopedSlots: { customRender: 'name' },
      ellipsis: true,
      align: 'center'
    }
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
      this.$message.error('分析失败')
      return
    }
    const value = result.results[0].Value
    if (!value) {
      return
    }
    const res = JSON.parse(value)
    const paths = res[0] ? res[0].Paths : res.Paths
    const edgeFieldNameArray = res[0]
      ? res[0].edgeFieldNameArray
      : res.edgeFieldNameArray
    let lines = []
    paths.forEach(path => {
      lines = lines.concat(path.Edges)
    })
    let points = []
    paths.forEach(path => {
      points = points.concat(path.Nodes)
    })
    // const map = this.getBaseMap();
    if (lines.length === 0 || points.length === 0) {
      this.$message.error('未分析出结果')
      return
    }
    const max1 = lines.length
    const lineArr = []
    for (let i = 0; i < max1; i++) {
      if (lines[i] && lines[i].Dots) {
        const data = []
        const dots = lines[i].Dots
        for (let j = 0; j < dots.length; j++) {
          data.push([dots[j].x, dots[j].y])
        }
        lineArr.push(data)
      }
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
    const max2 = points.length
    const pointArr = []
    for (let i = 0; i < max2; i++) {
      if (points[i] && points[i].Node) {
        const dot = points[i].Node

        pointArr.push([dot.x, dot.y])
      }
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
    this.$emit('draw-result', {
      layerPoint,
      layerLine
    })
    this.initTableAndPage(lines, edgeFieldNameArray)
  }

  initTableAndPage(data, nameArray) {
    let index = 0
    const arr = nameArray || []
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].toLowerCase().indexOf('name') >= 0) {
        index = i
      }
    }

    const total = data.length
    const dataArray = []
    for (let i = 0; i < data.length; i++) {
      if (data[i]) {
        dataArray.push({
          id: i,
          name: data[i].FieldValus[index] || '--',
          dots: data[i].Dots
        })
      }
    }
    this.data = dataArray
  }

  rowClick(row) {
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
    const highResultSource = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { id: row.id },
          geometry: {
            type: 'LineString',
            coordinates: array
          }
        }
      ]
    }
    this.$emit('fly-to-high', center)
    this.$emit('draw-high-result', highResultSource)
  }

  clearLayer() {
    this.data = []
  }
}
</script>
<style lang="less">
// .analysis-result-table-container {
//   .fixed-table {
//     width: 350px;
//   }
// }
</style>
