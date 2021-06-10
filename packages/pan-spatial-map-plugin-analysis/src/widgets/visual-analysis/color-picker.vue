<template>
  <div class="color-picker">
    <a-input
      class="color-input"
      v-model="pickColor"
      :style="{ background: pickColor }"
    >
      <a-popover slot="addonAfter" trigger="click">
        <template slot="content">
          <sketch-picker :value="pickColor" @input="val => getPickColor(val)" />
        </template>
        <a-icon type="edit" />
      </a-popover>
    </a-input>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Vue, PropSync } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import { Sketch } from 'vue-color'

@Component({ name: 'ColorPicker', components: { 'sketch-picker': Sketch } })
export default class ColorPicker extends Vue {
  @PropSync('color', { type: String }) pickColor: string

  // 颜色拾取器选中事件回调
  private getPickColor(val) {
    this.pickColor = val.hex
  }
}
</script>

<style lang="scss" scoped>
.color-input {
  ::v-deep .ant-input-wrapper,
  ::v-deep .ant-input {
    background: inherit;
  }
  ::v-deep .ant-input-group-addon {
    background: inherit;
    cursor: pointer;
  }
}
</style>
