<template>
  <div class="attr-statistics">
    <a-row v-if="queryParams" :gutter="16">
      <a-col :span="10">
        <a-row
          v-if="queryParams.gdbp"
          type="flex"
          align="middle"
          class="a-row-space"
        >
          <a-col :span="7">
            <label>GDBP</label>
          </a-col>
          <a-col :span="17">
            <a-input :value="queryParams.gdbp" disabled />
          </a-col>
        </a-row>
        <template v-else>
          <a-row type="flex" align="middle" class="a-row-space">
            <a-col :span="7">
              <label>数据服务</label>
            </a-col>
            <a-col :span="17">
              <a-input :value="queryParams.serverName" disabled />
            </a-col>
          </a-row>
          <a-row type="flex" align="middle" class="a-row-space">
            <a-col :span="7">
              <label>数据图层</label>
            </a-col>
            <a-col :span="17">
              <a-select v-model="layer" style="width:100%" placeholder="请选择">
                <a-select-option
                  v-for="{ label, value } in layerOptions"
                  :key="value"
                  :value="value"
                >
                  {{ label }}
                </a-select-option>
              </a-select>
            </a-col>
          </a-row>
        </template>
        <a-row
          v-if="layer || queryParams.gdbp"
          type="flex"
          align="middle"
          class="a-row-space"
        >
          <a-col :span="7">
            <label>分组字段</label>
          </a-col>
          <a-col :span="17">
            <a-select
              v-model="groupFieldIndex"
              style="width:100%"
              placeholder="请选择"
            >
              <a-select-option
                v-for="({ label, value }, index) in fieldOptions"
                :key="value"
                :value="index"
              >
                {{ label }}
              </a-select-option>
            </a-select>
          </a-col>
        </a-row>
        <a-row type="flex" align="middle" class="a-row-space">
          <a-col :span="7">
            <label>分段模式</label>
          </a-col>
          <a-col :span="17">
            <a-select
              v-model="groupType"
              style="width:100%"
              placeholder="请选择"
            >
              <a-select-option
                v-for="{ label, value } in groupTypeOptions"
                :key="value"
                :value="value"
                :disabled="
                  fieldOptions[groupFieldIndex] &&
                    !numberArr.includes(
                      fieldOptions[groupFieldIndex].type.toUpperCase()
                    ) &&
                    value === 'range'
                "
              >
                {{ label }}
              </a-select-option>
            </a-select>
          </a-col>
        </a-row>
        <a-row
          v-if="groupType === 'range'"
          type="flex"
          align="middle"
          class="a-row-space"
        >
          <a-col :span="7">
            <label>分段数</label>
          </a-col>
          <a-col :span="17">
            <a-input-number style="width:100%" :min="2" v-model="rangeNum" />
          </a-col>
        </a-row>
        <a-row type="flex" align="middle" class="a-row-space">
          <a-col :span="7">
            <label>统计字段</label>
          </a-col>
          <a-col :span="17">
            <a-select
              class="multiple-select-container"
              mode="multiple"
              v-model="statisticsFieldIndex"
              style="width:100%"
              placeholder="请选择"
            >
              <a-select-option
                v-for="({ label, value }, index) in fieldOptions"
                :key="value"
                :value="index"
              >
                {{ label }}
              </a-select-option>
            </a-select>
          </a-col>
        </a-row>
        <a-row type="flex" align="middle" class="a-row-space">
          <a-col :span="7">
            <label>统计方式</label>
          </a-col>
          <a-col flex="auto">
            <a-select
              v-model="statisticsTypeIndex"
              style="width:100%"
              placeholder="请选择"
            >
              <a-select-option
                v-for="({ label }, index) in statisticsTypeOptions"
                :key="index"
                :value="index"
              >
                {{ label }}
              </a-select-option>
            </a-select>
          </a-col>
          <a-button type="primary" @click="getResult" style="margin-left:10px">
            统计
          </a-button>
        </a-row>
        <a-row class="row items-center">
          <a-col :span="24">
            <a-table
              :locale="{ emptyText: '暂无数据' }"
              :columns="columns"
              :data-source="data"
              :pagination="false"
              bordered
              size="small"
              :scroll="{ y: 100 }"
              :rowKey="
                (record, index) => {
                  return index
                }
              "
            >
              <span slot="color" slot-scope="text, record">
                <a-popover trigger="click">
                  <template slot="content">
                    <sketch-picker
                      :value="record.color"
                      @input="val => (record.color = val.hex)"
                    />
                  </template>
                  <div
                    class="color-block-container"
                    :style="{ 'background-color': record.color }"
                  >
                    {{ text }}
                  </div>
                </a-popover>
              </span>
            </a-table>
          </a-col>
        </a-row>
      </a-col>

      <a-col :span="14">
        <a-spin :spinning="resultLoading" style="width:100%">
          <a-row justify="center" type="flex" class="a-row-space">
            <a-col>
              <a-radio-group
                v-model="showEchartTable"
                button-style="solid"
                @change="radioChange"
              >
                <a-radio-button :value="false" class="chart-radio-button">
                  统计图
                </a-radio-button>
                <a-radio-button :value="true" class="chart-radio-button">
                  数据视图
                </a-radio-button>
              </a-radio-group>
            </a-col>
          </a-row>
          <div class="panel-container">
            <div
              id="statisticsChart"
              class="chart-container"
              :class="[!showEchartTable ? '' : 'hidden-panel']"
            ></div>
            <a-table
              :class="[showEchartTable ? '' : 'hidden-panel']"
              v-if="tableData.length > 0"
              :locale="{ emptyText: '暂无数据' }"
              :columns="columnsTable"
              :data-source="tableData"
              bordered
              size="small"
              :scroll="{ y: 240, x: 10 }"
              :rowKey="
                (record, index) => {
                  return index
                }
              "
            >
            </a-table>
          </div>
        </a-spin>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Watch, Prop, Ref } from 'vue-property-decorator'
