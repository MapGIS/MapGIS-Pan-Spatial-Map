<template>
  <div class="widget-select-container">
    <a-row :gutter="14" type="flex">
      <a-col v-for="(widget, index) in widgetPool" :key="index">
        <widget-template-item
          :widget="widget"
          :selected="isSelected(widget)"
          @select="selectWidget"
        />
      </a-col>
    </a-row>
  </div>
</template>

<script>
import WidgetTemplateItem from './WidgetTemplateItem'

export default {
  name: 'WidgetSelect',
  components: { WidgetTemplateItem },
  props: {
    widgetPool: {
      type: Array
    },
    multiple: {
      type: Boolean,
      default: false
    },
    selectedWidgets: {
      type: Array
    }
  },
  computed: {
    isSelected() {
      return function(widget) {
        return (
          this.selectedWidgets.findIndex(item => {
            return item === widget.name
          }) >= 0
        )
      }
    }
  },
  methods: {
    selectWidget(widget) {
      if (this.multiple) {
        const index = this.selectedWidgets.findIndex(item => {
          return item === widget.name
        })
        if (index >= 0) {
          this.selectedWidgets.splice(index, 1)
        } else {
          this.selectedWidgets.push(widget.name)
        }
      } else {
        this.selectedWidgets.splice(0, this.selectedWidgets.length)
        this.selectedWidgets.push(widget.name)
      }
    }
  }
}
</script>

<style lang="less" scoped></style>
