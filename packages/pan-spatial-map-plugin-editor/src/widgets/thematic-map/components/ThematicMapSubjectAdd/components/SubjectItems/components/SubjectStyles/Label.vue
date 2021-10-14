<template>
  <!-- 聚合标注专题图 -->
  <div class="cluster-label">
    <a-row>
      <a-col :span="12">
        <mp-row-flex label="最小半径" :label-width="72">
          <a-input-number v-model="themeStyle.minSize" :min="1" />
        </mp-row-flex>
      </a-col>
      <a-col :span="12">
        <mp-row-flex label="最大半径" :label-width="72">
          <a-input-number v-model="themeStyle.maxSize" :min="1" />
        </mp-row-flex>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="12">
        <mp-row-flex
          :label-width="72"
          label="聚合点数"
          title="点数多于此值才会被聚合"
        >
          <a-input-number v-model="themeStyle.minPoints" :min="1" />
        </mp-row-flex>
      </a-col>
      <a-col :span="12">
        <mp-row-flex label="聚合级别" :label-width="72">
          <a-input-number v-model="themeStyle.maxClusterZoom" :min="1" />
        </mp-row-flex>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="12">
        <mp-row-flex label="像素半径" :label-width="72">
          <a-input-number v-model="themeStyle.clusterRadius" :min="1" />
        </mp-row-flex>
      </a-col>
      <a-col :span="12">
        <mp-row-flex
          :label-width="72"
          label="细腻程度"
          title="细腻程度越高聚合后点越密集"
        >
          <a-input-number v-model="themeStyle.extent" :min="1" />
        </mp-row-flex>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="12">
        <mp-row-flex :label-width="72" label="透明度">
          <a-input-number
            v-model="themeStyle.globalAlpha"
            :step="0.1"
            :min="0.1"
            :max="1"
          />
        </mp-row-flex>
      </a-col>
      <a-col :span="12">
        <mp-row-flex :label-width="72" label="渐变颜色">
          <color-picker-setting v-model="themeStyle.gradient" />
        </mp-row-flex>
      </a-col>
    </a-row>
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
      0: '#1876d0',
      0.5: '#bdbd0d',
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
  padding: 8px;
  > .ant-row:not(:last-of-type) {
    margin-bottom: 8px;
  }
}
</style>
