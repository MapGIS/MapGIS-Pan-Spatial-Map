<template>
  <!-- 聚合标注专题图 -->
  <div class="cluster-label">
    <mapgis-ui-row>
      <mapgis-ui-col :span="12">
        <mapgis-ui-row-flex label="最小半径" :label-width="72">
          <mapgis-ui-input-number v-model="themeStyle.minSize" :min="1" />
        </mapgis-ui-row-flex>
      </mapgis-ui-col>
      <mapgis-ui-col :span="12">
        <mapgis-ui-row-flex label="最大半径" :label-width="72">
          <mapgis-ui-input-number v-model="themeStyle.maxSize" :min="1" />
        </mapgis-ui-row-flex>
      </mapgis-ui-col>
    </mapgis-ui-row>
    <mapgis-ui-row>
      <mapgis-ui-col :span="12">
        <mapgis-ui-row-flex label="聚合点数" :label-width="72">
          <mapgis-ui-input-number v-model="themeStyle.minPoints" :min="1" />
        </mapgis-ui-row-flex>
      </mapgis-ui-col>
      <mapgis-ui-col :span="12">
        <mapgis-ui-row-flex label="聚合级别" :label-width="72">
          <mapgis-ui-input-number
            v-model="themeStyle.maxClusterZoom"
            :min="1"
          />
        </mapgis-ui-row-flex>
      </mapgis-ui-col>
    </mapgis-ui-row>
    <mapgis-ui-row>
      <mapgis-ui-col :span="12">
        <mapgis-ui-row-flex label="细腻程度" :label-width="72">
          <mapgis-ui-input-number v-model="themeStyle.extent" :min="1" />
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
export default class Label extends Vue {
  @Prop({ type: Object }) readonly value!: Record<string, any>

  private defaultThemeStyle = {
    fillStyle: 'rgba(255, 50, 0, 1.0)',
    size: 50 / 3 / 2, // 非聚合点的半径
    minSize: 8, // 聚合点最小半径
    maxSize: 31, // 聚合点最大半径
    globalAlpha: 0.8, // 透明度
    clusterRadius: 150, // 聚合像素半径
    maxClusterZoom: 18, // 最大聚合的级别
    maxZoom: 19, // 最大显示级别
    minPoints: 5, // 最少聚合点数，点数多于此值才会被聚合
    extent: 400, // 聚合的细腻程度，越高聚合后点越密集
    label: {
      // 聚合文本样式
      show: true, // 是否显示
      fillStyle: 'white'
    },
    gradient: {
      // 聚合图标渐变色
      0: 'blue',
      0.5: 'yellow',
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
.cluster-label {
  padding: 12px 8px 0 8px;
  > .mapgis-ui-row {
    margin-bottom: 12px;
  }
}
</style>
