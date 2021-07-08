<template>
  <div class="subject-types">
    <mp-row-flex label="专题类型" label-align="right">
      <a-select v-model="sujectType" :options="subjectTypeList" />
    </mp-row-flex>
    <component :is="sujectType" v-show="sujectType" />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { subjectTypes } from '../../../../store'
import SubSectionMap from './components/SubSectionMap.vue' // 分段专题图
import BaseMapWithGraph from './components/BaseMapWithGraph.vue' // 统计专题图
import StatisticLabel from './components/StatisticLabel.vue' // 等级符号专题图
import Label from './components/Label.vue' // 聚合标注专题图
import HeatMap from './components/HeatMap.vue' // 热力图
import HexBin from './components/HexBin.vue' // 蜂窝图

@Component({
  components: {
    BaseMapWithGraph,
    HeatMap,
    HexBin,
    Label,
    StatisticLabel,
    SubSectionMap
  }
})
export default class SubjectTypes extends Vue {
  // 专题类型
  sujectType = ''

  // 专题类型列表
  subjectTypeList = subjectTypes
}
</script>
<style lang="less" scoped></style>
