<template>
  <!-- 热力图配置 -->
  <div class="heat-map">
    <mp-row-flex label="实体大小" label-align="right" :span="[6, 18]">
      <a-input-number v-model="style.size" :min="0" />
    </mp-row-flex>
    <mp-row-flex label="最大权重" label-align="right" :span="[6, 18]">
      <a-input-number v-model="style.weight" :min="0" />
    </mp-row-flex>
    <mp-row-flex label="填充颜色" label-align="right" :span="[6, 18]">
      <color-picker v-model="style.gradient" :is-gradient="true" />
    </mp-row-flex>
    <animation-items v-model="style.animation" />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import ColorPicker from '../ColorPicker.vue'
import AnimationItems from '../AnimationItems.vue'

@Component({
  components: {
    ColorPicker,
    AnimationItems
  }
})
export default class HeatMap extends Vue {
  @Prop({
    default: () => ({})
  })
  readonly subject!: any

  get style() {
    return (
      this.subject?.style || {
        size: 13,
        weight: '30',
        gradient: {
          '0.25': 'rgb(0,0,255)',
          '0.55': 'rgb(0,255,0)',
          '0.85': 'yellow',
          '1.0': 'rgb(255,0,0)'
        }
      }
    )
  }

  set style(nV) {
    this.subject = { style: nV }
  }
}
</script>
<style lang="less"></style>
