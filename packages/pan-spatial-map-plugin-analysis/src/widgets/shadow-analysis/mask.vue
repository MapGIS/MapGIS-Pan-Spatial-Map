<template>
  <div></div>
  <!-- <div class="mp-mask" v-if="loading">
    <div class="loading-mask"></div>
    <div class="loading">
      <div class="loading-indicator">
        <a-button type="primary" :loading="loading"> </a-button>
        <svg
          class="spinner"
          width="65px"
          height="65px"
          viewBox="0 0 66 66"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            class="path"
            fill="none"
            stroke-width="6"
            stroke-linecap="round"
            cx="33"
            cy="33"
            r="30"
          ></circle>
        </svg>
      </div>
    </div>
  </div> -->
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component({
  name: 'MpMask'
})
export default class MpMask extends Vue {
  // 要加mask的div的class名，方便找到对应的div，把mask加进去
  @Prop() readonly parentDivClass!: string

  // 是否加载
  @Prop({
    type: Boolean,
    default: false
  })
  readonly loading!: boolean

  // 进度
  @Prop({
    type: Number,
    default: 0
  })
  readonly percent: number

  // 遮罩上显示的内容。可设置成“分析中{percent}...”，显示会将percent替换成percent数值
  @Prop({
    type: String,
    default: '分析中...'
  })
  readonly text: string

  // 静态文字显示，目前用的这个
  private maskHtml = `<div class="mp-mask"><div class="loading-mask"></div><div class="loading"><div class="loading-indicator"><div class="mp-mask-content">${this.text}</a-button></div></div></div>`

  // svg动态圆圈显示
  private maskHtmlSVG =
    '<div class="mp-mask"><div class="loading-mask"></div><div class="loading"><div class="loading-indicator"><svg class="spinner" width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg"><circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30" ></circle></svg></div></div></div>'

  @Watch('parentDivClass')
  changeParentDiv() {
    // this.addMask()
  }

  @Watch('loading', { immediate: true })
  changeState() {
    // console.log(`loading:${this.loading}`)
    if (this.loading) {
      this.addMask()
    } else {
      this.removeMask()
    }
  }

  @Watch('percent', { immediate: true })
  changePercent() {
    // console.log(`percent:${this.percent}`)
    if (!this.loading) {
      return
    }
    const content = this.text.replace(/\{percent\}/g, `${this.percent}%`)
    const mpMaskContentDiv = document.getElementsByClassName('mp-mask-content')
    mpMaskContentDiv[0].innerHTML = content
  }

  created() {
    // this.addMask()
    // console.log(`loading:${this.loading}`)
    // console.log(`percent:${this.percent}`)
  }

  // 添加遮罩层
  addMask() {
    this.removeMask()
    const parentDivClass = this.parentDivClass || 'mp-map-container'
    const parent = document.getElementsByClassName(parentDivClass)
    const mask = document.createElement('mp-mask')
    mask.innerHTML = this.maskHtml
    parent[0].appendChild(mask)
  }

  // 移除遮罩层
  removeMask() {
    const mpMask = document.getElementsByClassName('mp-mask')
    if (mpMask && mpMask.length > 0) {
      const parent = mpMask[0].parentElement
      parent.removeChild(mpMask[0])
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
