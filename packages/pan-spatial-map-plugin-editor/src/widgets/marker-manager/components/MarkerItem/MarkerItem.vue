<template>
  <div :class="['marker-item', { active }]">
    <div class="content" @click="$emit('goto-marker', marker)">
      <mp-toolbar-command-group
        remove-first-command-left-margin
        remove-last-command-right-margin
      >
        <mp-toolbar-command
          :icon="icons[marker.feature.geometry.type]"
          title=""
          :hoverBordered="false"
        ></mp-toolbar-command>
      </mp-toolbar-command-group>
      <div class="name" :title="marker.title">
        {{ marker.title }}
      </div>
    </div>
    <div :class="['actions', actionMenuVisible ? 'actions-visible' : '']">
      <a-icon type="info-circle" :title="marker.description" />
      <a-popover
        placement="bottomLeft"
        arrow-point-at-center
        v-model="actionMenuVisible"
        trigger="click"
        overlayClassName="marker-manager-popover"
      >
        <a-list slot="content" :gutter="10">
          <a-list-item @click="onDeleteMarker">
            删除
          </a-list-item>
        </a-list>
        <a-icon type="more" />
      </a-popover>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({ name: 'MpMarkerItem' })
export default class MpMarkerItem extends Vue {
  @Prop({ type: Object }) marker

  @Prop({ type: Object }) icons

  @Prop({ type: Boolean }) active

  private actionMenuVisible = false

  onDeleteMarker() {
    this.actionMenuVisible = false
    this.$emit('delete-marker', this.marker)
  }
}
</script>

<style lang="less" scoped>
.marker-item {
  width: 100%;
  height: 32px;
  cursor: pointer;
  border-radius: 3px;
  overflow: hidden;
  display: flex;
  align-items: center;
  .content {
    flex: 1;
    display: flex;
    align-items: center;
    height: 100%;
    border-bottom: 1px solid @item-active-bg;
    .name {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
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
  &:hover {
    .actions {
      display: block;
    }
    background-color: fade(@primary-color, 20%);
  }
  .actions-visible {
    display: block;
  }
  &.active {
    background-color: fade(@primary-color, 50%);
  }
}
</style>

<style lang="less">
.marker-manager-popover {
  .ant-popover-inner {
    overflow: hidden;
    .ant-popover-inner-content {
      padding: 0;
      .ant-list-item {
        padding: 5px 15px 5px 12px;
        font-size: 12px;
        line-height: 22px;
        &:hover {
          background-color: @table-row-hover-bg;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
