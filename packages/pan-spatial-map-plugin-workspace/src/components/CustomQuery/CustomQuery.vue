<template>
  <mp-field-calculator :queryParams="queryParams" @finish="onFinish" />
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import {
  ExhibitionControllerMixin,
  Exhibition
} from '@mapgis/web-app-framework'

const { IAttributeTableExhibition, AttributeTableExhibition } = Exhibition

@Component({
  name: 'MpCustomQuery',
  components: {}
})
export default class MpCustomQuery extends Mixins(ExhibitionControllerMixin) {
  @Prop(Object) readonly queryParams!: Record<string, any>

  // 确定
  onFinish(search) {
    const exhibition: IAttributeTableExhibition = { ...this.queryParams }

    exhibition.option.where = search.length > 0 ? `(${search})` : ''

    this.addExhibition(new AttributeTableExhibition(exhibition))
    this.openExhibitionPanel()

    // 关闭窗口
    this.$emit('close')
  }
}
</script>

<style lang="less" scoped></style>
