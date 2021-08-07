<template>
  <div
    v-show="show"
    class="mp-portal"
    :class="`mp-portal-${size}`"
    :style="portalStyle"
  >
    <div class="mp-portal-content">
      <slot>
        <span>{{ tip }}</span>
      </slot>
      <span class="dots">
        <span class="dot dot-1">.</span>
        <span class="dot dot-2">.</span>
        <span class="dot dot-3">.</span>
      </span>
      <slot name="suffix"></slot>
    </div>
  </div>
</template>
<script>
export default {
  name: 'MpPortal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    tip: {
      type: String,
      default: '正在加载, 请稍等'
    },
    size: {
      type: String,
      default: 'default',
      validator(v) {
        return ['large', 'default', 'small'].includes(v)
      }
    },
    zIndex: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      show: false
    }
  },
  computed: {
    portalStyle({ zIndex }) {
      return {
        zIndex
      }
    }
  },
  watch: {
    visible(nV) {
      if (this.show !== nV) {
        this.show = nV
      }
    },
    show(nV) {
      this.$emit('input', nV)
    }
  },
  created() {
    if (this.show !== this.visible) {
      this.show = this.visible
    }
  }
}
</script>
<style lang="less" scoped>
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
.mp-portal {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  top: 0;
  font-size: 18px;
  color: @primary-color;
  background: fade(@white, 50%);
  font-weight: 700;
  &-content {
    span {
      display: inline-block;
      vertical-align: middle;
    }
  }
  .dots {
    overflow: hidden;
    height: 18px;
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

  &.large {
    font-size: 22px;
    .dot {
      width: 6px;
      height: 6px;
    }
  }

  &.small {
    font-size: 14px;
    .dot {
      width: 3px;
      height: 3px;
    }
  }
}
</style>
