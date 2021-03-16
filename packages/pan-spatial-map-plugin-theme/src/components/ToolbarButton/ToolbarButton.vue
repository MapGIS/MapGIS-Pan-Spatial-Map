<template>
  <div class="command" @click="$emit('click')">
    <mp-icon :icon="widgetInfo.icon" class="icon" />
    <span class="label">{{ widgetInfo.label }}</span>
  </div>
</template>

<script>
import { WidgetInfoMixin } from '@mapgis/web-app-framework'

export default {
  name: 'MpPanSpatialMapToolbarButton',
  mixins: [WidgetInfoMixin]
}
</script>

<style lang="less" scoped>
.command {
  display: inline-block;
  text-align: center;
  cursor: pointer;
  &:hover {
    color: @primary-color;
  }
  .icon {
    font-size: 16px;
    margin-right: 8px;
  }
  .label {
    font-size: 12px;
    vertical-align: 0.1em;
  }
}
</style>
