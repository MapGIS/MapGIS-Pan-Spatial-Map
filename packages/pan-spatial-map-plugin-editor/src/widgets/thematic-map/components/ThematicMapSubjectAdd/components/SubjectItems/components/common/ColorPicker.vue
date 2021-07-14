<template>
  <a-dropdown :trigger="['click']">
    <slot>
      <span
        class="color-picker-btn"
        :class="colorPickerBtnCls"
        :style="colorPickerBtnStyle"
        @click.prevent
      />
    </slot>
    <chrome-picker slot="overlay" v-model="color" />
  </a-dropdown>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { ColorUtil } from '@mapgis/web-app-framework'
import { Chrome } from 'vue-color'

type CSize = 'large' | 'default' | 'small'

type CType = 'hex' | 'rgb' | 'rgba'

enum ColorPickerSize {
  large = 'large',
  default = 'default',
  small = 'small'
}

enum ColorType {
  hex = 'hex',
  rgb = 'rgb',
  rgba = 'rgba'
}

@Component({
  components: {
    'chrome-picker': Chrome
  }
})
export default class ColorPicker extends Vue {
  @Prop({ default: ColorType.hex }) readonly type!: CType

  @Prop({ default: ColorPickerSize.default }) readonly size!: CSize

  @Prop({ default: true }) readonly border!: boolean

  @Prop({ default: true }) readonly borderRadius!: boolean

  @Prop({
    type: String,
    validator: v =>
      ['string', 'undefined'].includes(typeof v) ||
      ColorUtil.isHex(v) ||
      ColorUtil.isRgb(v) ||
      ColorUtil.isRgba(v)
  })
  readonly value!: string

  defaultColor = 'rgb(0,0,255)'

  get color() {
    return this.value || this.defaultColor
  }

  set color({ rgba, hex }) {
    const { r, g, b, a } = rgba
    let value = hex
    switch (this.type) {
      case ColorType.rgb:
        value = `rgb(${r}, ${g}, ${b})`
        break
      case ColorType.rgba:
        value = `rgb(${r}, ${g}, ${b}, ${a})`
        break
      default:
        break
    }
    this.emitChange(value)
  }

  get colorPickerBtnCls() {
    const { size, border, borderRadius } = this
    return {
      border,
      borderRadius,
      [size]: true
    }
  }

  get colorPickerBtnStyle() {
    const { color, border } = this
    return {
      background: color,
      borderColor: border ? color : 'transparent'
    }
  }

  emitChange(value) {
    this.$emit('input', value)
  }

  created() {
    this.emitChange(this.color)
  }
}
</script>
<style lang="less" scoped>
.color-picker-btn {
  width: 32px;
  height: 32px;
  display: inline-block;
  vertical-align: middle;
  cursor: pointer;
  &.border {
    border: 1px solid transparent;
  }
  &.borderRadius {
    border-radius: @border-radius-base;
  }
  &.large {
    width: 40px;
    height: 40px;
  }
  &.small {
    width: 24px;
    height: 24px;
  }
}
</style>
