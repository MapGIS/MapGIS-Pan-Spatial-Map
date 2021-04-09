<template>
  <q-card-section class="symbol-container row items-start">
    <div
      v-for="item in symbols"
      :key="item.Name"
      class="col-4 q-pa-xs column items-center cursor-pointer symbol-item"
      @click="toggle(item.SymbolNo)"
    >
      <img
        class="img-style"
        :src="`data:image/png;base64,${item.SymbolData}`"
      />
      <span>{{ item.Name }}</span>
    </div>
  </q-card-section>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import {
  queryFeaturesInstance,
  igsFeatureModifyInstance
} from '@mapgis/pan-spatial-map-store'
const { IDocument, Layer } = require('@mapgis/webclient-store')
const { LayerType, SubLayerType } = Layer

@Component({
  name: 'MpSymbol',
  components: {}
})
export default class MpSymbol extends Vue {
  @Prop(Object) readonly queryParams!: Record<string, any>

  private symbols: Record<string, any> = {}

  mounted() {
    console.log(this.queryParams)
    this.changeParams()
  }

  @Watch('queryParams', { deep: true })
  async changeParams() {
    console.log(this.queryParams)
    if (Object.keys(this.queryParams).length < 1) {
      return
    }
    const { ip, port, sysLibraryGuid } = this.queryParams
    let { geomType } = this.queryParams
    if (geomType.indexOf('Reg') >= 0) {
      geomType = 'GeomReg'
    } else if (geomType.indexOf('Lin') >= 0) {
      geomType = 'GeomLin'
    } else if (geomType.indexOf('Pnt') >= 0) {
      geomType = 'GeomPnt'
    }
    const libName = await igsFeatureModifyInstance.getSystemlibrarieNameByGuid({
      ip,
      port,
      sysLibraryGuid
    })
    console.log(libName)
    const res = await igsFeatureModifyInstance.getSymbols({
      ip,
      port,
      systemLibName: libName,
      geomType
    })
    console.log(res)
    this.symbols = res.Data
  }

  toggle(symbolNo) {
    this.$emit('symbolNo', symbolNo)
  }
}
</script>

<style lang="scss" scoped>
.symbol {
  margin: 0.5em;
}
.table {
  margin-right: 2em;
  height: 11em;
}
.top-02em {
  margin-top: 0.2em;
}
.img-style {
  width: 30px;
  height: 30px;
  margin: 5px;
}
.symbol-item:hover {
  border: 1px solid #dcdcdc;
  border-radius: 2px;
  box-shadow: 1px 1px 1px 1px #999999;
}
</style>
