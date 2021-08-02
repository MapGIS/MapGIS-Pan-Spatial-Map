export default {
  name: 'EditableTableCell',
  props: {
    column: {
      type: Object,
      default: () => ({})
    },
    record: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      currentRowIndex: null
    }
  },
  methods: {
    emitValue(value) {
      this.$emit('change', value)
    },
    onSelectChange(value) {
      this.emitValue(value[0])
    },
    onInputChange(e) {
      this.emitValue(e.target.value)
    },
    onValueChange(value) {
      this.emitValue(value)
    }
  },
  render(h, ctx) {
    const value = this.record[this.column.dataIndex]
    switch (this.column.type) {
      case 'Select':
        return (
          <a-select
            onChange={this.onSelectChange}
            options={this.column.options}
            disabled={this.disabled}
            value={value}
            size={'small'}
            placeholder={'请选择'}
          />
        )
      case 'Input':
        return (
          <a-input
            onChange={this.onInputChange}
            disabled={this.disabled}
            value={value}
            size={'small'}
            placeholder={'请输入'}
          />
        )
      case 'ColorPicker':
        return (
          <mp-color-picker-confirm
            onChange={this.onValueChange}
            disabled={this.disabled}
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
