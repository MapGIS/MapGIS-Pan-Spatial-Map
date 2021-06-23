<template>
  <div class="editable-cell">
    <div class="editable-cell-text-wrapper">
      <div class="editable-cell-text">
        {{ value || ' ' }}
      </div>
      <a-icon type="edit" class="editable-cell-icon" @click="edit" />
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Vue, Prop } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'EditableCell' })
export default class EditableCell extends Vue {
  @Prop({ type: String }) text: string

  get value() {
    return this.text
  }

  private edit() {
    this.$emit('editPath')
  }
}
</script>

<style lang="less" scoped>
.editable-cell-icon {
  width: 20px;
  cursor: pointer;
}

.editable-cell-text-wrapper {
  display: flex;
  align-items: center;
}

.editable-cell-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.editable-cell-icon {
  line-height: 18px;
  display: none;
}

.editable-cell:hover .editable-cell-icon {
  display: inline-block;
}

.editable-cell-icon:hover {
  color: #108ee9;
}
</style>
