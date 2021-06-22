<template>
  <div class="mp-placement" :class="classes" :style="style">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'MpPlacement',
  props: {
    position: {
      type: String,
      default: 'bottom-right',
      validator: v =>
        [
          'top-right',
          'top-left',
          'bottom-right',
          'bottom-left',
          'top-center',
          'bottom-center',
          'center-right',
          'center-left',
          'center-center'
        ].includes(v)
    },
    offset: {
      type: Array,
      validator: v => v.length === 2
    },
    expand: Boolean,
    // 层级
    zIndex: {
      type: Number,
      default: 1
    }
  },
  computed: {
    style() {
      const css = {}
      if (this.offset) {
        css.margin = `${this.offset[1]}px ${this.offset[0]}px`
      }

      css.zIndex = this.zIndex
      return css
    },
    classes() {
      return `${this.position}`
    }
  }
}
</script>

<style lang="less" scoped>
.mp-placement {
  position: absolute;
  &.top-left {
    top: 0;
    left: 0;
  }
  &.top-right {
    top: 0;
    right: 0;
  }
  &.bottom-left {
    bottom: 0;
    left: 0;
  }
  &.bottom-right {
    bottom: 0;
    right: 0;
  }
  &.center {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  &.top-center {
    left: 50%;
    top: 0;
    transform: translateX(-50%);
  }
  &.bottom-center {
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
  }
  &.center-left {
    left: 0;
    top: 50%;
    transform: translateY(-50%);
  }
  &.center-right {
    right: 0;
    top: 50%;
    transform: translateY(-50%);
  }
  &.center-center {
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
