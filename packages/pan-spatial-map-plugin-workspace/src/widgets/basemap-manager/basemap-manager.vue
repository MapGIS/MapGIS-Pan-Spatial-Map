<template>
  <a-checkbox-group v-model="layerNames" style="width:100%">
    <ul class="mp-widget-basemap-manager">
      <li
        v-for="(item, index) in mapData"
        class="image-container"
        :key="item.name"
        :style="setMargin(index)"
      >
        <div class="image-header">
          <!-- <img :src="baseUrl + item.image" /> -->
          <img :src="setUrl(item.image)" />
          <a-popover>
            <template slot="content">
              <span>
                {{ item.name }}
              </span>
            </template>
            <p class="img-description">
              <a-checkbox :value="item.name"> </a-checkbox>
              <span class="img-title">{{ item.name }}</span>
            </p>
          </a-popover>
        </div>
      </li>
    </ul>
  </a-checkbox-group>
</template>

<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import baseMapUtil from './base-map-util'

@Component({ name: 'MpBasemapManager' })
export default class MpBasemapManager extends Mixins(WidgetMixin, baseMapUtil) {
  private get mapData() {
    return this.config.filter(config => {
      const { scene, visible } = config
      if (this.is2DMapMode) {
        return (scene === '2D' || scene === '23D') && visible === 'true'
      }
      return (scene === '3D' || scene === '23D') && visible === 'true'
    })
  }

  setUrl(url: string) {
    if (url.startsWith('http')) {
      return url
    }
    return this.baseUrl + url
  }

  setMargin(index) {
    const isMarginTop = index / 2 >= 1
    if (index % 2 === 0) {
      return {
        width: 'calc(50% - 5px)',
        marginRight: '10px',
        marginTop: isMarginTop ? '10px' : 0
      }
    }
    return {
      width: 'calc(50% - 5px)',
      marginRigh: '10px',
      marginTop: isMarginTop ? '10px' : 0
    }
  }
}
</script>

<style lang="less" scoped>
.mp-widget-basemap-manager {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  &,
  li {
    padding: 0;
    margin: 0;
    list-style: none;
    .image-header {
      position: relative;
      width: 100%;
      height: 0;
      padding-top: 80%; /*相对于这个盒子的宽度设置的，为保证图片比例，其值=width * 80%*/
      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      .img-description {
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 0 6px;
        height: 35px;
        line-height: 35px;
        text-align: center;
        margin-bottom: 0px;
        background-color: rgba(0, 0, 0, 0.3);
        color: white;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        .img-title {
          margin-left: 5px;
        }
      }
    }
  }
}
</style>
