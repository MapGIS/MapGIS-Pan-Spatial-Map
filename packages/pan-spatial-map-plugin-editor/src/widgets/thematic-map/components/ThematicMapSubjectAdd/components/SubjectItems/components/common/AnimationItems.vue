<template>
  <div>
    <mp-row-flex label="是否显示动画" label-align="right" :span="[6, 18]">
      <a-radio-group v-model="isAnimation">
        <a-radio :value="true">是</a-radio>
        <a-radio :value="false">否</a-radio>
      </a-radio-group>
    </mp-row-flex>
    <template v-if="isAnimation">
      <mp-row-flex label="动画展示方式" label-align="right" :span="[6, 18]">
        {{ animation.type }}
      </mp-row-flex>
      <mp-row-flex label="动画起止时间" label-align="right" :span="[6, 18]">
        <div class="steps-range">
          <a-input-number v-model="animation.stepsRange.start" :min="0" />
          <span>~</span>
          <a-input-number v-model="animation.stepsRange.end" :min="0" />
        </div>
      </mp-row-flex>
      <mp-row-flex label="动画拖尾大小" label-align="right" :span="[6, 18]">
        <a-input-number v-model="animation.trails" :min="1" />
      </mp-row-flex>
      <mp-row-flex label="单个动画时间" label-align="right" :span="[6, 18]">
        <a-input-number v-model="animation.duration" :min="1" />
      </mp-row-flex>
    </template>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class AnimationItems extends Vue {
  @Prop() readonly value!: any

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

  get animation() {
    return this.value || this.defaultAnimation
  }

  set animation(nV) {
    this.$emit('input', nV)
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