import {
  UUID,
  AppMixin,
  LayerType,
  ColorUtil,
  Feature,
  Catalog,
  Metadata
} from '@mapgis/web-app-framework'
import axios from 'axios'
import * as echarts from 'echarts'
import { Sketch } from 'vue-color'

@Component({
  name: 'MpAttrStatistics',
  components: { 'sketch-picker': Sketch }
})
export default class MpAttrStatistics extends Mixins(AppMixin) {
  @Prop(Object) readonly queryParams!: Record<string, any>

  @Prop({
    type: String,
    default: '#ff0000'
  })
  readonly beginColor!: string

  @Prop({
    type: String,
    default: '#0000ff'
  })
  readonly endColor!: string

  private resultLoading = false

  private layerOptions: OptionItem[] = []

  private color = 'rgba(255,255,16,1)'

  private layer = ''

  private fieldOptions: OptionItem[] = []

  // private groupField = ''

  private groupFieldIndex = -1

  private get groupField() {
    if (
      this.groupFieldIndex > -1 &&
      this.fieldOptions &&
      this.fieldOptions.length >= this.groupFieldIndex
    ) {
      return this.fieldOptions[this.groupFieldIndex]
    }
    return {}
  }

  @Watch('groupField')
  groupFieldChange() {
    if (
      this.fieldOptions &&
      this.fieldOptions.length >= this.groupFieldIndex &&
      !this.numberArr.includes(
        this.fieldOptions[this.groupFieldIndex].type.toUpperCase()
      )
    ) {
      this.groupType = this.groupTypeOptions[0].value
    }
  }

  private radioChange() {
    // if (!this.showEchartTable && this.chartObj) {
    //   this.chartObj.resize()
    // }
  }

  private groupTypeOptions: OptionItem[] = [
    {
      label: '一值一类',
      value: 'single'
    },
    {
      label: '分段分类',
      value: 'range'
    }
  ]

  private rangeNum = 5

  private groupType = this.groupTypeOptions[0].value

  private statisticsTypeOptions: OptionItem[] = [
    {
      label: '求和',
      value: '3',
      type: 'sum'
    },
    {
      label: '求平均值',
      value: '4',
      type: 'avg'
    },
    {
      label: '最大值',
      value: '1',
      type: 'max'
    },
    {
      label: '最小值',
      value: '2',
      type: 'min'
    },
    {
      label: '计数',
      value: '6',
      type: 'count'
    },
    {
      label: '去重',
      value: '7',
      type: 'var'
    }
  ]

  private statisticsTypeIndex = 0

  private get statisticsType() {
    return this.statisticsTypeOptions[this.statisticsTypeIndex]
  }

  private statisticsFieldIndex =
    this.fieldOptions && this.fieldOptions.length > 0 ? [0] : []

  private get statisticsField() {
    if (this.fieldOptions && this.fieldOptions.length > 0) {
      return this.statisticsFieldIndex.map(index => {
        return this.fieldOptions[index]
      })
    }

    return []
  }

