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
  display: flex;
  align-items: center;
  height: 32px;
  cursor: pointer;
  &:hover {
    color: @primary-color;
  }
  .icon {
    font-size: 16px;
    margin-right: 8px;
    height: 16px;
  }
  .label {
    font-size: 12px;
  }
}
</style>
