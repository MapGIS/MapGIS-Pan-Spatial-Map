<template>
  <div>
    <a-tabs default-active-key="general" size="small">
      <a-tab-pane key="general" tab="基本信息">
        <div class="info-body">
          <div
            v-for="(item, index) in generalInfo"
            :key="'VectorTitle' + item + index"
            class="info-item"
          >
            <span class="info-item-title" :title="item">{{ `${item}：` }}</span>
            <span>{{ metadata[item] }}</span>
          </div>
        </div>
      </a-tab-pane>
      <a-tab-pane key="layers" tab="图层信息">
        <div class="info-body">
          <div class="levels">
            <div class="info-item-title levels-title">
              图层信息：
            </div>
            <a-table
              bordered
              size="small"
              :scroll="{
                x: '100%'
              }"
              :data-source="getDataSource(metadata.layers)"
              :columns="getTableColumns(metadata.layers[0])"
              :rowKey="
                (record, index) => {
                  return index
                }
              "
            >
            </a-table>
          </div>
        </div>
      </a-tab-pane>
      <a-tab-pane key="sources" tab="sources">
        <a-tabs type="card" size="small">
          <a-tab-pane
            v-for="key in sourcesOtherInfo"
            :key="'sources' + key"
            :tab="key"
          >
            <div class="info-body">
              <div
                v-for="(subValue, subKey) in sourcesInfo[key]"
                :key="subValue + key + subKey"
                class="info-item"
              >
                <span class="info-item-title" :title="subKey">
                  {{ `${subKey}：` }}
                </span>
                <span>{{ subValue }}</span>
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Mixins } from 'vue-property-decorator'
import {
  LayerType,
  IGSMapImageLayer,
  IGSVectorLayer,
  IGSTileLayer,
  Layer
} from '@mapgis/web-app-framework'
import MetadataInfoMixin from './mixins/metadata-info'

@Component({ name: 'MpMetadataInfoVectorTitle', components: {} })
export default class MpMetadataInfoVectorTitle extends Mixins(
  MetadataInfoMixin
) {
  arr = ['layers', 'sources', 'metadata']

  private get generalInfo() {
    return Object.keys(this.metadata).filter(item => {
      return !this.arr.includes(item)
    })
  }

  private get layers() {
    return Object.keys(this.metadata.layers)
  }

  private get tileStorageInfo() {
    return this.metadata.tileInfo
  }

  private get sourcesInfo() {
    return this.metadata.sources || {}
  }

  private get sourcesOtherInfo() {
    return Object.keys(this.sourcesInfo)
  }
}
</script>

<style lang="less">
.metadata-info-container {
  .levels {
    display: flex;
    flex-direction: column;
    max-width: 100%;
    .levels-title {
      padding-bottom: 8px;
    }
  }
}
</style>
