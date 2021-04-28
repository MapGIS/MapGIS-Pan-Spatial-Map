<template>
  <mp-window
    v-bind="propObject"
    :title="widgetInfo.label"
    :icon="widgetInfo.icon"
    :shrink-action="false"
    :full-screen-action="false"
    :z-index="zIndex"
    :visible="visible"
    @update:visible="onUpdateVisible"
    @resize="onResize"
    @window-size="onWindowSize"
    drag-range
  >
    <template>
      <component
        :ref="widgetInfo.id"
        :is="widget.manifest.component"
        :widget="widget"
        @update-widget-state="$emit('update-widget-state', $event)"
      />
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
    styles: {
      type: Object
    },
    visible: { type: Boolean, default: true },
    // 层级
    zIndex: { type: Number, default: 1 }
  },
  computed: {
    propObject() {
      const position = { ...this.widgetInfo.position }

      position.verticalOffset += 42

      return { ...position, ...this.styles }
    }
  },
  watch: {},
  methods: {
    onUpdateVisible(value) {
      this.$emit('update:visible', value)
    },
    onResize(payload) {
      if (this.$refs[this.widgetInfo.id]) {
        this.$refs[this.widgetInfo.id].onResize(payload)
      }
    },
    onWindowSize(mode) {
      if (this.$refs[this.widgetInfo.id]) {
        this.$refs[this.widgetInfo.id].onWindowSize(mode)
      }
    }
  }
}
</script>

<style lang="less" scoped></style>
