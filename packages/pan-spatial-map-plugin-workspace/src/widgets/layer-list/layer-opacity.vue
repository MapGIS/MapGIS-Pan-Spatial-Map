<template>
  <ul>
    <li v-for="item in layers" :key="item.id">
      <label :title="setTooltip(item)">{{ item.title }}</label>
      <a-slider
        :value="100 - Number(item.opacity) * 100"
        @change="val => setOpacity(val, item)"
        :min="0"
        :max="100"
        :tipFormatter="val => `${val}%`"
      />
    </li>
  </ul>
</template>

<script lang="ts">
import { Component, Vue, Prop, Mixins, Watch } from 'vue-property-decorator'
import { AppMixin } from '@mapgis/web-app-framework'

@Component
export default class LayerOpacity extends Mixins(AppMixin) {
  @Prop({ required: true }) layers: Array

  @Prop() dataCatalog: Array<Record<string, any>>

  setOpacity(val, item) {
    item.opacity = Number((100 - val) / 100)
  }

  setTooltip(item) {
    const parentName = ''
    const arr = []
    this.findParentName(item.id, parentName, this.dataCatalog, arr)
    if (arr.length > 0) {
      return arr[0]
    }
    return ''
  }

  findParentName(id, parentName, dataCatalog, arr) {
    dataCatalog.forEach(item => {
      let copy = parentName
      if (item.guid === id) {
        parentName += item.label
        arr.push(parentName)
      } else if (item.children) {
        copy += `${item.label}-`
        this.findParentName(id, copy, item.children, arr)
      }
    })
  }
}
</script>

<style lang="less" scoped>
ul {
  list-style: none;
  margin: 0;
  padding: 0 10px;
  li {
    margin-bottom: 10px;
  }
}
</style>
