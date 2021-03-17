<template>
  <div class="mp-widget-scene-roaming">场景漫游</div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpSceneRoaming' })
export default class MpSceneRoaming extends Mixins(WidgetMixin) {}
</script>

<style lang="less" scoped></style>
