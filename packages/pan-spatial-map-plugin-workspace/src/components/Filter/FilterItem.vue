<template>
  <a-row type="flex" align="middle" class="filter-item">
    <a-col flex="1 1 0%">
      <a-row type="flex" :gutter="8" align="middle">
        <a-col :span="6">
          <a-select
            style="width:100%"
            placeholder="未知"
            @change="val => (firstFieldIndex = val)"
            size="small"
          >
            <a-select-option
              v-for="(item, index) in fields"
              :key="index"
              :value="index"
              :disabled="!(Object(item) === item && 'value' in item)"
            >
              {{
                Object(item) === item && 'label' in item
                  ? item.label
                  : '- Null -'
              }}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :span="5">
          <a-select style="width:100%" v-model="operIndex" size="small">
            <a-select-option
              v-for="(item, index) in operOptions"
              :key="index"
              :value="item.value"
            >
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :span="8">
          <template
            v-if="
              !notInput &&
                !betweenInput &&
                valueType.value !== 'singleValue' &&
                valueType.value !== 'field'
            "
          >
            <a-input style="width:100%" v-model="secondField" size="small" />
          </template>
          <template v-else-if="betweenInput">
            <a-row type="flex" align="middle">
              <a-col flex="1 1 0%">
                <a-input v-model="secondFieldBetweent[0]" size="small" />
              </a-col>
              <span style="margin:0 5px">和</span>
              <a-col flex="1 1 0%">
                <a-input v-model="secondFieldBetweent[1]" size="small" />
              </a-col>
            </a-row>
          </template>
          <template
            v-if="
              valueType.value === 'singleValue' || valueType.value === 'field'
            "
          >
            <a-select style="width:100%" v-model="secondField" size="small">
              <a-select-option
                v-for="(item, index) in values"
                :key="index"
                :value="item"
              >
                {{ item }}
              </a-select-option>
            </a-select>
          </template>
        </a-col>
        <a-col :span="5">
          <a-select style="width:100%" v-model="valueTypeIndex" size="small">
            <a-select-option
              v-for="(item, index) in valueTypeOptions"
              :key="index"
              :value="item.value"
              :disabled="
                !(Object(item) === item && 'value' in item) ||
                  (Object(item) === item ? item.inactive === true : true)
              "
            >
              {{
                Object(item) === item && 'label' in item
                  ? item.label
                  : '- Null -'
              }}
            </a-select-option>
          </a-select>
        </a-col>
      </a-row>
    </a-col>
    <a-button type="link" @click="$emit('close')" size="small">
      <a-icon type="close" class="item-delete" />
    </a-button>
  </a-row>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch, Model } from 'vue-property-decorator'
import { LayerType, Feature } from '@mapgis/web-app-framework'

export interface SelectOptionItem {
  label: string
  value: string
  [key: string]: unknown
}

// 默认操作符
const defaultOper = Object.freeze({ label: '等于', value: '=' })

// 默认值类型
const defaultValueType = Object.freeze({ label: '值', value: 'value' })

@Component({})
export default class FilterItem extends Vue {
  // 支持v-model绑定SQL结果
  // @Model('change', { type: String, required: false, default: '' })
  // private value!: string

  // 传入查询参数信息
  @Prop(Object) readonly queryParams!: Record<string, any>

  private fields!: SelectOptionItem[] = []

  // // 选中的字段
  // private firstField = { label: '未知', value: '' }

  /**
   * quasar 切换到antd，由于选中的值不能为对象类型，这里需要将选中下标返回，去获取选中的对象
   */
  private firstFieldIndex = -1

  private get firstField() {
    if (this.firstFieldIndex >= 0) {
      const item = this.fields[this.firstFieldIndex]
      return item
    }
    return { label: '未知', value: '' }
  }

  // // 选中的操作符
  // private oper: SelectOptionItem = { ...defaultOper }

  /**
   * quasar 切换到antd，由于选中的值不能为对象类型，这里需要将value在相应的数组里面找出对象
   */
  private operIndex = defaultOper.value

  private get oper() {
    const item = this.operOptions.find(x => x.value === this.operIndex)
    return item
  }

  private set oper(val) {
    for (let index = 0; index < this.operOptions.length; index++) {
      let element = this.operOptions[index]
      if (element.value === this.operIndex) {
        element = val
      }
    }
  }

  // 输入的值
  private secondField = ''

  private values: any[] = []

