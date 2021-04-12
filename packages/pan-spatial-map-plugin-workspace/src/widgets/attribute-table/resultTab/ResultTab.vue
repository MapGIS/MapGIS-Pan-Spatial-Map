<template>
  <a-locale-provider :locale="zhCN">
    <div class="result-tab-container">
      <div class="action-button-group">
        <div class="left">
          <a-button
            type="primary"
            @click="filterWithMap = !filterWithMap"
            icon="scissor"
          >
            <span>按地图范围过滤</span>
            <span v-if="filterWithMap">(再次点击取消范围过滤)</span>
          </a-button>
          <a-button type="danger" @click="clear" icon="close">
            清除所有
          </a-button>
        </div>
        <div class="right">
          <a-button @click="attrStatistics" icon="bar-chart">
            属性统计
          </a-button>
          <a-button @click="filter" icon="filter">
            过滤器
          </a-button>
          <a-button type="primary" :icon="'fullscreen'" @click="openDialog">
            全屏
          </a-button>
        </div>
      </div>
      <a-modal
        :title="data.label"
        :visible="visible"
        :footer="null"
        destroyOnClose
        width="100vw"
        :zIndex="9999"
        dialogClass="result-tab-model-container"
        @cancel="visible = false"
      >
        <a-table
          style="margin:10px"
          id="measure-table-content_model"
          bordered
          size="small"
          :columns="tableColumns"
          :data-source="tableData"
          :loading="loading"
          :rowSelection="{
            selectedRowKeys: getSelectionKey,
            onChange: handlerSelectChange,
            type: 'radio',
            fixed: true,
            columnWidth: '50px'
          }"
          :scroll="{
            y: scrollYModel,
            x: '100%'
          }"
          :pagination="false"
          :customRow="
            record => ({
              on: {
                click: () => rowClick(record),
                dblclick: () => rowDblclick(record)
              }
            })
          "
        >
        </a-table>
        <div
          style="text-align:right;padding-right:10px"
          v-if="tableData && tableData.length > 0"
        >
          <a-pagination
            :current="pagination.current"
            :page-size-options="pagination.pageSizeOptions"
            :total="pagination.total"
            :showTotal="pagination.showTotal"
            show-size-changer
            :page-size="pagination.pageSize"
            @showSizeChange="pagination.onShowSizeChange"
            @change="pagination.onChange"
            show-quick-jumper
          >
          </a-pagination>
        </div>
      </a-modal>
      <a-table
        style="margin:10px"
        id="measure-table-content"
        bordered
        size="small"
        :columns="tableColumns"
        :data-source="tableData"
        :loading="loading"
        :rowSelection="{
          selectedRowKeys: getSelectionKey,
          onChange: handlerSelectChange,
          type: 'radio',
          fixed: true,
          columnWidth: '50px'
        }"
        :scroll="{
          y: scrollY,
          x: '100%'
        }"
        :pagination="false"
        :customRow="
          record => ({
            on: {
              click: () => rowClick(record),
              dblclick: () => rowDblclick(record)
            }
          })
        "
      >
      </a-table>
      <div
        style="text-align:right;padding-right:10px"
        v-if="tableData && tableData.length > 0"
      >
        <a-pagination
          :current="pagination.current"
          :page-size-options="pagination.pageSizeOptions"
          :total="pagination.total"
          :showTotal="pagination.showTotal"
          show-size-changer
          :page-size="pagination.pageSize"
          @showSizeChange="pagination.onShowSizeChange"
          @change="pagination.onChange"
          show-quick-jumper
        >
        </a-pagination>
      </div>
      <result-tab-mapbox
        v-if="mapRender === mapboxRender"
        :markers="markers"
        :filterWithMap="filterWithMap"
        :bounds="bounds"
        :geojson="geojson"
        @mapBounds="getGeometry"
        @clear="clear"
      ></result-tab-mapbox>
      <result-tab-cesium
        v-else
        :markers="markers"
        :filterWithMap="filterWithMap"
        :bounds="bounds"
        :geojson="geojson"
        @mapBounds="getGeometry"
        @clear="clear"
      ></result-tab-cesium>
      <mp-window-wrapper :visible="showAttrStatistics">
        <mp-window
          title="属性统计"
          :width="700"
          :height="400"
          :visible.sync="showAttrStatistics"
          anchor="top-center"
        >
          <template>
            <mp-attr-statistics
              v-if="currentTableParams"
              :queryParams="statisticAndFilterParamas"
            />
          </template>
        </mp-window>
      </mp-window-wrapper>
      <mp-window-wrapper :visible="showFilter">
        <mp-window
          title="过滤器"
          :width="700"
          :height="400"
          :visible.sync="showFilter"
          @update:visible="value => closeFilterContainer(value)"
          anchor="top-center"
        >
          <template>
            <mp-filter
              v-if="currentTableParams"
              :queryParams="statisticAndFilterParamas"
              @filterVal="updateWhere"
              @close="closeFilter"
            />
          </template>
        </mp-window>
      </mp-window-wrapper>
    </div>
  </a-locale-provider>
