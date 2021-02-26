<template>
  <a-layout-footer class="footer-wrap" style="padding: 0">
    <mp-attribute-table :max-view-height="maxFooterHeight" :init-open="true" />
  </a-layout-footer>
</template>

<script>
import { ThemeContentMixin } from '@mapgis/web-app-framework'
import MpAttributeTable from '../AttributeTable/AttributeTable.vue'

export default {
  name: 'MpPanSpatialMapFooter',
  components: { MpAttributeTable },
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
