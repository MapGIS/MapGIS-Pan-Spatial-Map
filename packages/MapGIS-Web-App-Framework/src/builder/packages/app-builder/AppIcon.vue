<template>
  <div class="app-icon-container">
    <div v-if="isSvg">
      <i
        class="icon"
        v-html="icon"
        :style="{ width: width + 'px', height: height + 'px' }"
      >
      </i>
    </div>
    <img
      v-else-if="isBase64"
      :style="{
        width: width + 'px',
        height: height + 'px',
        display: 'block',
        'background-size': 'contain'
      }"
      :src="icon"
    />
    <img
      v-else
      :style="{
        width: width + 'px',
        height: height + 'px',
        display: 'block',
        'background-size': 'contain'
      }"
      :src="`${assetsPath}${icon}`"
    />
  </div>
</template>

<script>
import { AppManager } from '../../managers'

export default {
  props: { icon: String, width: Number, height: Number },
  computed: {
    isSvg() {
      if (this.icon && this.icon.indexOf('<svg') >= 0) {
        return true
      }

      return false
    },
    isBase64() {
      if (this.icon && this.icon.indexOf('data:image') >= 0) {
        return true
      }

      return false
    },
    assetsPath() {
      const app = AppManager.getInstance().getApplication()

      return `${app.baseAPI}${app.appAssetsPath}`
    }
  }
}
</script>

<style lang="less">
.app-icon-container {
  .icon {
    display: flex;
    fill: currentColor;
    align-items: center;
    > svg {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
