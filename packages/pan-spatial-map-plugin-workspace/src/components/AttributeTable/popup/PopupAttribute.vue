<template>
  <div class="attribute-popup-content-wrapper">
    <a-list
      item-layout="horizontal"
      :data-source="propertyKeys"
      size="small"
      class="table-marker"
      bordered
    >
      <a-list-item
        slot="renderItem"
        slot-scope="item"
        class="table-marker-item"
        v-if="item !== 'images'"
      >
        <div :title="item">
          {{ item }}
        </div>
        <div :title="properties[item]">
          {{ properties[item] }}
        </div>
      </a-list-item>
    </a-list>
    <div class="iot-enclosure-title">附件</div>
    <ul class="iot-enclosure-container">
      <li title="非结构化文件">
        <mapgis-ui-iconfont
          @click="clickIot(101)"
          type="mapgis-feijiegouhuawenjian"
        ></mapgis-ui-iconfont>
      </li>
      <li title="传感器">
        <mapgis-ui-iconfont
          @click="clickIot(301)"
          type="mapgis-a-iotDevicechuanganqi"
        ></mapgis-ui-iconfont>
      </li>
    </ul>
    <a-modal
      v-model="showModal"
      :closable="false"
      :footer="null"
      :width="600"
      :centered="true"
      :bodyStyle="{ padding: '10px' }"
      :destroyOnClose="true"
    >
      <iot-detail :toType="toType" />
    </a-modal>
  </div>
</template>

<script>
import IotDetail from './IOTDetail.vue'

export default {
  components: { IotDetail },
  name: 'popup-attribute',
  props: {
    properties: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      showModal: false,
      // 目地实体ID列表
      toType: ''
    }
  },
  computed: {
    // 根据filedConfigs做一个过滤，去除不可见的
    propertyKeys() {
      const keys = Object.keys(this.properties)
      return keys
    }
  },
  methods: {
    clickIot(toType) {
      this.showModal = true
      this.toType = toType
    }
  }
}
</script>

<style lang="less" scoped>
.attribute-popup-content-wrapper {
  .table-marker {
    max-height: 130px;
    overflow: auto;
    margin-top: 10px;
    border-radius: 0;
    border-color: @border-color;
    .table-marker-item {
      display: flex;
      padding: 0;
      &:nth-child(2n) {
        background-color: @hover-bg-color;
      }
      div {
        padding: 2px 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 3px 6px;
        &:first-child {
          width: 120px;
          border-right: 1px solid @border-color;
        }
        &:last-child {
          flex: 1 0 0%;
        }
      }
    }
  }
  .iot-enclosure-title {
    font-size: 15px;
    color: @title-color;
    font-weight: bold;
    margin-top: 10px;
  }
  .iot-enclosure-container {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    li {
      margin: 0;
      padding: 0 5px;
      margin-right: 5px;
      &:hover {
        background-color: @shadow-color;
        cursor: pointer;
      }
    }
  }
}
</style>
