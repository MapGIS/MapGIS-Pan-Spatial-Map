<template>
  <div class="widget-placeholder-container">
    <a-card
      hoverable
      class="widget-card"
      @click.native="$emit('select', widget)"
    >
      <a-icon type="plus" class="widget-select-icon" />
    </a-card>
    <div class="icon-text">微件</div>
  </div>
</template>

<script>
export default {
  name: 'WidgetTemplateItem',
  props: {
    widget: {
      type: Object
    }
  }
}
</script>

<style lang="less" scoped>
.widget-placeholder-container {
  width: 72px;
  display: inline-block;
  vertical-align: top;
  margin: 2px 0;
  .widget-card {
    width: 100%;
    height: 72px;
    position: relative;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center; /* 垂直居中 */
    justify-content: center; /* 水平居中 */
    border: 1px solid hsla(0, 0%, 60%, 0.15);
  }
  .icon-text {
    margin-top: 3px;
    font-size: 12px;
    text-align: center;
    word-wrap: break-word;
    white-space: pre-wrap;
  }
  .widget-select-icon {
    width: 50px;
    height: 50px;
    font-size: 20px;
    color: @primary-color;
    text-align: center;
    line-height: 50px;
  }
}
</style>
