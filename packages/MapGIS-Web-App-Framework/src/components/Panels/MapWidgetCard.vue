<template>
  <mp-window
    v-bind="normalizePosition"
    :title="widgetInfo.label"
    :icon="widgetInfo.icon"
    :shrink-action="false"
    :full-screen-action="false"
    :z-index="zIndex"
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
    visible: { type: Boolean, default: true },
    // 层级
    zIndex: { type: Number, default: 1 }
  },
  computed: {
    normalizePosition() {
      const position = { ...this.widgetInfo.position }

      position.verticalOffset += 42

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
