<template>
  <!-- 等级符号专题图 -->
  <mapgis-ui-custom-panel ref="customPanelForm" :options="options" />
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { UUID, Feature } from '@mapgis/web-app-framework'

@Component
export default class StatisticLabel extends Vue {
  get options() {
    return []
  }
}
</script>
