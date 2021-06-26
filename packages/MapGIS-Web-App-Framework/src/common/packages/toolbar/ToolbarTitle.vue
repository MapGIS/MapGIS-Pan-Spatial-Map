<template>
  <div class="mp-toolbar-title">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'MpToolbarTitle'
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
}
</style>
