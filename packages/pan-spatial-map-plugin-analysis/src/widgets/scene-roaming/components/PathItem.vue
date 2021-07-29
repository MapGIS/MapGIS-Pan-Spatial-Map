<template>
  <a-card class="path-item" type="inner">
    <div class="path-content">
      <template v-if="editable">
        <a-input
          v-if="editable"
          class="name-input"
          :value="path.name"
          @change="e => onNameChange(e.target.value)"
        />
        <a @click="onSavePathName">保存</a>
        <a-divider class="name-action-divider" type="vertical" />
        <a @click="onCancelRenamePath">取消</a>
      </template>
      <template v-else>
        <div class="name" @click="$emit('goto-path')">
          {{ path.name }}
        </div>
        <div :class="['actions', actionMenuVisible ? 'actions-visible' : '']">
          <a-icon type="info-circle" :title="path.path.join()" />
          <a-popover
            placement="bottomLeft"
            arrow-point-at-center
            v-model="actionMenuVisible"
            trigger="click"
            overlayClassName="scene-roaming-path-item-popover"
          >
            <a-list slot="content" :gutter="10">
              <a-list-item @click="onRenamePath">
                重命名
              </a-list-item>
              <a-list-item @click="onDeletePath">
                删除
              </a-list-item>
            </a-list>
            <a-icon type="more" />
          </a-popover>
        </div>
      </template>
    </div>
  </a-card>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({
  name: 'PathItem'
})
export default class PathItem extends Vue {
  @Prop() path

  private actionMenuVisible = false

  private editable = false

  private newPathName = this.path.name

  private onRenamePath() {
    this.actionMenuVisible = false
    this.editable = true
  }

  private onNameChange(val) {
    this.newPathName = val
  }

  onSavePathName() {
    this.editable = false
    this.path.name = this.newPathName
  }

  onCancelRenamePath() {
    this.editable = false
  }

  onDeletePath() {
    this.actionMenuVisible = false
    this.$emit('delete-path')
  }
}
</script>

<style lang="less" scoped>
.path-item {
  margin-bottom: 16px;
  background-color: @background-color-light;
  box-shadow: 0 1px 1px @shadow-color;
  border-radius: 6px;
  &:last-child {
    margin-bottom: 0;
  }
  .path-content {
    display: flex;
    align-content: center;
    .name {
      cursor: pointer;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .actions {
      display: none;
      .anticon {
        padding-left: 8px;
        cursor: pointer;
        &:hover {
          color: @primary-color;
        }
      }
    }
    .name-input {
      flex: 1;
      margin: -6px 8px -6px 0;
    }
    .name-action-divider {
      height: unset;
    }
  }
  &:hover {
    box-shadow: 0 1px 2px @shadow-color;
    .path-content {
      .actions {
        display: block;
      }
    }
  }
  .path-content {
    .actions-visible {
      display: block;
    }
  }
}
</style>

<style lang="less">
.path-item {
  &.ant-card-type-inner {
    .ant-card-body {
      padding: 12px;
    }
  }
}
.scene-roaming-path-item-popover {
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
