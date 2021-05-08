<template>
  <div class="split-screen-map">
    <a-empty
      description="请在目录树中勾选需要分屏的专题"
      v-if="!layers.length"
    />
    <a-row v-else :gutter="[5, 8]">
      <a-col
        v-for="(l, i) in layers"
        :key="l.id"
        :span="mapSpan.span"
        :style="{ height: mapSpan.height }"
      >
        <map-view :layer="l" :mapViewID="`split-screen-map-${i}`" />
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator'
import { WidgetMixin, Layer } from '@mapgis/web-app-framework'
import MapView from '../MapView'

@Component({
  components: {
    MapView
  }
})
export default class SplitScreenMap extends Mixins<{
  [k: string]: any
}>(WidgetMixin) {
  @Prop({
    default: () => ({
      span: 12,
      height: '100%'
    })
  })
  mapSpan!: object

  @Prop({ default: () => [] }) layers!: Layer[]
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
