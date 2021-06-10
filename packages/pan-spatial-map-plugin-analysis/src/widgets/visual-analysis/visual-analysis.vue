<template>
  <div class="mp-widget-visual-analysis">
    <div class="visual-panel">
      <a-form-model v-model="formData">
        <a-form-model-item label="方位角">
          <a-input v-model="formData.azimuthAngle" />
        </a-form-model-item>
        <a-form-model-item label="水平夹角">
          <a-input v-model="formData.horizontAngle" />
        </a-form-model-item>
        <a-form-model-item label="俯仰角">
          <a-input v-model="formData.pitchAngle" />
        </a-form-model-item>
        <a-form-model-item label="垂直夹角">
          <a-input v-model="formData.verticalAngle" />
        </a-form-model-item>
        <a-form-model-item label="不可视区域颜色">
          <ColorPicker :color.sync="formData.unVisibleColor"></ColorPicker>
        </a-form-model-item>
        <a-form-model-item label="可视区域颜色">
          <ColorPicker :color.sync="formData.visibleColor"></ColorPicker>
        </a-form-model-item>
        <a-form-model-item label="可视遮罩颜色">
          <ColorPicker :color.sync="formData.maskColor"></ColorPicker>
        </a-form-model-item>
      </a-form-model>
    </div>
    <div class="visual-footer">
      <a-button type="primary">开始分析</a-button>
      <a-button type="primary">结束分析</a-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import ColorPicker from './color-picker'

@Component({
  name: 'MpVisualAnalysis',
  components: { ColorPicker }
})
export default class MpVisualAnalysis extends Mixins(WidgetMixin) {
  // 表单数据
  private formData = {
    azimuthAngle: 0,
    horizontAngle: 60,
    pitchAngle: 0,
    verticalAngle: 60,
    unVisibleColor: '#ff0000',
    visibleColor: '#00ff00',
    maskColor: '#4feed7'
  }
}
</script>

<style lang="scss" scoped>
.visual-panel {
  .ant-form-item {
    margin-bottom: 8px;
  }

  ::v-deep .ant-form-item-label {
    line-height: 28px;
  }
}

.visual-footer {
  margin-top: 32px;
  display: flex;
  justify-content: space-between;
}
</style>
