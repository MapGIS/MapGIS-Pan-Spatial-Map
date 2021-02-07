<template>
  <div>{{ widgetInfo.label }}</div>
</template>

<script>
import { WidgetInfoMixin } from '../../mixins'
import WidgetManager from '../../managers/widget-manager'
import WidgetState from '../../utils/widget-state'

export default {
  // 组件名称，统一以"Mp"开头
  name: 'MpMapWidgetButton',
  mixins: [WidgetInfoMixin],
  created() {
    // 非面板微件的初始状态为OPENED
    this.widget.state = WidgetState.OPENED
  },
  methods: {
    onClickWidget() {
      WidgetManager.getInstance().activateWidget(this.widget)

      this.$emit('click')
    }
  }
}
</script>

<style lang="less" scoped>
.mp-map-widget-button {
  width: 30px;
  height: 30px;
  border-radius: 2px;
  background-color: #555;
  font-size: 10px;
  font-weight: normal;
}

.q-btn--dense .q-btn__wrapper {
  padding: 0;
  min-height: 0;
}
</style>
