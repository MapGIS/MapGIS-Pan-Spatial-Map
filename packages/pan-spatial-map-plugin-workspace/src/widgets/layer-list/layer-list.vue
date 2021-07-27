<template>
  <div class="mp-widget-layer-list">
    <div id="layerListEl">
      <template v-if="showWidget">
        <ul class="top-tab-nav">
          <li
            v-for="{ key, label } in tabs"
            :key="key"
            :class="[key === tab ? 'active-color' : '']"
            @click="tab = key"
          >
            {{ label }}
          </li>
        </ul>
        <tree-layer
          v-show="tab === 'tree'"
          :data-catalog="dataCatalog"
          :widgetInfo="widgetInfo"
        />
        <layer-opacity
          v-show="tab === 'opacity'"
          :data-catalog="dataCatalog"
          :layers="document.defaultMap.layers()"
        />
      </template>
      <a-empty v-else />
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch, Inject } from 'vue-property-decorator'
import { WidgetMixin, AppMixin } from '@mapgis/web-app-framework'
import treeLayer from './tree-layer'
import layerOpacity from './layer-opacity'
import { api, dataCatalogManagerInstance } from '@mapgis/pan-spatial-map-store'

@Component({
  name: 'MpLayerList',
  components: { treeLayer, layerOpacity }
})
export default class MpLayerList extends Mixins(WidgetMixin) {
  private tab = 'tree'

  private dataCatalog = null

  private tabs = [
    { key: 'tree', label: '图层树' },
    { key: 'opacity', label: '透明度' }
  ]

  /**
   * 视图窗口变化
   */
  private onWindowSize(mode: 'max' | 'normal') {
    this.$nextTick(() => {
      const layerListEl = document.getElementById('layerListEl')
      if (layerListEl) {
        layerListEl.style.width = `${
          mode === 'max' ? this.$el.clientWidth : 330
        }px`
      }
    })
  }

  get showWidget() {
    return (
      this.document &&
      this.document.defaultMap &&
      this.document.defaultMap.layers() &&
      this.document.defaultMap.layers().length > 0
    )
  }

  async mounted() {
    try {
      this.dataCatalog = await dataCatalogManagerInstance.getDataCatalogTreeData()
    } catch (error) {
      console.log(error)
    }
  }
}
</script>

<style lang="less">
.mp-widget-layer-list {
  flex: 1 1 0%;
  // min-height: 76px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  #layerListEl {
    width: 330px;
    max-width: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .top-tab-nav {
    border-bottom: 1px @border-color solid;
    flex-shrink: 0;
    list-style: none;
    display: flex;
    height: 28px;
    margin: 0;
    padding: 0;
    margin-bottom: 8px;
    li {
      height: 100%;
      padding: 0 5px;
      margin-right: 21px;
      border-bottom: 2px transparent solid;
      &:hover {
        color: @primary-color;
        cursor: pointer;
      }
    }
    .active-color {
      border-bottom-color: @primary-color;
    }
  }
}
.layer-list-popover {
  .ant-popover-inner {
    overflow: hidden;
    .ant-popover-inner-content {
      padding: 0;
      .ant-list-item {
        padding: 8px 25px;
        &:hover {
          background-color: @table-row-hover-bg;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
