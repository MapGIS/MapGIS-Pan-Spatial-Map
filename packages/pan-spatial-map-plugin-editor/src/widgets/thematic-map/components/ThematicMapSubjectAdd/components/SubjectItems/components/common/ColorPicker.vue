<template>
  <a-dropdown :visible="visible" :trigger="['click']">
    <slot>
      <span
        @click.prevent="showPicker"
        :class="colorPickerBtnCls"
        :style="colorPickerBtnStyle"
        :title="color"
        class="color-picker-btn"
        >{{ color }}</span
      >
    </slot>
    <div class="color-picker-content" slot="overlay">
      <chrome-picker :value="color" @input="setColor" />
      <div class="color-picker-content-btns">
        <a-button size="small" @click="cancel">取消</a-button>
        <a-button type="primary" size="small" @click="confirm">确定</a-button>
      </div>
    </div>
  </a-dropdown>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
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
  @Prop({ default: ColorType.rgb }) readonly type!: CType

  @Prop({ default: ColorPickerSize.default }) readonly size!: CSize

  @Prop({ default: true }) readonly border!: boolean

  @Prop({ default: true }) readonly borderRadius!: boolean

  @Prop({
    type: String,
    validator: v =>
      ColorUtil.isHex(v) || ColorUtil.isRgb(v) || ColorUtil.isRgba(v)
  })
  readonly value!: string

  @Watch('value')
  valueChange(nV) {
    this.color = nV
  }

  color = 'rgb(0,0,255)'

  visible = false

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

  showPicker() {
    this.visible = true
  }

  setColor({ rgba: { r, g, b, a }, hex }) {
    let _color = hex
    switch (this.type) {
      case ColorType.rgb:
        _color = `rgb(${r}, ${g}, ${b})`
        break
      case ColorType.rgba:
        _color = `rgb(${r}, ${g}, ${b}, ${a})`
        break
      default:
        break
    }
    this.color = _color
  }

  cancel() {
    this.visible = false
    this.color = this.value
  }

  confirm() {
    this.$emit('input', this.color)
    this.visible = false
  }

  created() {
    if (this.value) {
      this.color = this.value
    }
  }
}
</script>
<style lang="less" scoped>
.color-picker-btn {
  min-width: 32px;
  width: 100px;
  height: 32px;
  line-height: 32px;
  padding: 0 4px;
  display: inline-block;
  vertical-align: middle;
  cursor: pointer;
  text-align: center;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  &.border {
    border: 1px solid transparent;
  }
  &.borderRadius {
    border-radius: @border-radius-base;
  }
  &.large {
    min-width: 40px;
    height: 40px;
    line-height: 40px;
  }
  &.small {
    min-width: 24px;
    height: 24px;
    line-height: 24px;
  }
}

.color-picker-content {
  border: 1px solid @border-color-base;
  > div {
    box-shadow: none;
  }
  &-btns {
    background: @white;
    padding: 12px 0;
    text-align: center;
    border-top: 1px solid @border-color-base;
    border-bottom-left-radius: 2px;
    border-bottom-right-radius: 2px;
    button {
      margin: 0 5px;
    }
  }
}
</style>
