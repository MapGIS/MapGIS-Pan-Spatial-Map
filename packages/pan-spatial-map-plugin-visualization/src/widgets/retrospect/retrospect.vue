<template>
  <div class="mp-widget-retrospect">专题回溯</div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpRetrospect' })
export default class MpRetrospect extends Mixins(WidgetMixin) {}
</script>

<style lang="less" scoped></style>
