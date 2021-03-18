<template>
  <div class="mp-content-widget-panel">
    <mp-content-widget-card
      v-for="widget in widgetsInPanel()"
      :key="widget.uri"
      :position="position"
      :styles="styles"
      :widget="widget"
      :visible="isWidgetVisible(widget)"
      @update:visible="updateWidgetVisible($event, widget)"
      :z-index="isWidgetActive(widget) ? 2 : 1"
      @mousedown.native.capture="onPanelClick(widget)"
    />
  </div>
</template>

<script>
import { PanelMixin } from '../../mixins'
import MpContentWidgetCard from './ContentWidgetCard.vue'
import WidgetManager from '../../managers/widget-manager'

export default {
  // 组件名称，统一以"Mp"开头
  name: 'MpContentWidgetPanel',
  components: { MpContentWidgetCard },
  mixins: [PanelMixin],
  methods: {
    onPanelClick(widget) {
      this.activateWidget(widget)
    }
  }
}
</script>

<style lang="less" scoped></style>
