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
          style="width:100%"
        />
      </a-form-item>
      <a-form-item label="开启拾取">
        <a-switch v-model="enablePopup" />
      </a-form-item>
      <a-form-item label="开启多模态切换">
        <a-switch v-model="enableModelSwitch" />
      </a-form-item>
      <div style="textAlign:right">
        <a-button type="primary" @click="submit">
          确认
        </a-button>
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

  enableModelSwitch = this.layer.layer
    ? this.layer.layer.modelSwitchEnabled
    : this.layer.modelSwitchEnabled

  enablePopup = this.layer.layer
    ? this.layer.layer.popupEnabled
    : this.layer.popupEnabled

  submit() {
    if (this.layer.maximumScreenSpaceError) {
      this.layer.maximumScreenSpaceError = this.maximumScreenSpaceError
    }
    if (this.layer.layer) {
      this.layer.layer.popupEnabled = this.enablePopup
      this.layer.layer.modelSwitchEnabled = this.enableModelSwitch
    } else {
      this.layer.popupEnabled = this.enablePopup
      this.layer.modelSwitchEnabled = this.enableModelSwitch
    }
    this.$emit('update:layer', this.layer)
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
