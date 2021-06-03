<template>
  <div class="mp-widget-marker-manager">
    <div class="btn-tooltip">
      <div class="marker-input">
        <div class="marker-mouse">
          <div>
            <a-tooltip
              class="mouse-item"
              v-for="item in markMouseModes"
              :key="item.title"
              placement="bottom"
            >
              <template slot="title">{{ item.title }}</template>
              <a-button
                type="circle"
                :icon="item.icon"
                @click="startMark(item.mode)"
              ></a-button>
            </a-tooltip>
          </div>
          <span>鼠标交互</span>
        </div>
        <a-divider type="vertical" />
        <div class="marker-keyboard">
          <div
            class="keyboard-btns"
            v-for="item in markKeyboardModes"
            :key="item.title"
          >
            <a-button
              type="circle"
              :icon="item.icon"
              @click="item.click"
            ></a-button>
            <span>{{ item.title }}</span>
          </div>
        </div>
        <a-divider type="vertical" />
      </div>
      <div class="marker-manager">
        <div
          class="manager-item"
          v-for="item in markManagerModes"
          :key="item.title"
        >
          <a-button
            type="circle"
            :icon="item.icon"
            @click="item.click"
          ></a-button>
          <span>{{ item.title }}</span>
        </div>
      </div>
    </div>
    <a-table
      :class="isFullScreen === true ? '' : 'fixed-table'"
      :row-selection="{
        selectedRowKeys: selectedRowKeys,
        onChange: onSelectChange
      }"
      :columns="columns"
      :data-source="tableData"
      :pagination="pagination"
      :rowKey="
        (record, index) => {
          return record.id
        }
      "
    >
    </a-table>
    <div class="marker-add">
      <MapboxMarkerAdd
        v-show="is2DMapMode"
        ref="mapboxMarkerAdd"
        @addMarker="addMarker"
      ></MapboxMarkerAdd>
      <CesiumMarkerAdd
        v-show="!is2DMapMode"
        ref="cesiumMarkerAdd"
        @addMarker="addMarker"
      ></CesiumMarkerAdd>
    </div>

    <div class="marker-show">
      <MapboxMarkerShow
        v-show="is2DMapMode"
        :markers="tableData"
      ></MapboxMarkerShow>
      <CesiumMarkerShow
        v-show="!is2DMapMode"
        :markers="tableData"
      ></CesiumMarkerShow>
    </div>
    <a-modal v-model="modalInput" title="输入坐标" :width="360" :footer="null">
      <marker-input @addMarker="addMarker" @closeModal="modalInput = false" />
    </a-modal>
    <a-modal v-model="modalImport" title="导入文件" :width="360" :footer="null">
      <marker-import
        @addMarkers="addMarkers"
        @closeModal="modalImport = false"
      />
    </a-modal>
    <a-modal v-model="modalExport" title="导出标注" :width="360" :footer="null">
      <marker-export :markers="tableData" @closeModal="modalExport = false" />
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
  private markMouseModes = [
    { mode: 'point', title: '点', icon: 'environment' },
    {
      mode: 'line',
      title: '线',
      icon: 'pull-request'
    },
    {
      mode: 'polygon',
      title: '区',
      icon: 'area-chart'
    }
  ]

  // 键盘导入模块
  private markKeyboardModes = [
    {
      title: '键盘',
      icon: 'table',
      click: this.addMarkerByInputCoord
    },
    {
      title: '导入',
      icon: 'import',
      click: this.addMarkerByImportFile
    }
  ]

  // 标注点管理模块
  private markManagerModes = [
    {
      title: '保存',
      icon: 'save',
      click: this.saveMarkers
    },
    {
      title: '导出',
      icon: 'export',
      click: this.exportMarkers
    },
    {
      title: '删除',
      icon: 'delete',
      click: this.deleteMarkers
    }
  ]

  // 表格列的配置描述
  private columns = [
    {
      title: '名称',
      dataIndex: 'title',
      align: 'center',
      sorter: true,
      ellipsis: true
    },
    {
      title: '描述',
      dataIndex: 'description',
      align: 'center',
      sorter: true,
      ellipsis: true
    }
  ]

  // 表格数据(标注点构成的数组)
  private tableData: any[] = []

  // 表格选中项的 key 数组,需要和 onChange 进行配合
  private selectedRowKeys = []

  // 记录上一次表格选中项的 key 数组
  private preSelectedRowKeys = []

  // 分页器配置
  private pagination = {
    showSizeChanger: true,
    size: 'small',
    total: this.tableData.length,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`
  }

  // 键盘对话框的显隐
  private modalInput = false

  // 导入对话框的显隐
  private modalImport = false

  // 导出对话框的显隐
  private modalExport = false

  // 表格数据(标注点构成的数组)
  private markers: any[] = []

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
      this.tableData = this.tableData.reduce((result, item) => {
        if (newSelected.includes(item.id)) {
          item.iconImg = `${this.baseUrl}${baseConfigInstance.config.colorConfig.label.image.selectedImg}`
        }
        result.push(item)
        return result
      }, [])
      markerFlyTo = this.tableData.find(
        item => item.id === newSelected[newSelected.length - 1]
      )
    }

    // 修改新取消选中的图标为蓝色
    if (newUnSelected && newUnSelected.length > 0) {
      this.tableData = this.tableData.reduce((result, item) => {
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
      const index = this.tableData.findIndex(item => item.id === markerInfo.id)
      if (index !== -1) {
        this.$set(this.tableData, index, markerInfo)
      }
    })
    this.$message.config({
      top: '100px',
      duration: 2,
      maxCount: 1
    })
  }

  onClose() {
    this.tableData = []
    this.selectedRowKeys = []
    eventBus.$off('edit-marker-info')
  }

  // 微件窗口模式切换时回调
  onWindowSize(mode) {
    this.isFullScreen = mode === 'max'
  }

  // 点击不同类型标注图标回调事件
  private startMark(mode) {
    this.markerAddComponent && this.markerAddComponent.openMarker(mode)
  }

  // 添加标注
  private addMarker(marker: any) {
    this.tableData.push(marker)
  }

  // 通过文件导入添加标注
  private addMarkers(markers: any[]) {
    this.tableData.push(markers[0])
  }

  // Table选中项发生变化时的回调
  private onSelectChange(selectedRowKeys) {
    this.selectedRowKeys = selectedRowKeys
  }

  // 键盘按钮回调事件
  private addMarkerByInputCoord() {
    this.modalInput = true
  }

  // 导入按钮回调事件
  private addMarkerByImportFile() {
    this.modalImport = true
  }

  // 导出按钮回调事件
  private exportMarkers() {
    this.modalExport = true
  }

  // 保存按钮回调事件
  private saveMarkers() {
    const this_ = this
    api
      .saveWidgetConfig({
        name: 'marker-manager',
        config: JSON.stringify(this.tableData)
      })
      .then(() => {
        this_.$message.success('保存成功')
      })
      .catch(() => {
        this_.$message.error('保存失败')
      })
  }

  // 删除按钮回调事件
  private deleteMarkers() {
    if (this.selectedRowKeys.length === 0) {
      this.$message.info('请至少勾选一项进行删除')
      return false
    } else {
      this.tableData = this.tableData.reduce((result, item) => {
        if (this.selectedRowKeys.includes(item.id) === false) {
          result.push(item)
        }
        return result
      }, [])
    }
  }

  // 读取保存的配置信息并展示
  private getConfigData() {
    api.getWidgetConfig('marker-manager').then(res => {
      // 下面的操作都是为了兼容老版的三个标注点的数据(因为老版标注点的构造和新版的标注点构造不一样)
      this.tableData = res.reduce((result, item) => {
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
    })
  }
}
</script>

<style lang="less" scoped>
.btn-tooltip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.marker-input,
.marker-manager,
.marker-keyboard {
  display: flex;
  align-items: center;
}

.marker-mouse {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.manager-item,
.keyboard-btns {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.mouse-item,
.keyboard-btns,
.manager-item {
  margin-right: 4px;
}

.fixed-table {
  width: 322px;
}
</style>
