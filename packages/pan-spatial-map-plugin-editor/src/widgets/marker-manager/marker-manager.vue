<template>
  <div class="mp-widget-marker-manager">
    <mp-toolbar>
      <mp-toolbar-command-group>
        <mp-toolbar-command
          v-for="item in interactiveMarkModes"
          :key="item.title"
          :title="item.title"
          :icon="item.icon"
          @click="onInteractiveMark(item.mode)"
        />
        <a-divider type="vertical" />
        <mp-toolbar-command
          v-for="item in keyboardMarkModes"
          :key="item.title"
          :title="item.title"
          :icon="item.icon"
          @click="item.click"
        />
        <a-divider type="vertical" />
        <mp-toolbar-command
          v-for="item in markerManagerModes"
          :key="item.title"
          :title="item.title"
          :icon="item.icon"
          @click="item.click"
        />
      </mp-toolbar-command-group>
    </mp-toolbar>
    <a-table
      class="marker-table"
      :class="isFullScreen === true ? '' : 'fixed-table'"
      :row-selection="{
        selectedRowKeys: selectedRowKeys,
        onChange: onSelectChange
      }"
      :columns="columns"
      :data-source="markers"
      :pagination="pagination"
      :rowKey="
        (record, index) => {
          return record.id
        }
      "
      @change="onPageChange"
      :customRow="
        record => ({
          on: {
            click: () => onMarkerClick(record)
          }
        })
      "
      bordered
      size="small"
    >
    </a-table>
    <div class="marker-add">
      <MapboxMarkerAdd
        v-show="is2DMapMode"
        ref="mapboxMarkerAdd"
        @addMarker="onAddMarker"
      ></MapboxMarkerAdd>
      <CesiumMarkerAdd
        v-show="!is2DMapMode"
        ref="cesiumMarkerAdd"
        @addMarker="onAddMarker"
      ></CesiumMarkerAdd>
    </div>
    <div class="marker-show">
      <MapboxMarkerShow
        v-show="is2DMapMode"
        :markers="markersCurrentPage"
      ></MapboxMarkerShow>
      <CesiumMarkerShow
        v-show="!is2DMapMode"
        :markers="markersCurrentPage"
      ></CesiumMarkerShow>
    </div>
    <a-modal
      v-model="KeyboardModalVisible"
      title="输入坐标"
      :width="360"
      :footer="null"
    >
      <marker-input
        @addMarker="onAddMarker"
        @closeModal="KeyboardModalVisible = false"
      />
    </a-modal>
    <a-modal
      v-model="importModalVisible"
      title="导入文件"
      :width="360"
      :footer="null"
    >
      <marker-import
        @addMarkers="onAddMarkers"
        @closeModal="importModalVisible = false"
      />
    </a-modal>
    <a-modal
      v-model="exportModalVisible"
      title="导出标注"
      :width="360"
      :footer="null"
    >
      <marker-export
        :markers="markers"
        @closeModal="exportModalVisible = false"
      />
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Inject, Watch } from 'vue-property-decorator'
import { WidgetMixin, UUID } from '@mapgis/web-app-framework'
import {
  eventBus,
  api,
  baseConfigInstance
} from '@mapgis/pan-spatial-map-store'

import MapboxMarkerAdd from './components/MarkerAdd/MapboxMarkerAdd'
import CesiumMarkerAdd from './components/MarkerAdd/CesiumMarkerAdd'
import MapboxMarkerShow from './components/MarkerShow/MapboxMarkerShow.vue'
import CesiumMarkerShow from './components/MarkerShow/CesiumMarkerShow.vue'
import MarkerInput from './components/MarkerInput/MarkerInput.vue'
import MarkerImport from './components/MarkerImport/MarkerImport.vue'
import MarkerExport from './components/MarkerExport/MarkerExport.vue'

