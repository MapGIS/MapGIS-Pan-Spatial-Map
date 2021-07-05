<template>
  <a-select
    notFoundContent="请添加类型"
    placeholder="请选择类型"
    :size="size"
    :value="value && value.text"
    @select="onSelect"
  >
    <a-select-option v-for="item in types" :key="item.text">
      {{ item.text }}
    </a-select-option>
  </a-select>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component({
  name: 'AddDataTypeSelect'
})
export default class AddDataTypeSelect extends Vue {
  @Prop({ type: Array }) types

  @Prop({ type: String, default: 'default' }) size

  @Prop({ type: Object }) value

  onSelect(val) {
    this.$emit(
      'select',
      this.types.find(type => {
        return type.text == val
      })
    )
  }
}
</script>

<style></style>
