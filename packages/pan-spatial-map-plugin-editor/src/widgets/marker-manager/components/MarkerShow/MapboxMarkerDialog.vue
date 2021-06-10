<template>
  <div class="marker-info-wrapper">
    <a-form-model :model="marker">
      <a-form-model-item label="标题:">
        <span>{{ marker.title }}</span>
      </a-form-model-item>
      <a-form-model-item label="内容:">
        <span>{{ marker.description }}</span>
      </a-form-model-item>
      <a-form-model-item label="图片:">
        <a-avatar :src="`${baseUrl}${marker.img}`" />
        <a-button
          class="popup-button2"
          type="primary"
          shape="circle"
          icon="edit"
          @click="onClickEdit"
        >
        </a-button>
      </a-form-model-item>
    </a-form-model>

    <a-modal v-model="showInfo" :width="400" @ok="onClickOk">
      <a-form-model :model="formData">
        <a-form-model-item label="标题:">
          <a-input v-model="formData.title" />
        </a-form-model-item>
        <a-form-model-item label="内容:">
          <a-input v-model="formData.description" />
        </a-form-model-item>
        <a-form-model-item label="图片:">
          <a-avatar :src="`${baseUrl}${formData.img}`" />
          <a-button
            type="primary"
            shape="circle"
            icon="picture"
            @click="onClickImg"
          >
          </a-button>
        </a-form-model-item>
      </a-form-model>
    </a-modal>

    <a-modal v-model="showUploader" :width="300" :footer="null">
      <uploader
        :url="baseUrl + '/api/local-storage/pictures'"
        label="图片上传"
        @success="successHandleUploader"
      ></uploader>
    </a-modal>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Vue,
  Prop,
  Emit,
  Mixins,
  Watch
} from 'vue-property-decorator'
import {
  envInstance,
  eventBus,
  baseConfigInstance
} from '@mapgis/pan-spatial-map-store'
import { AppMixin } from '@mapgis/web-app-framework'
import uploader from '../Uploader/uploader'
import MarkerInfoMixin from '../../mixins/marker-info'

@Component({
  components: { uploader }
})
export default class MapboxMarkerDialog extends Mixins(
  AppMixin,
  MarkerInfoMixin
) {
  created() {
    this.initData()
  }

  private initData() {
    // 标注点默认图标
    this.marker.img =
      baseConfigInstance.config.colorConfig.label.image.defaultImg
  }

  private onClickEdit() {
    this.showInfo = true
  }
}
</script>

<style lang="less" scoped>
@import '../../styles/marker.less';

.marker-info-wrapper {
  width: 100%;
  overflow-y: auto;
  padding: 4px 0 0 0;
}
</style>
