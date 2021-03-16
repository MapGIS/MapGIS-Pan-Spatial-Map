<template>
  <mp-button
    :label="widgetInfo.label"
    :icon="widgetInfo.icon"
    @click="onClick"
  />
</template>

<script>
import MpButton from '../Button/Button.vue'
import { WidgetInfoMixin } from '../../mixins'
import WidgetManager from '../../managers/widget-manager'
import WidgetState from '../../utils/widget-state'

export default {
  // 组件名称，统一以"Mp"开头
  name: 'MpMapWidgetButton',
  components: { MpButton },
  mixins: [WidgetInfoMixin],
  created() {
    // 非面板微件的初始状态为OPENED
    this.widget.state = WidgetState.OPENED
  },
  methods: {
    onClick() {
      WidgetManager.getInstance().activateWidget(this.widget)

      this.$emit('click')
    }
  }
}
</script>

<style lang="less" scoped></style>
