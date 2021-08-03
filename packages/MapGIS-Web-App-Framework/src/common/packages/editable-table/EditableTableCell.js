export default {
  name: 'MpEditableTableCell',
  props: {
    /**
     * {
     *  ...(typeof ColumnProps),
     * type: 'Select|Input|InputNumber|ColorPicker...可扩展',
     * props: ant组件的绑定属性对象
     * }
     */
    column: {
      type: Object,
      default: () => ({})
    },
    record: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    onChange(value) {
      console.log('onChange', value)
      this.$emit('change', value, this.column, this.record)
    },
    onInputChange(e) {
      this.onChange(e.target.value)
    }
  },
  render(h, ctx) {
    const value = this.record[this.column.dataIndex]
    console.log('render', value)
    switch (this.column.type) {
      case 'Select':
        return (
          <a-select
            onChange={this.onChange}
            options={this.column.options}
            value={value}
            size={'small'}
            placeholder={'请选择'}
          />
        )
      case 'Input':
        return (
          <a-input
            onChange={this.onInputChange}
            value={value}
            size={'small'}
            placeholder={'请输入'}
          />
        )
      case 'InputNumber':
        return (
          <a-input-number
            onChange={this.onChange}
            value={value}
            {...{ ...this.column.props }}
          />
        )
      case 'ColorPicker':
        return (
          <mp-color-picker-confirm
            onChange={this.onChange}
            value={value}
            border-radius={false}
          />
        )

      default:
        break
    }
    return null
  }
}