</template>

<script lang="ts">
import { Component, Prop, Watch, Mixins } from 'vue-property-decorator'
import { AppMixin, LayerType } from '@mapgis/web-app-framework'
import { UUID } from '@mapgis/webclient-store/src/utils'
import moment from 'moment'
import zhCN from 'ant-design-vue/es/locale-provider/zh_CN'
import {
  utilInstance,
  queryFeaturesInstance,
  ResultSetColumnOper,
  ResultSetCategoryOper,
  FeatureIGS,
  FeatureGeoJSON,
  GFeature,
  queryArcgisInfoInstance
} from '@mapgis/pan-spatial-map-store'
import * as Zondy from '@mapgis/webclient-es6-service'
import markerBlue from '../../../assets/images/markerBlue.png'
import ResultTabMapbox from './ResultTabMapbox.vue'
import ResultTabCesium from './ResultTabCesium.vue'
import MpAttrStatistics from '../AttrStatistics/AttrStatistics.vue'
import MpFilter from '../../../components/Filter/Filter.vue'

interface Pagination {
  // 排序字段
  sortBy?: string
  // 是否是逆序
  descending?: boolean
  // 页码
  page: number
  // 每页的数量
  rowsPerPage: number
  // 总数
  rowsNumber: number
}

@Component({
  name: 'MpResultTab',
  components: { ResultTabMapbox, ResultTabCesium, MpAttrStatistics, MpFilter }
})
export default class MpResultTab extends Mixins(AppMixin) {
  // 结果集分类信息
  @Prop(Object) data!: IResultSetTable

  @Prop({ type: Number }) viewHeight!: number

  @Prop({ type: Boolean }) open!: boolean

  @Watch('viewHeight')
  viewHeightChange() {
    if (this.open) {
      this.getTableScroll()
    }
  }

  private zhCN = zhCN

  private visible = false

  // 表格内容过多的时候给 固定宽度，表格内容少的时候 内部宽度自适应
  private isfixed(columns): boolean {
    // 这里固定值的意思：20 代表两侧边距   50代表单选框的宽度
    const scroll = document.body.clientWidth - columns.length * 180 - 20 - 50
    if (scroll <= 0) {
      return columns.map(item => ({
        ...item,
        width: 180
      }))
    }
    return columns
  }

  private scrollY = 0

  private scrollYModel = 0

  // 表格数据
  private tableData: unknown[] = []

  // 表头数据
  private tableColumns: Array = []

  // 分页信息
  private pagination = {
    current: 1,
    pageSize: 10,
    total: 0,
    pageSizeOptions: ['5', '10', '20', '30', '50'], // 这里注意只能是字符串，不能是数字
    showSizeChanger: true,
    showTotal: (total, range) =>
      `显示${range[0]}-${range[1]}条，共有 ${total}条`,
    onChange: (page, pageSize) => {
      this.pagination.current = page
      this.query()
    },
    onShowSizeChange: (current, size) => {
      this.pagination.pageSize = size
      this.pagination.current = 1
      this.query()
    }
  }

  private markerBlue = markerBlue

  private markers: Record<string, any>[] = []

  private bounds: Record<string, any> = {}

  private geojson: Record<string, any> = {}

  // 是否正在加载
  private loading = false

  private showAttrStatistics = false

  private statisticAndFilterParamas: Record<string, any> = {}

  private currentTableParams: Record<string, any> = {}

  private showFilter = false

  beforeMount() {
    this.dataChange()
    // this.clear()
    // this.tableData = []
    // this.tableColumns = []
    // this.query()
  }

