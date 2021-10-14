<template>
  <a-card class="symbol-container">
    <a-card-grid
      v-for="item in symbols"
      :key="item.Name"
      class="symbol-item"
      @click="toggle(item.SymbolNo)"
    >
      <img
        class="img-style"
        :src="`data:image/png;base64,${item.SymbolData}`"
      />
      <p>{{ item.Name }}</p>
    </a-card-grid>
  </a-card>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'

import { Catalog } from '@mapgis/web-app-framework'

@Component({
  name: 'MpSymbol',
  components: {}
})
export default class MpSymbol extends Vue {
  @Prop(Object) readonly queryParams!: Record<string, any>

  private symbols: Record<string, any> = {}

  mounted() {
    this.changeParams()
  }

  @Watch('queryParams', { deep: true })
  async changeParams() {
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
    const libName = await Catalog.SystemLibraryCatalog.getSystemLibraryNameByGuid(
      {
        ip,
        port,
        sysLibraryGuid
      }
    )
    const res = await Catalog.SystemLibraryCatalog.getSymbols({
      ip,
      port,
      systemLibName: libName,
      geomType
    })
    this.symbols = res.Data
  }

  toggle(symbolNo) {
    this.$emit('symbolNo', symbolNo)
  }
}
</script>

<style lang="less" scoped>
.symbol-container {
  width: 100%;
  height: 100%;
  overflow-y: scroll;
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
  .symbol-item {
    width: 33.33%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    padding: 10px 3px;
    p {
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
      padding: 0 3px;
      text-align: center;
    }

    &:hover {
      cursor: pointer;
    }
  }
}
</style>
