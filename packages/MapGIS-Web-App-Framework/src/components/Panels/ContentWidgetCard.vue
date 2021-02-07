<template>
  <mp-window
    v-bind="position"
    :theme-style="themeStyle"
    :title="widgetInfo.label"
    :icon="widgetInfo.icon"
    :is-full-screen="widgetInfo.properties.windowSize === 'max'"
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
    visible: { type: Boolean, default: true }
  },
  data() {
    return {}
  },
  computed: {},
  watch: {},
  methods: {
    updateVisible(value) {
      this.$emit('update:visible', value)
    }
  }
}
</script>

<style lang="less" scoped></style>
