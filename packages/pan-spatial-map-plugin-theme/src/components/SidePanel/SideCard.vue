<template>
  <mp-pan-spatial-map-side-window
    ref="sideWindow"
    :title="widgetInfo.label"
    :icon="widgetInfo.icon"
    :is-full-screen="widgetInfo.properties.windowSize === 'max'"
    :visible="visible"
    @update:visible="onUpdateVisible"
  >
    <template>
      <component :is="widget.manifest.component" :widget="widget" />
    </template>
  </mp-pan-spatial-map-side-window>
</template>

<script>
import { WidgetInfoMixin } from '@mapgis/web-app-framework'
import MpPanSpatialMapSideWindow from './SideWindow.vue'

export default {
  name: 'MpPanSpatialMapSideCard',
  components: { MpPanSpatialMapSideWindow },
  mixins: [WidgetInfoMixin],
  props: {
    visible: { type: Boolean, default: true }
  },
  data() {
    return {}
  },
  computed: {},
  watch: {},
  methods: {
    onUpdateVisible(value) {
      this.$emit('update:visible', value)
    }
  }
}
</script>

<style lang="less" scoped></style>
