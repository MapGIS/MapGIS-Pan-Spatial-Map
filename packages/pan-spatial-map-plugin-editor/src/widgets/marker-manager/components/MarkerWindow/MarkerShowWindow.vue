<template>
  <div class="marker-show-wrapper">
    <div class="title" :title="marker.title">{{ marker.title }}</div>
    <div class="body">
      <div class="description">{{ marker.description }}</div>
      <div
        v-if="marker.picture"
        class="picture"
        :style="
          `background: url('${baseUrl}${marker.picture}') center center / cover no-repeat`
        "
        @click="onPreviewPicture"
      />
    </div>
    <a-modal :visible="previewVisible" :footer="null" @cancel="onPreviewCancel">
      <img style="width: 100%" :src="`${baseUrl}${marker.picture}`" />
    </a-modal>

    <mp-toolbar class="marker-toolbar">
      <mp-toolbar-command-group>
        <mp-toolbar-command
          class="marker-manager-toolbar-edit-button"
          title="编辑"
          icon="edit"
          @click="onMarkerEdit"
        />
      </mp-toolbar-command-group>
    </mp-toolbar>

    <marker-edit-window
      :visible="editWindowVisible"
      :marker="marker"
      @ok="onEditOk"
      @cancel="onEditCancel"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Mixins } from 'vue-property-decorator'
import { AppMixin } from '@mapgis/web-app-framework'
import { eventBus } from '@mapgis/pan-spatial-map-store'
import MarkerEditWindow from '../MarkerWindow/MarkerEditWindow'

@Component({ components: { MarkerEditWindow } })
export default class MarkerShowWindow extends Mixins(AppMixin) {
  @Prop({ type: Object, required: true }) marker!: Record<string, any>

  private editWindowVisible = false

  private previewVisible = false

  created() {
    eventBus.$on('marker-manager-toolbar-edit-button-click', markerId => {
      if (this.marker.markerId === markerId) {
        this.editWindowVisible = true
      }
    })
  }

  private onPreviewPicture() {
    this.previewVisible = true
  }

  private onPreviewCancel() {
    this.previewVisible = false
  }

  private onMarkerEdit() {
    this.editWindowVisible = true
  }

  // 编辑完成
  private onEditOk(marker) {
    this.$set(this.marker, 'title', marker.title)
    this.$set(this.marker, 'description', marker.description)
    this.$set(this.marker, 'picture', marker.picture)
    this.editWindowVisible = false
  }

  // 编辑取消
  private onEditCancel() {
    this.editWindowVisible = false
  }
}
</script>

<style lang="less" scoped>
.marker-show-wrapper {
  max-width: 240px;
  min-width: 200px;
  max-height: 200px;
  display: flex;
  flex-direction: column;
  .title {
    line-height: 33px;
    font-size: 14px;
    color: @title-color;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .body {
    flex: 1;
    overflow: auto;
    .description {
      padding: 5px 0;
      min-height: 20px;
      line-height: 20px;
      font-size: 12px;
      color: @text-color;
      word-break: break-all;
    }
    .picture {
      width: 100%;
      height: 100px;
      cursor: pointer;
    }
  }

  .marker-toolbar {
    flex-direction: row-reverse;
  }
}
</style>
