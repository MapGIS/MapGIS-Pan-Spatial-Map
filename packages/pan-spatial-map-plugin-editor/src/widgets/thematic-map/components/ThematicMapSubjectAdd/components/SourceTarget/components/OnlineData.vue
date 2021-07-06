<template>
  <div class="online-data">
    <mp-row-flex label="数据选择">
      <a-tree
        :tree-data="onlineTreeData"
        :replace-fields="{ key: 'id' }"
        @select="onOnlineTreeDataSelect"
      />
    </mp-row-flex>
    <mp-row-flex label="数据类型">
      <a-select v-model="onlineSourceType">
        <a-select-option value="doc">地图文档</a-select-option>
        <a-select-option value="gdbp">矢量图层</a-select-option>
      </a-select>
    </mp-row-flex>
    <template v-if="onlineSourceType === 'doc'">
      <mp-row-flex label="服务名称">
        <a-select v-model="serverName" :options="serverNameList" />
      </mp-row-flex>
      <mp-row-flex label="服务图层">
        <a-select v-model="serverLayer" :options="serverLayerList" />
      </mp-row-flex>
    </template>
    <mp-row-flex label="服务地址" v-if="onlineSourceType === 'gdbp'">
      {{ gdbpUrl }}
    </mp-row-flex>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class OnlineData extends Vue {
  // 数据选择
  onlineTreeData = []

  // 数据类型
  onlineSourceType = ''

  // doc服务名称
  serverName = ''

  serverNameList = []

  // doc服务图层
  serverLayer = ''

  serverLayerList = []

  // gdbp服务地址
  gdbpUrl = ''

  onOnlineTreeDataSelect() {}
}
</script>
<style lang="less" scoped></style>
