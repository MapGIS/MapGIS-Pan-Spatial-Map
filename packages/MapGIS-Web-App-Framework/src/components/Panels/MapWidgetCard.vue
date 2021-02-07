<template>
  <mp-window
    v-bind="normalizePosition"
    :theme-style="themeStyle"
    :title="widgetInfo.label"
    :icon="widgetInfo.icon"
    :shrinkAction="false"
    :fullScreenAction="false"
    :visible="visible"
    @update:visible="updateVisible"
    drag-range
  >
    <template>
      <component :is="widget.manifest.component" :widget="widget" />
    </template>
  </mp-window>
</template>

<script>
import { WidgetInfoMixin } from '../../mixins'

export default {
  name: 'MpMapWidgetCard',
  mixins: [WidgetInfoMixin],
  props: {
    position: {
      type: Object
    },
    visible: { type: Boolean, default: true }
  },
  computed: {
    width() {
      return (this.position && this.position.width) || 400
    },
    height() {
      return (this.position && this.position.height) || 410
    },
    normalizePosition() {
      const position = {
        ...this.widgetInfo.position,
        width: this.width,
        height: this.height
      }

      position.verticalOffset += 43

      return position
    }
  },
  watch: {},
  methods: {
    updateVisible(value) {
      this.$emit('update:visible', value)
    }
  }
}
</script>

<style lang="less" scoped></style>
