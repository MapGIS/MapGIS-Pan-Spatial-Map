<template>
  <a-form
    :class="[
      'mp-setting-form',
      compact ? 'compact' : '',
      size,
      noLastMarginBottom ? 'no-last-margin-bottom' : ''
    ]"
    :form="form"
    :hideRequiredMark="hideRequiredMark"
    :labelAlign="labelAlign"
    :layout="layout"
    :selfUpdate="selfUpdate"
    :colon="colon"
    @submit="$emit('submit', $event)"
  >
    <slot />
  </a-form>
</template>

<script>
import { formProps } from './props'

export default {
  name: 'MpSettingForm',
  props: formProps
}
</script>

<style lang="less">
.mp-setting-form {
  white-space: normal;
  .ant-form-item {
    .ant-form-item-label label {
      color: @text-color;
    }
  }
  &.mini {
    label,
    .ant-form-item,
    .ant-input,
    .ant-select,
    .ant-input-number,
    .ant-btn,
    .ant-slider-mark,
    .ant-form-explain,
    .ant-form-extra,
    .ant-time-picker-input,
    .ant-input-group-addon,
    .ant-upload.ant-upload-drag p.ant-upload-hint {
      font-size: 12px;
    }
    .ant-upload.ant-upload-drag p.ant-upload-text {
      font-size: 14px;
    }
    .ant-slider {
      margin: 10px 6px;
      &.ant-slider-with-marks {
        margin: 14px 6px;
      }
    }
    .ant-table {
      font-size: 12px;
    }
    .ant-table-pagination.ant-pagination {
      font-size: 12px;
      margin: 8px 0;
    }
  }
  &.ant-form-horizontal {
    .ant-form-item {
      display: flex;
      align-items: center;
      .ant-form-item-label {
        text-align: start;
        margin-right: 12px;
        line-height: normal;
        white-space: normal;
        word-break: break-all;
        width: 90px;
      }
      .ant-form-item-control-wrapper {
        flex: 1;
        display: flex;
        justify-content: flex-end;
        .ant-form-item-control {
          text-align: end;
          width: 170px;
          line-height: 32px;
        }
      }
    }
  }
  &.ant-form-vertical.compact {
    .ant-form-item {
      padding-bottom: 0;
    }
    .ant-slider {
      margin-top: 0;
      &.ant-slider-with-marks {
        margin-top: 0;
      }
    }
  }
  &.compact {
    .ant-form-item {
      margin-bottom: 12px;
    }
  }
  &.no-last-margin-bottom {
    .ant-form-item {
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
