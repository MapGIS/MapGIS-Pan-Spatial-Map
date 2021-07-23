<template>
  <div ref="attributeTable" :id="id" class="mp-attribute-table">
    <mp-toolbar class="header-bar" size="small" :bordered="false">
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
      <mp-toolbar-command
        title="缩放至已选择"
        icon="environment"
        @click="onZoomTo"
      />
      <mp-toolbar-command
        title="清除选择"
        icon="close-square"
        @click="onClearSelection"
      />
      <mp-toolbar-space />
      <mp-toolbar-command
        title="属性统计"
        icon="bar-chart"
        @click="onStatistics"
      />
      <mp-toolbar-command title="过滤器" icon="filter" @click="onFilter" />
      <a-divider type="vertical" />
      <mp-toolbar-command
        title="刷新"
        :icon="loading ? 'loading' : 'reload'"
        @click="onRefresh"
      />
      <mp-attribute-table-column-setting
        v-if="tableColumns.length"
        :columns="tableColumns"
      />
      <mp-toolbar-command
        title="全屏"
        :icon="fullScreen ? 'fullscreen-exit' : 'fullscreen'"
        @click="onToggleScreen"
      />
    </mp-toolbar>
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
    <mp-marker-plotting
      v-if="is2DMapMode && !isIGSScence"
      ref="refMarkerPlotting"
      :markers="markers"
      :filter-with-map="filterWithMap"
      :fit-bound="fitBound"
      :selection-bound="selectionBound"
      :highlight-style="highlightStyle"
      @map-bound-change="onGetGeometry"
    />
    <mp-3d-marker-plotting
      v-else
      ref="ref3dMarkerPlotting"
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
  markerIconInstance
} from '@mapgis/pan-spatial-map-store'
import {
  DomUtil,
  AppMixin,
  LayerType,
  UUID,
  MapMixin,
  Rectangle3D,
  Feature,
  Objects
} from '@mapgis/web-app-framework'
import * as Zondy from '@mapgis/webclient-es6-service'
import moment from 'moment'
import MpAttributeTableColumnSetting from './AttributeTableColumnSetting.vue'
import MpFilter from '../Filter/Filter.vue'
import MpAttrStatistics from '../AttrStatistics/AttrStatistics.vue'
import axios from 'axios'

const { GFeature, FeatureQuery, ArcGISFeatureQuery } = Feature