  // 数值介于之间的值
  private secondFieldBetweent = ['', '']

  // // 选中的值类型
  // private valueType: SelectOptionItem = { ...defaultValueType }

  private valueTypeIndex = defaultValueType.value

  private get valueType() {
    const item = this.valueTypeOptions.find(
      x => x.value === this.valueTypeIndex
    )
    return item
  }

  private set valueType(val) {
    for (let index = 0; index < this.valueTypeOptions.length; index++) {
      let element = this.valueTypeOptions[index]
      if (element.value === this.valueTypeIndex) {
        element = val
      }
    }
  }

  // 值类型
  private valueTypeOptions: SelectOptionItem[] = [
    { label: '值', value: 'value' },
    { label: '字段', value: 'field' },
    { label: '唯一值', value: 'singleValue' }
  ]

  // 是否不需要输入值
  private get notInput() {
    const { value } = this.oper
    return value === 'undefined' || value === 'undefined'
  }

  // 值是否是介于之间 或者不介于之间
  private get betweenInput() {
    const { value } = this.oper
    return value === 'between' || value === 'not'
  }

  // 生成的SQL语句
  private get where() {
    if (!this.firstField.type) return ''
    const { value: first, type } = this.firstField
    const { value: oper } = this.oper
    const { secondField: second } = this
    const [start, end] = this.secondFieldBetweent
    const { notInput, betweenInput } = this
    if (!notInput && !betweenInput) {
      if (oper === 'start') {
        // 开头是
        return `${first} like '${second}%'`
      }
      if (oper === 'end') {
        // 结尾是
        return `${first} like '%${second}'`
      }
      if (oper === 'include') {
        // 包含
        return `${first} like '%${second}%'`
      }
      if (oper === 'notInclude') {
        // 不包含
        return `${first} not like '%${second}%'`
      }
      // 大于、小于、等于、不等于、最大为、最小为
      return `${first} ${oper} ${second}`
    }
    if (betweenInput) {
      if (oper === 'between') {
        // 介于
        return `(${first} >= ${start} AND ${first} <= ${end})`
      }
      if (oper === 'not') {
        // 不介于
        return `(${first} < ${start} AND ${first} > ${end})`
      }
    } else if (notInput) {
      if (oper === 'undefined') {
        // 为空
        return `(${first} is null or trim(${first}) == ''`
      }
      if (oper === '!undefined') {
        // 不为空
        return `(${first} is not null and trim(${first}) != ''`
      }
    }

    return ''
  }

  // 根据字段类型显示操作符
  private get operOptions() {
    let result: SelectOptionItem[] = []
    result.push(defaultOper)
    if (!this.firstField.type) return result
    const { type } = this.firstField
    switch (type) {
      case 'long':
      case 'double':
      case 'float':
        result = [
          { label: '大于', value: '>' },
          { label: '小于', value: '<' },
          { label: '等于', value: '=' },
          { label: '不等于', value: '!=' },
          { label: '最大为', value: '<=' },
          { label: '最小为', value: '>=' },
          { label: '介于', value: 'between' },
          { label: '不介于', value: 'not' },
          { label: '为空', value: 'undefined' },
          { label: '不为空', value: '!undefined' }
        ]
        break
      case 'string':
        result = [
          { label: '等于', value: '=' },
          { label: '不等于', value: '!=' },
          { label: '开头是', value: 'start' },
          { label: '结尾是', value: 'end' },
          { label: '包含', value: 'include' },
          { label: '不包含', value: 'notInclude' },
          { label: '为空', value: 'undefined' },
          { label: '不为空', value: '!undefined' }
        ]
        break
      default:
        break
    }
    return result
  }

  async mounted() {
    await this.changeQueryParams()
  }

  @Watch('queryParams', { deep: true })
  async changeQueryParams() {
    this.fields = await this.getFieldInfosByLayer()
  }

