<template>
  <div>
    <a-tabs default-active-key="general" size="small">
      <a-tab-pane key="general" tab="基本信息">
        <div class="info-body">
          <div
            v-for="(item, index) in generalInfo"
            :key="'瓦片' + item + index"
            class="info-item"
          >
            <span class="info-item-title" :title="item">{{ `${item}：` }}</span>
            <span>{{ metadata[item] }}</span>
          </div>
        </div>
      </a-tab-pane>
      <a-tab-pane key="storage" tab="瓦片存储信息">
        <div class="info-body">
          <div
            v-for="(storageInfoItem, si) in Object.keys(tileStorageInfo)"
            :key="'瓦片存储' + storageInfoItem + si"
            class="info-item"
          >
            <template v-if="storageInfoItem !== '瓦片各级信息'">
              <span class="info-item-title" :title="storageInfoItem">
                {{ `${storageInfoItem}：` }}
              </span>
              <span>{{ tileStorageInfo[storageInfoItem] }}</span>
            </template>
            <template v-else>
              <div class="levels">
                <div
                  class="info-item-title levels-title"
                  :title="storageInfoItem"
                >
                  各级信息：
                </div>
                <a-table
                  bordered
                  size="small"
                  :scroll="{
                    x: '100%'
                  }"
                  :pagination="false"
                  :data-source="getDataSource(tileStorageInfo[storageInfoItem])"
                  :columns="
                    getTableColumns(tileStorageInfo[storageInfoItem][0])
                  "
                  :rowKey="
                    (record, index) => {
                      return index
                    }
                  "
                >
                </a-table>
              </div>
            </template>
          </div>
        </div>
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

@Component({ name: 'MpMetadataInfoTile', components: {} })
export default class MpMetadataInfoTile extends Mixins(MetadataInfoMixin) {
  private get generalInfo() {
    return Object.keys(this.metadata).filter(item => {
      return item !== '瓦片存储信息'
    })
  }

  private get tileStorageInfo() {
    return this.metadata['瓦片存储信息'] || {}
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
