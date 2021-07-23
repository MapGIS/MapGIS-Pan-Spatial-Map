<template>
  <div class="color-picker">
    <a-popover trigger="click">
      <template slot="content">
        <sketch-picker
          :disableAlpha="disableAlpha"
          :value="pickColor"
          @input="val => getPickColor(val)"
        />
      </template>
      <div class="color-container">
        <div :style="{ background: pickColor }" class="color color-div"></div>
      </div>
    </a-popover>
  </div>
</template>

<script>
import { Sketch } from 'vue-color'

export default {
  // 组件名称，统一以"Mp"开头
  name: 'MpColorPicker',
  components: { 'sketch-picker': Sketch },
  props: {
    color: {
      type: String,
      required: true,
      default: 'rgb(255,255,102)'
    },
    disableAlpha: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  computed: {
    pickColor: {
      get() {
        return this.color
      },
      set(val) {
        this.$emit('update:color', val)
      }
    }
  },
  methods: {
    // 颜色拾取器选中事件回调
    getPickColor(val) {
      this.pickColor = this.colorObjectToRgba(val.rgba, this.disableAlpha)
    },
    colorObjectToRgba(rgba, disableAlpha) {
      let colorStr = ''
      if (rgba.a !== undefined) {
        colorStr = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`
        // 已传入disableAlpha，并且为true
        if (disableAlpha) {
          colorStr = `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`
        }
      } else {
        colorStr = `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`
      }
      return colorStr
    }
  }
}
</script>

<style lang="less" scoped>
.color-picker {
  .color-container {
    padding: 9px 8px;
    height: 32px;
    border: 1px solid @border-color;
    border-radius: 4px;
    .color-div {
      height: 100%;
    }
  }
}
</style>
