<template>
  <mp-toolbar :bordered="false">
    <mp-toolbar-title :has-padding="false">
      {{ title }}
    </mp-toolbar-title>
    <mp-toolbar-command-group>
      <mp-toolbar-command
        v-for="item in tools"
        :key="item.title"
        :title="item.title"
        :icon="item.icon"
        @click="item.method()"
      />
    </mp-toolbar-command-group>
  </mp-toolbar>
</template>
<script>
export default {
  name: 'MpToolbarHeader',
  props: {
    title: {
      type: String,
      default: ''
    },
    tools: {
      type: Array,
      default: () => []
    }
  }
}
</script>
<style lang="less" scoped></style>
