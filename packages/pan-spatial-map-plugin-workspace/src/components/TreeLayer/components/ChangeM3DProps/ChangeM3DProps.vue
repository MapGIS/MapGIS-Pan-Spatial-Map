<template>
  <div class="change-m3d-props-container">
    <a-form
      labelAlign="left"
      :label-col="{ span: 14 }"
      :wrapper-col="{ span: 10 }"
    >
      <a-form-item label="最大屏幕空间误差">
        <a-input-number
          v-model="maximumScreenSpaceError"
          :min="0"
          style="width: 100%"
        />
      </a-form-item>
      <a-form-item label="开启拾取">
        <a-switch v-model="enablePopup" />
      </a-form-item>
      <a-form-item label="开启多模态切换">
        <a-switch v-model="enableModelSwitch" />
      </a-form-item>
      <mapgis-ui-input-number-panel
        size="large"
        label="模型阴影区域亮度调节"
        v-model="luminanceAtZenith"
        :range="[0, 200]"
        :step="0.2"
        @change="luminanceAtZenithChange"
      />
      <div style="textalign: right">
        <a-button type="primary" @click="submit"> 确认 </a-button>
      </div>
    </a-form>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop, Emit } from 'vue-property-decorator'
import { LayerType } from '@mapgis/web-app-framework'

@Component({
  name: 'MpChangeM3DProps',
  components: {}
})
export default class MpChangeM3DProps extends Vue {
  @Prop() layer

  maximumScreenSpaceError = this.layer.maximumScreenSpaceError

  private enableModelSwitch = false

  private enablePopup = false

  private luminanceAtZenith = 10

  @Watch('layer', { immediate: true, deep: true })
  initParams() {
    debugger
    const layer = this.layer.layer ? this.layer.layer : this.layer
    this.enablePopup = layer && layer.popupEnabled ? layer.popupEnabled : false
    this.enableModelSwitch =
      this.layer && this.layer.modelSwitchEnabled
        ? this.layer.modelSwitchEnabled
        : false

    this.luminanceAtZenith =
      this.layer && this.layer.luminanceAtZenith
        ? this.layer.luminanceAtZenith
        : 10
  }

  submit() {
    if (this.layer.maximumScreenSpaceError !== undefined) {
      this.layer.maximumScreenSpaceError = this.maximumScreenSpaceError
    }
    if (this.layer.modelSwitchEnabled !== undefined) {
      this.layer.modelSwitchEnabled = this.modelSwitchEnabled
    }
    if (this.layer.luminanceAtZenith !== undefined) {
      this.layer.luminanceAtZenith = this.luminanceAtZenith
    }
    if (this.layer.layer) {
      this.layer.layer.popupEnabled = this.enablePopup
    } else {
      this.layer.popupEnabled = this.enablePopup
    }
    this.$emit('update:layer', this.layer)
  }

  luminanceAtZenithChange() {
    this.layer.luminanceAtZenith = this.luminanceAtZenith
    this.$emit('update:luminanceAtZenith', this.layer)
  }
}
</script>

<style lang="less" scoped>
.select-tilematrixSet {
  margin: 0.5em;
}
.top-02em {
  margin-top: 0.2em;
}
</style>
