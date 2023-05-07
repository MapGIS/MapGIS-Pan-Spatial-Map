<template>
  <div class="variable-icon-wrapper">
    <i v-if="isSvg" class="icon" v-html="icon" :style="styleObject"> </i>
    <img v-else :style="styleObject" :src="icon" fit="contain" />
  </div>
</template>

<script>
export default {
  name: 'VariableIcon',
  props: {
    icon: { type: String, required: true },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 }
  },
  computed: {
    isSvg() {
      if (this.icon && this.icon.indexOf('<svg') >= 0) {
        return true
      }

      return false
    },
    styleObject() {
      const realStyleObject = {}
      if (this.width) {
        realStyleObject.width = this.width + 'px'
      }
      if (this.height) {
        realStyleObject.height = this.height + 'px'
      }
      return realStyleObject
    }
  }
}
</script>

<style lang="less" scoped>
.variable-icon-wrapper {
  display: flex;
  justify-content: center;
  .icon {
    display: flex;
    fill: currentColor;
    align-items: center;
    > svg {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
