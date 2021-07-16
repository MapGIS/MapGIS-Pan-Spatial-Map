<template>
  <div class="hinder-table-container">
    <a-table
      :columns="columns"
      :data-source="data"
      size="small"
      :class="isFullScreen === true ? '' : 'fixed-table'"
      :pagination="false"
      :scroll="{
        y: 160,
        x: '100%'
      }"
      rowKey="id"
      bordered
      :customRow="
        record => ({
          on: {
            // 事件
            click: event => {
              rowClick(record)
            } // 点击行
          }
        })
      "
    >
      <span slot="index" slot-scope="text, record, index"
        >{{ index + 1 }}
      </span>
      <span slot="x" slot-scope="text" :title="text">{{ text }} </span>
      <span slot="y" slot-scope="text" :title="text">{{ text }} </span>
      <span slot="action" slot-scope="text, record, index">
        <a-button type="link" @click.stop="deleteRow(index, 'barrier')">
          删除
        </a-button>
      </span>
    </a-table>
  </div>
</template>
<script lang="ts">
import { Vue, Prop, Component, Emit } from 'vue-property-decorator'

@Component({ name: 'MpHinderTable' })
export default class MpHinderTable extends Vue {
  @Prop(Array) data!: array

  @Prop(Array) columns!: array

  @Prop(Boolean) isFullScreen!: boolean

  rowClick(props) {
    this.$emit('rowClick', props)
  }

  deleteRow(props, type) {
    this.$emit('deleteRow', props, type)
  }
}
</script>
<style lang="less">
// .hinder-table-container {
//   .fixed-table {
//     width: 350px;
//   }
// }
</style>
