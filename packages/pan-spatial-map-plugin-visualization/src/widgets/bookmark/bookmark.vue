<template>
  <div class="mp-widget-bookmark">书签</div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpBookmark' })
export default class MpBookmark extends Mixins(WidgetMixin) {}
</script>

<style lang="less" scoped></style>