  getTableScroll(model) {
    const extraHeight = 52
    const [tHeader] = document
      .getElementById(
        model ? 'measure-table-content_model' : 'measure-table-content'
      )
      .getElementsByClassName('ant-table-thead')
    // 表格内容距离顶部的距离
    let tHeaderBottom = 0
    if (tHeader) {
      tHeaderBottom = tHeader.getBoundingClientRect().bottom
    }
    // 窗体高度-表格内容顶部的高度-表格内容底部的高度
    const height = document.body.clientHeight - tHeaderBottom - extraHeight
    if (model) {
      this.scrollYModel = height
    } else {
      this.scrollY = height
    }
  }

  beforeDestroy() {
    this.clear()
  }

  // 显示的表头字段
  private get visibleColumns() {
    return this.tableColumns.filter(x => x.visible).map(x => x.name)
  }

  // 获取行的唯一标识
  private getRowKey: (row: unknown) => unknown = () => ''

  // 选中的行
  private selection: unknown[] = []

  private get getSelectionKey() {
    return this.selection.map(item => (item as GFeature).properties.fid)
  }

  private handlerSelectChange(selectedRowKeys, selectedRows) {
    this.selection = selectedRows
  }

  @Watch('data', { deep: true })
  dataChange() {
    this.clear()
    this.tableData = []
    this.tableColumns = []
    this.query()
  }

  private openDialog() {
    if (this.tableColumns.length > 0) {
      this.visible = true
      window.setTimeout(() => {
        this.getTableScroll(true)
      }, 800)
    } else {
      this.$message.warning('数据正在加载，请稍后再试')
    }
  }

  // 单击行
  private rowClick(row: unknown) {
    this.geojson = {
      features: [row],
      type: 'FeatureCollection'
    }
    this.selection = [row]
  }

  // 关闭过滤器的时候，刷新请求
  closeFilterContainer(value) {
    if (!value) {
      this.dataChange()
    }
  }

  // 双击行
  private rowDblclick(row: unknown) {
    const feature = row as GFeature
    let { bound } = feature
    if (bound === undefined) {
      bound = utilInstance.getGeoJsonFeatureBound(feature)
    }
    this.bounds = { ...(bound as Record<string, number>) }
  }

  // 是否随地图范围过滤
  private filterWithMap = false

  // 地图范围
  private geometry?: Record<string, unknown> = undefined

  async getGeometry(val: Record<string, any>) {
    const { xmin, ymin, xmax, ymax } = val
    this.geometry = new Zondy.Common.Rectangle(xmin, ymin, xmax, ymax)
    // 分页初始化到第一页
    this.pagination.current = 1
    // 记录当前选中的行（避免双击定位同时根据范围过滤时导致信息刷新）
    const [row] = this.selection
    await this.query()
    if (row) {
      // 如果有选中行则在表格刷新之后再次选中行
      const Feature = this.tableData.find(feature => {
        const { properties } = feature as GFeature
        const {
          properties: { fid }
        } = row as GFeature
        return properties.fid === fid
      })
      this.selection = [Feature]
      this.geojson = {
        features: [Feature],
        type: 'FeatureCollection'
      }
    }
  }

  // @Watch('tab', { immediate: true })
  // private changeTab() {
  //   this.tableData = []
  //   this.tableColumns = []
  //   this.query()
  // }

  private async query(where?: string) {
    // debugger
    this.loading = true
    try {
      this.clear()
      await this.queryGeoJson(
        this.filterWithMap ? this.geometry : undefined,
        where
      )
    } catch (error) {
      const e = error as Error
      console.warn('[DEBUG]: ResultTab -> query -> e.stack', e.stack)
      this.$message.warning(e.message)
    } finally {
      this.loading = false
      this.getTableScroll()
    }
  }

  private async updateWhere(val) {
    await this.query(val)
  }

  // 只有数字类型才会添加排序功能
  private sorterFunciton(a: any, b: any, type: string): boolean {
    const numberArr: Array<string> = [
      'BYTE',
      'SHORT',
      'INT',
      'LONG',
      'FLOAT',
      'DOUBLE',
      'BINARY'
    ]
    const timeArr: Array<string> = ['TIME', 'DATE', 'TIMESTAMP']
    if (numberArr.includes(type.toUpperCase())) {
      return a - b
    }
    if (timeArr.includes(type.toUpperCase())) {
      return moment(a) - moment(b)
    }
    return false
  }

