<template>
  <div class="mp-map-widget-panel">
    <mp-map-widget-card
      v-for="widget in widgetsInPanel()"
      :key="widget.uri"
      :position="position"
      :styles="styles"
      :widget="widget"
      :visible="isWidgetVisible(widget)"
      @update:visible="updateWidgetVisible($event, widget)"
      @update-widget-state="$emit('update-widget-state', $event)"
      :z-index="isWidgetActive(widget) ? 2 : 1"
      @mousedown.native.capture="onPanelClick(widget)"
    />
  </div>
</template>

<script>
import { PanelMixin } from '../../mixins'
import MpMapWidgetCard from './MapWidgetCard.vue'
import WidgetManager from '../../managers/widget-manager'

export default {
  // 组件名称，统一以"Mp"开头
  name: 'MpMapWidgetPanel',
  components: { MpMapWidgetCard },
  mixins: [PanelMixin],
  methods: {
    onPanelClick(widget) {
      this.activateWidget(widget)
    }
  }
}
</script>

<style lang="less" scoped></style>
