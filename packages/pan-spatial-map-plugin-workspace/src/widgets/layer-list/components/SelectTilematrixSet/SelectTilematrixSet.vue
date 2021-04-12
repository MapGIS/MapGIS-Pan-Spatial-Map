<template>
  <div class="select-tilematrixSet">
    <a-select v-model="tileMatrixSetId" style="width:100%">
      <a-select-option v-for="{ id } in tileMatrixSets" :key="id" :value="id">
        {{ id }}
      </a-select-option>
    </a-select>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import { LayerType, OGCWMTSLayer } from '@mapgis/web-app-framework'

@Component({
  name: 'MpSelectTilematrixSet',
  components: {}
})
export default class MpSelectTilematrixSet extends Vue {
  @Prop() layer!: OGCWMTSLayer

  private get tileMatrixSets() {
    if (this.layer && this.layer.activeLayer) {
      return this.layer.activeLayer.tileMatrixSets || []
    }
    return []
  }

  private get tileMatrixSetId() {
    if (this.layer && this.layer.activeLayer) {
      return this.layer.activeLayer.tileMatrixSetId || ''
    }
    return ''
  }

  private set tileMatrixSetId(val) {
    this.layer.activeLayer.tileMatrixSetId = val
    this.$emit('update:layer', this.layer)
  }
}
</script>

<style lang="scss" scoped>
.select-tilematrixSet {
  margin: 0.5em;
}
.top-02em {
  margin-top: 0.2em;
}
</style>
