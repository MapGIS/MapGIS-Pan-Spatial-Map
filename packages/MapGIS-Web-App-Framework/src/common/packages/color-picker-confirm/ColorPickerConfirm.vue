<template>
  <a-dropdown :visible="visible" :trigger="['click']">
    <slot>
      <span
        @click.prevent="showPicker"
        :title="color"
        :style="colorPickerBtnStyle"
        :class="colorPickerBtnCls"
        >{{ color }}</span
      >
    </slot>
    <div :class="`${prefixCls}-content`" slot="overlay">
      <chrome-picker v-if="isChrome" @input="colorChange" :value="color" />
      <sketch-picker v-else @input="colorChange" :value="color" />
      <div :class="`${prefixCls}-content-btns`">
        <a-button size="small" @click="cancel">取消</a-button>
        <a-button type="primary" size="small" @click="confirm">确定</a-button>
      </div>
    </div>
  </a-dropdown>
</template>
<script>
import { ColorUtil, CommonUtil } from '@mapgis/web-app-framework'
import { Sketch, Chrome } from 'vue-color'

export default {
  name: 'MpColorPickerConfirm',
  components: {
    SketchPicker: Sketch,
    ChromePicker: Chrome
  },
  props: {
    type: {
      type: String,
      default: 'chrome',
      validator(v) {
        return CommonUtil.oneOf(v, ['sketch', 'chrome'])
      }
    },
    colorType: {
      type: String,
      default: 'rgb',
      validator(v) {
        return CommonUtil.oneOf(v, ['hex', 'rgb', 'rgba'])
      }
    },
    size: {
      type: String,
      validator(v) {
        return CommonUtil.oneOf(v, ['large', 'small'])
      }
    },
    disabled: {
      type: Boolean,
      default: false
    },
    border: {
      type: Boolean,
      default: true
    },
    borderRadius: {
      type: Boolean,
      default: true
    },
    defaultValue: {
      type: String,
      default: 'rgb(24,144,255)',
      validator: v =>
        ColorUtil.isHex(v) || ColorUtil.isRgb(v) || ColorUtil.isRgba(v)
    },
    value: {
      type: String,
      validator: v =>
        ColorUtil.isHex(v) || ColorUtil.isRgb(v) || ColorUtil.isRgba(v)
    }
  },
  data() {
    const prefixCls = 'color-picker'
    return {
      prefixCls,
      color: '',
      visible: false
    }
  },
  computed: {
    isChrome({ type }) {
      return type === 'chrome'
    },
    colorPickerBtnCls({ prefixCls, size, border, borderRadius, disabled }) {
      return [
        `${prefixCls}-btn`,
        {
          [`${prefixCls}-${size}`]: !!size,
          [`${prefixCls}-bordered`]: !!border,
          [`${prefixCls}-border-radius`]: !!borderRadius,
          [`${prefixCls}-disabled`]: !!disabled
        }
      ]
    },
    colorPickerBtnStyle({ defaultValue, value = defaultValue, border }) {
      return {
        background: value,
        borderColor: border ? value : 'transparent'
      }
    }
  },
  watch: {
    value(nV) {
      this.color = nV
    }
  },
  methods: {
    /**
     * 展示颜色选择器
     */
    showPicker() {
      this.visible = !this.disabled
    },
    /**
     * 隐藏颜色选择器
     */
    hidePicker() {
      this.visible = false
    },
    /**
     * 颜色选择变化
     */
    colorChange({ rgba: { r, g, b, a }, hex }) {
      let _color = hex
      switch (this.colorType) {
        case 'rgb':
          _color = `rgb(${r}, ${g}, ${b})`
          break
        case 'rgba':
          _color = `rgba(${r}, ${g}, ${b}, ${a})`
          break
        default:
          break
      }
      this.color = _color
    },
    /**
     * 往上更新
     */
    dispatchColor() {
      this.$emit('input', this.color)
      this.$emit('change', this.color)
    },
    /**
     * 取消
     */
    cancel() {
      this.color = this.value || this.defaultValue
      this.hidePicker()
    },
    /**
     * 确认
     */
    confirm() {
      this.dispatchColor()
      this.visible = false
    }
  },
  created() {
    if (this.value) {
      this.color = this.value
    } else {
      this.color = this.defaultValue
      this.$emit('input', this.color)
    }
  }
}
</script>
<style lang="less" scoped>
.color-picker {
  @size-lg: 40px;
  @size-md: 32px;
  @size-sm: 24px;

  &-btn {
    max-width: 100%;
    min-width: @size-md;
    height: @size-md;
    line-height: @size-md;
    padding: 0 4px;
    display: inline-block;
    vertical-align: middle;
    cursor: pointer;
    text-align: center;
    position: relative;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  &-content {
    color: #333;
    border: 1px solid @border-color-base;
    border-radius: @border-radius-base;
    > div {
      box-shadow: none;
      border-radius: 0;
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
  &-large {
    min-width: @size-lg;
    height: @size-lg;
    line-height: @size-lg;
  }
  &-small {
    min-width: @size-sm;
    height: @size-sm;
    line-height: @size-sm;
  }
  &-bordered {
    border: 1px solid transparent;
  }
  &-border-radius {
    border-radius: @border-radius-base;
  }
  &-disabled {
    &:after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      background: fade(@white, 85%);
    }
  }
}
</style>