  // private statisticsField = []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private chartObj: any

  private columns = [
    {
      align: 'center',
      title: '字段',
      dataIndex: 'field',
      key: 'field'
    },
    {
      align: 'center',
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      width: '45%',
      scopedSlots: { customRender: 'color' }
    }
  ]

  private data: TableItem[] = []

  private columnsTable: Record<string, any>[] = []

  private tableData: Record<string, any>[] = []

  private showEchartTable = false

  private fieldTypeCN = {
    BYTE: '字节数据类型',
    SHORT: '短整型',
    INT: '整型',
    LONG: '长整型',
    FLOAT: '浮点型',
    DOUBLE: '双精度型',
    STRING: '字符串类型',
    BINARY: '二进制类型',
    BOOLEAN: '布尔类型',
    GEOMETRY: '几何类型',
    TIMESTAMP: '时间戳',
    TIME: '时间类型',
    DATE: '日期类型'
  }

  private numberArr: Array<string> = [
    'BYTE',
    'SHORT',
    'INT',
    'LONG',
    'FLOAT',
    'DOUBLE',
    'BINARY'
  ]

  private async mounted() {
    // await this.getLayerOptions()
    await this.changeQueryParamas(this.queryParams)
  }

  async getLayerOptions() {
    await this.getLayerInfosByServerName(
      this.queryParams.serverName,
      this.queryParams.serverUrl
    )
  }

  @Watch('queryParams', { deep: true })
  async changeQueryParamas(value) {
    if (value.gdbp) {
      this.fieldOptions = await this.getFieldInfosByLayer()
    } else {
      await this.getLayerOptions()
    }
  }

  @Watch('layer')
  private async changeLayer(value) {
    this.fieldOptions = await this.getFieldInfosByLayer(value)
  }

  @Watch('fieldOptions')
  private changeFieldOptions(val: OptionItem[]) {
    // ;[this.groupField.value] = val
    this.groupFieldIndex = 0
    // this.statisticsField = [val[0].value]
    this.statisticsFieldIndex =
      this.fieldOptions && this.fieldOptions.length > 0 ? [0] : []
  }

  @Watch('statisticsField')
  private changeStatisticsField(val: OptionItem[]) {
    const fields = val.filter(x => !!x.value)
    const colors = this.gradientColor(
      this.beginColor,
      this.endColor,
      fields.length
    )
    const data: { field: string; color: string }[] = []
    for (let i = 0; i < fields.length; i += 1) {
      data.push({ field: fields[i].label, color: colors[i] })
    }
    this.data = data
  }

  // 根据文档名称获取图层信息(MapGIS和ArcGIS地图文档)
  private async getLayerInfosByServerName() {
    const { serverType, serverName, serverUrl, ip, port } = this.queryParams
    if (serverType === LayerType.IGSMapImage) {
      const docInfo = await Catalog.DocumentCatalog.getDocInfo({
        serverName,
        ip,
        port
      })

      if (docInfo == null) {
        this.$message.error(`获取文档${serverName}信息失败`)
        return []
      }
      const {
        MapInfos: [{ CatalogLayer }]
      } = docInfo

      if (CatalogLayer === undefined) {
        this.$message.error(`获取文档${serverName}信息失败`)
        return []
      }

      const layerIndexes = Catalog.DocumentCatalog.getLayerIndexesByNamesOrCodes(
        CatalogLayer
      ).join(',')

      const layers = Catalog.DocumentCatalog.getLayersByIndexes(
        layerIndexes,
        CatalogLayer
      )
      this.layerOptions = layers.map(layer => ({
        label: layer.LayerName,
        value: layer.layerIndex
      }))
    } else if (serverType === LayerType.ArcGISMapImage) {
      const result = await Metadata.ArcGISMetadataQuery.getServiceInfo(
        serverUrl
      )
      const { layers } = result
      this.layerOptions = layers.map((child, index) => ({
        label: child.name,
        value: index.toString()
      }))
    }
  }

