<template>
  <div class="command" @click="$emit('click')">
    <mp-icon :icon="widgetInfo.icon" class="icon" />
    <span>{{ widgetInfo.label }}</span>
  </div>
</template>

<script>
import { WidgetInfoMixin } from '@mapgis/web-app-framework'
import MpIcon from '../Icon/Icon.vue'

export default {
  name: 'MpPanSpatialMapToolbarButton',
  components: { MpIcon },
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
}
</style>
