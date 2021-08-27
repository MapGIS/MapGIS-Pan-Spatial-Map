<template>
  <a-modal
    title="配置微件"
    :visible="visible"
    @update:visible="updateVisible"
    width="75%"
    @ok="confirmConfigWidget"
    @cancel="updateVisible(false)"
  >
    <a-spin :spinning="loading">
      <component
        v-if="!loading"
        :is="this.widgetSettingUiComponent"
        ref="widgetJsonConfig"
        :widget-config="config"
      />
    </a-spin>
  </a-modal>
</template>

<script>
import { AppManager } from '../../managers'
import { deepClone } from '../../../utils/object-util'
import WidgetJsonConfig from './WidgetJsonConfig'

export default {
  name: 'WidgetConfigSetting',
  components: { WidgetJsonConfig },
  props: {
    widget: {
      type: Object
    },
    widgetTemplate: {
      type: Object
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      config: {},
      widgetSettingUiComponents: []
    }
  },
  computed: {
    widgetSettingUiComponent() {
      const result = this.widgetSettingUiComponents.find(item => {
        return item.name === this.widget.uri
      })

      if (result) return result.component

      return 'widget-json-config'
    }
  },
  watch: {
    widget: {
      async handler() {
        this.loading = true
        // 变化前赋初值
        this.config = {}

        // 默认Url
        let widgetConfigUrl = `${this.widget.uri}/config.json`
        if (
          typeof this.widget.config === 'object' &&
          this.widget.config.constructor === Object
        ) {
          // 如果为对象，直接使用
          this.config = deepClone(this.widget.config)
        } else {
          if (
            typeof this.widget.config === 'string' &&
            this.widget.config.constructor === String
          ) {
            // 如果为字符串，替换默认Url
            widgetConfigUrl = this.widget.config
          }

          // 获取widget配置
          this.config = await AppManager.getInstance().getWidgetConfig(
            widgetConfigUrl
          )
        }

        this.loading = false
      },
      immediate: true
    }
  },
  methods: {
    updateVisible(visible) {
      this.$emit('update:visible', visible)
    },
    confirmConfigWidget() {
      this.updateVisible(false)
      // 先设置对象到widget的config上
      let config = this.$refs.widgetJsonConfig.getConfig()

      if (typeof config === 'string') {
        config = JSON.parse(config)
      }

      this.$set(this.widget, 'config', config)
    }
  }
}
</script>

<style lang="less" scoped></style>
