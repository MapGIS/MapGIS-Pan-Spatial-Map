<template>
  <div
    class="adjust-line-wrapper adjust-line-wrapper-v"
    @mousedown="onMousedown"
  >
    <div class="adjust-line adjust-line-v"></div>
    <div class="adjust-button">
      <div class="indicator"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MpPanSpatialMapAdjustLine',
  methods: {
    onMousedown(e) {
      let startX = e.clientX
      const move = moveEvent => {
        moveEvent.preventDefault()
        moveEvent.stopPropagation()
        const offset = startX - moveEvent.clientX
        this.$emit('line-move', offset)
        startX -= offset
      }

      const up = moveEvent => {
        document.removeEventListener('mousemove', move, true)
        document.removeEventListener('mouseup', up, true)
      }
      document.addEventListener('mousemove', move, true)
      document.addEventListener('mouseup', up, true)
    }
  }
}
</script>

<style lang="less">
.adjust-line-wrapper {
  .adjust-line {
    border: 1px solid #eee;
  }

  .adjust-line-h {
    width: 100%;
  }

  .adjust-line-v {
    height: 100%;
  }

  .adjust-button {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    width: 30px;
    height: 10px;
    background-color: #fff;

    .indicator {
      margin: 0 auto;
      width: 10px;
      height: 1px;
      background-color: #ccd5db;
    }
  }

  &:hover {
    .adjust-button {
      background-color: @primary-color;
    }

    .adjust-line {
      border-color: @primary-color;
    }
  }
}

.adjust-line-wrapper-h {
  cursor: ns-resize;

  .adjust-tip {
    letter-spacing: 1px;
    padding: 0;
    height: 24px;
    margin: 2px auto 0;
    text-align: center;
    line-height: 24px;
    font-size: 12px;
    color: #868484;
    vertical-align: middle;
  }
}

.adjust-line-wrapper-v {
  position: relative;
  height: calc(100vh - 64px);
  cursor: ew-resize;

  .adjust-button {
    position: absolute;
    right: -10px;
    top: 50%;
    transform: rotate(90deg);
  }
}
</style>
