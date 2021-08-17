<template>
  <div>
    <mp-row-flex label="是否显示动画" :label-width="100">
      <a-radio-group v-model="isAnimation">
        <a-radio :value="true">是</a-radio>
        <a-radio :value="false">否</a-radio>
      </a-radio-group>
    </mp-row-flex>
    <template v-if="isAnimation">
      <mp-row-flex label="动画展示方式" :label-width="100">
        {{ animation.type }}
      </mp-row-flex>
      <mp-row-flex label="动画起止时间" :label-width="100">
        <div class="steps-range">
          <a-space>
            <a-input-number v-model="animation.stepsRange.start" :min="0" />
            <span>至</span>
            <a-input-number v-model="animation.stepsRange.end" :min="0" />
          </a-space>
        </div>
      </mp-row-flex>
      <mp-row-flex label="动画拖尾大小" :label-width="100">
        <a-input-number v-model="animation.trails" :min="1" />
      </mp-row-flex>
      <mp-row-flex label="单个动画时间" :label-width="100">
        <a-input-number v-model="animation.duration" :min="1" />
      </mp-row-flex>
    </template>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class AnimationItems extends Vue {
  @Prop({ type: Object }) readonly value!: Record<string, any>

  isAnimation = false

  defaultAnimation = {
    type: 'time',
    trails: 10,
    duration: 4,
    stepsRange: {
      start: 0,
      end: 100
    }
  }

  @Watch('isAnimation')
  isAnimationChanged(nV) {
    this.emitValue(nV ? this.animation : null)
  }

  get animation() {
    return this.value?.animation || this.defaultAnimation
  }

  set animation(nV) {
    this.emitValue(nV)
  }

  emitValue(value) {
    this.$emit('input', value)
  }
}
</script>
<style lang="less" scoped>
.steps-range {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>