@Component({
  name: 'MpMarkerManager',
  components: {
    MarkerInput,
    MarkerImport,
    MarkerExport,
    MapboxMarkerAdd,
    CesiumMarkerAdd,
    MapboxMarkerShow,
    CesiumMarkerShow
  }
})
export default class MpMarkerManager extends Mixins(WidgetMixin) {
  // 鼠标交互模块
  private interactiveMarkModes = [
    {
      mode: 'point',
      title: '点',
      icon: 'environment'
    },
    {
      mode: 'line',
      title: '线',
      icon:
        '<svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="128" height="128"><defs><style/></defs><path d="M883.2 238.933c-53.333 0-98.133 44.8-98.133 98.134 0 19.2 6.4 36.266 14.933 51.2L680.533 507.733c-14.933-10.666-32-14.933-51.2-14.933-27.733 0-53.333 12.8-70.4 29.867l-87.466-51.2v-8.534c0-53.333-44.8-98.133-98.134-98.133s-96 44.8-96 98.133c0 14.934 4.267 27.734 8.534 40.534L192 608c-14.933-8.533-29.867-12.8-46.933-12.8-53.334 0-98.134 44.8-98.134 98.133s44.8 96 98.134 96 98.133-44.8 98.133-98.133c0-21.333-6.4-40.533-19.2-57.6l87.467-96c17.066 14.933 38.4 23.467 61.866 23.467 36.267 0 66.134-19.2 83.2-49.067l78.934 46.933c-4.267 10.667-6.4 19.2-6.4 29.867 0 53.333 44.8 98.133 98.133 98.133s98.133-44.8 98.133-98.133c0-19.2-6.4-36.267-14.933-51.2l119.467-119.467c14.933 10.667 32 14.934 51.2 14.934 53.333 0 98.133-44.8 98.133-98.134s-42.667-96-96-96z"/></svg>'
    },
    {
      mode: 'polygon',
      title: '区',
      icon:
        '<svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="128" height="128"><defs><style/></defs><path d="M429.15 14.897c-45.775 0-82.85 37.076-82.85 82.85v2.61L136.562 232.38a83.223 83.223 0 0 0-38.815-10.357c-45.775 0-82.85 37.076-82.85 82.85 0 30.573 16.652 56.795 41.425 71.21v478.918c-24.773 14.416-41.426 40.597-41.426 71.21 0 45.775 37.076 82.85 82.85 82.85 30.573 0 56.795-16.653 71.21-41.425H689.3c14.416 24.772 40.597 41.425 71.21 41.425 45.775 0 82.85-37.075 82.85-82.85 0-16.487-4.556-32.353-12.966-45.32l101.036-203.19a83.058 83.058 0 0 0 10.357-164.417l-78.957-236.87c13.09-14.747 21.997-33.222 21.997-54.39 0-45.775-37.076-82.851-82.85-82.851-21.21 0-39.644 8.906-54.392 21.997L510.757 80.93a83.348 83.348 0 0 0-81.607-66.033zm54.39 144.989l236.87 77.672c6.338 33.347 32.726 59.694 66.032 66.032L865.4 539.175a82.436 82.436 0 0 0-21.997 55.675c0 17.15 5.344 33.348 14.25 46.604l-102.28 201.948a82.353 82.353 0 0 0-66.032 41.425H169a82.063 82.063 0 0 0-29.826-29.785V376.125c24.772-14.416 41.425-40.596 41.425-71.21v-2.61l209.736-132.022c11.6 6.131 24.731 10.357 38.816 10.357 20.878 0 39.768-7.913 54.39-20.713z"/></svg>'
    }
  ]

