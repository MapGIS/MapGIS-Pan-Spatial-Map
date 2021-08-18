<template>
  <div class="heat-map">
    <!-- 最大权重 -->
    <!-- <mp-row-flex label="最大权重" label-align="right" :label-width="72">
      <a-input-number v-model="style.max" :min="8" />
    </mp-row-flex> -->
    <!-- 半径大小 -->
    <!-- <mp-row-flex label="半径大小" label-align="right" :label-width="72">
      <a-input-number v-model="style.size" :min="10" />
    </mp-row-flex> -->
    <!-- 是否聚合 -->
    <mp-row-flex label="是否聚合" label-align="right" :label-width="76">
      <a-radio-group v-model="style.useClustering">
        <a-radio :value="true">是</a-radio>
        <a-radio :value="false">否</a-radio>
      </a-radio-group>
    </mp-row-flex>
    <!-- 半径大小 -->
    <mp-row-flex label="半径大小" label-align="right" :label-width="76">
      <a-input-number v-model="style.radius" :min="8" />
    </mp-row-flex>
    <!-- 模糊值 -->
    <mp-row-flex label="模糊值" label-align="right" :label-width="76">
      <a-input-number v-model="style.blur" :min="0.1" :max="1" />
    </mp-row-flex>
    <!-- 颜色填充 -->
    <mp-row-flex label="填充颜色" label-align="right" :label-width="76">
      <color-picker-setting v-model="style.gradient" />
    </mp-row-flex>
    <!-- 动画项设置 -->
    <!-- <animation-items v-model="style.animation" /> -->
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import ColorPickerSetting from '../common/ColorPickerSetting.vue'
// import AnimationItems from '../common/AnimationItems.vue'

@Component({
  components: {
    // AnimationItems,
    ColorPickerSetting
  }
})
export default class HeatMap extends Vue {
  @Prop({ type: Object }) readonly value!: Record<string, any>

  defaultStyle = {
    // size: 13,
    // max: 30,
    blur: 0.75,
    radius: 60,
    useClustering: true,
    gradient: {
      '0.25': 'rgb(0,0,255)',
      '0.55': 'rgb(0,255,0)',
      '0.85': 'rgb(241,241,15)',
      '1.0': 'rgb(255,0,0)'
    }
  }

  get style() {
    return this.value?.style || this.defaultStyle
  }

  set style(nV) {
    this.emitChange(nV)
  }

  emitChange(style) {
    this.$emit('change', { style })
  }

  created() {
    this.emitChange(this.style)
  }
}
</script>
