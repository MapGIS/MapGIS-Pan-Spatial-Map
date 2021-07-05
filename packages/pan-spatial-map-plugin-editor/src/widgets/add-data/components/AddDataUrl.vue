<template>
  <div class="add-data-url-wrapper beauty-scroll">
    <a-space direction="vertical" style="flex: 1">
      <a-row>
        <label>分类</label>
      </a-row>
      <a-row>
        <add-data-category-select
          :categories="categories"
          :value="categoryName"
          @select="onCategorySelect"
          class="full-width"
        />
      </a-row>
      <a-row>
        <label>类型</label>
      </a-row>
      <a-row>
        <add-data-type-select
          :types="urlDataTypes"
          :value="urlDataType"
          @select="onDataTypeSelect"
          class="full-width"
        />
      </a-row>
      <a-row>
        <label>地址</label>
      </a-row>
      <a-row>
        <a-textarea v-model="url" auto-size> </a-textarea>
      </a-row>
      <a-row>
        <a-textarea
          class="url-example"
          disabled
          :value="`示例 : ${this.urlDataType.example}`"
          auto-size
        ></a-textarea>
      </a-row>
      <a-row>
        <label>名称</label>
      </a-row>
      <a-row>
        <a-input v-model="name"> </a-input>
      </a-row>
      <template v-if="hasToken">
        <a-row>
          <label>令牌</label>
        </a-row>
        <a-row>
          <a-input v-model="token"> </a-input>
        </a-row>
      </template>
      <a-row>
        <a-button
          type="primary"
          @click="onAdd"
          class="full-width"
          style="margin-top: 10px;"
          :disabled="url.length == 0 || name.length == 0"
        >
          添加
        </a-button>
      </a-row>
    </a-space>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { UrlUtil } from '@mapgis/web-app-framework'
import AddDataCategorySelect from './AddDataCategorySelect.vue'
import AddDataTypeSelect from './AddDataTypeSelect.vue'

@Component({
  name: 'AddDataUrl',
  components: {
    AddDataCategorySelect,
    AddDataTypeSelect
  }
})
export default class AddDataUrl extends Vue {
  @Prop({ type: Array }) urlDataTypes

  @Prop({ type: Array }) categories

  private categoryName = this.categories.length ? this.categories[0].name : ''

  private urlDataType = this.urlDataTypes.length ? this.urlDataTypes[0] : null

  private url = ''

  private name = ''

  private token = ''

  get hasToken() {
    return (
      (this.urlDataType && this.urlDataType.value === 'IMAGEARCGIS') || false
    )
  }

  onCategorySelect(val) {
    this.categoryName = val
  }

  onDataTypeSelect(val) {
    this.urlDataType = val
  }

  onAdd() {
    if (!UrlUtil.isUrlValid(this.url)) {
      this.$message.warn('请输入正确的数据地址')
      return
    }

    // 应该要对地址进行解析，判断是否有效
    const data = {
      name: this.categoryName,
      data: { type: this.urlDataType.value, url: this.url, name: this.name }
    }
    if (this.hasToken) {
      this.$set(data.data, 'token', this.token)
    }
    this.$emit('added', data)
  }
}
</script>

<style lang="less" scoped>
.add-data-url-wrapper {
  overflow: auto;
  display: flex;
  .full-width {
    width: 100%;
  }
  .url-example {
    padding: 3px 0;
    color: @text-color-secondary;
    word-break: break-all;
    white-space: break-spaces;
    font-size: 12px;
    &.ant-input {
      border: none;
      background-color: transparent;
      resize: none;
      min-height: 24px;
    }
  }
}
</style>
