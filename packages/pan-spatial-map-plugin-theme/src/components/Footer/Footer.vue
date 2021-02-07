<template>
  <div>Footer</div>
</template>

<script>
import { ThemeContentMixin } from '@mapgis/web-app-framework'

export default {
  name: 'MpPanSpatialMapFooter',
  mixins: [ThemeContentMixin],
  props: { maxFooterHeight: Number },
  data() {
    return {}
  },
  watch: {},
  methods: {}
}
</script>

<style lang="less" scoped></style>
