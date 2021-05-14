<template>
  <component :is="type" v-show="type" />
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import SubSectionMap from './SubSectionMap.vue' // 分段专题图
import BaseMapWithGraph from './BaseMapWithGraph.vue' // 统计专题图
import StatisticLabel from './StatisticLabel.vue' // 等级符号专题图
import Label from './Label.vue' // 聚合标注专题图
import HeatMap from './HeatMap.vue' // 热力图
import HexBin from './HexBin.vue' // 蜂窝图

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
  @Prop() type!: string
}
</script>
<style lang="less" scoped></style>