  // 获取图层字段信息
  private async getFieldInfosByLayer(layerIndex?: string) {
    const {
      serverType,
      serverName,
      serverUrl,
      ip,
      port,
      gdbp
    } = this.queryParams
    let options: OptionItem[] = []
    if (
      serverType === LayerType.IGSMapImage ||
      serverType === LayerType.IGSVector ||
      serverType === LayerType.IGSScene
    ) {
      const info = await Feature.FeatureQuery.query(
        {
          ip: this.queryParams.ip,
          port: this.queryParams.port,
          f: 'json',
          gdbp,
          docName: serverName,
          layerIdxs: layerIndex,
          IncludeAttribute: false,
          IncludeGeometry: false,
          IncludeWebGraphic: false
        },
        false,
        serverType === LayerType.IGSScene
      )
      const {
        AttStruct: { FldName, FldType, FldNumber, FldAlias }
      } = info

      for (let index = 0; index < FldNumber; index += 1) {
        options.push({
          label: FldAlias[index] || FldName[index],
          value: FldName[index],
          type: FldType[index]
        })
      }
    } else if (serverType === LayerType.ArcGISMapImage) {
      const result = await Feature.ArcGISFeatureQuery.getLayerFileds({
        f: 'json',
        serverUrl,
        layerIndex
      })
      console.log(result)
      options = result.fields
        .map((item, index) => ({
          label: item.name,
          value: item.name,
          type: item.type
        }))
        .map(({ label, value, type }) => ({
          label,
          value,
          type: type.toUpperCase()
        }))
    }
    return options
  }

  private gradientColor(start: string, end: string, step: number) {
    if (step === 0) return []
    if (step === 1) return [start]
    if (step === 2) return [start, end]
    const startRgba = ColorUtil.getColorObject(start)
    const endRgba = ColorUtil.getColorObject(end)
    const rgbArr: string[] = []
    for (let i = 0; i < step; i += 1) {
      const r = startRgba.r + i * Math.floor((endRgba.r - startRgba.r) / step)
      const g = startRgba.g + i * Math.floor((endRgba.g - startRgba.g) / step)
      const b = startRgba.b + i * Math.floor((endRgba.b - startRgba.b) / step)
      const rgb = `rgb(${r},${g},${b})`
      rgbArr.push(rgb)
    }
    return rgbArr
  }

  private async getResult() {
    this.resultLoading = true
    try {
      const {
        serverType,
        serverName,
        serverUrl,
        ip,
        port,
        gdbp
      } = this.queryParams
      let dataset: unknown[][] = []
      let data: any
      if (
        serverType === LayerType.IGSMapImage ||
        serverType === LayerType.IGSVector ||
        serverType === LayerType.IGSScene
      ) {
        let url
        if (serverType === LayerType.IGSMapImage) {
          url = `http://${ip}:${port}/onemap/docs/${serverName}/0/*/statisticalField`
        } else {
          url = `http://${ip}:${port}/onemap/layer/statisticalField`
        }
        const params = {
          layerIdxs: this.layer,
          where: '',
          field: this.statisticsField.map(item => item.value).join(','),
          type: this.statisticsType.value,
          guid: '__readonly_user__',
          f: 'json',
          groupFields: this.groupField.value,
          precision: '2',
          gdbp
        }

        data = await this.setDataParams(url, params)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dataset.push([
          `${this.groupField.label}(分组)`,
          ...this.statisticsField.map(item => item.label)
        ])
        const keys = Object.keys(data[0])
        const items = keys.map(key => {
          return [
            key,
            ...data.map(x => {
              return x[key]
            })
          ]
        })
        dataset.push(...items)
      } else if (serverType === LayerType.ArcGISMapImage) {
        const { count: totalCount } = await Feature.ArcGISFeatureQuery.getTotal(
          {
            f: 'json',
            serverUrl,
            layerIndex: this.layer
          }
        )

        const outStatistics = this.statisticsField.map(item => {
          return {
            statisticType: this.statisticsType.type,
            onStatisticField: item.value,
            outStatisticFieldName: item.value
          }
        })
        let obj = {}
        if (this.groupType === 'single') {
          const geojson = await Feature.ArcGISFeatureQuery.query({
            f: 'json',
            page: 0,
            pageCount: totalCount,
            serverUrl,
            outStatistics: JSON.stringify(outStatistics),
            groupByFieldsForStatistics: this.groupField.value,
            layerIndex: this.layer,
            totalCount
          })
          obj = this.setArcgisSingleData(geojson)
        } else {
          const { features } = await Feature.ArcGISFeatureQuery.query({
            f: 'json',
            page: 0,
            pageCount: totalCount,
            serverUrl,
            outStatistics: JSON.stringify([
              {
                statisticType: 'max',
                onStatisticField: this.groupField.value,
                outStatisticFieldName: 'max'
              },
              {
                statisticType: 'min',
                onStatisticField: this.groupField.value,
                outStatisticFieldName: 'min'
              }
            ]),
            layerIndex: this.layer,
            totalCount
          })
          const {
            properties: { max, min }
          } = features[0]
          obj = await this.setArcgisRangeData({
            max,
            min,
            outStatistics,
            totalCount,
            serverUrl
          })
        }
        data = obj.data
        dataset = obj.dataSet
      }
      this.$nextTick(() => {
        this.setEchart(data)

        this.setTableView(dataset)
      })
    } catch (error) {
      this.$message.warning('统计失败！')
    } finally {
      this.resultLoading = false
    }
  }

