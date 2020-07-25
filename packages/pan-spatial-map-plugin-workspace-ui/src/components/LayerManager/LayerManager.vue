<template>
  <q-card-section>
    <q-tree
      :nodes="layers"
      node-key="nodeKey"
      label-key="title"
      tick-strategy="leaf"
      selected-color="primary"
      no-nodes-label=" "
      :ticked="ticked"
      @update:ticked="handTicked"
      @lazy-load="handleLazyLoad"
    >
      <template v-slot:default-header="item">
        <div class="row items-center full-width">
          <span v-if="isGroup(item)" class="col" :key="item.id">
            {{ item.node.title }}
          </span>
          <span v-else :key="item.node.id" class="col">
            {{ item.node.title }}
          </span>
          <q-btn flat dense round @click.stop>
            <q-icon name="more_vert">
              <q-menu auto-close fit :offset="[0, 10]">
                <q-list dense style="min-width: 100px">
                  <q-item
                    clickable
                    v-ripple
                    v-if="isSubLayer(item)"
                    @click="showAttributes(item)"
                  >
                    <q-item-section>查看属性</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-icon>
          </q-btn>
        </div>
      </template>
    </q-tree>
  </q-card-section>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'

import {
  MapDocumentMixin,
  ResultSetMixin,
  systemConfigInstance,
  IResultSetCategory
} from '@mapgis/pan-spatial-map-store'

import { UUID } from '@mapgis/webclient-store/src/utils'

const { IDocument, Layer } = require('@mapgis/webclient-store')

const { LayerType, IgsLayerType, IgsDocLayer } = Layer

@Component({ name: 'MpLayerManager' })
export default class MpLayerManager extends Mixins(
  MapDocumentMixin,
  ResultSetMixin
) {
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

    // 将nodekey转成id
    const flatsLayers = doc.getFlatLayers()
    const visibleLayerIds = flatsLayers
      .filter(layer => {
        return ticks.includes(layer.nodeKey)
      })
      .map(layer => {
        return layer.id
      })
    doc.checkVisibleLayers(visibleLayerIds)
    this.document = doc
    this.ticked = ticks
  }

  init() {
    if (!this.document) {
      return
    }
    const doc = IDocument.clone(this.document)
    doc.layers.map(l => {
      if (
        l.subtype === IgsLayerType.IgsDocLayer ||
        l.subtype === IgsLayerType.IgsWmsLayer
      ) {
        l.lazy = true
      }

      if (!l.nodeKey) {
        l.nodeKey = UUID.uuid()
      }
      return l
    })
    this.layers = doc.layers

    this.parseTicked(doc)
  }

  parseTicked(doc) {
    const visibleLayerIds = doc.getCheckedLayers()

    // 将id转成nodekey
    const flatsLayers = doc.getFlatLayers()
    const visibleLayerNodeKeys = flatsLayers
      .filter(layer => {
        return visibleLayerIds.includes(layer.id)
      })
      .map(layer => {
        return layer.nodeKey
      })

    this.ticked = visibleLayerNodeKeys
  }

  isGroup(item) {
    return item.node.type === LayerType.GroupLayer
  }

  isSubLayer(item) {
    return item.node.sublayer === LayerType.UnKnow
  }

  handleLazyLoad(event) {
    let l = event.node
    const self = this
    if (l.subtype === IgsLayerType.IgsDocLayer) {
      const doclayer = new IgsDocLayer()
      doclayer.parseLayer(l)
      l = { ...l, ...doclayer }
      const mapdoc = new window.Zondy.Catalog.MapDoc({
        ip: l.ip,
        port: l.port,
        docName: l.serverName
      })
      mapdoc.getLayersInfo(
        res => {
          const doc = IDocument.clone(self.document)
          doc.changeLayerProp(l.id, 'children', [])
          const children = res.value.map((child, index) => {
            const layer = {
              name: child.Name,
              title: child.Name,
              id: child.Name,
              nodeKey: UUID.uuid(),
              key: l.id + child.Name,
              type: LayerType.UnKnow,
              sublayer: LayerType.UnKnow,
              serverName: l.serverName,
              layerIndex: index.toString()
            }
            doc.addLayerInGroup(layer, l.id)
            return layer
          })
          const newticks = children.map(child => child.nodeKey)
          self.ticked = self.ticked.concat(newticks)
          event.done(children)
        },
        error => {
          console.log(error)
        }
      )
    } else if (l.subtype === IgsLayerType.IgsWmsLayer) {
      const wmsInfo = new window.Zondy.OGC.OGCWMSInfo({
        ip: l.ip,
        port: l.port,
        serverName: l.serverName,
        serverType: l.serverType,
        version: '1.1.1'
      })
      wmsInfo.getWMSInfo(
        res => {
          const parser = new window.Zondy.Format.WMSCapabilities()
          const result = parser.read(res.data)
          const layers = result.Capability.Layer.Layer
          const doc = IDocument.clone(self.document)
          doc.changeLayerProp(l.id, 'children', [])
          const children = layers.map((child, index) => {
            const layer = {
              name: child.Name,
              title: child.Name,
              id: child.Name,
              nodeKey: UUID.uuid(),
              key: l.id + child.Name,
              type: LayerType.UnKnow,
              sublayer: LayerType.UnKnow,
              serverName: l.serverName,
              layerIndex: index.toString()
            }
            doc.addLayerInGroup(layer, l.id)
            return layer
          })
          const newticks = children.map(child => child.nodeKey)
          self.ticked = self.ticked.concat(newticks)
          event.done(children)
        },
        error => {
          console.log(error)
        }
      )
    }
  }

  showAttributes({ node: layer }) {
    let category = this.categories.find(x => x.id === layer.id)
    if (!category) {
      const categoryInfo: IResultSetCategory = {
        id: layer.id,
        ip: layer.ip || systemConfigInstance.config.ip,
        port: Number(layer.port || systemConfigInstance.config.port),
        label: `${layer.name}-属性表`,
        docName: layer.serverName,
        tables: [
          {
            label: layer.name!,
            layerIndex: layer.layerIndex
          }
        ]
      }

      category = this.addCategory(categoryInfo)
      this.currentCategoryId = category.id
    }
  }
}
</script>

<style lang="scss"></style>
