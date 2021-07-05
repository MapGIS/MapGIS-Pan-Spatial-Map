<template>
  <a-select
    notFoundContent="请添加分类"
    placeholder="请选择分类"
    :value="value"
    :size="size"
    @select="onSelect"
  >
    <a-select-option
      v-for="item in categories"
      :key="item.name"
      :title="item.description"
    >
      {{ item.name }}
    </a-select-option>
  </a-select>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component({
  name: 'AddDataCategorySelect'
})
export default class AddDataCategorySelect extends Vue {
  @Prop({ type: Array }) categories

  @Prop({ type: String, default: 'default' }) size

  @Prop({ type: String }) value

  onSelect(val) {
    this.$emit('select', val)
  }
}
</script>

<style></style>
