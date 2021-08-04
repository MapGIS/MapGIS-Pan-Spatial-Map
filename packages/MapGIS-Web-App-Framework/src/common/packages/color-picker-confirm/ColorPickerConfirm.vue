<template>
  <a-dropdown :visible="visible" :trigger="['click']">
    <slot>
      <span
        @click.prevent="showPicker"
        :title="color"
        :style="colorPickerBtnStyle"
        :class="colorPickerBtnCls"
        class="color-picker-btn"
        >{{ color }}</span
      >
    </slot>
    <div class="color-picker-content" slot="overlay">
      <chrome-picker v-if="isChrome" @input="colorChange" :value="color" />
      <sketch-picker v-else @input="colorChange" :value="color" />
      <div class="color-picker-content-btns">
        <a-button size="small" @click="cancel">取消</a-button>
        <a-button type="primary" size="small" @click="confirm">确定</a-button>
      </div>
    </div>
  </a-dropdown>
</template>
<script>
import { ColorUtil } from '@mapgis/web-app-framework'
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
        return ['sketch', 'chrome'].includes(v)
      }
    },
    colorType: {
      type: String,
      default: 'rgb',
      validator(v) {
        return ['hex', 'rgb', 'rgba'].includes(v)
      }
    },
    size: {
      type: String,
      default: 'default',
      validator(v) {
        return ['large', 'default', 'small'].includes(v)
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
      default: 'rgb(64,169,255)'
    },
    value: {
      type: String,
      validator: v =>
        ColorUtil.isHex(v) || ColorUtil.isRgb(v) || ColorUtil.isRgba(v)
    }
  },
  data() {
    return {
      color: this.defaultValue,
      visible: false
    }
  },
  computed: {
    isChrome({ type }) {
      return type === 'chrome'
    },
    colorPickerBtnCls({ size, border, borderRadius, disabled }) {
      return {
        [size]: true,
        border,
        borderRadius,
        disabled
      }
    },
    colorPickerBtnStyle({ defaultValue, value, border }) {
      return {
        background: value || defaultValue,
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
     * 取消
     */
    cancel() {
      this.hidePicker()
      this.color = this.value
    },
    /**
     * 确认
     */
    confirm() {
      this.$emit('input', this.color)
      this.visible = false
    }
  },
  created() {
    if (this.value) {
      this.color = this.value
    }
  }
}
</script>
<style lang="less" scoped>
.color-picker-btn {
  min-width: 100px;
  width: 100%;
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
  position: relative;
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
  &.disabled {
    &:after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      background: fade(@white, 85%);
    }
  }
}

.color-picker-content {
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
</style>
