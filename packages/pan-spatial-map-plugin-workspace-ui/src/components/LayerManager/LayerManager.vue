<template>
  <q-card-section>
    <q-tree
      :nodes="layers"
      node-key="id"
      label-key="title"
      tick-strategy="leaf"
      selected-color="primary"
      no-nodes-label=" "
      :ticked="ticked"
      @update:ticked="handTicked"
    >
    </q-tree>
  </q-card-section>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'

import { MapDocumentMixin } from '@mapgis/pan-spatial-map-store'

const { IDocument } = require('@mapgis/webclient-store')

@Component({ name: 'MpLayerManager' })
export default class MpLayerManager extends Mixins(MapDocumentMixin) {
  ticked = []

  layers = []

  mounted() {
    this.init()
  }

  @Watch('document', { deep: true, immediate: true })
  parseDocument() {
    this.init()
  }

  handTicked(ticks) {
    const doc = IDocument.clone(this.document)
    doc.checkVisibleLayers(ticks)
    this.document = doc
    this.ticked = ticks
  }

  init() {
    if (!this.document) {
      return
    }
    const doc = IDocument.clone(this.document)
    this.parseTicked(doc)
    this.layers = doc.layers
  }

  parseTicked(doc) {
    const ticks = doc.getCheckedLayers()
    this.ticked = ticks
  }
}
</script>

<style lang="scss"></style>
