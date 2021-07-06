<template>
  <div class="local-data">
    <mp-row-flex label="数据类型">
      <a-select v-model="localSourceType">
        <a-select-option value="GeoJSON">GeoJSON</a-select-option>
        <a-select-option value="Excel">Excel</a-select-option>
      </a-select>
    </mp-row-flex>
    <mp-row-flex label="文件路径">
      <a-select v-model="localSourceType">
        <a-upload action="https://www.mocky.io/v2/5cc8019d300000980a055e76">
          <a-button>
            <a-icon type="upload" />
            点击上传
          </a-button>
        </a-upload>
      </a-select>
    </mp-row-flex>
    <template v-if="localSourceType === 'Excel'">
      <mp-row-flex label="Excel文件类型">
        <a-select v-model="excelType" :options="excelTypeList" />
      </mp-row-flex>
      <mp-row-flex label="行政区代码表头字段名">
        <a-select v-model="codeKey" :options="codeKeyList" />
      </mp-row-flex>
      <mp-row-flex label="行政区名称表头字段名">
        <a-select v-model="nameKey" options="nameKeyList" />
      </mp-row-flex>
      <mp-row-flex label="行政区划所属年度" v-if="excelType === 'singleSheet'">
        <a-select v-model="formYear" options="formYearList" />
      </mp-row-flex>
    </template>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class LocalData extends Vue {
  // 本地数据类型
  localSourceType = ''

  // 本地Excel文件类型
  excelType = ''

  excelTypeList = [
    { value: 'singleSheet', label: '单sheet页' },
    { value: 'multiSheet', label: '多sheet页' }
  ]

  // 行政区代码表头字段名
  codeKey = ''

  codeKeyList = []

  // 行政区名称表头字段名
  nameKey = ''

  nameKeyList = []

  // 行政区划所属年度
  formYear = ''

  formYearList = []
}
</script>
<style lang="less" scoped></style>
