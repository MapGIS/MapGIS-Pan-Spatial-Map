<template>
  <div class="source-target">
    <mp-row-flex label="服务地址" label-align="right">
      <!-- <a-textarea v-model="url" auto-size> </a-textarea> -->
      <a-input placeholder="请按示例输入地址">
        <a-tooltip slot="suffix" title="服务选择">
          <a-icon type="plus-circle" @click="onShowSeverSelectDrawer" />
        </a-tooltip>
      </a-input>
    </mp-row-flex>
    <mp-row-flex
      v-for="{ label, content } in examples"
      :key="label"
      :label="label"
      align="top"
      label-align="right"
      class="source-target-example"
    >
      {{ content }}
    </mp-row-flex>
    <a-drawer
      title="服务选择"
      placement="right"
      :closable="false"
      :visible="showDrawer"
    >
      目录树
    </a-drawer>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { UrlUtil } from '@mapgis/web-app-framework'
// import OnlineData from './components/OnlineData.vue'
// import LocalData from './components/LocalData.vue'

@Component
export default class SourceTarget extends Vue {
  // 数据选择弹框
  showDrawer = false

  // 数据地址
  url = ''

  // 示例
  examples = [
    {
      label: ' 示例1',
      content: 'http://<server>:<port>/igs/rest/mrms/layers?gdbps={gdbps}'
    },
    {
      label: '示例2',
      content:
        'http://<server>:<port>/igs/rest/mrms/docs/{docName}?layerName={layerName}&layerIdxs={layerIdxs}'
    }
  ]

  get dropdownStyle() {
    return {
      maxWidth: '200px',
      maxHeight: '400px',
      overflow: 'auto'
    }
  }

  get replaceFields() {
    return {
      children: 'children',
      title: 'name',
      value: 'guid'
    }
  }

  onShowSeverSelectDrawer() {
    this.showDrawer = true
  }

  // onAdd() {
  //   if (!UrlUtil.isUrlValid(this.url)) {
  //     this.$message.warn('请输入正确的数据服务地址')
  //     return
  //   }
  // }

  created() {}
}
</script>
<style lang="less" scoped>
.source-target-example {
  word-break: break-all;
  white-space: normal;
  font-size: 12px;
  color: @text-color-secondary;
  margin-bottom: 4px !important;
}
</style>
