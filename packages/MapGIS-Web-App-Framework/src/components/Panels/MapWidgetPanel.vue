<template>
  <div class="mp-map-widget-panel">
    <mp-map-widget-card
      v-for="widget in widgetsInPanel()"
      :key="widget.uri"
      :position="position"
      :widget="widget"
      :visible="isWidgetVisible(widget)"
      @update:visible="updateWidgetVisible($event, widget)"
      :class="{ active: isWidgetActive(widget) }"
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
      console.log('panel click')
      this.activateWidget(widget)
    }
  }
}
</script>

<style lang="less" scoped>
.mp-map-widget-panel {
  .active {
    z-index: 1;
  }
}
</style>
