<template>
  <div ref="attributeTable" :id="id" class="mp-attribute-table">
    <div class="header-bar">
      <div class="left-bar">
        <div class="title">
          {{ selectedDescription }}
        </div>
        <a-switch
          checked-children="范围过滤"
          un-checked-children="范围过滤"
          v-model="filterWithMap"
          size="small"
          style="margin: 0 8px"
        />
        <div class="actions">
          <a-tooltip title="缩放至已选择">
            <a-icon @click="onZoomTo" class="action" type="environment" />
          </a-tooltip>
          <a-tooltip title="清除选择">
            <a-icon
              @click="onClearSelection"
              class="action"
              type="close-square"
            />
          </a-tooltip>
        </div>
      </div>
      <div class="actions">
        <a-tooltip title="属性统计">
          <a-icon @click="onStatistics" class="action" type="bar-chart" />
        </a-tooltip>
        <a-tooltip title="过滤器">
          <a-icon @click="onFilter" class="action" type="filter" />
        </a-tooltip>
        <a-divider type="vertical" />
        <a-tooltip title="刷新">
          <a-icon
            @click="onRefresh"
            class="action"
            :type="loading ? 'loading' : 'reload'"
          />
        </a-tooltip>
        <a-tooltip title="列配置">
          <mp-action-columns
            v-if="tableColumns.length"
            :columns="tableColumns"
            class="action"
          >
          </mp-action-columns>
        </a-tooltip>
        <a-tooltip title="全屏">
          <a-icon
            @click="onToggleScreen"
            class="action"
            :type="fullScreen ? 'fullscreen-exit' : 'fullscreen'"
          />
        </a-tooltip>
      </div>
    </div>
    <a-table
      :id="tableId"
      bordered
      size="small"
      :columns="visibleColumns"
      :data-source="tableData"
      :loading="loading"
      :rowSelection="{
        selectedRowKeys: selectedRowKeys,
        onChange: onSelectChange,
        type: 'checkbox',
        fixed: true,
        columnWidth: '50px'
      }"
      :rowKey="row => row.properties[rowKey]"
      :scroll="{
        x: useScrollX ? '100%' : false,
        y: scrollY
      }"
      :pagination="false"
      :customRow="
        record => ({
          on: {
            click: () => onRowClick(record),
            dblclick: () => onRowDblclick(record)
          }
        })
      "
    >
    </a-table>
    <div
      style="text-align:right;padding:5px 10px 5px 0"
      v-if="tableData && tableData.length > 0"
    >
      <a-pagination
        size="small"
        :total="pagination.total"
        :show-total="showPaginationTotal"
        :page-size-options="pagination.pageSizeOptions"
        :page-size="pagination.pageSize"
        :current="pagination.current"
        show-size-changer
        show-quick-jumper
        @showSizeChange="onPaginationShowSizeChange"
        @change="onPaginationChange"
      >
      </a-pagination>
    </div>
    <mp-table-mapbox
      v-if="mapRender === mapboxRender"
      ref="tableMapbox"
      :markers="markers"
      :filter-with-map="filterWithMap"
      :fit-bound="fitBound"
      :selection-bound="selectionBound"
      :highlight-style="highlightStyle"
      @map-bound-change="onGetGeometry"
    />
    <mp-table-cesium
      v-else
      ref="tableCesium"
      :markers="markers"
      :filter-with-map="filterWithMap"
      :fit-bound="fitBound"
      :selection-bound="selectionBound"
      :highlight-style="highlightStyle"
      @map-bound-change="onGetGeometry"
    />
    <mp-window-wrapper :visible="showAttrStatistics">
      <template v-slot:default="slotProps">
        <mp-window
          :id="statisticsId"
          title="属性统计"
          :width="720"
          :bottom="10"
          :verticalOffset="10"
          :visible.sync="showAttrStatistics"
          anchor="top-center"
          v-bind="slotProps"
        >
          <template>
            <mp-attr-statistics
              v-if="currentTableParams"
              :queryParams="statisticAndFilterParamas"
            />
          </template>
        </mp-window>
      </template>
    </mp-window-wrapper>
    <mp-window-wrapper :visible="showFilter">
      <template v-slot:default="slotProps">
        <mp-window
          :id="filterId"
          title="过滤器"
          :width="600"
          :height="320"
          :verticalOffset="10"
          :visible.sync="showFilter"
          anchor="top-center"
          v-bind="slotProps"
        >
          <template>
            <mp-filter
              v-if="currentTableParams"
              :queryParams="statisticAndFilterParamas"
              @filterVal="onUpdateWhere"
              @close="onCloseFilter"
            />
          </template>
        </mp-window>
      </template>
    </mp-window-wrapper>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import {
  ExhibitionMixin,
  IAttributeTableOption,
  IAttributeTableExhibition,
  baseConfigInstance,
  utilInstance,
  queryFeaturesInstance,
  FeatureIGS,
  queryArcgisInfoInstance,
  FeatureGeoJSON,
  GFeature
} from '@mapgis/pan-spatial-map-store'
import { AppMixin, LayerType, UUID } from '@mapgis/web-app-framework'
import * as Zondy from '@mapgis/webclient-es6-service'
import moment from 'moment'
import MpActionColumns from './ActionColumns.vue'
import MpTableMapbox from './TableMapbox.vue'
import MpTableCesium from './TableCesium.vue'
import MpFilter from '../Filter/Filter.vue'
import MpAttrStatistics from '../AttrStatistics/AttrStatistics.vue'

