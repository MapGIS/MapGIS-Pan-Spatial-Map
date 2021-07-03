<template>
  <a-modal
    title="添加数据分类"
    :visible="visible"
    :width="300"
    :mask="false"
    :ok-button-props="okButtonDisabled"
    @cancel="onAddCancel"
    @ok="onAddOk"
  >
    <div style="display: flex;">
      <a-space direction="vertical" style="flex: 1">
        <a-row>
          <label>分类名称</label>
        </a-row>
        <a-row>
          <a-input v-model="name" placeholder="分类名称"></a-input>
        </a-row>
        <a-row>
          <label>分类描述</label>
        </a-row>
        <a-row>
          <a-input v-model="description" placeholder="分类描述"></a-input>
        </a-row>
      </a-space>
    </div>
  </a-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component({
  name: 'AddDataCategory'
})
export default class AddDataCategory extends Vue {
  @Prop({ type: Boolean }) visible

  @Prop({ type: Array }) categories

  private name = ''

  private description = ''

  get okButtonDisabled() {
    return {
      props: {
        disabled:
          !this.name.length ||
          this.categories.some(category => category.name === this.name)
      }
    }
  }

  onAddCancel() {
    this.$emit('finished')
  }

  onAddOk() {
    this.$emit('added', { name: this.name, description: this.description })
    this.$emit('finished')
    this.name = ''
    this.description = ''
  }
}
</script>

<style></style>
