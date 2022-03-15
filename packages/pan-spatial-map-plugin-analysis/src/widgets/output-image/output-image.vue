<template>
  <div class="mp-widget-output-image">
    <mapgis-3d-output-image />
  </div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({
  name: 'MpOutputImage'
})
export default class MpOutputImage extends Mixins(WidgetMixin) {}
</script>
