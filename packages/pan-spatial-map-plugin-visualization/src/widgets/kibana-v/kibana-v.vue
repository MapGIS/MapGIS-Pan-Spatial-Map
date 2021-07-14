<template>
  <div class="mp-widget-kibana-v">
    <a-list
      v-if="config.length"
      :grid="{ gutter: 24, xl: 4, lg: 3, md: 3, sm: 2, xs: 1 }"
      style="margin: 0 -8px"
    >
      <a-list-item
        v-for="(item, index) in config"
        :key="index"
        style="padding: 0 8px"
      >
        <a-card class="kibana-v-card" hoverable @click="onView(item)">
          <div slot="cover" class="img-box">
            <img :src="item.image" :alt="item.title" />
          </div>
          <a-card-meta>
            <div slot="title" :title="item.title">
              {{ item.title }}
            </div>
          </a-card-meta>
        </a-card>
      </a-list-item>
    </a-list>
    <div class="empty-box" v-else><a-empty /></div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpKibanaV' })
export default class MpKibanaV extends Mixins(WidgetMixin) {
  get config() {
    return this.widgetInfo.config.map(item => {
      return {
        title: item.title,
        link: item.link,
        image: `${this.baseUrl}${item.image}`
      }
    })
  }

  // 点击触发预览
  private onView(item) {
    window.open(item.link)
  }
}
</script>

<style lang="less" scoped>
.mp-widget-kibana-v {
  width: 100%;
  height: 100%;
  padding: 4px;
  .kibana-v-card {
    /deep/.ant-card-body {
      padding: 12px;
    }
    .img-box {
      position: relative;
      height: 0;
      padding-bottom: 60%;
      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    }
    &:hover {
      /deep/.ant-card-meta-title {
        color: @primary-color;
      }
    }
  }
  .empty-box {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
