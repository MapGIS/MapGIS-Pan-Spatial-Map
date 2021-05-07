<template>
  <div class="igs-server">
    <div class="input-item">
      <label class="">IP地址：</label>
      <a-input v-model="ip"></a-input>
    </div>
    <div class="input-item">
      <label class="">端口：</label>
      <a-input v-model="port"></a-input>
    </div>
    <div v-if="showLayer" class="input-item">
      <label>GDBP地址：</label>
      <mapgis-layer :ip="ip" :port="port" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import MapgisLayer from './MapgisLayer.vue'
import MapgisServer from './MapgisServer.vue'

@Component({
  name: 'IgsServer',
  components: { MapgisLayer, MapgisServer }
})
export default class IgsServer extends Vue {
  @Prop({ type: String, default: 'doc' }) readonly dataType!: string

  // 服务器ip
  private ip = 'develop.smaryun.com'

  // 服务器端口
  private port = '6163'

  get showLayer() {
    return this.dataType === 'layer'
  }

  get showMap() {
    return this.dataType === 'doc' || this.dataType === 'tile'
  }
}
</script>

<style lang="scss" scoped>
.igs-server {
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

  label {
    width: 79px;
  }

  .ant-input {
    margin-left: 4px;
    flex-grow: 1;
  }
}
</style>
