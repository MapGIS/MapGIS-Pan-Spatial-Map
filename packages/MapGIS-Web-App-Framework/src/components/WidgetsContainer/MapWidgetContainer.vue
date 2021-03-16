<template>
  <mp-placement
    :position="widgetInfo.position.anchor"
    :offset="[
      widgetInfo.position.horizontalOffset,
      widgetInfo.position.verticalOffset
    ]"
  >
    <template v-if="!widget.manifest">
      <map-widget-placeholder :widget="widget" />
    </template>
    <div v-else-if="widget.manifest.properties.inPanel">
      <map-widget-icon :widget="widget" />
    </div>
    <div v-else>
      <component :is="widget.manifest.component" :widget="widget" />
    </div>
  </mp-placement>
</template>

<script>
import { WidgetInfoMixin } from '../../mixins'
import MapWidgetIcon from './MapWidgetIcon.vue'
import MapWidgetPlaceholder from './MapWidgetPlaceholder.vue'

export default {
  name: 'MpMapWidgetContainer',
  components: { MapWidgetIcon, MapWidgetPlaceholder },
  mixins: [WidgetInfoMixin]
}
</script>

<style lang="less" scoped></style>
