<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated class="transparent">
      <slot name="header" :toggle-left-drawer="toggleLeftDrawer" />
    </q-header>
    <q-drawer
      elevated
      class="transparent"
      v-model="left"
      side="left"
      :width="leftWidth"
    >
      <slot name="left" :change-width="changeLeftWidth"></slot>
    </q-drawer>
    <q-drawer
      elevated
      class="transparent"
      v-model="right"
      side="right"
      :width="rightWidth"
    >
      <slot name="right" :change-width="changeRightWidth"></slot>
    </q-drawer>
    <q-page-container>
      <slot name="main" />
      <q-page-sticky v-if="showFooterToggle" position="bottom" :offset="[0, 0]">
        <q-btn
          :icon="footer | footerBtnIcon"
          color="title"
          @click="footer = !footer"
          class="footer-btn"
        />
      </q-page-sticky>
    </q-page-container>
    <slot name="absolute" />
    <slot />
    <q-footer elevated class="transparent" v-model="footer">
      <slot
        name="footer"
        :open-footer="openFooter"
        :close-footer="closeFooter"
      />
    </q-footer>
  </q-layout>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component({
  name: 'MpDynamicLayout',
  filters: {
    footerBtnIcon: (footer: boolean) => {
      return footer ? 'keyboard_arrow_down' : 'keyboard_arrow_up'
    }
  }
})
export default class MpDynamicLayout extends Vue {
  private left = false

  private leftWidth = 300

  private right = false

  private rightWidth = 240

  private footer = false

  private showFooterToggle = false

  private mounted() {
    this.left = !!this.$scopedSlots.left
    this.right = !!this.$scopedSlots.right
    this.showFooterToggle = !!this.$scopedSlots.footer
  }

  private toggleLeftDrawer() {
    this.left = !this.left
  }

  private closeFooter() {
    this.footer = false
  }

  private openFooter() {
    this.footer = true
  }

  private changeLeftWidth(width: number) {
    this.leftWidth = width
  }

  private changeRightWidth(width: number) {
    this.rightWidth = width
  }
}
</script>

<style lang="scss" scoped>
.footer-btn {
  font-size: 8px;
  width: 8em;
  height: 2em;
  border-radius: 8px 8px 0 0;
}
</style>
