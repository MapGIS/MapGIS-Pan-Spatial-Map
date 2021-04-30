<template>
  <a-layout-footer class="footer-wrapper" style="padding: 0;background: none">
    <mp-exhibition-panel :max-view-height="maxViewHeight" />
  </a-layout-footer>
</template>

<script>
import { ThemeContentMixin } from '@mapgis/web-app-framework'
import MpExhibitionPanel from '../ExhibitionPanel/ExhibitionPanel.vue'

export default {
  name: 'MpPanSpatialMapFooter',
  components: { MpExhibitionPanel },
  mixins: [ThemeContentMixin],
  props: { maxViewHeight: Number }
}
</script>

<style lang="less" scoped>
.footer-wrapper {
  z-index: 500;
}
</style>
