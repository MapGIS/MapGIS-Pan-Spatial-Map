<template>
  <div class="mp-widget-kibana-v">KibanaV</div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpKibanaV' })
export default class MpKibanaV extends Mixins(WidgetMixin) {}
</script>

<style lang="less" scoped></style>
