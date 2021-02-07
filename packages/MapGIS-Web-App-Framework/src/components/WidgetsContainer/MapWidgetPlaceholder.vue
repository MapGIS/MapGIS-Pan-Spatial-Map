<template>
  <div></div>
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
  width: 40px;
  height: 40px;
  cursor: default;
  background-color: #000000;
  opacity: 0.5;
  border: 1px dashed #a0acbf;
}
</style>
