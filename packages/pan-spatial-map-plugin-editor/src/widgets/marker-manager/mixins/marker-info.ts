import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator'
import { baseConfigInstance } from '@mapgis/pan-spatial-map-store'

@Component({})
export default class MarkerInfoMixin extends Vue {
  @Prop({ type: Object, required: true }) marker!: Record<string, any>

  // 编辑对话框的表单数据
  private formData = {
    title: '',
    description: '',
    img: baseConfigInstance.config.colorConfig.label.image.defaultImg
  }

  // 图片上传器的显隐
  private showUploader = false

  // 编辑对话框的显隐
  private showInfo = false

  @Watch('marker', { deep: true })
  onMarkerInfoChange(newVal) {
    this.formData.img = newVal.img
  }

  // 点击dialog确定按钮回调
  onClickOk() {
    this.showInfo = false

    this.marker.title = this.formData.title
    this.marker.description = this.formData.description
    this.marker.img = this.formData.img
  }

  // 点击上传图片按钮回调
  onClickImg() {
    this.showUploader = true
  }

  // 图片上传成功时回调
  successHandleUploader(info) {
    console.log(info)
    this.formData.img = info.file.response.url
    this.showUploader = false
  }
}
