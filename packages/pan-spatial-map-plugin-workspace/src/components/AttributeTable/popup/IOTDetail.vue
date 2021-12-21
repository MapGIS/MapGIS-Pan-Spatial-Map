<template>
  <div>
    <div class="iot-detail-title">
      <h3>附件</h3>
      <a-radio-group v-model="isList" button-style="solid" size="small">
        <a-radio-button :value="true">
          <mapgis-ui-iconfont type="mapgis-unorderedlist" />
        </a-radio-button>
        <a-radio-button :value="false">
          <mapgis-ui-iconfont type="mapgis-table" />
        </a-radio-button>
      </a-radio-group>
    </div>
    <mp-file-preview :isList="isList" :files="files" />
    <div class="iot-detail-pagination">
      <a-pagination
        size="small"
        v-model="current"
        show-size-changer
        :page-size.sync="pageSize"
        :total="total"
      />
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'IotDetail',
  props: {
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
      files: []
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    async getData() {
      let arr = []
      try {
        const res = await axios.get(
          'http://192.168.96.101:9014/datastore/rest/services/dataset/relations',
          {
            params: {
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
      rtn.forEach(({ toDataUrl, toExtInfo, id }) => {
        const { ip, port, provider } = JSON.parse(toExtInfo)
        const url = `http://${ip}:${port}/datastore/rest/services/dataset/${provider}${toDataUrl}/iots/devices/videos`
        arr.push({
          name: id,
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
