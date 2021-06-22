<template>
  <mp-button
    :label="widgetInfo.label"
    :icon="widgetInfo.icon"
    @click="onClick"
  />
</template>

<script>
import MpButton from '../../../common/packages/button/Button.vue'
import { WidgetInfoMixin } from '../../mixins'
import WidgetManager from '../../managers/widget-manager'

export default {
  // 组件名称，统一以"Mp"开头
  name: 'MpMapWidgetIcon',
  components: { MpButton },
  mixins: [WidgetInfoMixin],
  methods: {
    onClick() {
      WidgetManager.getInstance().triggerWidgetOpen(this.widget)
    }
  }
}
</script>

<style lang="less" scoped></style>
