<template>
  <ul>
    <li v-for="item in layers" :key="item.id">
      <label>{{ item.title }}</label>
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

const { IDocument } = require('@mapgis/webclient-store')

@Component
export default class LayerOpacity extends Mixins(AppMixin) {
  @Prop({ required: true }) layers: Array

  setOpacity(val, item) {
    item.opacity = Number((100 - val) / 100)
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