  async setArcgisRangeData({ max, min, outStatistics, totalCount, serverUrl }) {
    const arr = []
    const dataSet = []
    const templete = [this.groupField.value]
    this.statisticsField.forEach(val => {
      arr.push({})
      templete.push(val.value)
    })
    const num = (max - min) / this.rangeNum
    const limistArr = []
    for (let index = 1; index <= this.rangeNum; index++) {
      const arr1 = Number(min) + (index - 1) * num
      const arr2 = Number(min) + index * num
      limistArr.push([arr1, arr2])
    }
    for (let index = 0; index < limistArr.length; index++) {
      const limits = limistArr[index]
      const { features } = await Feature.ArcGISFeatureQuery.query({
        f: 'json',
        page: 0,
        pageCount: totalCount,
        serverUrl,
        outStatistics: JSON.stringify(outStatistics),
        // groupByFieldsForStatistics: this.groupField.value,
        layerIndex: this.layer,
        totalCount,
        where: `( ${this.groupField.value} >= ${limits[0]} AND ${
          this.groupField.value
        } ${index === limistArr.length - 1 ? '<=' : '<'} ${limits[1]} )`
      })
      const { properties } = features[0]
      this.statisticsField.forEach((val, i) => {
        // arr[i].push({ [JSON.stringify(limits)]: properties[val] })
        arr[i][JSON.stringify(limits)] = properties[val.value]
      })
      const tableArr = [JSON.stringify(limits)]
      templete.forEach((val, id) => {
        if (id !== 0) {
          tableArr.push(properties[val])
        }
      })
      dataSet.push(tableArr)
    }
    dataSet.unshift(
      templete.map((item, index) => {
        if (index === 0) {
          return `${item}(分组)`
        }
        return item
      })
    )
    return {
      data: arr,
      dataSet
    }
  }

  setArcgisSingleData({ features }) {
    const arr = []
    const dataSet = []
    const templete = [this.groupField.value]
    this.statisticsField.forEach(item => {
      arr.push({})
      templete.push(item.value)
    })
    features.forEach(({ properties }) => {
      dataSet.push(templete.map(item => properties[item]))

      this.statisticsField.forEach((item, index) => {
        arr[index][properties[this.groupField.value]] = properties[item.value]
      })
    })
    dataSet.unshift(
      templete.map((item, index) => {
        if (index === 0) {
          return `${item}(分组)`
        }
        return item
      })
    )
    return {
      data: arr,
      dataSet
    }
  }

  async setDataParams(url, params) {
    const { data } = await axios.get<any[]>(url, { params })
    const keys = Object.keys(data[0])
    const dataArr = []
    if (this.groupType === 'single') {
      for (let index = 0; index < keys.length; index++) {
        const key = keys[index]
        const where = this.numberArr.includes(
          this.fieldOptions[this.groupFieldIndex].type.toUpperCase()
        )
          ? `${this.groupField.value} = ${key}`
          : `${this.groupField.value} = '${key}'`
        const arr = (
          await axios.get<any[]>(url, {
            params: {
              ...params,
              where,
              groupFields: ''
            }
          })
        ).data
        if (dataArr.length > 0) {
          arr.forEach((item, i) => {
            const newItem = { [key]: item }
            const obj = {
              ...dataArr[i],
              ...newItem
            }
            dataArr[i] = obj
          })
        } else {
          arr.forEach(item => {
            dataArr.push({ [key]: item })
          })
        }
      }
      return dataArr
    }
    const num = (keys[keys.length - 1] - keys[0]) / this.rangeNum
    const limistArr = []
    for (let index = 1; index <= this.rangeNum; index++) {
      const arr1 = Number(keys[0]) + (index - 1) * num
      const arr2 = Number(keys[0]) + index * num
      limistArr.push([arr1, arr2])
    }
    for (let index = 0; index < limistArr.length; index++) {
      const limits = limistArr[index]

      const arr = (
        await axios.get<any[]>(url, {
          params: {
            ...params,
            where: `( ${this.groupField.value} >= ${limits[0]} AND ${
              this.groupField.value
            } ${index === limistArr.length - 1 ? '<=' : '<'} ${limits[1]} )`,
            groupFields: ''
          }
        })
      ).data
      if (dataArr.length > 0) {
        arr.forEach((item, i) => {
          const newItem = { [JSON.stringify(limits)]: item }
          const obj = {
            ...dataArr[i],
            ...newItem
          }
          dataArr[i] = obj
        })
      } else {
        arr.forEach(item => {
          dataArr.push({ [JSON.stringify(limits)]: item })
        })
      }
    }
    return dataArr
  }

