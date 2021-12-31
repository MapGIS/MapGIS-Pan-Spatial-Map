<template>
  <mapgis-ui-spin :spinning="loading">
    <div class="iot-detail-title">
      <h3>附件</h3>
      <mapgis-ui-radio-group v-model="isList" button-style="solid" size="small">
        <mapgis-ui-radio-button :value="true">
          <mapgis-ui-iconfont type="mapgis-unorderedlist" />
        </mapgis-ui-radio-button>
        <mapgis-ui-radio-button :value="false">
          <mapgis-ui-iconfont type="mapgis-table" />
        </mapgis-ui-radio-button>
      </mapgis-ui-radio-group>
    </div>
    <mp-file-preview :isList="isList" :files="files" />
    <div class="iot-detail-pagination">
      <mapgis-ui-pagination
        size="small"
        v-model="current"
        show-size-changer
        :page-size.sync="pageSize"
        :total="total"
      />
    </div>
  </mapgis-ui-spin>
</template>

<script>
import axios from 'axios'
import { baseConfigInstance } from '@mapgis/pan-spatial-map-common'

export default {
  name: 'IotDetail',
  props: {
    entityCode: {
      type: String,
      default: ''
    },
    toType: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      isList: true,
      current: 1,
      pageSize: 10,
      total: 0,
      files: [],
      loading: false
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    async getData() {
      let arr = []
      this.loading = true
      try {
        const res = await axios.get(
          `http://${baseConfigInstance.config.DataStoreIp}:${baseConfigInstance.config.DataStorePort}/datastore/rest/services/dataset/relations`,
          {
            params: {
              fromID: this.entityCode,
              fromType: 1,
              toType: this.toType,
              pageNo: this.current,
              pageSize: this.pageSize
            }
          }
        )
        if (res.status === 200) {
          const {
            data: { total, rtn }
          } = res.data
          this.total = total
          if (rtn) {
            switch (this.toType) {
              case 101:
                arr = this.fileDataStore(rtn)
                break
              case 301:
                arr = this.iotDevice(rtn)
                break
              default:
                break
            }
          }
        }
      } catch (error) {
      } finally {
        this.files = arr
        this.loading = false
      }
    },
    fileDataStore(rtn) {
      const arr = []
      rtn.forEach(({ toDataUrl, toExtInfo }) => {
        const names = toDataUrl.split('/')
        if (names.length > 0) {
          const name = names[names.length - 1]
          const { ip, port, provider } = JSON.parse(toExtInfo)
          const url = `http://${ip}:${port}/datastore/rest/services/file/${provider}${toDataUrl}/download`
          arr.push({
            name,
            url
          })
        }
      })
      return arr
    },
    iotDevice(rtn) {
      const arr = []
      rtn.forEach(({ toDataUrl, toExtInfo, toID }) => {
        const { ip, port, provider } = JSON.parse(toExtInfo)
        const url = `http://${ip}:${port}/datastore/rest/services/dataset/${provider}${toDataUrl}/iots/devices/videos`
        arr.push({
          name: toID,
          type: 'hls',
          url
        })
      })
      return arr
    }
  }
}
</script>

<style lang="less" scoped>
.iot-detail-title {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.iot-detail-pagination {
  text-align: right;
  margin-top: 10px;
}
</style>
