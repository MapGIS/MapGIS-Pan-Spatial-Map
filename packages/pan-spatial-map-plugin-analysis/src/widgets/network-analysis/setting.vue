<template>
  <q-form class="q-gutter-md q-pt-md">
    <div class="form-card-container">
      <label>分析模式</label>
      <div class="q-pa-md q-gutter-xs">
        <div class="row justify-between items-center">
          <q-radio dense v-model="value.analyTp" val="UserMode" label="用户模式" />
          <q-radio dense v-model="value.analyTp" val="SystemMode" label="系统模式" />
        </div>
      </div>
    </div>
    <div class="form-card-container">
      <label>分析半径</label>
      <div class="q-pa-md q-gutter-xs">
        <div class="row justify-between items-center">
          <label>分析半径:</label>
          <q-input class="col-6" outlined v-model="value.nearDis" dense />
        </div>
      </div>
    </div>
    <div class="form-card-container">
      <label>结点网络权值</label>
      <div class="q-pa-md q-gutter-xs">
        <div class="row justify-between items-center">
          <label>结点网络权值:</label>
          <q-select
            class="col-6"
            outlined
            v-model="value.wid1"
            dense
            :options="options"
            option-value="value"
            option-label="label"
            emit-value
            map-options
          />
        </div>
      </div>
    </div>
    <div class="form-card-container">
      <label>边线元素网络权值</label>
      <div class="q-pa-md q-gutter-md">
        <div class="row justify-between items-center">
          <label>边线顺向网络权值:</label>
          <q-select
            class="col-6"
            outlined
            v-model="value.wid2"
            dense
            :options="options"
            option-value="value"
            option-label="label"
            emit-value
            map-options
          />
        </div>
        <div class="row justify-between items-center">
          <label>边线逆向网络权值:</label>
          <q-select
            class="col-6"
            outlined
            v-model="value.wid3"
            dense
            :options="options"
            option-value="value"
            option-label="label"
            emit-value
            map-options
          />
        </div>
      </div>
    </div>
  </q-form>
</template>
<script>
import { Vue, Prop, Component, Watch } from 'vue-property-decorator'

@Component({ name: 'Setting' })
export default class Setting extends Vue {
  @Prop({ type: Object }) value

  options = [
    { value: 'Weight1', label: '缺省网络权值' },
    { value: 'Weight1', label: '顺距离' },
    { value: 'Weight1', label: '逆距离' },
    { value: 'Weight1', label: '顺时' },
    { value: 'Weight1', label: '逆时' },
  ]

  @Watch('value', { deep: true })
  valueChange(val) {
    this.$emit('input', val)
  }
}
</script>
<style lang="scss" scoped>
.form-card-container {
  display: flex;
  flex-direction: column;
  border: 1px solid #dcdcdc;
  border-radius: 4px;
  & > label {
    height: 40px;
    background-color: #dcdcdc;
    line-height: 40px;
    padding: 0 10px;
  }
}
</style>