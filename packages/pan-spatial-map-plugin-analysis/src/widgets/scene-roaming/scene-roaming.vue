<template>
  <div class="mp-widget-scene-roaming">
    <div class="scene-title">
      <a-button type="primary" icon="pull-request">交互选点</a-button>
      <a-button type="primary">取消选点</a-button>
    </div>
    <div class="scene-panel-table">
      <a-table :columns="columns" :data-source="tableData">
        <template slot="operate" slot-scope="text">
          <a-tooltip placement="bottom">
            <template slot="title">
              <span>删除</span>
            </template>
            <a-icon type="delete" @click="onClickDelete(text)"></a-icon>
          </a-tooltip>
        </template>
      </a-table>
      <a-table :columns="pointColumns" :data-source="pointTableData"> </a-table>
    </div>
    <div class="scene-panel-form">
      <a-form-model :model="formData">
        <a-form-model-item label="移动速度:">
          <a-input v-model.number="formData.speed" type="number" />
        </a-form-model-item>
        <a-form-model-item label="附加高程:">
          <a-input v-model.number="formData.exHeight" type="number" />
        </a-form-model-item>
        <a-form-model-item label="方位角:">
          <a-input v-model.number="formData.azimuth" type="number" />
        </a-form-model-item>
        <a-form-model-item label="俯仰角:">
          <a-input v-model.number="formData.pitch" type="number" />
        </a-form-model-item>
        <a-form-model-item label="视角:">
          <a-select v-model="formData.perspective">
            <a-select-option v-for="item in perspectiveOptions" :key="item">
              {{ item }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="插值:">
          <a-select v-model="formData.interpolation">
            <a-select-option v-for="item in interpolationOptions" :key="item">
              {{ item }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
      </a-form-model>
    </div>
    <div class="scene-footer">
      <div class="footer-checkbox">
        <a-checkbox-group
          v-model="checkedVal"
          :options="checkboxOptions"
        ></a-checkbox-group>
      </div>
      <div class="footer-btn">
        <a-button type="primary">开始</a-button>
        <a-button type="primary">停止</a-button>
        <a-button type="primary">继续</a-button>
        <a-button type="primary">暂停</a-button>
        <a-button type="primary">保存</a-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpSceneRoaming' })
export default class MpSceneRoaming extends Mixins(WidgetMixin) {
  // 表格一列配置
  private columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '坐标',
      dataIndex: 'coord',
      key: 'coord'
    },
    {
      title: '操作',
      dataIndex: 'operate',
      key: 'operate',
      scopedSlots: { customRender: 'operate' }
    }
  ]

  // 表格二列配置
  private pointColumns = [
    {
      title: 'x坐标',
      dataIndex: 'xCoord',
      key: 'xCoord'
    },
    {
      title: 'y坐标',
      dataIndex: 'yCoord',
      key: 'yCoord'
    },
    {
      title: 'z坐标',
      dataIndex: 'zCoord',
      key: 'zCoord'
    }
  ]

  // 表格一数据
  private tableData = []

  // 表格二数据
  private pointTableData = []

  // 表单数据
  private formData = {
    speed: 0,
    exHeight: 0,
    azimuth: 0,
    pitch: 0,
    perspective: '',
    interpolation: ''
  }

  // 视角下拉框
  private perspectiveOptions = []

  // 插值下拉框
  private interpolationOptions = []

  // 多选框组选中值
  private checkedVal = []

  // 多选框项
  private checkboxOptions = [
    {
      label: '循环',
      value: 'cycle'
    },
    {
      label: '显示路径',
      value: 'showPath'
    },
    {
      label: '显示提示信息',
      value: 'showInfo'
    }
  ]
}
</script>

<style lang="scss" scoped>
@import '../../styles/flex.scss';

.mp-widget-scene-roaming {
  @include flex($direction: column);
}

.scene-title {
  @include flex();
}

.scene-panel-form {
  .ant-form-item {
    @include flex();
  }

  ::v-deep .ant-form-item-control-wrapper {
    flex-grow: 1;
  }
}

.scene-footer {
  @include flex($direction: column);

  .footer-btn {
    @include flex($justify-content: space-around);
  }
}
</style>
