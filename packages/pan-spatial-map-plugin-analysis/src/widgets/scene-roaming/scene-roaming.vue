<template>
  <div
    class="mp-widget-scene-roaming"
    :class="isFullScreen ? '' : 'window-size'"
  >
    <div class="scene-title">
      <a-button type="primary" icon="pull-request">交互选点</a-button>
      <a-button type="primary">取消选点</a-button>
    </div>
    <div class="scene-panel-table">
      <a-table
        :columns="columns"
        :data-source="tableData"
        :pagination="pagination"
        :row-selection="{
          selectedRowKeys: selectedRowKeys,
          type: 'radio',
          onChange: onSelectChange
        }"
        :rowKey="
          record => {
            return record.id
          }
        "
      >
        <template slot="operate" slot-scope="text, record">
          <a-tooltip placement="bottom">
            <template slot="title">
              <span>删除</span>
            </template>
            <a-icon type="delete" @click="onClickDelete(record)"></a-icon>
          </a-tooltip>
        </template>
      </a-table>
      <a-table
        v-show="false"
        :columns="pointColumns"
        :data-source="pointTableData"
        :pagination="pointPagination"
      >
      </a-table>
    </div>
    <div class="scene-panel-form">
      <a-form-model
        :model="formData"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
        labelAlign="left"
      >
        <a-form-model-item label="移动速度:">
          <a-input
            v-model.number="formData.speed"
            type="number"
            addon-after="(经纬度/秒)"
          />
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
            <a-select-option
              v-for="item in perspectiveOptions"
              :key="item.value"
            >
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="插值:">
          <a-select v-model="formData.interpolation">
            <a-select-option
              v-for="item in interpolationOptions"
              :key="item.value"
            >
              {{ item.label }}
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
        <a-button v-show="!isStart" type="primary" @click="onClickStart"
          >开始</a-button
        >
        <a-button v-show="isStart" type="primary" @click="onClickStop"
          >停止</a-button
        >
        <a-button v-show="isPause" type="primary" @click="onClickGoOn"
          >继续</a-button
        >
        <a-button v-show="!isPause" type="primary" @click="onClickPause"
          >暂停</a-button
        >
        <a-button type="primary" @click="onClickSave">保存</a-button>
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
      key: 'name',
      align: 'center'
    },
    {
      title: '坐标',
      dataIndex: 'path',
      key: 'path',
      align: 'center',
      ellipsis: true
    },
    {
      title: '操作',
      dataIndex: 'operate',
      key: 'operate',
      align: 'center',
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

  // 表格一分页器配置
  private pagination = {
    showSizeChanger: true,
    size: 'small',
    total: this.tableData.length,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`
  }

  // 表格二分页器配置
  private pointPagination = {
    showSizeChanger: true,
    size: 'small',
    total: this.pointTableData.length,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`
  }

  // 表格一选中项 key 数组
  private selectedRowKeys = []

  // 表格一选中项
  private selectedRow

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
  private perspectiveOptions = [
    {
      label: '跟随',
      value: 1
    },
    {
      label: '锁定第一视角',
      value: 2
    },
    {
      label: '上帝视角',
      value: 3
    }
  ]

  // 插值下拉框
  private interpolationOptions = [
    {
      label: '拉格朗日插值',
      value: 'LagrangePolynomialApproximation'
    },
    {
      label: '线性近似',
      value: 'LinearApproximation'
    },
    {
      label: '埃尔米特插值',
      value: 'HermitePolynomialApproximation'
    }
  ]

  // 多选框组选中值
  private checkedVal = []

  // 多选框项
  private checkboxOptions = [
    {
      label: '循环',
      value: 'isLoop'
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

  // 是否开始
  private isStart = false

  // 是否暂停
  private isPause = false

  // 微件窗口是否全屏显示
  private isFullScreen = false

  created() {
    this.initData()
  }

  onWindowSize(mode) {
    this.isFullScreen = mode === 'max'
  }

  // 初始化各项数据
  private initData() {
    const configData = this.widgetInfo.config

    this.tableData = configData.map(item => {
      return { ...item, path: item.path.join() }
    })

    window.SceneWanderManager = {
      animation: null
    }

    console.log(configData)
  }

  // 表格一选中项发生变化时的回调
  private onSelectChange(selectedRowKeys) {
    this.selectedRowKeys = selectedRowKeys
    this.selectedRow = this.tableData.find(
      item => item.id === selectedRowKeys[0]
    )
    const {
      speed,
      exHeight,
      til,
      pitch,
      animationType,
      interpolationAlgorithm,
      isLoop,
      showPath,
      showInfo
    } = this.selectedRow.para

    // 根据选中项，初始化表单数据
    this.formData = {
      speed,
      exHeight,
      azimuth: til,
      pitch,
      perspective: animationType,
      interpolation: interpolationAlgorithm
    }

    // 根据选中项，初始化多选框组
    this.checkedVal = this.checkboxOptions.reduce((result, item) => {
      if (isLoop && item.value === 'isLoop') {
        result.push(item.value)
      }
      if (showPath && item.value === 'showPath') {
        result.push(item.value)
      }
      if (showInfo && item.value === 'showInfo') {
        result.push(item.value)
      }
      return result
    }, [])
  }

  // 点击删除列按钮回调
  private onClickDelete(record) {
    const index = this.tableData.findIndex(item => item.id === record.id)

    this.tableData.splice(index, 1)
  }

  // 点击开始按钮回调
  private onClickStart() {
    const pathCoords = this.selectedRow.path.split(',')

    window.SceneWanderManager.animation = new this.Cesium.AnimationAnalyse(
      this.webGlobe.viewer,
      {
        modelUrl: 'models/CesiumAir/Cesium_Air.gltf'
      }
    )

    if (pathCoords.length > 0) {
      window.SceneWanderManager.animation.positions = this.Cesium.Cartesian3.fromDegreesArrayHeights(
        pathCoords
      )
      window.SceneWanderManager.animation.speed = this.formData.speed
      window.SceneWanderManager.animation.exHeight = this.formData.exHeight
      window.SceneWanderManager.animation.offsetX = this.formData.azimuth
      window.SceneWanderManager.animation.offsetZ = this.formData.pitch
      window.SceneWanderManager.animation.animationType = this.formData.perspective
      window.SceneWanderManager.animation.isLoop = false
      window.SceneWanderManager.animation.isShowPath = false
      window.SceneWanderManager.animation.showInfo = false

      if (this.checkedVal.includes('isLoop')) {
        window.SceneWanderManager.animation.isLoop = true
      }
      if (this.checkedVal.includes('showPath')) {
        window.SceneWanderManager.animation.isShowPath = true
      }
      if (this.checkedVal.includes('showInfo')) {
        window.SceneWanderManager.animation.showInfo = true
      }

      switch (this.formData.interpolation) {
        case 'LagrangePolynomialApproximation':
          window.SceneWanderManager.animation.interpolationAlgorithm = this.Cesium.LagrangePolynomialApproximation // 拉格朗日插值
          break
        case 'LinearApproximation':
          window.SceneWanderManager.animation.interpolationAlgorithm = this.Cesium.LinearApproximation // 线性近似
          break
        case 'HermitePolynomialApproximation':
          window.SceneWanderManager.animation.interpolationAlgorithm = this.Cesium.HermitePolynomialApproximation // 埃尔米特插值
          break
        default:
          break
      }

      window.SceneWanderManager.animation.start()
      this.isStart = true
    }
  }

  // 点击停止按钮回调
  private onClickStop() {
    window.SceneWanderManager.animation.stop()
    this.isStart = false
    this.isPause = false
  }

  // 点击继续按钮回调
  private onClickGoOn() {
    window.SceneWanderManager.animation.pause = false
    this.isPause = false
  }

  // 点击暂停按钮回调
  private onClickPause() {
    window.SceneWanderManager.animation.pause = true
    this.isPause = true
  }

  // 点击保存按钮回调
  private onClickSave() {}
}
</script>

<style lang="scss" scoped>
@import '../../styles/flex.scss';

.mp-widget-scene-roaming {
  @include flex($direction: column);
}

.window-size {
  width: 344px;
}

.scene-title {
  @include flex();
  width: 100%;
  padding: 8px 0;

  .ant-btn {
    margin-right: 16px;
    padding: 0 15px;
  }
}

.scene-panel-table {
  width: 100%;
}

.scene-panel-form {
  width: 100%;
  margin-top: 8px;
  .ant-form-item {
    @include flex();
  }
  .ant-input {
    padding: 4px 11px;
  }
}

.scene-footer {
  @include flex($direction: column);
  width: 100%;
  margin-top: 16px;

  .footer-checkbox {
    width: 100%;

    .ant-checkbox-group {
      @include flex($justify-content: space-between);
      width: 100%;
    }
  }

  .footer-btn {
    @include flex($justify-content: space-between);
    width: 100%;
    margin-top: 16px;

    .ant-btn {
      padding: 0 15px;
    }
  }
}
</style>
