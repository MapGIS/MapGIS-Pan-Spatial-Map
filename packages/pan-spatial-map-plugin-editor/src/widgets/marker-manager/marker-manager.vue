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
              <a-button type="circle" :icon="item.icon"></a-button>
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
          <a-button type="circle" :icon="item.icon"></a-button>
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
    >
    </a-table>
    <a-modal v-model="modalInput" title="输入坐标" :width="360">
      <marker-input />
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Inject, Watch } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import MarkerInput from './components/MarkerInput/MarkerInput.vue'

@Component({ name: 'MpMarkerManager', components: { MarkerInput } })
export default class MpMarkerManager extends Mixins(WidgetMixin) {
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

  private markManagerModes = [
    {
      title: '保存',
      icon: 'save'
    },
    {
      title: '导出',
      icon: 'export'
    },
    {
      title: '删除',
      icon: 'delete'
    }
  ]

  // 表格列的配置描述
  private columns = [
    {
      title: '名称',
      dataIndex: 'name',
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

  // 表格数据
  private tableData: any[] = [
    {
      key: 1,
      name: 'aaa',
      description: 'a1aa'
    },
    {
      key: 2,
      name: 'bbb',
      description: 'b2bb'
    }
  ]

  // 指定选中项的 key 数组
  private selectedRowKeys = []

  // 分页器配置
  private pagination = {
    showSizeChanger: true,
    size: 'small'
  }

  // 键盘对话框的显隐
  private modalInput = false

  // 导入对话框的显隐
  private modalImport = false

  // 导出对话框的显隐
  private modalExport = false

  // 选中项发生变化时的回调
  onSelectChange(selectedRowKeys) {
    this.selectedRowKeys = selectedRowKeys
  }

  // 键盘按钮回调事件
  addMarkerByInputCoord() {
    this.modalInput = true
  }

  // 导入按钮回调事件
  addMarkerByImportFile() {}
}
</script>

<style lang="less" scoped>
.btn-tooltip {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
