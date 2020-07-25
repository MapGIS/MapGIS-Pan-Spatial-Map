<template>
  <div class="min-width-10em">
    <div class="col-auto row items-center">
      <label class="col-2 text-right" style="min-width:3em">标题：</label>
      <q-input
        class="col-9"
        v-if="markerInfo.edit"
        v-model="markerInfo.title"
        dense
        outlined
      />
      <span v-else>{{ markerInfo.title }}</span>
    </div>
    <div class="col-auto row items-center top-02em">
      <label class="col-2 text-right" style="min-width:3em">内容：</label>
      <q-input
        class="col-9"
        v-if="markerInfo.edit"
        v-model="markerInfo.description"
        type="textarea"
        :max-line="2"
        dense
        outlined
      />
      <span v-else>{{ markerInfo.description }}</span>
    </div>
    <div class="col-auto row items-center top-02em">
      <label class="col-2 text-right" style="min-width:3em">图片：</label>
      <q-img :src="markerInfo.img" class="img-style" @click="selectImg()" />
    </div>
    <div v-show="!markerInfo.edit" class="group-btn-div">
      <q-btn
        v-show="!markerInfo.edit"
        class="group-btn"
        dense
        color="primary"
        @click="editMarkerInfo(markerInfo)"
        >编辑</q-btn
      >
    </div>
    <div v-show="markerInfo.edit" class="group-btn-div">
      <q-btn
        color="primary"
        class="group-btn"
        dense
        @click="selectImg(markerInfo)"
        >选图</q-btn
      >
      <q-btn
        color="primary"
        class="group-btn"
        dense
        @click="interactSure(markerInfo)"
        >确定</q-btn
      >
      <q-btn color="primary" class="group-btn" dense @click="interactCancel()"
        >取消</q-btn
      >
    </div>

    <input
      ref="filElem"
      type="file"
      accept="image/*"
      id="upfile"
      name="upfile"
      style="display: none;"
      @change="uploadPic"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'

@Component({
  components: {}
})
export default class MarkerInfo extends Vue {
  @Prop({ type: Object, required: true }) markerInfo!: Record<string, any>

  private deleteCount = 0

  @Emit('delete')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitDelete(deleteCount: number) {}

  mounted() {
    console.log('markerInfoMounted')
  }

  editMarkerInfo(markerInfo: any) {
    markerInfo.edit = true
  }

  selectImg() {
    let ele = this.$refs.filElem as HTMLInputElement
    if (ele && ele[0]) {
      ele = this.$refs.filElem[0] as HTMLInputElement
    }
    ele.dispatchEvent(new MouseEvent('click'))
  }

  uploadPic(val: any) {
    console.log(val)
    const reader = new FileReader()
    const file = val.target.files[0]
    reader.readAsDataURL(file)
    reader.onload = () => {
      // 展示出来：得到的reader.result为二进制文件base64  data:image/jpeg;base64...
      console.log(reader.result)
      this.markerInfo.img = reader.result
    }
  }

  interactSure(markerInfo: any) {
    console.log('interactSure')
    markerInfo.edit = false
  }

  interactCancel() {
    this.deleteCount += 1
    this.emitDelete(this.deleteCount)
  }
}
</script>

<style>
.group-btn-div {
  width: 100%;
  text-align: center;
  margin-top: 0.5em;
}

.group-btn {
  min-width: 3em;
  margin-right: 0.5em;
}

.img-style {
  width: 1.5em;
  height: 2em;
  margin: 0.5em;
}

.top-02em {
  margin-top: 0.2em;
}

.min-width-10em {
  min-width: 10em;
}
</style>
