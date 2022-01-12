<template>
  <a-form :label-col="{ span: 2 }" :wrapper-col="{ span: 16 }">
    <div v-for="(item, index) in metadata" :key="index">
      <a-divider v-if="item.length > 1">分组</a-divider>
      <a-form-item
        v-for="({ value, nickName, type }, key) in item"
        :key="key"
        :label="nickName"
      >
        <a-switch v-if="`${type}` === '2'" :checked="setBool(value)" disabled />
        <div v-else-if="`${type}` === '5'">
          <a-date-picker
            disabled
            :value="moment(value, 'YYYY-MM-DD')"
            style="width:50%"
          />
          <a-time-picker
            disabled
            :value="moment(value, 'HH:mm:ss')"
            style="width:50%"
          />
        </div>
        <a-input v-else :value="value" disabled />
      </a-form-item>
    </div>
  </a-form>
</template>

<script lang="ts">
import { Vue, Component, Prop, Mixins } from 'vue-property-decorator'
import {
  LayerType,
  IGSMapImageLayer,
  IGSVectorLayer,
  IGSTileLayer,
  Layer
} from '@mapgis/web-app-framework'
import momentFromat from 'moment'

@Component({ name: 'MpMetadataInfoCloud', components: {} })
export default class MpMetadataInfoCloud extends Vue {
  @Prop() readonly metadata!: Array<any>

  moment = momentFromat

  setBool(value) {
    if (value === 'true') {
      return true
    }
    return false
  }
}
</script>

<style lang="less">
.metadata-info-container {
  .layers {
    display: flex;
    flex-direction: column;
    max-width: 100%;
    .layers-title {
      padding-bottom: 8px;
    }
  }
}
</style>
