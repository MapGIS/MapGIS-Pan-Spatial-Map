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
      <a-tab-pane key="maplist" tab="地图列表">
        <a-tabs type="card" size="small">
          <a-tab-pane
            v-for="(mapInfo, m) in metadata['地图列表']"
            :key="'地图文档地图列表' + m"
            :tab="mapInfo.MapName"
          >
            <div class="info-body">
              <div
                v-for="(mapInfoItem, mi) in getJsonTag(mapInfo)"
                :key="'地图文档地图列表图层列表' + mapInfoItem + mi"
                class="info-item"
              >
                <template v-if="mapInfoItem !== '图层列表'">
                  <span class="info-item-title" :title="mapInfoItem">
                    {{ `${mapInfoItem}：` }}
                  </span>
                  <span>{{ mapInfo[mapInfoItem] }}</span>
                </template>
                <template v-else>
                  <div class="layers">
                    <div
                      class="info-item-title layers-title"
                      :title="mapInfoItem"
                    >
                      {{ `${mapInfoItem}：` }}
                    </div>
                    <a-table
                      bordered
                      size="small"
                      :pagination="false"
                      :data-source="mapInfo[mapInfoItem]"
                      :columns="getTableColumns(mapInfo[mapInfoItem][0])"
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

@Component({ name: 'MpMetadataInfoDoc', components: {} })
export default class MpMetadataInfoDoc extends Mixins(MetadataInfoMixin) {
  private get generalInfo() {
    return this.getJsonTag(this.metadata).filter(item => {
      return item !== '地图列表'
    })
  }
}
</script>

<style lang="less">
.metadata-info-container {
  .layers {
    display: flex;
    flex-direction: column;
    .layers-title {
      padding-bottom: 8px;
    }
  }
}
</style>
