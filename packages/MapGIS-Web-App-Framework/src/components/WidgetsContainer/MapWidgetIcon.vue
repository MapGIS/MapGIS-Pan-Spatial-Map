<template>
  <div>{{ widgetInfo.label }}</div>
</template>

<script>
import { WidgetInfoMixin } from '../../mixins'
import WidgetState from '../../utils/widget-state'
import WidgetManager from '../../managers/widget-manager'

export default {
  // 组件名称，统一以"Mp"开头
  name: 'MpMapWidgetIcon',
  mixins: [WidgetInfoMixin],
  methods: {
    onClick() {
      WidgetManager.getInstance().triggerWidgetOpen(this.widget)
    }
  }
}
</script>

<style lang="less" scoped>
.mp-map-widget-icon {
  width: 40px;
  height: 40px;
  cursor: pointer;
  background-color: #555;
}
</style>
