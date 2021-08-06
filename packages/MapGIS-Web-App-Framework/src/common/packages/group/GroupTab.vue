<template>
  <div class="mp-group-tab" :class="classes">
    <hr />
    <span class="title">
      <slot name="title">{{ title }}</slot>
    </span>
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
      default: 'mini',
      validator(val) {
        return ['default', 'large', 'small', 'mini'].includes(val)
      }
    },
    hasTopMargin: {
      type: Boolean,
      default: true
    },
    hasBottomMargin: {
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
          'has-top-margin': this.hasTopMargin,
          'has-bottom-margin': this.hasBottomMargin
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
  font-weight: 700;

  &.is-mini {
    font-size: 12px;
    &.has-top-margin {
      margin-top: 4px;
    }
    &.has-bottom-margin {
      margin-bottom: 4px;
    }
  }
  &.is-small {
    font-size: 14px;
    &.has-top-margin {
      margin-top: 6px;
    }
    &.has-bottom-margin {
      margin-bottom: 6px;
    }
  }
  &.is-default {
    font-size: 14px;
    &.has-top-margin {
      margin-top: 7px;
    }
    &.has-bottom-margin {
      margin-bottom: 7px;
    }
  }
  &.is-large {
    font-size: 16px;
    &.has-top-margin {
      margin-top: 8px;
    }
    &.has-bottom-margin {
      margin-bottom: 8px;
    }
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
