<template>
  <div class="source-target">
    <!-- 线上数据 -->
    <online-data v-if="type === 'onLineData'" />
    <!-- 本地数据 -->
    <local-data v-if="type === 'localData'" />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import OnlineData from './OnlineData.vue'
import LocalData from './LocalData.vue'

@Component({
  components: {
    OnlineData,
    LocalData
  }
})
export default class SourceTarget extends Vue {
  @Prop() type!: 'onLineData' | 'localData'
}
</script>
<style lang="less" scoped></style>
