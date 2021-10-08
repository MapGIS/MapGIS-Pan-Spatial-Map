<template>
  <div></div>
</template>
<script lang="ts">
import { Vue, Prop, Component } from 'vue-property-decorator'

@Component
export default class HexBin extends Vue {
  @Prop({ type: Object }) readonly value!: Record<string, any>

  private defaultThemeStyle = {
    max: 100,
    label: {
      show: true,
      fillStyle: 'white',
      shadowColor: 'yellow',
      font: '15px Arial',
      shadowBlur: 10
    },
    gradient: {
      '0': 'rgba(49, 54, 149, 0)',
      '0.2': 'rgba(69,117,180, 0.7)',
      '0.3': 'rgba(116,173,209, 0.7)',
      '0.4': 'rgba(171,217,233, 0.7)',
      '0.5': 'rgba(224,243,248, 0.7)',
      '0.6': 'rgba(254,224,144,0.7)',
      '0.7': 'rgba(253,174,97,0.7)',
      '0.8': 'rgba(244,109,67,0.8)',
      '0.9': 'rgba(215,48,39,0.8)',
      '0.95': 'rgba(165, 0, 38,0.8)'
    }
  }

  get themeStyle() {
    return this.value?.themeStyle || this.defaultThemeStyle
  }

  set themeStyle(nV) {
    this.emitChange(nV)
  }

  emitChange(themeStyle) {
    this.$emit('input', { themeStyle })
  }

  created() {
    this.emitChange(this.defaultThemeStyle)
  }
}
</script>
<style lang="less" scoped></style>