@Component({
  name: 'MpAttributeTable',
  components: {
    MpActionColumns,
    MpTableMapbox,
    MpTableCesium,
    MpAttrStatistics,
    MpFilter
  }
})
export default class MpAttributeTable extends Mixins(
  ExhibitionMixin,
  AppMixin
) {
  // 属性表选项
  @Prop({ type: Object }) exhibition!: IAttributeTableExhibition

  // 属性表选项
  @Prop({ type: Object }) option!: IAttributeTableOption

  // 表格数据
  private tableData: unknown[] = []

  // 表头数据
  private tableColumns: Array = []

  private markers: Record<string, any>[] = []

  private fitBound: Record<string, any> = {}

  private selectionBound: Record<string, any> = {}

  // 是否正在加载
  private loading = false

  private currentTableParams: Record<string, any> = {}

  private showFilter = false

  private showAttrStatistics = false

  private statisticAndFilterParamas: Record<string, any> = {}

  // 是否随地图范围过滤
  private filterWithMap = false

  // 地图范围
  private geometry?: Record<string, unknown> = undefined

  // 选中的行
  private selection: unknown[] = []

  // 分页信息
  private pagination = {
    current: 1,
    pageSize: 10,
    total: 0,
    pageSizeOptions: ['5', '10', '20', '30', '50'] // 这里注意只能是字符串，不能是数字
  }

  private id = `${new Date().getTime()}-${Math.floor(
    Math.random() * 10
  )}-table-wrapper`

  private tableId = `${new Date().getTime()}-${Math.floor(
    Math.random() * 10
  )}-table`

  private filterId = `${new Date().getTime()}-${Math.floor(
    Math.random() * 10
  )}-filter`

  private statisticsId = `${new Date().getTime()}-${Math.floor(
    Math.random() * 10
  )}-statistics`

  private fullScreen = false

  private useScrollX = false

  private scrollY = 0

  private isActive = true

  private get selectedRowKeys() {
    return this.selection.map(
      item => (item as GFeature).properties[this.rowKey]
    )
  }

  private get rowKey() {
    const { serverType } = this.optionVal
    if (
      serverType === LayerType.IGSMapImage ||
      serverType === LayerType.IGSVector
    ) {
      return 'fid'
    } else if (serverType === LayerType.arcGISMapImage) {
      return 'ID'
    }
    return 'fid'
  }

  private get selectedDescription() {
    const length = this.selectedRowKeys.length

    return `${length} 已选择`
  }

  private get optionVal() {
    return this.option || this.exhibition.option
  }

  private get visibleColumns() {
    return this.tableColumns.filter(col => col.visible)
  }

  private get highlightStyle() {
    return baseConfigInstance.config.colorConfig.feature
  }

  @Watch('optionVal', { deep: true, immediate: true })
  optionChange() {
    this.clearSelection()
    this.removeMarkers()
    this.tableData = []
    this.tableColumns = []
    this.query()
  }

  created() {
    this.addListener()
  }

  beforeDestroy() {
    this.removeListener()
  }

  onResize() {
    this.calcTableScrollY()
  }

  onActive() {
    this.addMarkers()
    this.hightlightSelectionMarkers()
  }

  onDeActive() {
    this.showFilter = false
    this.showAttrStatistics = false
    this.removeMarkers()
  }

  onClose() {
    // 下面无法隐藏窗口
    // this.showFilter = false
    // this.showAttrStatistics = false
    // 直接设置窗口的style
    document.getElementById(this.filterId).style.display = 'none'
    document.getElementById(this.statisticsId).style.display = 'none'

    this.removeMarkers()
  }

  private onSelectChange(selectedRowKeys, selectedRows) {
    this.selection = selectedRows
    this.hightlightSelectionMarkers()
  }

  private onPaginationChange(page, pageSize) {
    this.pagination.current = page
    this.query()
  }

  private onPaginationShowSizeChange(current, size) {
    this.pagination.pageSize = size
    this.pagination.current = 1
    this.query()
  }

  // 单击行
  private onRowClick(row: unknown) {}

  // 双击行
  private onRowDblclick(row: unknown) {
    const feature = row as GFeature
    let { bound } = feature
    if (bound === undefined) {
      bound = utilInstance.getGeoJsonFeatureBound(feature)
    }
    // 把bound缩小到1/2
    const width = bound.xmax - bound.xmin
    const height = bound.ymax - bound.ymin
    const center = {
      x: (bound.xmin + bound.xmax) / 2,
      y: (bound.ymin + bound.ymax) / 2
    }
    bound = {
      xmin: center.x - width,
      ymin: center.y - height,
      xmax: center.x + width,
      ymax: center.y + height
    }
    this.fitBound = { ...(bound as Record<string, number>) }
  }

  private onRefresh() {
    this.query()
  }

  private onToggleScreen() {
    if (this.fullScreen) {
      this.outFullScreen()
    } else {
      this.inFullScreen()
    }
  }

  private onZoomTo() {
    if (this.selection.length == 0) return

    if (this.mapRender === this.mapboxRender) {
      if (this.$refs.tableMapbox) {
        this.$refs.tableMapbox.zoomTo(this.selectionBound)
      }
    } else {
      if (this.$refs.tableCesium) {
        this.$refs.tableCesium.zoomTo(this.selectionBound)
      }
    }
  }

  private onClearSelection() {
    this.clearSelection()
  }

  private onStatistics() {
    this.showAttrStatistics = true
    this.updateStatisticAndFilterParamas()
  }

  private onFilter() {
    this.showFilter = true
    this.updateStatisticAndFilterParamas()
  }

  private onCloseFilter() {
    this.showFilter = false
  }

  private async onUpdateWhere(val) {
    await this.query(val)
  }

  async onGetGeometry(val: Record<string, any>) {
    const { xmin, ymin, xmax, ymax } = val
    this.geometry = new Zondy.Common.Rectangle(xmin, ymin, xmax, ymax)
    // 分页初始化到第一页
    this.pagination.current = 1
    // 记录当前选中的行（避免双击定位同时根据范围过滤时导致信息刷新）
    await this.query()
  }

  private showPaginationTotal(total, range) {
    return `显示${range[0]}-${range[1]}条，共有 ${total}条`
  }

  private async query(where?: string) {
    this.loading = true
    try {
      this.clearSelection()
      await this.queryGeoJson(
        this.filterWithMap ? this.geometry : undefined,
        where
      )
    } catch (error) {
      const e = error as Error
      this.$message.warning(e.message)
    } finally {
      this.loading = false
      this.calcTableScrollY()
    }
  }

  private async queryGeoJson(
    geometry: Record<string, unknown> | undefined,
    where: string | undefined
  ) {
    this.currentTableParams = { ...this.optionVal }
    const { ip, port, serverName, serverType, serverUrl } = this.optionVal
    if (
      serverType === LayerType.IGSMapImage ||
      serverType === LayerType.IGSVector
    ) {
      const { layerIndex, gdbp } = this.optionVal
      const queryWhere = where || this.optionVal.where
      const queryGeometry = geometry || this.optionVal.geometry
      const { current, pageSize } = this.pagination
      const geojson = (await queryFeaturesInstance.query({
        ip,
        port: port.toString(),
        f: 'geojson',
        where: queryWhere,
        geometry: queryGeometry,
        page: current - 1,
        pageCount: pageSize,
        gdbp,
        docName: serverName,
        layerIdxs: layerIndex,
        coordPrecision: 8
      })) as FeatureGeoJSON

      const { AttStruct, TotalCount } = await this.queryCount(
        queryGeometry,
        queryWhere
      )
      const columns: Array = []
      const {
        FldNumber = 0,
        FldName = [],
        FldAlias = [],
        FldType = []
      } = AttStruct
      // 根据字段数计算useScrollX
      if (FldNumber <= 10) {
        // 10个以内，不需要设固定宽度，且不需要启用水平滚动条
        this.useScrollX = false
      } else {
        // 10个以上，每个设固定宽度180，且启用水平滚动条
        this.useScrollX = true
      }
      for (let index = 0; index < FldNumber; index++) {
        const name = FldName[index]
        const alias = FldAlias[index] ? `${FldAlias[index]}` : ''
        const type = FldType[index]
        const sortable = !['GEOMETRY', 'STRING'].includes(type.toUpperCase())
        const obj = {
          title: alias.length ? alias : name,
          key: name,
          dataIndex: `properties.${name}`,
          align: 'left',
          // 超过宽度将自动省略
          ellipsis: true
        }
        if (this.useScrollX) {
          obj.width = 180
        }
        columns.push(
          sortable
            ? {
                ...obj,
                sorter: (a, b) =>
                  this.sorterFunciton(
                    a.properties[name],
                    b.properties[name],
                    type
                  )
              }
            : obj
        )
      }
      this.tableColumns = columns
      this.pagination.total = TotalCount
      this.tableData = geojson.features
      this.removeMarkers()
      // 如果当前是激活状态，则添加markers
      if (this.isExhibitionActive) {
        this.addMarkers()
      }
    } else if (serverType === LayerType.arcGISMapImage) {
      const { layerIndex, gdbp } = this.optionVal
      const queryWhere = where || this.optionVal.where
      const queryGeometry = geometry || this.optionVal.geometry
      const { current, pageSize } = this.pagination
      const {
        count: totalCount
      } = await queryArcgisInfoInstance.getArcGISQueryTotal({
        f: 'json',
        where: queryWhere,
        geometry: queryGeometry,
        serverUrl,
        layerIndex
      })
      console.log(totalCount)
      const geojson = await queryArcgisInfoInstance.query({
        f: 'json',
        where: queryWhere,
        geometry: queryGeometry,
        page: current - 1,
        pageCount: pageSize,
        serverUrl,
        layerIndex,
        totalCount
      })
      const columns: Array = []
      const { properties } = geojson.features[0]
      const tags = utilInstance.getJsonTag(properties)
      if (tags.length <= 10) {
        // 10个以内，不需要设固定宽度，且不需要启用水平滚动条
        this.useScrollX = false
      } else {
        // 10个以上，每个设固定宽度180，且启用水平滚动条
        this.useScrollX = true
      }
      for (let index = 0; index < tags.length; index++) {
        const name = tags[index]
        const alias = tags[index] ? `${tags[index]}` : ''
        const type = 'string'
        const obj = {
          title: alias.length ? alias : name,
          key: name,
          dataIndex: `properties.${name}`,
          align: 'left',
          ellipsis: true
        }
        if (this.useScrollX) {
          obj.width = 180
        }
        // var str = '37'
        const num = Number(properties[name])
        if (!isNaN(num)) {
          obj.sorter = (a, b) =>
            Number(a.properties[name]) - Number(b.properties[name])
        }
        columns.push(obj)
      }
      this.tableColumns = columns
      this.pagination.total = totalCount
      this.tableData = geojson.features
      this.removeMarkers()
      // 如果当前是激活状态，则添加markers
      if (this.isExhibitionActive) {
        this.addMarkers()
      }
    }
  }

  private async queryCount(geometry?: Record<string, any>, where?: string) {
    const { ip, port, serverName } = this.optionVal
    const { layerIndex, gdbp } = this.optionVal
    const featureSet = (await queryFeaturesInstance.query({
      ip,
      port: port.toString(),
      f: 'json',
      cursorType: 'cursorType',
      IncludeAttribute: false,
      IncludeGeometry: false,
      IncludeWebGraphic: false,
      geometry,
      where,
      gdbp,
      docName: serverName,
      layerIdxs: layerIndex
    })) as FeatureIGS
    return featureSet
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

  // 清除选择集
  private clearSelection() {
    this.selection = []
    this.hightlightSelectionMarkers()
  }

  // 高亮选择集对应的标注图标
  private hightlightSelectionMarkers() {
    this.markers.forEach(marker => {
      if (this.selectedRowKeys.includes(marker.fid)) {
        marker.img = `${this.baseUrl}${baseConfigInstance.config.colorConfig.label.image.selectedImg}`
      } else {
        marker.img = `${this.baseUrl}${baseConfigInstance.config.colorConfig.label.image.defaultImg}`
      }
    })

    // 设置选择项和未选择项的图标
    if (this.selection.length == 0) return
    // 点击之后需要做一些跳转和缩放的动作
    // 以所有选择项的外包来看
    //    如果在当前屏幕范围内，什么都不处理
    //    如果不在屏幕范围内，先看平移过来是否可以看全，如果平移看不全，就需要缩放
    this.selectionBound = this.selection.reduce(
      (prev, cur) => {
        const feature = cur as GFeature
        let { bound } = feature
        if (bound === undefined) {
          bound = utilInstance.getGeoJsonFeatureBound(feature)
        }
        return {
          xmin: bound.xmin < prev.xmin ? bound.xmin : prev.xmin,
          ymin: bound.ymin < prev.ymin ? bound.ymin : prev.ymin,
          xmax: bound.xmax > prev.xmax ? bound.xmax : prev.xmax,
          ymax: bound.ymax > prev.ymax ? bound.ymax : prev.ymax
        }
      },
      {
        xmin: Number.MAX_VALUE,
        ymin: Number.MAX_VALUE,
        xmax: Number.MIN_VALUE,
        ymax: Number.MIN_VALUE
      }
    )
  }

  // 添加标注
  private addMarkers() {
    const tempMarkers: Record<string, any>[] = []
    for (let i = 0; i < this.tableData.length; i += 1) {
      const feature = this.tableData[i]
      const center = utilInstance.getGeoJsonFeatureCenter(feature)
      if (!(Number.isNaN(center[0]) || Number.isNaN(center[1]))) {
        const marker: Record<string, any> = {
          coordinates: center,
          fid: feature.properties[this.rowKey],
          img: `${this.baseUrl}${baseConfigInstance.config.colorConfig.label.image.defaultImg}`,
          id: UUID.uuid(),
          properties: feature.properties,
          feature: feature
        }
        tempMarkers.push(marker)
      }
    }
    this.markers = [...tempMarkers]
  }

  // 移除标注
  private removeMarkers() {
    this.markers = []
  }

  // 计算表格内容高度
  private calcTableScrollY() {
    const tableElement = document.getElementById(this.tableId)
    const boundingClientRect = tableElement.getBoundingClientRect()

    // 30 is table header height,35 is bleow pagination height
    this.scrollY = document.body.clientHeight - boundingClientRect.top - 30 - 35
  }

  private updateStatisticAndFilterParamas() {
    const { serverType, gdbp, serverUrl } = this.optionVal
    if (
      serverType === LayerType.IGSMapImage ||
      serverType === LayerType.IGSVector
    ) {
      this.statisticAndFilterParamas = {
        ip: this.optionVal.ip.toString(),
        port: this.optionVal.port.toString(),
        serverName: this.optionVal.serverName,
        layerIndex: this.currentTableParams.layerIndex,
        serverType,
        gdbp
      }
    } else if (serverType === LayerType.arcGISMapImage) {
      this.statisticAndFilterParamas = {
        serverName: this.optionVal.serverName,
        layerIndex: this.currentTableParams.layerIndex,
        serverType,
        serverUrl
      }
    }
  }

  private addListener() {
    document.addEventListener('fullscreenchange', this.fullScreenListener)
    document.addEventListener('webkitfullscreenchange', this.fullScreenListener)
    document.addEventListener('mozfullscreenchange', this.fullScreenListener)
    document.addEventListener('msfullscreenchange', this.fullScreenListener)
  }

  private removeListener() {
    document.removeEventListener('fullscreenchange', this.fullScreenListener)
    document.removeEventListener(
      'webkitfullscreenchange',
      this.fullScreenListener
    )
    document.removeEventListener('mozfullscreenchange', this.fullScreenListener)
    document.removeEventListener('msfullscreenchange', this.fullScreenListener)
  }

  private fullScreenListener(e) {
    if (e.target.id === this.id) {
      this.fullScreen = !this.fullScreen
    }
  }

  private inFullScreen() {
    const el = this.$refs.attributeTable
    el.classList.add('beauty-scroll')
    if (el.requestFullscreen) {
      el.requestFullscreen()
      return true
    } else if (el.webkitRequestFullScreen) {
      el.webkitRequestFullScreen()
      return true
    } else if (el.mozRequestFullScreen) {
      el.mozRequestFullScreen()
      return true
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen()
      return true
    }
    this.$message.warn('对不起，您的浏览器不支持全屏模式')
    el.classList.remove('beauty-scroll')
    return false
  }

  private outFullScreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    }
    this.$refs.attributeTable.classList.remove('beauty-scroll')
  }
}
</script>

<style lang="less">
.mp-attribute-table {
  .ant-table-tbody > tr > td,
  .ant-table-thead > tr > th {
    padding: 4px 4px !important;
  }
  // .ant-table-body {
  //   overflow: auto !important;
  // }
  // .ant-table-header {
  //   overflow: hidden !important;
  //   margin-bottom: 0px !important;
  // }
  .ant-table-fixed-left {
    overflow: unset !important;
    .ant-table-body-inner {
      overflow: hidden !important;
    }
  }
}
</style>

<style lang="less" scoped>
.mp-attribute-table {
  height: 100%;
  background-color: @base-bg-color;
  .header-bar {
    padding: 4px 10px 4px 17px;
    display: flex;
    align-items: center;
    transition: all 0.3s;
    .left-bar {
      flex: 1;
      display: flex;
      .title {
        transition: all 0.3s;
        font-size: 14px;
        line-height: 14px;
        color: @title-color;
        min-width: 64px;
      }
    }
    .actions {
      display: flex;
      align-items: center;
      text-align: right;
      font-size: 14px;
      color: @text-color;
      .action {
        margin: 0 8px;
        cursor: pointer;
        &:hover {
          color: @primary-color;
        }
      }
    }
  }
}
</style>
