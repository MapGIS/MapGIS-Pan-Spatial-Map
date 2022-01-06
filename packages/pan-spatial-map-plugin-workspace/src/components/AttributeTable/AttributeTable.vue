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
      <a-dropdown class="download-dropdown">
        <a-menu slot="overlay" @click="handleMenuClick">
          <a-menu-item key="jsonData"> 导出json文件 </a-menu-item>
          <a-menu-item key="csvData"> 导出csv文件 </a-menu-item>
        </a-menu>
        <a-button
          class="download-button"
          style="
            margin: 0 13px;
            border: 1px solid transparent;
            height: 25px !important;
            padding: 2px 0 0;
          "
        >
          <a-icon type="download" />
        </a-button>
      </a-dropdown>
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
      style="text-align: right; padding: 5px 10px 5px 0"
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
    >
      <template slot="popup" slot-scope="{ properties, position }">
        <mp-popup-attribute
          :properties="properties"
          :dataStoreIp="dataStoreIp"
          :dataStorePort="dataStorePort"
          :getVideoStatus="getVideoStatus"
          @project-screen="file => projectScreen(file, position)"
        />
      </template>
    </mp-3d-marker-plotting>
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
            <mp-attribute-statistics
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
              @finish="onUpdateWhere"
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
  baseConfigInstance,
  markerIconInstance,
  events,
  DataFlowList,
  ActiveResultSet
} from '@mapgis/pan-spatial-map-common'
import {
  DomUtil,
  AppMixin,
  ExhibitionMixin,
  LayerType,
  UUID,
  MapMixin,
  Rectangle3D,
  Feature,
  Objects,
  Exhibition
} from '@mapgis/web-app-framework'
import * as Zondy from '@mapgis/webclient-es6-service'
import MpAttributeTableColumnSetting from './AttributeTableColumnSetting.vue'
import axios from 'axios'
/* 文件导出 */
import FileSaver from 'file-saver'
import AttributeUtil from './mixin/AttributeUtil'

const { GFeature, FeatureQuery, ArcGISFeatureQuery } = Feature

const { IAttributeTableOption, IAttributeTableExhibition } = Exhibition

@Component({
  name: 'MpAttributeTable',
  components: {
    MpAttributeTableColumnSetting
  }
})
export default class MpAttributeTable extends Mixins(AttributeUtil) {
  // 属性表选项
  @Prop({ type: Object }) exhibition!: IAttributeTableExhibition

  // 属性表选项
  @Prop({ type: Object }) option!: IAttributeTableOption

  private get selectedRowKeys() {
    return this.selection.map(
      item => (item as GFeature).properties[this.rowKey]
    )
  }

  private get dataStoreIp() {
    return baseConfigInstance.config.DataStoreIp
  }

  private get dataStorePort() {
    return baseConfigInstance.config.DataStorePort
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

  private get dataFlowList() {
    return DataFlowList
  }

  private get getDataFLowList() {
    const { serverType } = this.optionVal
    if (serverType === LayerType.DataFlow) {
      const features = this.dataFlowList.getDataFlowById(this.optionVal.id)
      return features || []
    }
    return []
  }

  @Watch('getDataFLowList', { deep: true })
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
    //   this.vueCesium,
    //   this.viewer
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
    /**
     * 当缩放的范围为点时，跳转过去，会导致标注点消失，
     * 这个给点一个矩形范围
     * @修改人 龚瑞强
     * @date 2021/12/28
     */
    bound = {
      xmin: center.x - (width || 0.1),
      ymin: center.y - (height || 0.1),
      xmax: center.x + (width || 0.1),
      ymax: center.y + (height || 0.1)
    }
    this.fitBound = { ...(bound as Record<string, number>) }
  }

  private onRefresh() {
    this.query()
  }

  /* 属性表导出选择器 */
  private async handleMenuClick(type) {
    await this.jsonFile(type.key)
  }

  /* 结果集属性列表导出为json数据 */
  private async jsonFile(type) {
    const val = '1'
    const where = ''
    const datetime = Date.now()
    const jsonData = {}
    await this.queryGeoJSON(
      this.filterWithMap ? this.geometry : undefined,
      where,
      val
    )
    // const tableColumns = JSON.parse(JSON.stringify(this.tableColumns))
    const attrTableToJsonData = JSON.parse(
      JSON.stringify(this.attrTableToJsonData)
    )
    const jsonDataList = []
    for (const element of attrTableToJsonData) {
      jsonDataList.push(element.properties)
    }
    /* csv文件下载 */
    if (type === 'csvData') {
      await this.exportCSV(JSON.parse(JSON.stringify(jsonDataList)))
    } else if (type === 'jsonData') {
      jsonData.data = jsonDataList
      const blob = new Blob([JSON.stringify(jsonData)])
      await FileSaver.saveAs(blob, `attrData_${datetime}.json`)
    }
  }

  /* json数据转换成csv文件导出 */
  private async exportCSV(data: any) {
    const parser = new this.Json2csvParser()
    const csvData = parser.parse(data)
    const blob = new Blob([`\uFEFF${csvData}`], {
      type: 'text/plain;charset=utf-8;'
    })
    const datetime = Date.now()
    await FileSaver.saveAs(blob, `attrData_${datetime}.csv`)
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

  private async onUpdateWhere(val) {
    await this.query(val)
    this.showFilter = false
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
      this.vueCesium,
      this.viewer
    )
    try {
      this.clearSelection()
      const attrGeoJson = await this.queryGeoJSON(
        this.filterWithMap ? this.geometry : undefined,
        where
      )
    } catch (error) {
      const e = error as Error
      console.error('属性表请求失败：', e)
      this.$message.warning('请求失败！')
    } finally {
      this.loading = false
      this.calcTableScrollY()
    }
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
          properties: this.setPropertiesAlias(feature.properties),
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

    ActiveResultSet.activeResultSet = {
      type: 'FeatureCollection',
      features: this.tableData,
      id: this.optionVal.id
    }
    console.log(ActiveResultSet.activeResultSet)
  }

  /**
   * 将弹窗的key设置成别名
   * 这里images字段不能用别名，弹窗组件需要通过images字段添加图片
   */
  setPropertiesAlias(properties) {
    const obj = {}
    for (const key in properties) {
      if (Object.prototype.hasOwnProperty.call(properties, key)) {
        const value = properties[key]
        const column = this.tableColumns.find(item => item.key === key)
        if (column && key !== 'images') {
          obj[column.title] = value
        } else {
          obj[key] = value
        }
      }
    }
    return obj
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
        this.viewer,
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
