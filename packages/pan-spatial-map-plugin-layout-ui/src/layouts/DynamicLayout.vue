<template>
  <q-layout view="hHh Lpr lFf">
    <q-header ref="headerContainer" elevated class="transparent">
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
          @click="switchFooter"
          class="footer-btn"
        />
      </q-page-sticky>
    </q-page-container>
    <slot name="absolute" />
    <slot />
    <q-footer
      elevated
      class="transparent"
      v-model="footer"
      :style="{ height: `${footerHeight}px` }"
    >
      <!-- Top Resize Handle -->
      <div
        v-touch-pan.prevent.mouse="resizeFooter"
        style="position: relative; left: 0; right: 0; top: 0; cursor: ns-resize; height: 7px;"
        class="bg-title"
      />
      <slot
        name="footer"
        :open-footer="openFooter"
        :close-footer="closeFooter"
      />
    </q-footer>
  </q-layout>
</template>

<script lang="ts">
import { Vue, Component, Ref } from 'vue-property-decorator'

@Component({
  name: 'MpDynamicLayout',
  filters: {
    footerBtnIcon: (footer: boolean) => {
      return footer ? 'keyboard_arrow_down' : 'keyboard_arrow_up'
    }
  }
})
export default class MpDynamicLayout extends Vue {
  @Ref() readonly headerContainer!: any

  private left = false

  private leftWidth = 300

  private right = false

  private rightWidth = 240

  private footer = false

  private showFooterToggle = false

  private footerHeight = 100

  private initFooterHeight = 100

  private maxFooterHeight = 200

  mounted() {
    this.left = !!this.$scopedSlots.left
    this.right = !!this.$scopedSlots.right
    this.showFooterToggle = !!this.$scopedSlots.footer

    const viewHeight =
      document.documentElement.clientHeight -
      this.headerContainer.$el.offsetHeight

    this.initFooterHeight = viewHeight / 2
    this.maxFooterHeight = viewHeight

    this.footerHeight = this.initFooterHeight
  }

  private toggleLeftDrawer() {
    this.left = !this.left
  }

  private closeFooter() {
    this.footer = false
  }

  private openFooter() {
    this.footer = true
    if (this.footerHeight === 0) {
      this.footerHeight = this.initFooterHeight
    }
  }

  private switchFooter() {
    this.footer = !this.footer
    if (this.footer && this.footerHeight === 0) {
      this.footerHeight = this.initFooterHeight
    }
  }

  private changeLeftWidth(width: number) {
    this.leftWidth = width
  }

  private changeRightWidth(width: number) {
    this.rightWidth = width
  }

  private resizeFooter(event: any): void {
    const delta = event.delta.y
    const height = this.footerHeight - delta

    if (height > this.maxFooterHeight) {
      this.footerHeight = this.maxFooterHeight
    } else if (height < 10) {
      this.footerHeight = 0
    } else {
      this.footerHeight = height
    }
  }
}
</script>

<style lang="scss" scoped>
.footer-btn {
  font-size: 9px;
  width: 8em;
  height: 2em;
  border-radius: 8px 8px 0 0;
}
</style>