  setEchart(data) {
    if (!this.chartObj) {
      this.chartObj = echarts.init(document.getElementById('statisticsChart'))
    }
    const self = this
    const keys = Object.keys(data[0])
    // 指定图表的配置项和数据
    const queryChartOption = {
      color: self.data.map(x => x.color),
      tooltip: { trigger: 'axis' },
      legend: {},
      xAxis: {
        axisLabel: {
          interval: 'auto', // 横轴信息自动调整显示
          rotate: -20 // -30度角倾斜显示
        }
      },
      dataZoom: [],
      yAxis: {
        axisLabel: {
          formatter(value) {
            const texts = []
            if (value > 9999999999999999) {
              // 16个9
              const text = `${parseInt(value / 10000000000000000)}京`
              texts.push(text)
            } else if (value > 999999999999) {
              // 12个9
              const text = `${parseInt(value / 1000000000000)}兆`
              texts.push(text)
            } else if (value > 99999999) {
              // 8个9
              const text = `${parseInt(value / 100000000)}亿`
              texts.push(text)
            } else if (value > 9999) {
              const text = `${parseInt(value / 10000)}万`
              texts.push(text)
            } else {
              texts.push(value)
            }
            return texts
          }
        }
      },
      toolbox: {
        show: true,
        orient: 'horizontal',
        showTitle: true,
        feature: {
          magicType: {
            type: ['line', 'bar']
          },
          saveAsImage: {
            type: 'png',
            show: true,
            title: '保存为图片'
          },
          restore: { show: true }
        }
      },
      series: []
    }
    queryChartOption.xAxis.data = Object.keys(data[0])
    queryChartOption.xAxis.title = this.groupField.value
    for (let n = 0; n < this.statisticsField.length; n++) {
      const option = {
        type: 'bar',
        barMaxWidth: 30,
        data: keys.map(key => {
          return data[n][key]
        }),
        name: this.statisticsField[n].label
      }
      queryChartOption.series[n] = option
    }
    queryChartOption.legend.data = this.statisticsField.map(x => x.label)
    if (keys.length > 10) {
      queryChartOption.dataZoom = [
        {
          type: 'slider',
          show: true,
          xAxisIndex: [0],
          left: '9%',
          start: 30,
          end: 70 // 初始化滚动条
        }
      ]
    } else {
      queryChartOption.dataZoom = []
    }
    this.chartObj.setOption(queryChartOption, true)
    this.chartObj.resize()
  }

  setTableView(dataset) {
    const tableColumns: Record<string, any>[] = []
    const tableData: Record<string, any>[] = []
    dataset[0].forEach(x => {
      const item = {
        title: x,
        dataIndex: x,
        align: 'center',
        key: x,
        width: 200
      }
      tableColumns.push(item)
    })
    for (let i = 1; i < dataset.length; i += 1) {
      const row = dataset[i]
      const obj: Record<string, any> = {}
      obj.id = UUID.uuid()
      for (let j = 0; j < tableColumns.length; j += 1) {
        const col = tableColumns[j]
        obj[col.dataIndex] = row[j]
      }
      tableData.push(obj)
    }
    this.columnsTable = tableColumns
    this.tableData = tableData
  }
}
</script>

<style lang="less" scoped>
.attr-statistics {
  .a-row-space {
    margin-bottom: 5px;
  }
  .color-block-container {
    padding: 5px 10px;
    border-radius: 4px;
    color: white;
  }
  .chart-radio-button {
    width: 110px;
    text-align: center;
  }
  .panel-container {
    position: relative;
    .chart-container {
      position: absolute;
      height: 280px;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
    }
    .hidden-panel {
      opacity: 0;
      pointer-events: none;
    }
  }
}
</style>
