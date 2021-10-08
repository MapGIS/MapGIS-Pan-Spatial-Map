<template>
  <div class="hex-bin">
    <mapgis-ui-row>
      <mapgis-ui-col :span="12">
        <mapgis-ui-row-flex label="半径大小" :label-width="72">
          <mapgis-ui-input-number v-model="themeStyle.size" :min="10" />
        </mapgis-ui-row-flex>
      </mapgis-ui-col>
      <mapgis-ui-col :span="12">
        <mapgis-ui-row-flex label="最大权重" :label-width="72">
          <mapgis-ui-input-number v-model="themeStyle.max" :min="1" />
        </mapgis-ui-row-flex>
      </mapgis-ui-col>
    </mapgis-ui-row>
    <mapgis-ui-row>
      <mapgis-ui-col :span="12">
        <mapgis-ui-row-flex label="透明度" :label-width="72">
          <mapgis-ui-input-number
            v-model="themeStyle.globalAlpha"
            :min="0.1"
            :max="1"
          />
        </mapgis-ui-row-flex>
      </mapgis-ui-col>
      <mapgis-ui-col :span="12">
        <mapgis-ui-row-flex label="填充颜色" :label-width="72">
          <color-picker-setting v-model="themeStyle.gradient" />
        </mapgis-ui-row-flex>
      </mapgis-ui-col>
    </mapgis-ui-row>
  </div>
</template>
<script lang="ts">
import { Vue, Prop, Component } from 'vue-property-decorator'
import ColorPickerSetting from '../../../../common/ColorPickerSetting.vue'

@Component({
  components: {
    ColorPickerSetting
  }
})
export default class HexBin extends Vue {
  @Prop({ type: Object }) readonly value!: Record<string, any>

  private defaultThemeStyle = {
    max: 100,
    size: 50,
    fillStyle: 'rgba(55, 50, 250, 0.8)',
    shadowColor: 'rgba(255, 250, 50, 1)',
    shadowBlur: 20,
    globalAlpha: 0.5,
    label: {
      show: true,
      fillStyle: 'white'
    },
    gradient: {
      0.25: 'rgb(0,0,255)',
      0.55: 'rgb(0,255,0)',
      0.85: 'yellow',
      1.0: 'rgb(255,0,0)'
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
<style lang="less" scoped>
.hex-bin {
  padding: 12px 8px 0 8px;
  > .mapgis-ui-row {
    margin-bottom: 12px;
  }
}
</style>
