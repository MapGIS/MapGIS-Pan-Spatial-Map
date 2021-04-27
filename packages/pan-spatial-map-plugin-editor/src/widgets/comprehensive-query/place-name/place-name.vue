<template>
  <div class="place-name-container">
    <div class="float-pop-container" v-show="!showResult">
      <span
        v-for="item in allItems"
        :key="`地名地址${item.placeName}`"
        @click="select(item)"
        :class="{ active: selected.indexOf(item.placeName) > -1 }"
      >
        {{ item.placeName }}
      </span>
    </div>
    <div v-if="showResult">
      <a-tabs v-model="tab" type="card">
        <a-tab-pane v-for="item in selected" :key="item" :tab="item">
          <result-tab
            :widgetInfo="widgetInfo"
            :name="item"
            :keyword="keyword"
          ></result-tab>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { WidgetInfoMixin } from '@mapgis/web-app-framework'
import ResultTab from './result-tab'

@Component({ components: { ResultTab } })
export default class PlaceName extends Vue {
  @Prop() widgetInfo!: Record<string, unknown>

  private selected: string[] = []

  private showResult = false

  private keyword = ''

  private tab = ''

  private get allItems() {
    return this.widgetInfo.config.placeName.queryTable
  }

  select(item: any) {
    const index = this.selected.indexOf(item.placeName)
    if (index < 0) {
      this.selected.push(item.placeName)
    } else {
      this.selected.splice(index, 1)
    }
  }

  search(keyword: string) {
    this.keyword = keyword
    this.showResult = true
    this.tab = this.selected[0]
  }

  reset() {
    this.showResult = false
    this.tab = ''
  }
}
</script>

<style lang="less" scoped>
.place-name-container {
  .float-pop-container {
    span {
      padding: 3px 6px;
      &:hover {
        cursor: pointer;
      }
    }
    .active {
      color: @primary-color;
    }
  }
}
</style>
