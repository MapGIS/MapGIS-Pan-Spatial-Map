<template>
  <div class="mp-side-widget-panel">
    <mp-pan-spatial-map-side-card
      v-for="widget in widgetsInPanel('content')"
      :key="widget.uri"
      :widget="widget"
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
  methods: {
    onPanelClick(widget) {
      console.log('panel click')
      this.activateWidget(widget)
    }
  }
}
</script>

<style lang="less" scoped></style>
