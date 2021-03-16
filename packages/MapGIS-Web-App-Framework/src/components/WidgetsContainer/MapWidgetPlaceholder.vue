<template>
  <div v-if="designTime" class="mp-map-widget-placeholder"></div>
</template>

<script>
import { WidgetInfoMixin } from '../../mixins'

export default {
  // 组件名称，统一以"Mp"开头
  name: 'MpMapWidgetPlaceholder',
  mixins: [WidgetInfoMixin]
}
</script>

<style lang="less" scoped>
.mp-map-widget-placeholder {
  width: 32px;
  height: 32px;
  cursor: default;
  background: @base-bg-color;
  opacity: 0.5;
  box-shadow: 0px 1px 2px 0px @shadow-color;
  border: 1px dashed @border-color;
  &:hover {
    border: 1px dashed @primary-color;
  }
}
</style>