  // 键盘导入模块
  private keyboardMarkModes = [
    {
      title: '键盘',
      icon:
        '<svg class="icon" viewBox="0 0 1152 1024" xmlns="http://www.w3.org/2000/svg" width="144" height="128"><defs><style/></defs><path d="M1056 128H96c-53.02 0-96 42.98-96 96v576c0 53.02 42.98 96 96 96h960c53.02 0 96-42.98 96-96V224c0-53.02-42.98-96-96-96zm16 672c0 8.822-7.178 16-16 16H96c-8.822 0-16-7.178-16-16V224c0-8.822 7.178-16 16-16h960c8.822 0 16 7.178 16 16v576zM340 540v-56c0-13.254-10.746-24-24-24h-56c-13.254 0-24 10.746-24 24v56c0 13.254 10.746 24 24 24h56c13.254 0 24-10.746 24-24zm192 0v-56c0-13.254-10.746-24-24-24h-56c-13.254 0-24 10.746-24 24v56c0 13.254 10.746 24 24 24h56c13.254 0 24-10.746 24-24zm192 0v-56c0-13.254-10.746-24-24-24h-56c-13.254 0-24 10.746-24 24v56c0 13.254 10.746 24 24 24h56c13.254 0 24-10.746 24-24zm192 0v-56c0-13.254-10.746-24-24-24h-56c-13.254 0-24 10.746-24 24v56c0 13.254 10.746 24 24 24h56c13.254 0 24-10.746 24-24zM244 704v-56c0-13.254-10.746-24-24-24h-56c-13.254 0-24 10.746-24 24v56c0 13.254 10.746 24 24 24h56c13.254 0 24-10.746 24-24zm768 0v-56c0-13.254-10.746-24-24-24h-56c-13.254 0-24 10.746-24 24v56c0 13.254 10.746 24 24 24h56c13.254 0 24-10.746 24-24zM244 376v-56c0-13.254-10.746-24-24-24h-56c-13.254 0-24 10.746-24 24v56c0 13.254 10.746 24 24 24h56c13.254 0 24-10.746 24-24zm192 0v-56c0-13.254-10.746-24-24-24h-56c-13.254 0-24 10.746-24 24v56c0 13.254 10.746 24 24 24h56c13.254 0 24-10.746 24-24zm192 0v-56c0-13.254-10.746-24-24-24h-56c-13.254 0-24 10.746-24 24v56c0 13.254 10.746 24 24 24h56c13.254 0 24-10.746 24-24zm192 0v-56c0-13.254-10.746-24-24-24h-56c-13.254 0-24 10.746-24 24v56c0 13.254 10.746 24 24 24h56c13.254 0 24-10.746 24-24zm192 0v-56c0-13.254-10.746-24-24-24h-56c-13.254 0-24 10.746-24 24v56c0 13.254 10.746 24 24 24h56c13.254 0 24-10.746 24-24zM816 692v-32c0-13.254-10.746-24-24-24H360c-13.254 0-24 10.746-24 24v32c0 13.254 10.746 24 24 24h432c13.254 0 24-10.746 24-24z"/></svg>',
      click: this.onKeyboardMark
    },
    {
      title: '导入',
      icon: 'import',
      click: this.onImportMarkers
    }
  ]

  // 标注点管理模块
  private markerManagerModes = [
    {
      title: '保存',
      icon: 'save',
      click: this.onSaveMarkers
    },
    {
      title: '导出',
      icon: 'export',
      click: this.onExportMarkers
    },
    {
      title: '删除',
      icon: 'delete',
      click: this.onDeleteMarkers
    }
  ]

  // 表格列的配置描述
  private columns = [
    {
      title: '名称',
      dataIndex: 'title',
      align: 'center',
      ellipsis: true
    },
    {
      title: '描述',
      dataIndex: 'description',
      align: 'center',
      ellipsis: true
    }
  ]

  // 表格数据(标注点构成的数组)
  private markers: any[] = []

  // table当前页显示的标注点
  private markersCurrentPage: any[] = []

  // 表格选中项的 key 数组,需要和 onChange 进行配合
  private selectedRowKeys = []

  // 记录上一次表格选中项的 key 数组
  private preSelectedRowKeys = []

  // 分页器配置
  private pagination = {
    current: 1,
    showSizeChanger: true,
    size: 'small',
    total: this.markers.length,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
    pageSizeOptions: ['5', '10', '15', '20'],
    pageSize: 10
  }

  // 键盘对话框的显隐
  private KeyboardModalVisible = false

