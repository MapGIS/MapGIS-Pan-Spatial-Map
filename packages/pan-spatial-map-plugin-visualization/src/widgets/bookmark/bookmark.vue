<template>
  <div class="mp-widget-bookmark">
    <a-tree
      v-if="treeData.length > 0"
      :tree-data="treeData"
      :defaultExpandAll="true"
      :showLine="true"
      :replaceFields="replaceFields"
    >
      <a-icon slot="switcherIcon" type="down" />
      <template #custom="item">
        <div v-if="item.children && item.children.length > 0">
          {{ item.name }}
        </div>
        <a-dropdown v-else :trigger="['contextmenu']">
          <div @click="onClickBookmark(item)">{{ item.name }}</div>
          <a-menu slot="overlay">
            <a-menu-item key="1" @click="onDeleteBookmark(item)">
              删除该项
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </template>
    </a-tree>
    <a-empty v-else :image="simpleImage" />
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { Empty } from 'ant-design-vue'
import { WidgetMixin, UUID } from '@mapgis/web-app-framework'
import { eventBus, events, api } from '@mapgis/pan-spatial-map-store'
import { TreeConfig } from './tree-config'

@Component({ name: 'MpBookmark' })
export default class MpBookmark extends Mixins(WidgetMixin) {
  private treeData: Array<Record<string, any>> = []

  private replaceFields: object = { title: 'name', key: 'guid' }

  private baseTreeData: Array<Record<string, any>> = null

  // 判断是否是批量添加
  private isBatAdd = false

  private nodeParentLevel: number[] = []

  beforeCreate() {
    this.simpleImage = Empty.PRESENTED_IMAGE_SIMPLE
  }

  mounted() {
    this.treeData = this.widgetInfo.config
    eventBus.$on(events.ADD_DATA_BOOKMARK_EVENT, this.onAddDataBookmark)
    eventBus.$on(
      events.ADD_ALL_SELECTED_DATA_BOOKMARK_EVENT,
      this.onAddAllSelectdDataBookmark
    )
  }

  private onAddDataBookmark(data, baseTreeData: Array<Record<string, any>>) {
    this.isBatAdd = false
    this.addToMark(data, baseTreeData)
  }

  private onAddAllSelectdDataBookmark(
    type: string,
    checkedKeys: string[],
    baseTreeData: Array<Record<string, any>>
  ) {
    this.isBatAdd = true
    this.baseTreeData = baseTreeData
    this.addAllSelectedToMark(type, checkedKeys, baseTreeData)
    this.saveBookmarks()
  }

  // 单击选中该项响应事件
  onClickBookmark(node) {
    eventBus.$emit(events.OPEN_DATA_BOOKMARK_EVENT, node)
  }

  // 右键删除该项响应事件
  onDeleteBookmark(node) {
    const index = this.treeData[0].children.findIndex(
      item =>
        item[TreeConfig.getInstance().config.GUID] ===
        node[TreeConfig.getInstance().config.GUID]
    )
    this.treeData[0].children.splice(index, 1)
    this.saveBookmarks()
  }

  // 遍历所勾选节点中所有的叶子节点
  private addAllSelectedToMark(type, checkedKeys, treeData) {
    treeData.forEach(item => {
      if (item.children && item.children.length > 0) {
        this.addAllSelectedToMark(type, checkedKeys, item.children)
      } else {
        if (checkedKeys.includes(item[TreeConfig.getInstance().config.GUID])) {
          this.addToMark({ params: item, type }, this.baseTreeData)
        }
      }
    })
  }

  // 添加到书签
  private addToMark(
    { params, type },
    baseTreeData: Array<Record<string, any>>
  ) {
    const this_ = this
    const labelArr = []
    const copyParams = JSON.parse(JSON.stringify(params))
    this.nodeParentLevel = []

    this.baseTreeData = baseTreeData
    if (params.pos) {
      this.getParentLevel(params)
    } else {
      this.getParentLevel2(params, baseTreeData, [])
    }

    if (this.nodeParentLevel.length > 0) {
      this.getNodeLabel(baseTreeData, 0, labelArr)
    }
    const treeNodeLabel = labelArr.join(' ')
    copyParams.name = treeNodeLabel

    if (this.treeData.some(item => item.name === type)) {
      const childrenArr = this.treeData[0].children
      if (
        childrenArr.some(
          item =>
            item[TreeConfig.getInstance().config.GUID] ===
            params[TreeConfig.getInstance().config.GUID]
        )
      ) {
        const index = childrenArr.find(
          item =>
            item[TreeConfig.getInstance().config.GUID] ===
            params[TreeConfig.getInstance().config.GUID]
        )
        this.$confirm({
          title: '提示',
          content: `已收藏 ${copyParams.name}, 是否要覆盖之前的收藏?`,
          onOk() {
            this_.$set(childrenArr, index, copyParams)
            this_.showMessage()
          },
          onCancel() {}
        })
      } else {
        this.treeData[0].children.push(copyParams)
        this.showMessage()
      }
    } else {
      this.treeData.push({
        name: type,
        guid: UUID.uuid(),
        children: [copyParams]
      })
      this.showMessage()
    }
    if (!this.isBatAdd) {
      this.saveBookmarks()
    }
  }

  // 添加书签成功后提示信息
  private showMessage() {
    this.$message.config({
      top: '100px',
      duration: 1,
      maxCount: 3
    })
    this.$message.success({
      content: '收藏成功，通过书签功能查看'
    })
  }

  // 串联该节点所在层级的label(去除首层节点的label)
  private getNodeLabel(node, index, labelArr) {
    if (index >= 1) {
      labelArr.push(node[this.nodeParentLevel[index]].name)
    }
    if (
      node[this.nodeParentLevel[index]].children &&
      node[this.nodeParentLevel[index]].children.length > 0
    ) {
      index++
      this.getNodeLabel(
        node[this.nodeParentLevel[index - 1]].children,
        index,
        labelArr
      )
    }
  }

  // 获取该节点在目录树中的层级(节点中有pos属性)
  private getParentLevel(node: Record<string, any>) {
    this.nodeParentLevel = node.pos
      .split('-')
      .slice(1)
      .map(item => +item)
  }

  // 获取该节点在目录树中的层级(节点中无pos属性)
  private getParentLevel2(
    params: Record<string, any>,
    baseTreeData: Record<string, any>,
    arr: number[]
  ) {
    for (let i = 0; i < baseTreeData.length; i++) {
      const newArr = JSON.parse(JSON.stringify(arr))
      const item = baseTreeData[i]
      newArr.push(i)
      if (item.children && item.children.length > 0) {
        this.getParentLevel2(params, item.children, newArr)
      } else if (
        item[TreeConfig.getInstance().config.GUID] ===
        params[TreeConfig.getInstance().config.GUID]
      ) {
        this.nodeParentLevel = newArr
      }
    }
  }

  private saveBookmarks() {
    api
      .saveWidgetConfig({
        name: 'Bookmark',
        config: JSON.stringify(this.treeData)
      })
      .catch(() => {
        this.$message.config({
          top: '100px',
          duration: 1,
          maxCount: 3
        })
        this.$message.error('配置文件更新失败')
      })
  }
}
</script>

<style lang="less" scoped>
.mp-widget-bookmark {
  /deep/ .ant-tree > li {
    &:last-child {
      padding-bottom: 0;
    }
    &:first-child {
      padding-top: 0;
    }
  }
  /deep/ .ant-empty-normal {
    margin: 8px 0;
  }
}
</style>
