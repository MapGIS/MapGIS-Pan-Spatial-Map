<template>
  <div class="heat-map">
    <mp-row-flex label="类型选择" label-align="right" :label-width="76">
      <a-radio-group v-model="type">
        <a-radio value="CESIUM">原生</a-radio>
        <a-radio value="MAPV">mapv</a-radio>
      </a-radio-group>
    </mp-row-flex>
    <template v-if="isCesium">
      <mp-row-flex label="是否聚合" label-align="right" :label-width="76">
        <a-radio-group v-model="style.useClustering">
          <a-radio :value="true">是</a-radio>
          <a-radio :value="false">否</a-radio>
        </a-radio-group>
      </mp-row-flex>
      <mp-row-flex label="半径大小" label-align="right" :label-width="76">
        <a-input-number v-model="style.radius" :min="13" />
      </mp-row-flex>
      <mp-row-flex label="模糊值" label-align="right" :label-width="76">
        <a-input-number v-model="style.blur" :min="0.1" :max="1" />
      </mp-row-flex>
    </template>
    <template v-else>
      <mp-row-flex label="半径大小" label-align="right" :label-width="72">
        <a-input-number v-model="style.size" :min="13" />
      </mp-row-flex>
      <mp-row-flex label="最大权重" label-align="right" :label-width="72">
        <a-input-number v-model="style.max" :min="1" />
      </mp-row-flex>
      <!-- 动画项设置(缺陷列表#108) -->
      <!-- <animation-items v-model="style.animation" /> -->
    </template>
    <mp-row-flex label="填充颜色" label-align="right" :label-width="76">
      <color-picker-setting v-model="style.gradient" />
    </mp-row-flex>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import ColorPickerSetting from '../common/ColorPickerSetting.vue'
// import AnimationItems from '../common/AnimationItems.vue'

enum HeatMapType {
  MAPV = 'MAPV',
  CESIUM = 'CESIUM'
}

@Component({
  components: {
    // AnimationItems,
    ColorPickerSetting
  }
})
export default class HeatMap extends Vue {
  @Prop({ type: Object }) readonly value!: Record<string, any>

  private type = HeatMapType.CESIUM

  @Watch('type')
  typeChanged(t) {
    this.style = this.getStyle(t)
  }

  get isCesium() {
    return this.type === HeatMapType.CESIUM
  }

  get style() {
    return this.value?.style || this.getStyle()
  }

  set style(nV) {
    this.emitChange(nV)
  }

  getStyle(type: keyof HeatMapType = HeatMapType.CESIUM) {
    return {
      type,
      gradient: {
        '0.25': 'rgb(0,0,255)',
        '0.55': 'rgb(0,255,0)',
        '0.85': 'rgb(241,241,15)',
        '1.0': 'rgb(255,0,0)'
      },
      ...(type === HeatMapType.CESIUM
        ? {
            blur: 0.85,
            radius: 20,
            useClustering: true
          }
        : {
            size: 20,
            max: 100
          })
    }
  }

  emitChange(style) {
    this.$emit('change', { style })
  }

  created() {
    this.emitChange(this.style)
  }
}
</script>
<style lang="less" scoped>
.heat-map {
  padding-top: 8px;
  > .ant-row-flex {
    margin-bottom: 12px;
  }
}
</style>
