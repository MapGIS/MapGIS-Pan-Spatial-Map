<template>
  <div class="marker-import">
    <a-form-model
      :model="formImport"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-form-model-item label="文件路径:">
        <div class="upload-content">
          <input
            ref="fileInput"
            class="inputfile"
            type="file"
            id="file"
            accept=".txt"
            @input="readImportFile"
          />
          <label ref="fileLabel" class="labelfile" for="file">上传文件</label>
        </div>
      </a-form-model-item>
      <div class="btn-content">
        <a-button type="primary" @click="openImportFileDesc = true"
          >查看支持导入文件的数据结构</a-button
        >
      </div>
      <a-checkbox
        class="crs-checkbox"
        :default-checked="true"
        @change="onChange"
      >
        设置输入坐标空间参考系
      </a-checkbox>
      <a-form-model-item v-show="showCrsSelect" label="参考系:">
        <a-select v-model="formImport.crsName">
          <a-select-option v-for="item in crsNames" :key="item">{{
            item
          }}</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-divider />
      <div class="btn-group">
        <a-button type="primary" @click="onClickConfirm">确认</a-button>
        <a-button @click="onClickCancel">取消</a-button>
      </div>
    </a-form-model>
    <a-modal
      v-model="openImportFileDesc"
      title="文件结构"
      @ok="openImportFileDesc = false"
    >
      <marker-import-file-desc />
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Emit } from 'vue-property-decorator'
import { utilInstance, baseConfigInstance } from '@mapgis/pan-spatial-map-store'
import { ThemeStyleMixin, AppMixin, UUID } from '@mapgis/web-app-framework'
import MarkerAddMixin from '../../mixins/marker-add'
import MarkerImportFileDesc from './MarkerImportFileDesc.vue'

@Component({
  name: 'MpMarkerImport',
  components: { MarkerImportFileDesc }
})
export default class MpMarkerImport extends Mixins(MarkerAddMixin, AppMixin) {
  private formImport = {
    crsName: 'WGS1984_度'
  }

  private crsNames = ['WGS1984_度', 'Web墨卡托_WGS1984']

  // 支持导入文件描述对话框的显隐
  private openImportFileDesc = false

  // 参考系选择器的显隐
  private showCrsSelect = true

  private importMarkers: any[] = []

  @Emit('closeModal')
  closeModal() {}

  @Emit('addMarkers')
  emitAddMarkers(markers: any[]) {}

  // 多选框变化时回调函数
  onChange(e) {
    this.showCrsSelect = e.target.checked
  }

  // 取消按钮回调函数
  onClickCancel() {
    this.closeModal()
  }

  // 确认按钮回调函数
  onClickConfirm() {
    this.closeModal()
    this.emitAddMarkers(this.importMarkers)
  }

  readImportFile() {
    console.log(this.$refs.fileInput.files)
    const file = this.$refs.fileInput.files[0]
    this.$refs.fileLabel.innerHTML = file.name
    const reader = new FileReader()
    // 文件内容载入完毕之后的回调。
    reader.onload = this.fileLoad.bind(this)
    reader.readAsText(file)
  }

  async fileLoad(e: any) {
    await this.analyzeFile(e.target.result)
  }

