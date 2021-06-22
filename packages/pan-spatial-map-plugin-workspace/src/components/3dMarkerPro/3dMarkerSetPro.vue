<template>
  <div>
    <mp-3d-marker-pro
      v-for="marker in markers"
      :key="marker.markerId"
      :marker="marker"
      :current-marker-id="currentMarkerId"
      :field-configs="fieldConfigs"
      @marker-id="updateCurrentMarkerId"
      @mouseenter="mouseEnterEvent"
      @mouseleave="mouseLeaveEvent"
      @change="changePopup"
    >
      <template slot="popup" slot-scope="slotProps">
        <slot name="popup" v-bind="slotProps"></slot>
      </template>
    </mp-3d-marker-pro>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { IFields } from '@mapgis/pan-spatial-map-store'
import Mp3dMarkerPro from './3dMarkerPro.vue'

@Component({
  name: 'Mp3dMarkerSetPro',
  components: { Mp3dMarkerPro }
})
export default class Mp3dMarkerSetPro extends Vue {
  @Prop({
    type: Array,
    required: true
  })
  readonly markers!: Record<string, any>[]

  @Prop({
    type: Array,
    required: false,
    default: () => []
  })
  readonly fieldConfigs!: IFields[]

  private currentMarkerId = ''

  private updateCurrentMarkerId(id: string) {
    this.currentMarkerId = id
  }

  private mouseEnterEvent(e, id) {
    this.$emit('mouseenter', e, id)
  }

  private mouseLeaveEvent(e, id) {
    this.$emit('mouseleave', e, id)
  }

  changePopup(val) {
    this.currentMarkerId = val
  }
}
</script>
<style lang="scss" scoped></style>
