<template>
  <div class="marker-input">
    <a-form-model
      :model="formInput"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-form-model-item label="坐标单位:">
        <a-select v-model="formInput.unit">
          <a-select-option v-for="item in unitTypes" :key="item">{{
            item
          }}</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="X坐标:">
        <a-input
          v-show="formInput.unit === '十进制'"
          v-model.number="formInput.coordX"
          type="number"
        >
        </a-input>
        <div v-show="formInput.unit === '度分秒'" class="coord-input">
          <a-input v-model="formInput.degreeX" type="number"> </a-input>
          <span>度</span>
          <a-input v-model="formInput.minuteX" type="number"> </a-input>
          <span>分</span>
          <a-input v-model="formInput.secondX" type="number"> </a-input>
          <span>秒</span>
        </div>
      </a-form-model-item>
      <a-form-model-item label="Y坐标:">
        <a-input
          v-show="formInput.unit === '十进制'"
          v-model.number="formInput.coordY"
          type="number"
        >
        </a-input>
        <div v-show="formInput.unit === '度分秒'" class="coord-input">
          <a-input v-model="formInput.degreeY" type="number"> </a-input>
          <span>度</span>
          <a-input v-model="formInput.minuteY" type="number"> </a-input>
          <span>分</span>
          <a-input v-model="formInput.secondY" type="number"> </a-input>
          <span>秒</span>
        </div>
      </a-form-model-item>
      <a-checkbox
        class="crs-checkbox"
        :default-checked="true"
        @change="onChange"
      >
        设置输入坐标空间参考系
      </a-checkbox>
      <a-form-model-item v-show="showCrsSelect" label="参考系:">
        <a-select v-model="formInput.crsName">
          <a-select-option v-for="item in crsNames" :key="item">{{
            item
          }}</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-divider />
      <div class="btn-group">
        <a-button type="primary" @click="onClickConfirm">确认</a-button>
        <a-button @click="onClickCancel">取消</a-button>
      </div>
    </a-form-model>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Emit } from 'vue-property-decorator'
import {
  utilInstance,
  eventBus,
  baseConfigInstance
} from '@mapgis/pan-spatial-map-store'
import { ThemeStyleMixin, AppMixin } from '@mapgis/web-app-framework'
import { UUID } from '@mapgis/webclient-store/src/utils'
import markerRed from '../../../../../../pan-spatial-map-plugin-workspace/src/assets/images/markerRed.png'
import markerBlue from '../../../../../../pan-spatial-map-plugin-workspace/src/assets/images/markerBlue.png'
import MarkerAddMixin from '../../mixins/marker-add'

@Component({ name: 'MpMarkerInput' })
export default class MpMarkerInput extends Mixins(MarkerAddMixin, AppMixin) {
  // 表单数据
  private formInput = {
    unit: '十进制',
    coordX: 0,
    coordY: 0,
    degreeX: 0,
    minuteX: 0,
    secondX: 0,
    degreeY: 0,
    minuteY: 0,
    secondY: 0,
    crsName: 'WGS1984_度'
  }

  // 坐标单位下拉配置
  private unitTypes = ['十进制', '度分秒']

  // 坐标系下拉配置
  private crsNames = ['WGS1984_度', 'Web墨卡托_WGS1984']

  // 参考系选择器的显隐
  private showCrsSelect = true

  @Emit('addMarker')
  addInputMarker(marker) {}

  @Emit('closeModal')
  closeModal() {}

  // 多选框变化时回调函数
  onChange(e) {
    this.showCrsSelect = e.target.checked
  }

  // 取消按钮回调函数
  onClickCancel() {
    this.closeModal()
  }

  // 确认按钮回调函数
  async onClickConfirm() {
    if (this.formInput.unit === '度分秒') {
      this.formInput.coordX = utilInstance.degreeToDecimal(
        Number(this.formInput.degreeX),
        Number(this.formInput.minuteX),
        Number(this.formInput.secondX)
      )
      this.formInput.coordY = utilInstance.degreeToDecimal(
        Number(this.formInput.degreeY),
        Number(this.formInput.minuteY),
        Number(this.formInput.secondY)
      )
    }
    let pointCoords: number[][] = [
      [Number(this.formInput.coordX), Number(this.formInput.coordY)]
    ]
    if (this.showCrsSelect) {
      pointCoords = await this.transPoints(
        [[Number(this.formInput.coordX), Number(this.formInput.coordY)]],
        this.formInput.crsName
      )
    }
    this.structMarker(pointCoords[0])
    this.closeModal()
  }

  // 构造marker
  structMarker(coord) {
    const feature = {
      geometry: {
        coordinates: [...coord],
        type: 'Point'
      },
      id: UUID.uuid(),
      properties: {},
      type: 'Feature'
    }

    const marker = {
      id: UUID.uuid(),
      title: '',
      description: '',
      iconImg: `${this.baseUrl}${baseConfigInstance.config.colorConfig.label.image.defaultImg}`,
      img: '',
      edit: true,
      features: [feature],
      coordinates: [...coord],
      center: [...coord]
    }
    this.addInputMarker(marker)
  }
}
</script>

<style lang="less" scoped>
.ant-form-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
}
::v-deep .ant-form-item-label {
  width: 104px;
}
::v-deep .ant-form-item-control-wrapper {
  width: 208px;
}

.crs-checkbox {
  margin: 8px 0 18px 32px;
}
.coord-input {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
}
.ant-divider {
  margin: 12px 0;
}
.btn-group {
  display: flex;
  justify-content: flex-end;
  align-items: center;

  .ant-btn {
    margin-left: 8px;
  }
}
</style>
