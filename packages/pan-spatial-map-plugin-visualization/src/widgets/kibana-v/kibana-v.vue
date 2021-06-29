<template>
  <div class="mp-widget-kibana-v">
    <div class="kibana-v-panel">
      <div class="panel-item" v-for="(item, index) in configData" :key="index">
        <img :src="item.imgUrl" alt="" @click="onView(item)" />
        <div class="item-label" @click="onView(item)">{{ item.title }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpKibanaV' })
export default class MpKibanaV extends Mixins(WidgetMixin) {
  private configData = []

  onOpen() {
    this.configData = this.widgetInfo.config
    this.configData.forEach(item => {
      const imgSuffix = item.imgLink.split('/')[4]
      item.imgUrl = `${this.baseUrl}/upload/${imgSuffix}`
    })
  }

  // 点击触发预览
  private onView(item) {
    window.open(item.htmlLink)
  }
}
</script>

<style lang="less" scoped>
.mp-widget-kibana-v {
  width: 100%;
  height: 100%;

  .kibana-v-panel {
    width: 100%;
    height: 100%;
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;

    .panel-item {
      display: flex;
      flex-direction: column;
      width: 20%;
      height: 43%;
      padding: 20px;

      img {
        border: 1px solid #dcdcdc;
        flex-grow: 1;
        object-fit: cover;
        cursor: pointer;
      }

      .item-label {
        border: 1px solid #dcdcdc;
        font-size: 12px;
        padding: 2px 10px;
        cursor: pointer;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .item-label:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
