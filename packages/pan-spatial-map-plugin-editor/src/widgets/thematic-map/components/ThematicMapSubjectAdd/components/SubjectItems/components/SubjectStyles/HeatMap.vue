<template>
  <div class="heat-map">
    <mp-row-flex label="类型选择" :label-width="76">
      <a-radio-group v-model="type">
        <a-radio value="CESIUM">原生</a-radio>
        <a-radio value="MAPV">mapv</a-radio>
      </a-radio-group>
    </mp-row-flex>
    <template v-if="isCesium">
      <mp-row-flex label="是否聚合" :label-width="76">
        <a-radio-group v-model="themeStyle.useClustering">
          <a-radio :value="true">是</a-radio>
          <a-radio :value="false">否</a-radio>
        </a-radio-group>
      </mp-row-flex>
      <mp-row-flex label="半径大小" :label-width="76">
        <a-input-number v-model="themeStyle.radius" :min="13" />
      </mp-row-flex>
      <mp-row-flex label="模糊大小" :label-width="76">
        <a-input-number v-model="themeStyle.blur" :min="0.1" :max="1" />
      </mp-row-flex>
    </template>
    <template v-else>
      <mp-row-flex label="半径大小" :label-width="72">
        <a-input-number v-model="themeStyle.size" :min="13" />
      </mp-row-flex>
      <mp-row-flex label="最大权重" :label-width="72">
        <a-input-number v-model="themeStyle.max" :min="1" />
      </mp-row-flex>
      <!-- 动画项设置(缺陷列表#108) -->
      <!-- <animation-items v-model="themeStyle.animation" /> -->
    </template>
    <mp-row-flex label="渐变颜色" :label-width="76">
      <color-picker-setting v-model="themeStyle.gradient" />
    </mp-row-flex>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import ColorPickerSetting from '../../../../common/ColorPickerSetting.vue'
// import AnimationItems from '../../../../common/AnimationItems.vue'

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
    this.themeStyle = this.getThemeStyle(t)
  }

  get isCesium() {
    return this.type === HeatMapType.CESIUM
  }

  get themeStyle() {
    return this.value?.themeStyle || this.getThemeStyle()
  }

  set themeStyle(nV) {
    this.emitChange(nV)
  }

  getThemeStyle(type: keyof HeatMapType = HeatMapType.CESIUM) {
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

  emitChange(themeStyle) {
    this.$emit('input', { themeStyle })
  }

  created() {
    this.emitChange(this.getThemeStyle())
  }
}
</script>
<style lang="less" scoped>
.heat-map {
  padding: 8px;
  > .mp-row-flex:not(:last-of-type) {
    margin-bottom: 8px;
  }
}
</style>
