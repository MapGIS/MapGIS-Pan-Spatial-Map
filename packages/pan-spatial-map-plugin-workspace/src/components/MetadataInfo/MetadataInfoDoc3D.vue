<template>
  <div>
    <a-tabs default-active-key="general" size="small">
      <a-tab-pane key="general" tab="基本信息">
        <div class="info-body">
          <div
            v-for="(item, index) in generalInfo"
            :key="'地图文档' + item + index"
            class="info-item"
          >
            <span class="info-item-title" :title="item">{{ `${item}：` }}</span>
            <span>{{ metadata[item] }}</span>
          </div>
        </div>
      </a-tab-pane>
      <a-tab-pane key="maplist" tab="三维场景">
        <a-tabs type="card" size="small">
          <a-tab-pane
            v-for="(mapInfo, m) in metadata['三维场景']"
            :key="'三维场景' + m"
            :tab="mapInfo['场景名称']"
          >
            <div class="info-body">
              <div
                v-for="(mapInfoItem, mi) in Object.keys(mapInfo)"
                :key="'三维场景图层列表' + mapInfoItem + mi"
                class="info-item"
              >
                <template v-if="mapInfoItem !== '图层列表'">
                  <span class="info-item-title" :title="mapInfoItem">
                    {{ `${mapInfoItem}：` }}
                  </span>
                  <span>{{ mapInfo[mapInfoItem] }}</span>
                </template>
                <template v-else>
                  <div class="layers-3d">
                    <div
                      class="info-item-title layers-3d-title"
                      :title="mapInfoItem"
                    >
                      {{ `${mapInfoItem}：` }}
                    </div>
                    <a-table
                      bordered
                      size="small"
                      :pagination="false"
                      :data-source="getDataSource(mapInfo[mapInfoItem])"
                      :columns="getTableColumns(mapInfo[mapInfoItem][0])"
                      :scroll="{
                        x: '100%'
                      }"
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

@Component({ name: 'MpMetadataInfoDoc3D', components: {} })
export default class MpMetadataInfoDoc3D extends Mixins(MetadataInfoMixin) {
  private get generalInfo() {
    return Object.keys(this.metadata).filter(item => {
      return item !== '三维场景'
    })
  }
}
</script>

<style lang="less">
.metadata-info-container {
  .layers-3d {
    display: flex;
    flex-direction: column;
    max-width: 100%;
    .layers-3d-title {
      padding-bottom: 8px;
    }
  }
}
</style>
