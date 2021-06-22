<template>
  <mp-placement
    :position="widgetInfo.position.anchor"
    :offset="[
      widgetInfo.position.horizontalOffset,
      widgetInfo.position.verticalOffset
    ]"
  >
    <template v-if="!widget.manifest">
      <mp-map-widget-placeholder :widget="widget" />
    </template>
    <div v-else-if="widget.manifest.properties.inPanel">
      <mp-map-widget-icon :widget="widget" />
    </div>
    <div v-else>
      <component :is="widget.manifest.component" :widget="widget" />
    </div>
  </mp-placement>
</template>

<script>
import { WidgetInfoMixin } from '../../mixins'
import MpPlacement from '../../../common/packages/placement/Placement.vue'
import MpMapWidgetIcon from './MapWidgetIcon.vue'
import MpMapWidgetPlaceholder from './MapWidgetPlaceholder.vue'

export default {
  name: 'MpMapWidgetIndicator',
  components: {
    MpPlacement,
    MpMapWidgetIcon,
    MpMapWidgetPlaceholder
  },
  mixins: [WidgetInfoMixin]
}
</script>

<style lang="less" scoped></style>