  private async queryGeoJson(
    geo: Record<string, unknown> | undefined,
    where: string | undefined
  ) {
    // const table = this.tables.find(x => x.id === this.tab)
    this.currentTableParams = { ...this.data }
    if (!this.data) throw new Error('获取表格数据失败')
    const { ip, port, serverName, serverType, serverUrl } = this.data
    if (
      serverType === LayerType.IGSMapImage ||
      serverType === LayerType.IGSVector
    ) {
      const { layerIndex, gdbp, geometry } = this.data
      const tempWhere = where || this.data.where
      const { current, pageSize } = this.pagination
      const tangram = geo || geometry
      const geojson = (await queryFeaturesInstance.query({
        ip,
        port: port.toString(),
        f: 'geojson',
        where: tempWhere,
        geometry: tangram,
        page: current - 1,
        pageCount: pageSize,
        gdbp,
        docName: serverName,
        layerIdxs: layerIndex,
        coordPrecision: 8
      })) as FeatureGeoJSON
      const { AttStruct, TotalCount } = await this.queryCount(
        tangram,
        tempWhere
      )
      const columns: Array = []
      const {
        FldNumber = 0,
        FldName = [],
        FldAlias = [],
        FldType = []
      } = AttStruct
      for (let index = 0; index < FldNumber; index++) {
        const name = FldName[index]
        const alias = FldAlias[index] ? `(${FldAlias[index]})` : ''
        const type = FldType[index]
        const bool = ['GEOMETRY', 'STRING'].includes(type.toUpperCase())
        const obj = {
          title: `${name}${alias}`,
          key: name,
          dataIndex: `properties.${name}`,
          align: 'center',
          ellipsis: true
        }
        columns.push(
          bool
            ? obj
            : {
                ...obj,
                sorter: (a, b) =>
                  this.sorterFunciton(
                    a.properties[name],
                    b.properties[name],
                    type
                  )
              }
        )
      }
      this.tableColumns = this.isfixed(columns)
      this.getRowKey = row => (row as GFeature).properties.fid
      this.pagination.total = TotalCount
      this.tableData = geojson.features
      this.markers = []
      const tempMarkers: Record<string, any>[] = []
      for (let i = 0; i < geojson.features.length; i += 1) {
        const feature = geojson.features[i]
        const center = utilInstance.getGeoJsonFeatureCenter(feature)
        if (!(Number.isNaN(center[0]) || Number.isNaN(center[1]))) {
          const marker: Record<string, any> = {
            coordinates: center,
            fid: feature.properties.fid,
            img: this.markerBlue,
            id: UUID.uuid(),
            properties: feature.properties
          }
          tempMarkers.push(marker)
        }
      }
      this.markers = [...tempMarkers]
    }
    /* else if (serverType === SubLayerType.RasterArcgisLayer) {
      const { layerIndex, gdbp, geometry } = this.data
      const tempWhere = where || this.data.where
      const { current, pageSize } = this.pagination
      const tangram = geo || geometry
      const {
        count: totalCount
      } = await queryArcgisInfoInstance.getArcGISQueryTotal({
        f: 'json',
        where: tempWhere,
        geometry: tangram,
        serverUrl,
        layerIndex
      })
      console.log(totalCount)
      const geojson = await queryArcgisInfoInstance.query({
        f: 'json',
        where: tempWhere,
        geometry: tangram,
        page: current - 1,
        pageCount: pageSize,
        serverUrl,
        layerIndex,
        totalCount
      })
      const columns: Array = []
      const { properties } = geojson.features[0]
      const tags = utilInstance.getJsonTag(properties)
      for (let index = 0; index < tags.length; index++) {
        const name = tags[index]
        const alias = tags[index] ? `(${tags[index]})` : ''
        const type = 'string'
        columns.push({
          title: `${name}${alias}`,
          key: name,
          dataIndex: `properties.${name}`,
          align: 'center',
          ellipsis: true
        })
      }
      this.tableColumns = this.isfixed(columns)
      this.pagination.total = totalCount
      this.getRowKey = row => (row as GFeature).properties.fid
      this.tableData = geojson.features
      this.markers = []
      const tempMarkers: Record<string, any>[] = []
      for (let i = 0; i < geojson.features.length; i += 1) {
        const feature = geojson.features[i]
        const center = utilInstance.getGeoJsonFeatureCenter(feature)
        if (Number.isNaN(center[0]) || Number.isNaN(center[1])) {
          continue
        }
        const marker: Record<string, any> = {
          coordinates: center,
          fid: feature.properties.fid,
          img: this.markerBlue,
          id: UUID.uuid(),
          properties: feature.properties
        }
        tempMarkers.push(marker)
      }
      this.markers = [...tempMarkers]
    } */
  }

