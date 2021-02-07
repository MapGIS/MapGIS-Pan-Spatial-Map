<template>
  <div>{{ widgetInfo.label }}</div>
</template>

<script>
import { WidgetInfoMixin } from '../../mixins'

export default {
  // 组件名称，统一以"Mp"开头
  name: 'MpContentWidgetButton',
  mixins: [WidgetInfoMixin]
}
</script>

<style lang="less" scoped></style>
