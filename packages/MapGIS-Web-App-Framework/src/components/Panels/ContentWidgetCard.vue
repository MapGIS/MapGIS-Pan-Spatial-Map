<template>
  <mp-window
    v-bind="propObject"
    :title="widgetInfo.label"
    :icon="widgetInfo.icon"
    :is-full-screen="widgetInfo.properties.windowSize === 'max'"
    :z-index="zIndex"
    :visible="visible"
    @update:visible="onUpdateVisible"
    @resize="onResize"
    @window-size="onWindowSize"
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
  name: 'MpContentWidgetCard',
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
  data() {
    return {}
  },
  computed: {
    propObject() {
      return { ...this.position, ...this.styles }
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
