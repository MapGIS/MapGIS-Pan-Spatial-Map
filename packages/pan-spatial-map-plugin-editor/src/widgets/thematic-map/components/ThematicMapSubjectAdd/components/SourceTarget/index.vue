<template>
  <div class="source-target">
    <mp-row-flex label="数据来源" label-align="right">
      <a-select v-model="sourceTarget" :options="sourceTargetList" />
    </mp-row-flex>
    <!-- 本地数据 -->
    <local-data v-if="type === 'localData'" />
    <!-- 线上数据 -->
    <online-data v-else />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import OnlineData from './components/OnlineData.vue'
import LocalData from './components/LocalData.vue'

@Component({
  components: {
    OnlineData,
    LocalData
  }
})
export default class SourceTarget extends Vue {
  // 数据来源
  type = 'localData'

  // 数据来源列表
  sourceTargetList = [
    {
      label: '线上数据',
      value: 'onLineData'
    },
    {
      label: '本地数据',
      value: 'localData'
    }
  ]
}
</script>
<style lang="less" scoped></style>