  async analyzeFile(str: string) {
    this.importMarkers = []
    const lines: string[] = str.split('\n')

    for (let i = 0; i < lines.length; i += 4) {
      // 每四行一个标注
      const line0: string = lines[i * 4 + 0]
      const title = line0 && line0.split('：')[1]

      const line1: string = lines[i * 4 + 1]
      const description = line1 && line1.split('：')[1]

      const line2 = lines[i * 4 + 2]
      const featureType = line2 && line2.split('：')[1]

      const line3 = lines[i * 4 + 3]
      const coordsStr = line3 && line3.split('：')[1]
      let featuresCoord = [coordsStr]

      if (featureType && coordsStr) {
        if (coordsStr.includes('#')) {
          featuresCoord = coordsStr.split('#')
        }

        const obj: Record<string, any> = {
          id: UUID.uuid(),
          title,
          description,
          features: [],
          coordinates: [],
          iconImg: `${this.baseUrl}${baseConfigInstance.config.colorConfig.label.image.defaultImg}`,
          img: '',
          type: ''
        }

        let feature: Record<string, any> = {}

        if (featureType.includes('区')) {
          const polygonCoords: any[] = []
          for (let j = 0; j < featuresCoord.length; j += 1) {
            const polygonCoordsStr = featuresCoord[j]
            const arcStrs = polygonCoordsStr.split(' ')
            const arcCoordinates: any[] = []
            for (let a = 0; a < arcStrs.length; a += 1) {
              const arcCoordStr = arcStrs[a]
              const arcCoordStrs = arcCoordStr.split(',')
              const arcCoord = [
                Number(arcCoordStrs[0]),
                Number(arcCoordStrs[1])
              ]
              arcCoordinates.push(arcCoord)
            }
            let arcCoords = arcCoordinates
            if (this.showCrsSelect) {
              arcCoords = await this.transPoints(
                arcCoordinates,
                this.formImport.crsName
              )
            }
            polygonCoords.push(arcCoords)
          }

          feature = {
            geometry: {
              coordinates: polygonCoords,
              type: 'Polygon'
            },
            id: UUID.uuid(),
            properties: {},
            type: 'Feature'
          }
          const coordinates = utilInstance.getGeoJsonFeatureCenter(feature)
          obj.features.push(feature)
          obj.coordinates = feature.geometry.coordinates
          obj.center = coordinates
          obj.type = 'Polygon'
        } else if (featureType.includes('点') || featureType.includes('线')) {
          for (let j = 0; j < featuresCoord.length; j += 1) {
            const coordStr = featuresCoord[j]
            if (featureType.includes('点')) {
              const pointCoordStrs = coordStr.split(',')
              const pointCoordinates = [
                Number(pointCoordStrs[0]),
                Number(pointCoordStrs[1])
              ]
              let pointCoords = [pointCoordinates]
              if (this.showCrsSelect) {
                pointCoords = await this.transPoints(
                  [pointCoordinates],
                  this.formImport.crsName
                )
              }
              feature = {
                geometry: {
                  coordinates: pointCoords[0],
                  type: 'Point'
                },
                id: UUID.uuid(),
                properties: {},
                type: 'Feature'
              }
              obj.type = 'Point'
            } else if (featureType.includes('线')) {
              const lineStrs = coordStr.split(' ')
              const lineCoordinates: any[] = []
              for (let l = 0; l < lineStrs.length; l += 1) {
                const lineCoordStr = lineStrs[l]
                const lineCoordStrs = lineCoordStr.split(',')
                const lineCoord = [
                  Number(lineCoordStrs[0]),
                  Number(lineCoordStrs[1])
                ]
                lineCoordinates.push(lineCoord)
              }
              let lineCoords = lineCoordinates
              if (this.showCrsSelect) {
                lineCoords = await this.transPoints(
                  lineCoordinates,
                  this.formImport.crsName
                )
              }
              feature = {
                geometry: {
                  coordinates: lineCoords,
                  type: 'LineString'
                },
                id: UUID.uuid(),
                properties: {},
                type: 'Feature'
              }
              obj.type = 'LineString'
            }
            const coordinates = utilInstance.getGeoJsonFeatureCenter(feature)
            obj.features.push(feature)
            obj.coordinates = feature.geometry.coordinates
            obj.center = coordinates
          }
        }
        this.importMarkers.push(obj)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.ant-form-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
}
.upload-content {
  width: 208px;
  height: 32px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  display: flex;
  align-items: center;

  .anticon-upload {
    margin-right: 10px;
  }
  .inputfile {
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    z-index: -1;
  }
  .inputfile:focus + label,
  .inputfile + label:hover {
    cursor: pointer;
  }
  .labelfile {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    margin-left: 8px;
  }
}
.btn-content {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 8px 0;
}
.crs-checkbox {
  margin: 8px 0 18px 32px;
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
