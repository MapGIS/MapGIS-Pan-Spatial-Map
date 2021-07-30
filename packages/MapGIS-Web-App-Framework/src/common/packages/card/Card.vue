<template>
  <a-card
    :title="title"
    :size="size"
    :bordered="bordered"
    :loading="loading"
    :class="cardCls"
  >
    <template #extra>
      <slot name="extra">
        <mp-toolbar-command-group>
          <mp-toolbar-command
            v-for="item in tools"
            :key="item.title"
            :title="item.title"
            :icon="item.icon"
            :size="size"
            @click="item.method()"
          />
        </mp-toolbar-command-group>
      </slot>
    </template>
    <slot></slot>
  </a-card>
</template>
<script>
export default {
  name: 'MpCard',
  props: {
    title: {
      type: String,
      default: ''
    },
    tools: {
      type: Array,
      default: () => []
    },
    size: {
      type: String,
      default: 'default',
      validator(v) {
        return ['large', 'default', 'small'].includes(v)
      }
    },
    boxShadow: {
      type: Boolean,
      default: false
    },
    bordered: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    cardCls({ boxShadow }) {
      return {
        'mp-card': true,
        'is-box-shadow': boxShadow
      }
    }
  }
}
</script>
<style lang="less">
.mp-card.ant-card {
  .ant-card-head {
    padding: 0 8px;
    min-height: 30px;
    line-height: 30px;
    font-size: 14px;

    .ant-card-head-title,
    .ant-card-extra {
      padding: 0;
    }
  }
  .ant-card-body {
    padding: 8px;
  }

  &.is-box-shadow {
    box-shadow: @box-shadow-base;
  }

  &.ant-card-small {
    .ant-card-head {
      padding: 0 4px;
      min-height: 24px;
      line-height: 24px;
    }
    .ant-card-body {
      padding: 4px;
    }
  }

  &.ant-card-large {
    .ant-card-head {
      padding: 0 12px;
      min-height: 36px;
      line-height: 36px;
    }
    .ant-card-body {
      padding: 12px;
    }
  }
}
</style>
