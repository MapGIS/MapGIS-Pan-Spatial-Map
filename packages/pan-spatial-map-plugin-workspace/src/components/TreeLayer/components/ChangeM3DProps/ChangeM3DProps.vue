<template>
  <div class="change-m3d-props-container">
    <a-form labelAlign="left">
      <a-form-item label="最大屏幕空间误差">
        <a-input-number
          v-model="maximumScreenSpaceError"
          :min="0"
          style="width:100%
          "
        />
      </a-form-item>
      <a-form-item style="textAlign:right">
        <a-button type="primary" @click="submit">
          确认
        </a-button>
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

  maximumScreenSpaceError = this.layer.maximumScreenSpaceError

  submit() {
    this.layer.maximumScreenSpaceError = this.maximumScreenSpaceError
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
