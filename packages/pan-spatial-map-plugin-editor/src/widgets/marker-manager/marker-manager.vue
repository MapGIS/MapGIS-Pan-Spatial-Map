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
          <div class="keyboard-btns">
            <a-button
              class="keyboard-item"
              v-for="item in markKeyboardModes"
              :key="item.title"
              type="circle"
              :icon="item.icon"
              @click="item.click"
            ></a-button>
          </div>
          <span>键盘导入</span>
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
    <marker-add
      v-if="mapboxShow"
      :drawMode="activeMode"
      @addMarker="addMarker"
    ></marker-add>
    <marker-show :markers="tableData"></marker-show>
    <a-modal v-model="modalInput" title="输入坐标" :width="360">
      <marker-input />
    </a-modal>
    <a-modal v-model="modalImport" title="导入文件" :width="360">
      <marker-import />
    </a-modal>
    <a-modal v-model="modalExport" title="导入标注" :width="360">
      <marker-export />
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Inject, Watch } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import { eventBus, api } from '@mapgis/pan-spatial-map-store'

import MarkerAdd from './components/MarkerAdd/MarkerAdd.vue'
import MarkerShow from './components/MarkerShow/MarkerShow.vue'
import MarkerInput from './components/MarkerInput/MarkerInput.vue'
import MarkerImport from './components/MarkerImport/MarkerImport.vue'
import MarkerExport from './components/MarkerExport/MarkerExport.vue'
import markerRed from '../../../../pan-spatial-map-plugin-workspace/src/assets/images/markerRed.png'
import markerBlue from '../../../../pan-spatial-map-plugin-workspace/src/assets/images/markerBlue.png'

@Component({
  name: 'MpMarkerManager',
  components: { MarkerInput, MarkerImport, MarkerExport, MarkerAdd, MarkerShow }
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
      icon: 'laptop',
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
      sorter: true
    },
    {
      title: '描述',
      dataIndex: 'description',
      align: 'center',
      sorter: true
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

  // 控制mapbox绘制组件，防止id冲突
  private mapboxShow = false

  // 当前激活项
  private activeMode = { mode: '', var: 0 }

  // 表格数据(标注点构成的数组)
  private markers: any[] = []

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

    // 修改新选中的图标为蓝色
    if (newSelected && newSelected.length > 0) {
      this.tableData = this.tableData.reduce((result, item) => {
        if (newSelected.includes(item.id)) {
          item.iconImg = markerBlue
        }
        result.push(item)
        return result
      }, [])
      markerFlyTo = this.tableData.find(
        item => item.id === newSelected[newSelected.length - 1]
      )
    }

    // 修改新取消选中的图标为红色
    if (newUnSelected && newUnSelected.length > 0) {
      this.tableData = this.tableData.reduce((result, item) => {
        if (newUnSelected.includes(item.id)) {
          item.iconImg = markerRed
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
    this.mapboxShow = true
    this.$message.config({
      top: '100px',
      duration: 2,
      maxCount: 1
    })
    // api.getWidgetConfig('MarkerManager').then(res => {
    //   this.oldConfigToNew(res)
    // })
  }

  onClose() {
    this.mapboxShow = false
    this.tableData = []
  }

  // 点击不同类型标注图标回调事件
  startMark(mode) {
    this.activeMode.mode = mode
    this.activeMode.var += 1
  }

  // 添加标注
  addMarker(marker: any) {
    this.tableData.push(marker)
  }

  // Table选中项发生变化时的回调
  onSelectChange(selectedRowKeys) {
    this.selectedRowKeys = selectedRowKeys
  }

  // 键盘按钮回调事件
  addMarkerByInputCoord() {
    this.modalInput = true
  }

  // 导入按钮回调事件
  addMarkerByImportFile() {
    this.modalImport = true
  }

  // 导出按钮回调事件
  exportMarkers() {
    this.modalExport = true
  }

  // 保存按钮回调事件
  saveMarkers() {
    const this_ = this
    api
      .saveWidgetConfig({
        name: 'MarkerManager',
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
  deleteMarkers() {
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
.keyboard-btns {
  display: flex;
  align-items: center;
}

.marker-mouse,
.marker-keyboard {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.manager-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.mouse-item,
.keyboard-item,
.manager-item {
  margin-right: 4px;
}
</style>
