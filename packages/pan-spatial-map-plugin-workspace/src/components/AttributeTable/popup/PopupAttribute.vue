<template>
  <div class="attribute-popup-content-wrapper">
    <mapgis-ui-list
      item-layout="horizontal"
      :data-source="propertyKeys"
      size="small"
      class="table-marker"
      bordered
    >
      <mapgis-ui-list-item
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
      </mapgis-ui-list-item>
    </mapgis-ui-list>
    <!-- 如果存在实体编码entityCode字段，则暂时附件按钮 -->
    <template v-if="entityCode">
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
    </template>

    <mapgis-ui-modal
      v-model="showModal"
      :footer="null"
      :width="600"
      :centered="true"
      class="attribute-model"
      :bodyStyle="{ padding: '30px 10px 10px' }"
      :destroyOnClose="true"
    >
      <iot-detail v-if="entityCode" :toType="toType" :entityCode="entityCode" />
    </mapgis-ui-modal>
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
      const keys = []
      for (const key in this.properties) {
        // 不展示关联的实体编码
        if (key !== 'entityCode') {
          keys.push(key)
        }
      }
      return keys
    },
    /**
     * 获取实体编码，实体编码存在的时候，展示预览界面
     */
    entityCode() {
      return this.properties.entityCode
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

<style lang="less">
.attribute-model {
  .mapgis-ui-modal-close-x {
    width: 30px;
    height: 30px;
    line-height: 30px;
  }
}
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
