<template>
  <div class="marker-info-wrapper text-body2">
    <div v-if="markerInfo.edit" class="column items-start">
      <div class="marker-content edit">
        <div class="content-title">标题：</div>
        <a-input class="col" v-model="title"></a-input>
      </div>
      <div class="marker-content edit">
        <div class="content-title">内容：</div>
        <a-input class="col" v-model="description"></a-input>
      </div>
      <div class="marker-content edit">
        <div class="content-title">图片：</div>
        <!-- <q-img
          contain
          position="0 0"
          :src="`${uploadUrl}${img}`"
          style="height: 2em;"
          class="col"
          @click="selectImg()"
        /> -->
        <div class="edit-img">
          <a-avatar
            src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
          />
          <a-button
            type="primary"
            shape="circle"
            icon="picture"
            size="small"
            @click="selectImg"
          >
          </a-button>
        </div>
      </div>

      <a-divider />

      <div class="btn-group">
        <a-button type="primary" size="small" @click="handleOk">确定</a-button>
        <a-button size="small" @click="handleCancel">取消</a-button>
      </div>
    </div>
    <div v-else class="column items-start">
      <div class="marker-content">
        <div class="content-title">
          标题：
        </div>
        <span style="word-break: break-all;">{{ markerInfo.title }}</span>
      </div>
      <div class="marker-content">
        <div class="content-title">
          内容：
        </div>
        <span style="word-break: break-all;">{{ markerInfo.description }}</span>
      </div>
      <div class="marker-content">
        <div class="content-title">图片：</div>
        <!-- <q-img
          contain
          position="0 0"
          :src="`${uploadUrl}${markerInfo.img}`"
          style="height: 2em;"
          class="col"
        /> -->
        <a-button shape="circle" icon="edit" size="small" @click="handleEdit">
        </a-button>
      </div>
    </div>
    <a-modal v-model="showUploader" :width="300" :footer="null">
      <uploader
        :url="uploadUrl + '/api/local-storage/pictures'"
        label="图片上传"
        @success="succesHandleUploader"
      ></uploader>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit, Mixins } from 'vue-property-decorator'
import { envInstance, eventBus } from '@mapgis/pan-spatial-map-store'
import { AppMixin } from '@mapgis/web-app-framework'
import uploader from '../Uploader/uploader'

@Component({
  components: { uploader }
})
export default class MarkerInfo extends Mixins(AppMixin) {
  @Prop({ type: Object, required: true }) markerInfo!: Record<string, any>

  private title = ''

  private description = ''

  private img = ''

  private uploadUrl = ''

  // 图片上传器的显隐
  private showUploader = false

  @Emit('ok')
  emitOk(markerInfo: any) {}

  @Emit('cancel')
  emitCancel(markerInfo: any) {}

  created() {
    console.log(this.baseUrl)

    this.title = this.markerInfo.title
    this.description = this.markerInfo.description
    this.img = this.markerInfo.img
    this.uploadUrl = this.baseUrl
  }

  mounted() {
    this.markerInfo.edit = false
  }

  handleEdit() {
    this.markerInfo.edit = true
  }

  handleOk() {
    this.markerInfo.edit = false
    this.markerInfo.title = this.title
    this.markerInfo.description = this.description
    this.markerInfo.img = this.img

    this.emitOk(this.markerInfo)
    eventBus.$emit('edit-marker-info', this.markerInfo)
  }

  handleCancel() {
    this.markerInfo.edit = false
    this.emitCancel(this.markerInfo)
  }

  selectImg() {
    this.showUploader = true
  }

  // 图片上传成功时，更新图例微件的config文件
  succesHandleUploader(info) {
    console.log(info)

    // const { url } = JSON.parse(xhr.response)
    // if (url) {
    //   this.showUploader = false
    //   this.img = url
    // }
  }
}
</script>

<style lang="less" scoped>
.marker-info-wrapper {
  width: 100%;
  overflow-y: auto;
  padding: 4px 0 0 0;
}
.marker-content {
  display: flex;
  align-items: center;

  .content-title {
    white-space: nowrap;
  }
}
.edit {
  margin-top: 4px;
}
.edit-img {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-grow: 1;
}

.ant-divider {
  margin: 12px 0;
}

.btn-group {
  display: flex;
  justify-content: flex-end;
  align-items: center;

  .ant-btn {
    margin-left: 8px;
  }
}
</style>
