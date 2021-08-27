<template>
  <div class="widget-container">
    <a-card hoverable class="widget-card" :class="grayBackgroundClassObject">
      <div>
        <app-icon :width="50" :height="50" :icon="icon" />
        <a-tooltip
          v-for="(action, index) in actions"
          :key="index"
          placement="top"
          :title="action.text"
        >
          <a-icon
            :type="action.icon"
            class="visible"
            style="font-size: 16px;"
            :class="btnClassObject(action)"
            @click="action.callback(widget, widgetTemplate)"
          ></a-icon>
        </a-tooltip>
      </div>
    </a-card>
    <div class="icon-text">{{ label }}</div>
  </div>
</template>

<script>
import AppIcon from './AppIcon'
import { UUID } from '../../../model/utils'

export default {
  name: 'WidgetItem',
  components: { AppIcon },
  props: {
    widget: {
      type: Object
    },
    widgetTemplate: {
      type: Object
    },
    actions: {
      type: Array
    }
  },
  computed: {
    icon() {
      return (
        this.widget.icon ||
        this.widgetTemplate.manifest.icon ||
        this.widget.uri + '/images/icon.svg'
      )
    },
    label() {
      return this.widget.label || this.widgetTemplate.manifest.name
    },
    btnClassObject() {
      return function(action) {
        return {
          'btn-top-right': action.placement === 'top-right',
          'btn-bottom-right': action.placement === 'bottom-right',
          'btn-bottom-left': action.placement === 'bottom-left',
          'btn-top-left': action.placement === 'top-left'
        }
      }
    },
    grayBackgroundClassObject() {
      return {
        'gray-background': 'visible' in this.widget && !this.widget.visible
      }
    }
  },
  mounted() {
    if (!this.widget.id) {
      this.$set(this.widget, 'id', `widget_${UUID.uuid()}`)
    }
  }
}
</script>

<style lang="less" scoped>
.widget-container {
  width: 72px;
  display: inline-block;
  vertical-align: top;
  margin: 2px 0;
  .widget-card {
    width: 100%;
    height: 72px;
    position: relative;
    cursor: pointer;
    color: @primary-color;
    display: flex;
    flex-direction: column;
    align-items: center; /* 垂直居中 */
    justify-content: center; /* 水平居中 */
    border: 1px solid hsla(0, 0%, 60%, 0.15);
    .visible {
      display: none;
    }
    &:hover {
      .visible {
        display: block;
      }
    }
    /deep/ .ant-card-body {
      padding: 0;
    }
  }
  .gray-background {
    background-color: hsla(0, 0%, 60%, 0.15);
  }
  .icon-text {
    margin-top: 3px;
    font-size: 12px;
    text-align: center;
    word-wrap: break-word;
    white-space: pre-wrap;
  }
  .btn-top-right {
    position: absolute;
    top: 3px;
    right: 3px;
  }
  .btn-bottom-right {
    position: absolute;
    bottom: 3px;
    right: 3px;
  }
  .btn-bottom-left {
    position: absolute;
    bottom: 3px;
    left: 3px;
  }
  .btn-top-left {
    position: absolute;
    top: 3px;
    left: 3px;
  }
}
</style>
