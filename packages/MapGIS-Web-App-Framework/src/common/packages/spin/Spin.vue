<template>
  <div class="mp-spin-wrapper">
    <slot />
    <div class="mp-spin" :style="spinStyle" v-show="visible">
      <slot name="spin">
        <div class="mp-spin-dots">
          <span>{{ tip }}</span>
          <span class="dots">
            <span class="dot dot-1">.</span>
            <span class="dot dot-2">.</span>
            <span class="dot dot-3">.</span>
          </span>
          <slot name="suffix" />
        </div>
      </slot>
    </div>
  </div>
</template>
<script>
import { ColorUtil } from '@mapgis/web-app-framework'

export default {
  name: 'MpSpin',
  props: {
    spinning: {
      type: Boolean,
      default: false
    },
    tip: {
      type: String,
      default: '正在加载, 请稍等'
    },
    background: {
      type: String,
      default: 'rgba(255, 255, 255, .7)',
      validator: v =>
        ColorUtil.isHex(v) || ColorUtil.isRgb(v) || ColorUtil.isRgba(v)
    },
    zIndex: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      visible: false
    }
  },
  computed: {
    spinStyle({ background, zIndex }) {
      return {
        background,
        zIndex
      }
    }
  },
  watch: {
    spinning(nV) {
      this.visible = nV
    }
  },
  created() {
    if (this.visible !== this.spinning) {
      this.visible = this.spinning
    }
  }
}
</script>
<style lang="less" scoped>
.position-absolute() {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
}
.mp-spin-wrapper {
  .position-absolute;
  .mp-spin {
    .position-absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    background: fade(@white, 70%);
    span {
      display: inline-block;
      vertical-align: middle;
    }
  }

  .mp-spin-dots {
    font-size: 16px;
    font-weight: 600;
    color: @primary-color;

    @keyframes loading {
      0% {
        transform: translate(0, 0);
      }
      33% {
        transform: translate(0, 10px);
      }
      60% {
        transform: translate(0, -10px);
      }
      100% {
        transform: translate(0, 0);
      }
    }

    .dots {
      height: 18px;
      overflow: hidden;
    }
    .dot {
      width: 4px;
      height: 4px;
      margin: 0 4px;
      border-radius: 50%;
      background: @primary-color;

      &-1 {
        animation: loading 0.8s 0.15s ease infinite;
      }
      &-2 {
        animation: loading 0.8s 0.25s ease infinite;
      }
      &-3 {
        animation: loading 0.8s 0.35s ease infinite;
      }
    }
  }
}
</style>