  // 导入对话框的显隐
  private importModalVisible = false

  // 导出对话框的显隐
  private exportModalVisible = false

  // 当前微件窗口是否全屏
  private isFullScreen = false

  // 获取当前渲染引擎下的标注添加组件
  get markerAddComponent() {
    return this.is2DMapMode
      ? this.$refs.mapboxMarkerAdd
      : this.$refs.cesiumMarkerAdd
  }

  // 监听渲染器切换事件，切换回二维时，通知三维标注点隐藏信息窗口
  @Watch('mapRender')
  mapRenderChange() {
    if (this.is2DMapMode) {
      eventBus.$emit('emitMapRenderChange')
    }
  }

  // table勾选项变化时，对应标注点图标也会变化
  @Watch('selectedRowKeys')
  onSelectedRowKeysChange() {
    let newSelected = []
    let newUnSelected = []
    if (this.preSelectedRowKeys.length === 0) {
      newSelected = this.selectedRowKeys
    } else if (this.selectedRowKeys.length === 0) {
      newUnSelected = this.preSelectedRowKeys
    } else {
      // 查找新选中的(在之前的选中中没有,在当前的选中中有)
      newSelected = this.selectedRowKeys.reduce((result, item) => {
        if (this.preSelectedRowKeys.includes(item) === false) {
          result.push(item)
        }
        return result
      }, [])

      // 查找新取消选中的(在之前的选中中有,在当前的选中中没有)
      newUnSelected = this.preSelectedRowKeys.reduce((result, item) => {
        if (this.selectedRowKeys.includes(item) === false) {
          result.push(item)
        }
        return result
      }, [])
    }
    // 视点跳转到最后一个新选中的位置
    let markerFlyTo = null

    // 修改新选中的图标为红色
    if (newSelected && newSelected.length > 0) {
      this.markers = this.markers.reduce((result, item) => {
        if (newSelected.includes(item.id)) {
          item.iconImg = `${this.baseUrl}${baseConfigInstance.config.colorConfig.label.image.selectedImg}`
        }
        result.push(item)
        return result
      }, [])
      markerFlyTo = this.markers.find(
        item => item.id === newSelected[newSelected.length - 1]
      )
    }

    // 修改新取消选中的图标为蓝色
    if (newUnSelected && newUnSelected.length > 0) {
      this.markers = this.markers.reduce((result, item) => {
        if (newUnSelected.includes(item.id)) {
          item.iconImg = `${this.baseUrl}${baseConfigInstance.config.colorConfig.label.image.defaultImg}`
        }
        result.push(item)
        return result
      }, [])
    }

    // 将视口移动到指定的marker处
    if (markerFlyTo) {
      if (this.is2DMapMode) {
        this.map.panTo(markerFlyTo.center)
      } else {
        this.webGlobe.flyTo(
          markerFlyTo.center[0],
          markerFlyTo.center[1],
          100000,
          2
        )
      }
    }

    this.preSelectedRowKeys = JSON.parse(JSON.stringify(this.selectedRowKeys))
  }

  onOpen() {
    this.getConfigData()
    // 监听标注点编辑信息改变事件，并更新该标注点
    eventBus.$on('edit-marker-info', markerInfo => {
      const index = this.markers.findIndex(item => item.id === markerInfo.id)
      if (index !== -1) {
        this.$set(this.markers, index, markerInfo)
      }
    })
    this.$message.config({
      top: '100px',
      duration: 2,
      maxCount: 1
    })
  }

  onClose() {
    this.markers = []
    this.selectedRowKeys = []
    eventBus.$off('edit-marker-info')
  }

  // 微件窗口模式切换时回调
  onWindowSize(mode) {
    this.isFullScreen = mode === 'max'
  }

  // 点击不同类型标注图标回调事件
  private onInteractiveMark(mode) {
    this.markerAddComponent && this.markerAddComponent.openMarker(mode)
  }

  // 添加标注
  private onAddMarker(marker: any) {
    this.markers.push(marker)

    this.getMarkersCurrentPage()
  }

