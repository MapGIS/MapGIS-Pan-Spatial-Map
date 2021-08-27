<template>
  <div class="widget-template-container">
    <a-card
      hoverable
      class="widget-card"
      @click.native="$emit('select', widget)"
    >
      <div>
        <app-icon :width="50" :height="50" :icon="icon" />
        <a-icon
          type="check-circle"
          class="btn-top-left icon-selected"
          :class="{ visible: selected }"
        />
      </div>
    </a-card>
    <div class="icon-text">{{ label }}</div>
  </div>
</template>

<script>
import AppIcon from './AppIcon'

export default {
  name: 'WidgetTemplateItem',
  components: { AppIcon },
  props: {
    widget: {
      type: Object
    },
    selected: {
      type: Boolean
    }
  },
  computed: {
    icon() {
      return (
        this.widget.manifest.icon ||
        `widgets/${this.widget.name}/images/icon.svg`
      )
    },
    label() {
      return this.widget.manifest.name
    }
  }
}
</script>

<style lang="less" scoped>
.widget-template-container {
  width: 72px;
  display: inline-block;
  vertical-align: top;
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
    .icon-selected {
      display: none;
      font-size: 20px;
    }
    .visible {
      display: block;
    }
  }
  .icon-text {
    margin-top: 3px;
    font-size: 12px;
    text-align: center;
    word-wrap: break-word;
    white-space: pre-wrap;
  }
  .btn-top-left {
    position: absolute;
    top: 5px;
    left: 5px;
  }
}
</style>
