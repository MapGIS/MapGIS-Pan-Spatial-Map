<template>
  <div :class="{ 'mp-toolbar-title': true, 'has-padding': hasPadding }">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'MpToolbarTitle',
  props: {
    hasPadding: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style lang="less" scoped>
.mp-toolbar-title {
  flex: 1 1 0%;
  min-width: 1px;
  max-width: 100%;
  font-weight: 400;
  color: @title-color;
  letter-spacing: 0.01em;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  &.has-padding {
    padding: 0 12px;
  }
}
</style>
