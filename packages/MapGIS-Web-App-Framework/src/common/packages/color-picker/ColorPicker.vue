<template>
  <div class="color-picker">
    <a-input
      class="color-input"
      v-model="pickColor"
      :style="{ background: pickColor }"
    >
      <a-popover slot="addonAfter" trigger="click">
        <template slot="content">
          <sketch-picker
            :disableAlpha="disableAlpha"
            :value="pickColor"
            @input="val => getPickColor(val)"
          />
        </template>
        <a-icon type="edit" />
      </a-popover>
    </a-input>
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
      // this.$emit('update:color', this.pickColor)
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