  // 通过文件导入添加标注
  private onAddMarkers(markers: any[]) {
    this.markers = this.markers.concat(markers)

    this.getMarkersCurrentPage()
  }

  // table分页变化时回调
  private onPageChange(pagination) {
    this.pagination = { ...pagination }
    const startIndex = (pagination.current - 1) * pagination.pageSize
    const endIndex = pagination.current * pagination.pageSize

    this.markersCurrentPage = this.markers.slice(startIndex, endIndex)
  }

  // Table选中项发生变化时的回调
  private onSelectChange(selectedRowKeys) {
    this.selectedRowKeys = selectedRowKeys
  }

  // 键盘按钮回调事件
  private onKeyboardMark() {
    this.KeyboardModalVisible = true
  }

  // 导入按钮回调事件
  private onImportMarkers() {
    this.importModalVisible = true
  }

  // 导出按钮回调事件
  private onExportMarkers() {
    this.exportModalVisible = true
  }

  // 保存按钮回调事件
  private onSaveMarkers() {
    const this_ = this

    api
      .saveWidgetConfig({
        name: 'marker-manager',
        config: JSON.stringify(this.markers)
      })
      .then(() => {
        this_.$message.success('保存成功')
      })
      .catch(() => {
        this_.$message.error('保存失败')
      })
  }

  // 删除按钮回调事件
  private onDeleteMarkers() {
    if (this.selectedRowKeys.length === 0) {
      this.$message.info('请至少勾选一项进行删除')
      return false
    } else {
      this.markers = this.markers.reduce((result, item) => {
        if (this.selectedRowKeys.includes(item.id) === false) {
          result.push(item)
        }
        return result
      }, [])

      this.getMarkersCurrentPage()
    }
  }

  // 点击标注时
  private onMarkerClick(row) {}

  // 读取保存的配置信息并展示
  private getConfigData() {
    api.getWidgetConfig('marker-manager').then(res => {
      // 下面的操作都是为了兼容老版的三个标注点的数据(因为老版标注点的构造和新版的标注点构造不一样)
      this.markers = res.reduce((result, item) => {
        if (Object.keys(item).includes('ftype')) {
          // 老版标注点包含'ftype'属性
          let coordinates = []
          switch (item.fileType) {
            case 'Polygon':
              coordinates = [item.coordinates]
              break
            case 'LineString':
              coordinates = item.coordinates
              break
            default:
              coordinates = item.point
              break
          }
          const geoJsonFeature = {
            geometry: {
              coordinates: coordinates,
              type: item.fileType || 'Point'
            },
            id: UUID.uuid(),
            properties: {},
            type: 'Feature'
          }
          const marker = {
            id: UUID.uuid(),
            title: item.name,
            description: item.info,
            iconImg: `${this.baseUrl}${baseConfigInstance.config.colorConfig.label.image.defaultImg}`,
            edit: true,
            features: [geoJsonFeature],
            coordinates: coordinates,
            center: item.point,
            type: item.fileType || 'Point'
          }
          result.push(marker)
        } else {
          // 新版标注点不包含'ftype'属性
          result.push(item)
        }
        return result
      }, [])

      // 默认每一页显示10条数据，所以初始显示的marker取table的前10项
      this.showMarkers = this.tableData.slice(0, this.pagination.pageSize)
    })
  }

  // 判断添加后的标注点当前处于table中的哪一页
  private getMarkersCurrentPage() {
    let currentPage

    if (this.markers.length % this.pagination.pageSize === 0) {
      currentPage = this.markers.length / this.pagination.pageSize
      this.pagination.current = currentPage
    } else {
      currentPage = Math.floor(this.markers.length / this.pagination.pageSize)
      this.pagination.current = currentPage + 1
    }

    this.onPageChange(this.pagination)
  }
}
</script>

<style lang="less" scoped>
.mp-widget-marker-manager {
  .marker-table {
    padding-top: 12px;
  }
  .fixed-table {
    width: 350px;
  }
}
</style>
