<template>
  <div class="mp-side-widget-panel">
    <div :style="{ display: 'inline-block', width: `${stuffWidth}px` }"></div>
    <mp-pan-spatial-map-side-card
      v-for="widget in widgetsInPanel('content')"
      :key="widget.uri"
      :ref="widget.id"
      :widget="widget"
      :max-width="maxWidth"
      :visible="isWidgetVisible(widget, 'content')"
      @update:visible="updateWidgetVisible($event, widget)"
      :class="{ active: isWidgetActive(widget) }"
      @mousedown.native.capture="onPanelClick(widget)"
    />
  </div>
</template>

<script>
import { WidgetManager, PanelMixin } from '@mapgis/web-app-framework'
import MpPanSpatialMapSideCard from './SideCard.vue'

export default {
  // 组件名称，统一以"Mp"开头
  name: 'MpPanSpatialMapSidePanel',
  components: { MpPanSpatialMapSideCard },
  mixins: [PanelMixin],
  props: {
    maxWidth: { type: [Number, Function] }
  },
  computed: {
    stuffWidth() {
      const visibleWidget = this.widgets.find(widget =>
        this.isWidgetVisible(widget, 'content')
      )

      if (visibleWidget) {
        return this.$refs[visibleWidget.id][0].$refs.sideWindow.currentWidth
      }

      return 0
    }
  },
  methods: {
    onPanelClick(widget) {
      this.activateWidget(widget)
    }
  }
}
</script>

<style lang="less" scoped>
.mp-side-widget-panel {
  position: relative;
}
</style>
