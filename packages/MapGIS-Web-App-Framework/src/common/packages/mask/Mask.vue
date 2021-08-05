<template>
  <div></div>
</template>

<script>
export default {
  // 组件名称，统一以"Mp"开头
  name: 'MpMask',
  props: {
    parentDivClass: {
      type: String,
      required: true,
      default: 'mp-map-container'
    },
    loading: {
      type: Boolean,
      required: true,
      default: false
    },
    percent: {
      type: Number,
      required: false,
      default: 0
    },
    text: {
      type: String,
      required: false,
      default: '分析中...'
    }
  },
  watch: {
    loading: {
      handler() {
        if (this.loading) {
          this.addMask()
        } else {
          this.removeMask()
        }
      }
    },
    percent: {
      handler() {
        if (!this.loading) {
          return
        }
        const mpMaskContentDiv = document.getElementsByClassName(
          'mp-mask-content'
        )
        const content = this.text.replace(/\{percent\}/g, `${this.percent}%`)
        mpMaskContentDiv[0].innerHTML = content
      }
    }
  },
  data() {
    return {
      maskHtml: `<div class="mp-mask"><div class="loading-mask"></div><div class="loading"><div class="loading-indicator"><div class="mp-mask-content">${this.text}</a-button></div></div></div>`,
      maskHtmlSVG:
        '<div class="mp-mask"><div class="loading-mask"></div><div class="loading"><div class="loading-indicator"><svg class="spinner" width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg"><circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30" ></circle></svg></div></div></div>'
    }
  },
  methods: {
    addMask() {
      // 添加遮罩层
      this.removeMask()
      const parentDivClass = this.parentDivClass || 'mp-map-container'
      const parent = document.getElementsByClassName(parentDivClass)
      const mask = document.createElement('mp-mask')
      mask.innerHTML = this.maskHtml
      parent[0].appendChild(mask)
    },

    removeMask() {
      // 移除遮罩层
      const mpMask = document.getElementsByClassName('mp-mask')
      if (mpMask && mpMask.length > 0) {
        const parent = mpMask[0].parentElement
        parent.removeChild(mpMask[0])
      }
    }
  }
}
</script>

<style lang="less">
.mp-mask {
  .loading-mask {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 20000;
    background: rgba(255, 255, 255, 0.3);
  }
  .loading {
    position: absolute;
    left: 45%;
    top: 40%;
    padding: 2px;
    z-index: 20001;
    height: auto;
  }
  .loading .loading-indicator {
    background: transparent;
    color: #444;
    font: bold 20px tahoma, arial, helvetica;
    padding: 10px;
    margin: 0;
    height: auto;
  }

  // offset: 187;
  // duration: 1.4s;

  .spinner {
    animation: rotator 1.4s linear infinite;
  }

  @keyframes rotator {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(270deg);
    }
  }

  .path {
    stroke-dasharray: 187;
    stroke-dashoffset: 0;
    transform-origin: center;
    animation: dash 1.4s ease-in-out infinite,
      colors (1.4s * 4) ease-in-out infinite;
  }

  @keyframes colors {
    0% {
      stroke: #4285f4;
    }
    25% {
      stroke: #de3e35;
    }
    50% {
      stroke: #f7c223;
    }
    75% {
      stroke: #1b9a59;
    }
    100% {
      stroke: #4285f4;
    }
  }

  @keyframes dash {
    0% {
      stroke-dashoffset: 187;
    }
    50% {
      stroke-dashoffset: 187/4;
      transform: rotate(135deg);
    }
    100% {
      stroke-dashoffset: 187;
      transform: rotate(450deg);
    }
  }
}
</style>