@Component({
  name: 'MpAttributeTable',
  components: {
    MpAttributeTableColumnSetting,
    MpAttrStatistics,
    MpFilter
  }
})
export default class MpAttributeTable extends Mixins(
  ExhibitionMixin,
  AppMixin,
  MapMixin
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

  private geometry3D?: Record<string, unknown> = undefined

  // 选中的行
  private selection: unknown[] = []

  selectIcon = ''

  unSelectIcon = ''

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
    } else if (serverType === LayerType.ArcGISMapImage) {
      return 'ID'
    } else if (this.isIGSScence) {
      return 'FID'
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
    return baseConfigInstance.config.colorConfig
  }

  private get markerPlottingComponent() {
    return this.is2DMapMode
      ? this.$refs.refMarkerPlotting
      : this.$refs.ref3dMarkerPlotting
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
    DomUtil.addFullScreenListener(this.fullScreenListener)
    // this.sceneController = Objects.SceneController.getInstance(
    //   this.Cesium,
    //   this.CesiumZondy,
    //   this.webGlobe
    // )
  }

  beforeDestroy() {
    DomUtil.removeFullScreenListener(this.fullScreenListener)
  }

  onResize() {
    this.calcTableScrollY()
  }

  async onActive() {
    await this.addMarkers()
    await this.hightlightSelectionMarkers()
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

  private async onSelectChange(selectedRowKeys, selectedRows) {
    this.selection = selectedRows
    await this.hightlightSelectionMarkers()
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
    let bound = feature.properties.specialLayerBound
    if (bound === undefined) {
      bound = Feature.getGeoJSONFeatureBound(feature)
    }
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

    this.markerPlottingComponent &&
      this.markerPlottingComponent.zoomTo(this.selectionBound)
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
    const { xmin, ymin, xmax, ymax, height = 0 } = val
    this.geometry = new Zondy.Common.Rectangle(xmin, ymin, xmax, ymax)

    this.geometry3D = {
      xmin,
      ymin,
      zmin: -100000,
      xmax,
      ymax,
      zmax: 100000
    }
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
    this.sceneController = Objects.SceneController.getInstance(
      this.Cesium,
      this.CesiumZondy,
      this.webGlobe
    )
    try {
      this.clearSelection()
      await this.queryGeoJSON(
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

  private async queryGeoJSON(
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
      const geojson = await FeatureQuery.query({
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
      })

      const { AttStruct, TotalCount } = await this.queryCount(
        queryGeometry,
        queryWhere
      )
      if (!(this.tableColumns && this.tableColumns.length > 0)) {
        const columns = this.setTableScroll(AttStruct)
        this.tableColumns = columns
      }
      this.pagination.total = TotalCount
      this.tableData = geojson.features
      this.removeMarkers()
      // 如果当前是激活状态，则添加markers
      if (this.isExhibitionActive) {
        await this.addMarkers()
      }
    } else if (serverType === LayerType.ArcGISMapImage) {
      const { layerIndex, gdbp } = this.optionVal
      const queryWhere = where || this.optionVal.where
      const queryGeometry = geometry || this.optionVal.geometry
      const { current, pageSize } = this.pagination
      const { count: totalCount } = await ArcGISFeatureQuery.getTotal({
        f: 'json',
        where: queryWhere,
        geometry: queryGeometry,
        serverUrl,
        layerIndex
      })
      const geojson = await ArcGISFeatureQuery.query({
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
      const tags = Object.keys(properties)
      if (tags.length <= 10) {
        // 10个以内，不需要设固定宽度，且不需要启用水平滚动条
        this.useScrollX = false
      } else {
        // 10个以上，每个设固定宽度180，且启用水平滚动条
        this.useScrollX = true
      }
      if (!(this.tableColumns && this.tableColumns.length > 0)) {
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
      }
      this.pagination.total = totalCount
      this.tableData = geojson.features
      this.removeMarkers()
      // 如果当前是激活状态，则添加markers
      if (this.isExhibitionActive) {
        await this.addMarkers()
      }
    } else if (serverType === LayerType.IGSScene) {
      // 查找矩阵集
      const { source } = this.sceneController.findSource(this.optionVal.id)
      const { gdbp } = this.optionVal
      const queryWhere = where || this.optionVal.where
      const queryGeometry = geometry
        ? this.getGeometry3D(source)
        : this.optionVal.geometry
      const { current, pageSize } = this.pagination

      const json = await FeatureQuery.query(
        {
          ip,
          port: port.toString(),
          where: queryWhere,
          geometry: queryGeometry,
          page: current - 1,
          pageCount: pageSize,
          gdbp,
          coordPrecision: 8,
          rtnLabel: false
        },
        false,
        serverType === LayerType.IGSScene
      )
      const { AttStruct, SFEleArray = [], TotalCount } = json
      const { FldNumber = 0, FldName = [] } = AttStruct
      if (!(this.tableColumns && this.tableColumns.length > 0)) {
        const columns = this.setTableScroll(AttStruct)
        this.tableColumns = columns
      }
      this.pagination.total = TotalCount
      this.tableData = (SFEleArray || []).map(
        ({ AttValue = [], bound = {}, FID }) => {
          let boundObj = null
          if (source.length > 0) {
            const tranform = source[0].root.transform
            boundObj = this.sceneController.localExtentToGlobelExtent(
              bound,
              tranform
            )
          }
          const properties = {
            FID,
            specialLayerId: this.optionVal.id,
            specialLayerBound: boundObj
          }
          for (let index = 0; index < FldNumber; index++) {
            const name = FldName[index]
            const value = AttValue[index]
            properties[name] = value
          }
          return {
            geometry: {
              coordinates: [],
              type: '3DPolygon'
            },
            properties
          }
        }
      )
      this.removeMarkers()
      // 如果当前是激活状态，则添加markers
      if (this.isExhibitionActive) {
        await this.addMarkers()
      }
    }
  }

  private getGeometry3D(source) {
    if (source.length > 0) {
      const transform = source[0].root.transform
      const { xmin, ymin, xmax, ymax, zmin, zmax } = this.geometry3D
      const minPosition = this.sceneController.globelPositionToLocalPosition(
        { x: xmin, y: ymin, z: zmin },
        transform
      )
      const maxPosition = this.sceneController.globelPositionToLocalPosition(
        { x: xmax, y: ymax, z: zmax },
        transform
      )
      return new Rectangle3D(
        minPosition.x,
        minPosition.y,
        zmin,
        maxPosition.x,
        maxPosition.y,
        zmax
      )
    }

    return undefined
  }

  private setTableScroll(AttStruct) {
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

    return columns
  }

  private async queryCount(geometry?: Record<string, any>, where?: string) {
    const { ip, port, serverName } = this.optionVal
    const { layerIndex, gdbp } = this.optionVal
    const featureSet = await FeatureQuery.query({
      ip,
      port: port.toString(),
      f: 'json',
      IncludeAttribute: false,
      IncludeGeometry: false,
      IncludeWebGraphic: false,
      geometry,
      where,
      gdbp,
      docName: serverName,
      layerIdxs: layerIndex
    })
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
  private async clearSelection() {
    this.selection = []
    await this.hightlightSelectionMarkers()
  }

  // 高亮选择集对应的标注图标
  private async hightlightSelectionMarkers() {
    const selectIcon = await markerIconInstance.selectIcon()
    const unSelectIcon = await markerIconInstance.unSelectIcon()
    this.markers.forEach(marker => {
      if (this.selectedRowKeys.includes(marker.fid)) {
        marker.img = selectIcon
      } else {
        marker.img = unSelectIcon
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
        let bound = feature.properties.specialLayerBound
        if (bound === undefined) {
          bound = Feature.getGeoJSONFeatureBound(feature)
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

  private get isIGSScence() {
    const { serverType } = this.optionVal
    return serverType === LayerType.IGSScene
  }

  // 添加标注
  private async addMarkers() {
    const { serverType } = this.optionVal

    const unSelectIcon = await markerIconInstance.unSelectIcon()
    const tempMarkers: Record<string, any>[] = []
    for (let i = 0; i < this.tableData.length; i += 1) {
      const feature = this.tableData[i]
      let center = []
      if (this.isIGSScence) {
        const { xmin, xmax, ymin, ymax } = feature.properties.specialLayerBound
        const longitude = (xmin + xmax) / 2
        const latitude = (ymin + ymax) / 2
        // const height = await this.getModelHeight(longitude, latitude)
        center = [longitude, latitude]
      } else {
        center = Feature.getGeoJSONFeatureCenter(feature)
      }
      if (!(Number.isNaN(center[0]) || Number.isNaN(center[1]))) {
        const marker: Record<string, any> = {
          markerId: UUID.uuid(),
          coordinates: center,
          fid: feature.properties[this.rowKey],
          img: unSelectIcon,
          properties: feature.properties,
          feature: feature
        }
        tempMarkers.push(marker)
      }
    }
    if (this.isIGSScence && tempMarkers.length > 0) {
      const arr = await this.getModelHeight(tempMarkers)
      if (arr.length === tempMarkers.length) {
        arr.forEach((item, index) => {
          const { longitude, latitude, height } = item
          tempMarkers[index].coordinates = [longitude, latitude, height]
        })
      }
    }
    this.markers = [...tempMarkers]
  }

  getModelHeight(tempMarkers: Array<unknown>) {
    return new Promise((resolve, reject) => {
      const positions = tempMarkers.map(item => {
        return new this.Cesium.Cartesian3.fromDegrees(
          item.coordinates[0],
          item.coordinates[1]
        )
      })
      const sampleElevationTool = new this.Cesium.SampleElevationTool(
        this.webGlobe.viewer,
        positions,
        'model',
        elevationPosition => {
          if (elevationPosition && elevationPosition.length > 0) {
            resolve(elevationPosition)
          } else {
            resolve([])
          }
        }
      )
      sampleElevationTool.start()
    })
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
      serverType === LayerType.IGSVector ||
      serverType === LayerType.IGSScene
    ) {
      this.statisticAndFilterParamas = {
        ip: this.optionVal.ip.toString(),
        port: this.optionVal.port.toString(),
        serverName: this.optionVal.serverName,
        layerIndex: this.currentTableParams.layerIndex,
        serverType,
        gdbp
      }
    } else if (serverType === LayerType.ArcGISMapImage) {
      this.statisticAndFilterParamas = {
        serverName: this.optionVal.serverName,
        layerIndex: this.currentTableParams.layerIndex,
        serverType,
        serverUrl
      }
    }
  }

  private fullScreenListener(e) {
    if (e.target.id === this.id) {
      this.fullScreen = !this.fullScreen
    }
  }

  private inFullScreen() {
    const el = this.$refs.attributeTable
    el.classList.add('beauty-scroll')
    if (!DomUtil.inFullScreen(el)) {
      this.$message.warn('对不起，您的浏览器不支持全屏模式')
      el.classList.remove('beauty-scroll')
    }
  }

  private outFullScreen() {
    DomUtil.outFullScreen()
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
    padding: 0 10px 0 17px;
    .columns {
      margin: 0 8px;
      cursor: pointer;
    }
  }
}
</style>
