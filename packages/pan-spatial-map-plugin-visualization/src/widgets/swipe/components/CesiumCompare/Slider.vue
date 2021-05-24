<template>
  <div class="slider-outer" title="通过拖动查看图层">
    <div class="slider-inner" />
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class Slider extends Vue {}
</script>
<style lang="less" scoped>
.slider-outer,
.slider-inner {
  background: #dcdcdc;
  border: 1px solid rgb(112, 107, 107);
}
.slider-outer {
  position: absolute;
  left: 50%;
  height: 100%;
  width: 4px;
  top: 0px;
  opacity: 0.5;
  z-index: 2000;
  .slider-inner {
    position: absolute;
    height: 32px;
    width: 14px;
    top: 46%;
    left: -6px;
    background-position: center;
    background-repeat: no-repeat;
  }
}
</style>
