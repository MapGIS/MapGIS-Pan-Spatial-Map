<template>
  <div class="mp-group-tab" :class="classes">
    <hr />
    <slot>
      <span class="title">{{ title }}</span>
    </slot>
    <slot name="handle"></slot>
  </div>
</template>

<script>
export default {
  name: 'MpGroupTab',
  props: {
    title: String,
    background: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      default: 'small',
      validator(val) {
        return ['default', 'large', 'small'].includes(val)
      }
    },
    hasTopMargin: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    classes() {
      return [
        {
          'is-background': this.background,
          [`is-${this.size}`]: !!this.size,
          'has-top-margin': this.hasTopMargin
        }
      ]
    }
  }
}
</script>

<style lang="less">
.mp-group-tab {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 0 0 8px 0;
  font-weight: 700;
  &.has-top-margin {
    margin-top: 8px;
  }
  &.is-small {
    font-size: 12px;
  }
  &.is-default {
    font-size: 14px;
  }
  &.is-large {
    font-size: 16px;
  }
  hr {
    width: 3px;
    height: 1em;
    margin-right: 8px;
    border: 0;
    background-color: @primary-color;
  }
  .title {
    flex: 1;
    color: @heading-color;
  }
}
</style>
