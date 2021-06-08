import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator'

@Component({})
export default class MarkerInfoMixin extends Vue {
  @Prop({ type: Object, required: true }) marker!: Record<string, any>

  // 图片上传器的显隐
  private showUploader = false

  // 编辑对话框的显隐
  private showInfo = false

  // 点击dialog确定按钮回调
  onClickOk() {
    this.showInfo = false
  }

  // 点击上传图片按钮回调
  onClickImg() {
    this.showUploader = true
  }

  // 图片上传成功时，更新图例微件的config文件
  successHandleUploader(info) {
    console.log(info)
    this.marker.img = info.file.response.url
    this.showUploader = false
  }
}