  async getFieldInfosByLayer() {
    const {
      serverType,
      serverName,
      serverUrl,
      ip,
      port,
      layerIndex,
      gdbp
    } = this.queryParams
    let options: OptionItem[] = []
    if (
      serverType === LayerType.IGSMapImage ||
      serverType === LayerType.IGSVector ||
      serverType === LayerType.IGSScene
    ) {
      const info = await Feature.FeatureQuery.query(
        {
          ip: this.queryParams.ip,
          port: this.queryParams.port,
          f: 'json',
          docName: serverName,
          layerIdxs: layerIndex,
          IncludeAttribute: false,
          IncludeGeometry: false,
          IncludeWebGraphic: false,
          cursorType: 'cursorType',
          gdbp
        },
        false,
        serverType === LayerType.IGSScene
      )

      const {
        AttStruct: { FldName, FldType, FldNumber }
      } = info

      for (let index = 0; index < FldNumber; index += 1) {
        options.push({
          label: FldName[index],
          value: FldName[index],
          type: FldType[index]
        })
      }
    } else if (serverType === LayerType.ArcGISMapImage) {
      const result = await Feature.ArcGISFeatureQuery.getLayerFileds({
        f: 'json',
        serverUrl,
        layerIndex
      })
      console.log(result)
      options = result.fields
        .map((item, index) => ({
          label: item.name,
          value: item.name,
          type: item.type
        }))
        .map(({ label, value, type }) => ({
          label: label,
          value: value,
          type: type.toLowerCase()
        }))
    }
    return options
  }

  // 选择字段之后重置操作符
  @Watch('firstField', { immediate: true, deep: true })
  private selectFirstField() {
    this.oper = { ...defaultOper }
  }

  // 选择操作符之后重置值
  @Watch('oper', { immediate: true, deep: true })
  private selectOper() {
    this.secondField = ''
    this.secondFieldBetweent[0] = ''
    this.secondFieldBetweent[1] = ''
    const { oper, notInput, betweenInput } = this
    const { valueTypeOptions } = this
    let opts: Record<string, any>[] = []
    if (
      notInput ||
      betweenInput ||
      oper === 'start' ||
      oper === 'end' ||
      oper === 'include' ||
      oper === 'notInclude'
    ) {
      opts = valueTypeOptions.filter(item => {
        if (item.value !== 'value') {
          item.inactive = true
        }
        return item
      })
    } else {
      opts = valueTypeOptions.filter(item => {
        if (item.value !== 'value') {
          item.inactive = false
        }
        return item
      })
    }
    this.valueType = { label: '值', value: 'value' }
    this.valueTypeOptions = [...opts]
  }

  @Watch('valueType', { deep: true })
  changeValueType() {
    const { value } = this.valueType
    if (value === 'singleValue') {
      // 唯一值，需要查出对应字段的属性值
      this.getValue()
    } else if (value === 'field') {
      // 字段，如果第一个字段是数字类型，那么第二个字段也显示数字类型；如果第一个字段是字符串类型，那么第二个字段也显示字符串类型。
      const { type } = this.firstField
      if (type === 'long' || type === 'double' || type === 'float') {
        this.values = this.fields
          .filter(x => {
            return (
              x.type === 'long' || x.type === 'double' || x.type === 'float'
            )
          })
          .map(x => {
            return x.value
          })
      } else if (type === 'string') {
        this.values = this.fields
          .filter(x => {
            return x.type === 'string'
          })
          .map(x => {
            return x.value
          })
      }
    }
  }

  // 获取属性值
  async getValue() {
    const name = this.firstField.value
    if (!name) {
      return
    }
    const {
      serverType,
      ip,
      port,
      serverName,
      layerIndex,
      serverUrl,
      gdbp
    } = this.queryParams
    if (
      serverType === LayerType.IGSMapImage ||
      serverType === LayerType.IGSVector
    ) {
      const result = await Feature.FeatureQuery.query({
        ip,
        port: port.toString(),
        f: 'json',
        cursorType: 'cursorType',
        page: 0,
        pageCount: 10000,
        docName: serverName,
        layerIdxs: layerIndex,
        gdbp
      })

      const { SFEleArray: features, AttStruct } = result
      const index = AttStruct.FldName.indexOf(name)
      this.values = Array.from(
        new Set(features.map(({ AttValue }) => AttValue[index]))
      ).map(value => {
        return value
      })
    } else if (serverType === LayerType.ArcGISMapImage) {
      const result = await Feature.ArcGISFeatureQuery.getLayerFileds({
        f: 'json',
        serverUrl,
        layerIndex,
        outFields: name,
        page: 0,
        pageCount: Number(this.valueSize)
      })
      const values = Array.from(new Set(result.value.map(value => ({ value }))))
      this.valueTableData = values
    }
  }

  // SQL变更提交change事件
  @Watch('where')
  private changeWhere(val: string) {
    this.$emit('change', val)
  }
}
</script>

<style lang="less" scoped>
.filter-item {
  .item-delete {
    color: @error-color;
  }
}
</style>
