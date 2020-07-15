<template>
  <q-card-section class="relative-position">
    <q-tree
      :nodes="baseTreeData"
      node-key="id"
      label-key="label"
      selected-color="primary"
      tick-strategy="leaf"
      no-nodes-label=" "
      :duration="10"
      :ticked.sync="ticked"
      @update:ticked="handTicked"
      v-show="!loading"
    >
      <template v-slot:default-header="item">
        <span :key="item.node.id">{{ item.node.label }}</span>
      </template>
    </q-tree>
    <q-inner-loading :showing="loading">
      <q-spinner color="primary" size="5em" />
    </q-inner-loading>
  </q-card-section>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import {
  dataCatalogInstance,
  MapDocumentMixin
} from '@mapgis/pan-spatial-map-store'

const { IDocument } = require('@mapgis/webclient-store')

@Component({ name: 'MpDataCatalog' })
export default class MpDataCatalog extends Mixins(MapDocumentMixin) {
  private dataCatalog = dataCatalogInstance

  private ticked: string[] = []

  private selected: string[] = []

  private oldTicked: string[] = []

  private baseTreeData: any = []

  private loading = false

  mounted() {
    this.loading = true
    this.dataCatalog.init().then(async () => {
      this.baseTreeData = await this.dataCatalog.getBaseTreeData()
      this.loading = false
    })
  }

  async handTicked(ticks: string[]) {
    this.ticked = ticks
    this.dataCatalog.checkedLayerIds = this.ticked
    let diffTicked
    if (this.oldTicked && this.oldTicked.length > 0) {
      diffTicked = this.dataCatalog.getTickedDiff(ticks, this.oldTicked)
    }
    const doc = IDocument.clone(this.document)

    if (diffTicked && diffTicked.length > 0) {
      const diffTickedLayers: any[] = await this.dataCatalog.getLayersByIds(
        diffTicked
      )
      if (!diffTickedLayers) {
        return
      }
      for (let i = 0; i < diffTickedLayers.length; i += 1) {
        const diffTickedLayer = diffTickedLayers[i]
        const existLayers = doc.getLayersById(diffTickedLayer.id)
        if (existLayers && existLayers.length > 0) {
          doc.deleteLayer(diffTickedLayer.id)
        } else {
          doc.addLayerInGroup(diffTickedLayer)
        }
      }
    } else {
      const checkedLayers: any[] = await this.dataCatalog.getLayersByIds(ticks)
      if (!checkedLayers) {
        return
      }
      for (let i = 0; i < checkedLayers.length; i += 1) {
        const existLayers = doc.getLayersById(checkedLayers[i].id)
        if (!existLayers || existLayers.length === 0) {
          doc.addLayerInGroup(checkedLayers[i])
        }
      }
    }
    this.document = doc
    this.oldTicked = this.ticked
  }
}
</script>

<style lang="scss" scoped></style>