  private async queryCount(geometry?: Record<string, any>, where?: string) {
    // const table = this.tables.find(x => x.id === this.tab)
    if (!this.data) throw new Error('获取表格数据失败')
    const { ip, port, serverName } = this.data
    const { layerIndex, gdbp } = this.data
    const tempWhere = where || this.data.where
    const featureSet = (await queryFeaturesInstance.query({
      ip,
      port: port.toString(),
      f: 'json',
      cursorType: 'cursorType',
      IncludeAttribute: false,
      IncludeGeometry: false,
      IncludeWebGraphic: false,
      geometry,
      where: tempWhere,
      gdbp,
      docName: serverName,
      layerIdxs: layerIndex
    })) as FeatureIGS
    return featureSet
  }

  public clear() {
    this.geojson = {
      features: [],
      type: 'FeatureCollection'
    }
    this.markers = []
    this.selection = []
  }

  private attrStatistics() {
    this.showAttrStatistics = true
    this.setStatisticAndFilterParamas()
  }

  // customSort(rows, sortBy, descending) {
  //   const data = [...rows]
  //   const isNum = utilInstance.isNumeric(data[0].properties[sortBy])
  //   if (sortBy) {
  //     data.sort((item1, item2) => {
  //       const a = item1.properties
  //       const b = item2.properties
  //       const x = descending ? b : a
  //       const y = descending ? a : b

  //       if (isNum) {
  //         // numeric sort
  //         return parseFloat(x[sortBy]) - parseFloat(y[sortBy])
  //       }
  //       // string sort
  //       return x[sortBy] > y[sortBy] ? 1 : x[sortBy] < y[sortBy] ? -1 : 0
  //     })
  //   }

  //   return data
  // }

  setStatisticAndFilterParamas() {
    const { serverType, gdbp } = this.data
    if (
      serverType === LayerType.IGSMapImage ||
      serverType === LayerType.IGSVector
    ) {
      this.statisticAndFilterParamas = {
        ip: this.data.ip.toString(),
        port: this.data.port.toString(),
        serverName: this.data.serverName,
        layerIndex: this.currentTableParams.layerIndex,
        serverType,
        gdbp
      }
    }
    /* else if (serverType === SubLayerType.RasterArcgisLayer) {
      this.statisticAndFilterParamas = {
        serverUrl: this.data.serverUrl,
        serverName: this.data.serverName,
        layerIndex: this.currentTableParams.layerIndex,
        serverType
      }
    } */
  }

  filter() {
    this.showFilter = true
    this.setStatisticAndFilterParamas()
  }

  closeFilter() {
    this.showFilter = false
  }
}
</script>
<style lang="less">
@import '~ant-design-vue/lib/style/color/colors.less';
.result-tab-model-container {
  top: 0;
  padding: 0;
  .ant-modal-content {
    border-radius: 0;
    box-shadow: none;
    height: 100vh;
    .ant-modal-body {
      padding: 0;
      .ant-table-thead {
        background-color: #f5f5f5;
      }
      .ant-table-selection-column {
        background-color: #f5f5f5;
      }
    }
  }
}
.result-tab-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  .action-button-group {
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
    .ant-btn {
      margin-top: 10px;
      color: #fff;
    }
    .left {
      .ant-btn:nth-child(1) {
        margin-right: 10px;
      }
    }
    .right {
      .ant-btn:nth-child(1) {
        background-color: @green-6;
        border-color: @green-6;
        margin-right: 10px;
        &:hover,
        &:focus {
          border-color: @green-4;
          background-color: @green-4;
        }
      }
      .ant-btn:nth-child(2) {
        background-color: @gold-6;
        border-color: @gold-6;
        margin-right: 10px;
        &:hover,
        &:focus {
          border-color: @gold-4;
          background-color: @gold-4;
        }
      }
    }
  }
}
</style>
