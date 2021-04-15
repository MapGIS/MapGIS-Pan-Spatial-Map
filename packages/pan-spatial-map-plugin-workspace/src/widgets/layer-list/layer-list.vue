<template>
  <div class="mp-widget-layer-list">
    <a-tabs v-model="tab">
      <a-tab-pane key="tree" tab="图层树">
        <tree-layer :widgetInfo="widgetInfo" />
      </a-tab-pane>
      <a-tab-pane key="opacity" tab="透明度">
        <layer-opacity :layers="document.defaultMap.layers()" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch, Inject } from 'vue-property-decorator'
import { WidgetMixin, AppMixin } from '@mapgis/web-app-framework'
import treeLayer from './tree-layer'
import layerOpacity from './layer-opacity'

@Component({
  name: 'MpLayerList',
  components: { treeLayer, layerOpacity }
})
export default class MpLayerList extends Mixins(WidgetMixin) {
  private tab = 'tree'
}
</script>

<style lang="less">
@import '~ant-design-vue/lib/style/themes/default.less';
.mp-widget-layer-list {
  width: 100%;
  height: 100%;
  overflow: hidden;
  .ant-tabs {
    width: 100%;
    height: 100%;
    .ant-tabs-nav {
      .ant-tabs-tab {
        padding-top: 0px;
      }
    }
    .ant-tabs-content {
      height: calc(~'100% - 60px');
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
