<template>
  <div class="card-command" @click="$emit('click')">
    <mp-icon :icon="widgetInfo.icon" class="icon" />
    <div class="label">{{ widgetInfo.label }}</div>
  </div>
</template>

<script>
import { WidgetInfoMixin } from '@mapgis/web-app-framework'

export default {
  name: 'MpPanSpatialMapToolbarCard',
  mixins: [WidgetInfoMixin]
}
</script>

<style lang="less" scoped>
.card-command {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 0;
  cursor: pointer;
  &:hover {
    color: @primary-color;
  }
  .icon {
    font-size: 16px;
  }
  .label {
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
