<template>
  <div class="select-tilematrixSet">
    <a-select v-model="selectId" style="width:100%">
      <a-select-option v-for="{ title, id } in Sublayers" :key="id" :value="id">
        {{ title }}
      </a-select-option>
    </a-select>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop, Emit } from 'vue-property-decorator'
import {
  LayerType,
  OGCWMTSLayer,
  WMTSSublayer
} from '@mapgis/web-app-framework'

@Component({
  name: 'MpChangeActiveLayer',
  components: {}
})
export default class MpChangeActiveLayer extends Vue {
  @Prop() layer!: OGCWMTSLayer

  private get selectId(): string {
    return this.layer.activeLayer.id
  }

  private set selectId(id: string) {
    const layer: WMTSSublayer = this.Sublayers.find(
      (item: WMTSSublayer) => item.id === id
    )
    this.layer.activeLayer = layer
    this.$emit('update:layer', this.layer)
  }

  private get Sublayers(): Array<WMTSSublayer> {
    return this.layer.sublayers
  }
}
</script>

<style lang="less" scoped>
.select-tilematrixSet {
  margin: 0.5em;
}
.top-02em {
  margin-top: 0.2em;
}
</style>
