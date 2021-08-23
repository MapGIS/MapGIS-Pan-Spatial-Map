<template>
  <div class="mp-attribute-table-list">
    <a-tabs
      v-if="options.length > 0"
      v-model="activeOptionId"
      type="card"
      size="small"
      hide-add
    >
      <a-tab-pane v-for="option in options" :key="option.id" :tab="option.name">
        <component
          :is="attributeTableComponent"
          :ref="option.id"
          :option="option"
        />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator'
import { ExhibitionMixin, Exhibition } from '@mapgis/web-app-framework'

const { IAttributeTableListExhibition } = Exhibition

@Component({ name: 'MpAttributeTableList' })
export default class MpAttributeTableList extends Mixins(ExhibitionMixin) {
  // 属性表选项
  @Prop({ type: Object, required: true })
  exhibition!: IAttributeTableListExhibition

  private get activeOptionId() {
    return this.exhibition.activeOptionId
  }

  private set activeOptionId(id: string) {
    this.exhibition.activeOptionId = id
  }

  private get attributeTableComponent() {
    return 'MpAttributeTable'
  }

  private get options() {
    return this.exhibition.options
  }

  private get tableExhibition() {
    return function(option) {
      return {
        id: option.id,
        name: option.name,
        option: option
      }
    }
  }

  @Watch('activeOptionId')
  activeOptionIdChange(newVal, oldVal) {
    // 延迟10毫秒执行
    setTimeout(() => {
      if (this.$refs[oldVal] && this.$refs[oldVal][0]) {
        this.$refs[oldVal][0].deActivateExhibition()
      }
      if (this.$refs[newVal] && this.$refs[newVal][0]) {
        this.$refs[newVal][0].activateExhibition()
        this.$refs[newVal][0].resizeExhibition()
      }
    }, 10)
  }

  onResize() {
    if (this.$refs[this.activeOptionId]) {
      this.$refs[this.activeOptionId][0].resizeExhibition()
    }
  }

  onActive() {
    if (this.$refs[this.activeOptionId] && this.$refs[this.activeOptionId][0]) {
      this.$refs[this.activeOptionId][0].activateExhibition()
      this.$refs[this.activeOptionId][0].resizeExhibition()
    }
  }

  onDeActive() {
    if (this.$refs[this.activeOptionId] && this.$refs[this.activeOptionId][0]) {
      this.$refs[this.activeOptionId][0].deActivateExhibition()
    }
  }

  onClose() {
    if (this.$refs[this.activeOptionId] && this.$refs[this.activeOptionId][0]) {
      this.$refs[this.activeOptionId][0].closeExhibition()
    }
  }
}
</script>

<style lang="less" scoped>
.mp-attribute-table-list {
  padding-top: 2px;
}
</style>
