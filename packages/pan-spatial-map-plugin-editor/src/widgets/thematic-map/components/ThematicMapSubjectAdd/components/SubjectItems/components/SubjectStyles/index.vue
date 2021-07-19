<template>
  <component :is="subjectType" :value="subject" @change="subjectChange" />
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
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
export default class SubjectStyles extends Vue {
  @Prop() readonly subjectType!: string

  subject = null

  subjectChange(sub) {
    this.subject = sub
    this.$emit('change', this.subject)
  }
}
</script>
<style lang="less" scoped></style>
