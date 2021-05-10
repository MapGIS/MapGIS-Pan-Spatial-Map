<template>
  <div class="add-service-file">
    <service-category-select />
    <div class="input-item head-item">
      <label class="">文件类型：</label>
      <a-select v-model="option">
        <a-select-option v-for="item in serviceTypes" :key="item.value">
          {{ item.label }}
        </a-select-option>
      </a-select>
    </div>
    <div class="input-item">
      <label class="">服务名称：</label>
      <a-input v-model="fileInfo.name" />
    </div>
    <div class="input-item">
      <label class="">服务地址：</label>
      <a-input v-model="fileInfo.url" />
    </div>
    <a-upload-dragger
      name="file"
      :action="url"
      :accept="accept"
      :multiple="true"
      :before-upload="beforeUpload"
      @change="handleChange"
    >
      <div class="upload-content">
        <a-icon type="upload" :style="{ fontSize: '36px' }" />
        <p>{{ label }}</p>
      </div>
    </a-upload-dragger>
    <div class="btn">
      <a-button type="primary">添加</a-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator'
import {
  AddServicesMixin,
  ServiceType,
  ServiceCategory,
  Service,
  servicesConfigInstance,
  ServicesConfig
} from '@mapgis/pan-spatial-map-store'
import { AppMixin } from '@mapgis/web-app-framework'
import ServiceCategorySelect from './ServiceCategorySelect.vue'

@Component({
  components: { ServiceCategorySelect }
})
export default class AddServiceFile extends Mixins(AddServicesMixin, AppMixin) {
  @Prop(Array) readonly serviceTypes!: ServiceType[]

  // 下拉框值
  private option: ServiceType | null = null

  // 输入框输入值
  private fileInfo = {
    name: '',
    url: ''
  }

  // 上传地址
  private url = ''

  // 上传提示信息
  private label = '单击或将文件拖到该区域以上传'

  // 上传文件类型
  private accept = ''

  private serviceConfig

  get isJSON() {
    return this.option && this.option === 'GeoJSON'
  }

  get isUploadToIGS() {
    return (
      this.option &&
      (this.option === 'tif' || this.option === 'shp' || this.option === '6x')
    )
  }

  @Watch('option', { deep: true })
  changeOption() {
    if (!this.option) {
      return
    }
    if (this.option == 'tif') {
      this.accept = '.tif,.tfw,.tif.ovr,.tif.vat.dbf,.tif.aux.xml'
      this.label =
        'Tips:必须上传*.tif和*.tfw两个个类型的文件,且单个文件大小<200M'
    } else if (this.option == 'shp') {
      this.accept = '.dbf,.prj,.sbn,.sbx,.shp,.shp.xml,.shx,.cpg'
      this.label =
        'Tips:必须上传后缀为"shp", "shx", "dbf", "prj"四个类型的文件,且单个文件大小<200M'
    } else if (this.option == '6x') {
      this.accept = '.wp,.wt,.wl'
      this.label =
        'Tips:可以上传后缀为"wt","wp"或"wl"的文件,且单个文件大小<200M'
    } else if (this.option == 'GeoJSON') {
      this.accept = '.json'
      this.label = 'Tips:可以上传后缀为"json"的文件,且文件大小<200M'
    }
  }

  created() {}

  // get getUrl() {
  //   if (this.isJSON) {
  //     this.url = 'http://localhost:8015//upload/uploadFile' // TODO:后台地址
  //   } else {
  //     if (!this.serviceConfig) {
  //       await ServicesConfig.loadConfig()
  //       this.serviceConfig = servicesConfigInstance.config
  //     }
  //     const { uploadIp, uploadPort } = this.serviceConfig
  //     this.url = `http://${uploadIp}:${uploadPort}/open/uploadFile`
  //   }
  //   console.log(this.url)

  //   return this.url
  // }

  beforeUpload(file) {}

  handleChange(info) {}
}
</script>

<style lang="scss" scoped>
.add-service-file {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.input-item {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 8px;

  .ant-select,
  .ant-input {
    margin-left: 4px;
    flex-grow: 1;
  }
}
.head-item {
  margin: 8px 0;
}

.upload-content {
  display: flex;
  flex-direction: column;

  p {
    padding: 8px;
  }
}

.btn {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}
</style>
