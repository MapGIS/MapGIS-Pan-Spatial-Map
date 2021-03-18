<template>
  <mp-window
    v-bind="propObject"
    :title="widgetInfo.label"
    :icon="widgetInfo.icon"
    :is-full-screen="widgetInfo.properties.windowSize === 'max'"
    :z-index="zIndex"
    :visible="visible"
    @update:visible="updateVisible"
  >
    <template>
      <component :is="widget.manifest.component" :widget="widget" />
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
    updateVisible(value) {
      this.$emit('update:visible', value)
    }
  }
}
</script>

<style lang="less" scoped></style>
