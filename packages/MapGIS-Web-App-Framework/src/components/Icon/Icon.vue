<template>
  <div class="mp-icon-wrapper">
    <i v-if="isSvg" class="icon" v-html="icon"> </i>
    <img v-else :src="icon" fit="contain" />
  </div>
</template>

<script>
export default {
  name: 'MpIcon',
  props: ['icon'],
  computed: {
    isSvg() {
      if (this.icon && this.icon.indexOf('<svg') >= 0) {
        return true
      }

      return false
    }
  }
}
</script>

<style lang="less">
.mp-icon-wrapper {
  display: inline;
  .icon {
    line-height: 0;
    text-align: center;
    text-transform: none;
    vertical-align: -0.075em;
    > svg {
      width: 1em;
      height: 1em;
      fill: currentColor;
    }
  }
  > img {
    vertical-align: middle;
    width: 1em;
  }
}
</style>
