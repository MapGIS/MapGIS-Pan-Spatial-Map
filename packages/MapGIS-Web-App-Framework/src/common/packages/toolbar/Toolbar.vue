<template>
  <div
    :class="{
      'mp-toolbar': true,
      sm: size === 'small',
      bordered: bordered
    }"
  >
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'MpToolbar',
  props: {
    size: {
      type: String,
      default: 'default'
    },
    bordered: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style lang="less" scoped>
.mp-toolbar {
  display: flex;
  align-items: center;
  height: 32px;
  &.bordered {
    border-top: 1px solid @item-active-bg;
    border-bottom: 1px solid @item-active-bg;
  }
  &.sm {
    height: 28px;
  }
}
</style>
