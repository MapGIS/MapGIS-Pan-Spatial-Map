<template>
  <div>
    <mp-marker-pro
      v-for="marker in markers"
      :key="marker.markerId"
      :marker="marker"
      :field-configs="fieldConfigs"
      @mouseenter="mouseEnterEvent"
      @mouseleave="mouseLeaveEvent"
    >
      <template slot="popup" slot-scope="slotProps">
        <slot name="popup" v-bind="slotProps"></slot>
      </template>
    </mp-marker-pro>
  </div>
</template>

<script lang="ts">
import MpMarkerPro from './MarkerPro.vue'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { IFields } from '@mapgis/pan-spatial-map-store'

@Component({
  name: 'MpMarkerSetPro',
  components: { MpMarkerPro }
})
export default class MpMarkerSetPro extends Vue {
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

  private prePopup: any = undefined

  private mouseEnterEvent(e: any, id) {
    if (this.prePopup && this.prePopup.isOpen()) {
      this.prePopup.remove()
    }
    e.marker.togglePopup()
    this.prePopup = e.marker.getPopup()

    this.$emit('mouseenter', e, id)
  }

  private mouseLeaveEvent(e: any, id) {
    this.$emit('mouseleave', e, id)
  }
}
</script>
<style lang="less" scoped></style>
