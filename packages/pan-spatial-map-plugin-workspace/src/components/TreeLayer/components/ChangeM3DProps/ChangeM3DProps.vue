<template>
  <div class="change-m3d-props-container">
    <a-form
      :label-col="{ span: 12 }"
      :wrapper-col="{ span: 12 }"
      labelAlign="left"
    >
      <a-form-item label="最大几何误差">
        <a-input-number v-model="maximumScreenSpaceError" :max="16" :min="1" />
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop, Emit } from 'vue-property-decorator'
import { LayerType } from '@mapgis/web-app-framework'

@Component({
  name: 'MpChangeM3DProps',
  components: {}
})
export default class MpChangeM3DProps extends Vue {
  @Prop() layer

  get maximumScreenSpaceError() {
    return this.layer.maximumScreenSpaceError
  }

  set maximumScreenSpaceError(val) {
    this.layer.maximumScreenSpaceError = val
    this.$emit('update:layer', this.layer)
  }
}
</script>

<style lang="less" scoped>
.select-tilematrixSet {
  margin: 0.5em;
}
.top-02em {
  margin-top: 0.2em;
}
</style>
