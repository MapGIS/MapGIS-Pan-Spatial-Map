<template>
  <div class="mp-rotate">
    <mapgis-3d-rotate
    @loaded='loaded'/>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({
  name: 'MpRotate'
})
export default class MpRotate extends Mixins(WidgetMixin) {

  private rotate = undefined

  loaded(e){
    this.rotate = e;
  }

}

</script>

<style scoped>
.mp-rotate {
  width: 300px;
  max-width: 100%;
  margin: 0px 5px 5px 5px;
}
</style>
