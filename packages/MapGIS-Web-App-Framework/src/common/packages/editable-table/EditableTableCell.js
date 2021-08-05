import _debounce from 'lodash/debounce'

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
  render(h, ctx) {
    const { column, record } = this
    const onChange = _debounce(value => {
      this.$emit('change', value)
    }, 200)
    const value = record[column.dataIndex]
    switch (column.type) {
      case 'Select':
        return (
          <a-select
            onChange={onChange}
            options={column.options}
            value={value}
            size={'small'}
            placeholder={'请选择'}
          />
        )
      case 'Input':
        return (
          <a-input
            onChange={e => onChange(e.target.value)}
            value={value}
            size={'small'}
            placeholder={'请输入'}
          />
        )
      case 'InputNumber':
        return (
          <a-input-number
            onChange={onChange}
            value={value}
            {...{ ...column.props }}
          />
        )
      case 'ColorPicker':
        return (
          <mp-color-picker-confirm
            onChange={onChange}
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
