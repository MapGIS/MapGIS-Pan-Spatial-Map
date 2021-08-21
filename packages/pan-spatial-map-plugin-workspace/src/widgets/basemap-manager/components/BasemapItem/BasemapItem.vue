<template>
  <div :class="['basemap-item', { active }]" @click="onClick">
    <div class="item-image">
      <img :src="image" />
    </div>
    <div class="item-name">{{ name }}</div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({
  name: 'MpBasemapItem'
})
export default class MpBasemapItem extends Vue {
  @Prop({ type: String }) name

  @Prop({ type: String }) image

  @Prop({ type: Boolean }) active

  onClick() {
    if (!this.active) {
      this.$emit('select', this.name)
    } else {
      this.$emit('un-select', this.name)
    }
  }
}
</script>

<style lang="less" scoped>
.basemap-item {
  display: inline-block;
  vertical-align: top;
  margin: 2px 5px;
  width: 100px;
  text-align: center;
  cursor: pointer;
  .item-image {
    position: relative;
    width: 100%;
    height: 0;
    padding-top: 66.5%; /*相对于这个盒子的宽度设置的，为保证图片比例，其值=width * 80%*/
    box-sizing: border-box;
    img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: solid 1px @border-color;
      border-radius: 5px;
    }
  }
  .item-name {
    font-size: 12px;
    text-align: center;
    word-wrap: break-word;
    white-space: pre-wrap;
  }
  &:hover {
    .item-image {
      img {
        box-shadow: 0 0 8px @shadow-color, 0 0 8px @shadow-color;
      }
    }
    .item-name {
      text-decoration: underline;
    }
  }
  &.active {
    .item-image {
      img {
        border: double 4px @primary-color;
      }
    }
    .item-name {
      color: @primary-color;
    }
  }
}
</style>
