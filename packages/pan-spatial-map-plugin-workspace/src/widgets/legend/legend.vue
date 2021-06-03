<template>
  <div class="mp-widget-legend">
    <MpWindowWrapper :visible="visible">
      <template v-slot:default="slotProps">
        <MpWindow
          anchor="top-right"
          title="图例"
          :visible.sync="visible"
          :horizontalOffset="10"
          :verticalOffset="235"
          :fullScreenAction="false"
          :shrinkAction="false"
          :width="270"
          :height="390"
          v-bind="slotProps"
        >
          <template>
            <div v-for="(item, index) in data" :key="index">
              <div>{{ item.name }}</div>
              <img class="contain-img" :src="item.imgUrl" alt="" />
            </div>
          </template>
        </MpWindow>
      </template>
    </MpWindowWrapper>
    <mp-map-widget-button :widget="widget" @click="onClickWidget" />
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import {
  dataCatalogManagerInstance,
  eventBus,
  api,
  envInstance
} from '@mapgis/pan-spatial-map-store'

@Component({ name: 'MpLegend' })
export default class MpLegend extends Mixins(WidgetMixin) {
  // 图例微件的显隐
  private visible = false

  private dataCatalog = dataCatalogManagerInstance

  // 目录树数据
  private treeData = []

  // 被勾选的目录树数据
  private checkedTreeData = []

  // 被勾选的目录树节点key
  private checkedNodesKeys = []

  // 图例数据
  private data = []

  async created() {
    const treeConfig = await api.getWidgetConfig('data-catalog')
    this.dataCatalog.init(treeConfig)
    this.treeData = await this.dataCatalog.getDataCatalogTreeData()
    eventBus.$on('uploader-success', this.onGetConfig)
    eventBus.$on('emitCheckedNodeKeys', this.onCheckedKeysChange)
    this.$message.config({
      top: '100px',
      duration: 2,
      maxCount: 1
    })
  }

  beforeDestroy() {
    eventBus.$off('uploader-success')
    eventBus.$off('emitCheckedNodeKeys')
  }

  // 微件点击事件回调
  private onClickWidget() {
    this.visible = !this.visible
    if (this.visible && this.data.length === 0) {
      this.$message.warning(
        '未勾选专题或未配置专题图例，可在后台配置或右键专题节点上传图例'
      )
    }
  }

  // 获取被选中的树节点数据(仅包含叶子节点)
  private getCheckNodeData(treeData) {
    treeData.forEach(item => {
      if (item.children && item.children.length > 0) {
        this.getCheckNodeData(item.children)
      } else {
        if (this.checkedNodesKeys.includes(item.guid)) {
          this.checkedTreeData.push(item)
        }
      }
    })
  }

  // 监听上传图例成功事件回调
  onGetConfig() {
    this.initData()
  }

  // 监听目录树勾选节点变化时回调事件
  onCheckedKeysChange(keys) {
    this.checkedNodesKeys = keys
    this.initData()
  }

  // 初始化图例数据
  private async initData() {
    const newConfig = await api.getWidgetConfig('legend')
    this.checkedTreeData = []
    this.getCheckNodeData(this.treeData)
    this.data = this.checkedTreeData
      .reduce((result, item) => {
        if (Object.keys(newConfig).includes(item.name)) {
          result.push(item)
        }
        return result
      }, [])
      .map(item => {
        this.$set(item, 'imgUrl', `${this.baseUrl}${newConfig[item.name]}`)
        return item
      })
  }
}
</script>

<style lang="less" scoped>
.mp-widget-legend {
  margin-bottom: 8px;
}

.contain-img {
  width: 246px;
  height: 246px;
  object-fit: contain;
  background: rgba(128, 128, 128, 0.2);
}
</style>
