<template>
  <q-card-section class="q-pa-md q-gutter-md">
    <q-list>
      <q-item
        v-for="{ color, name, desc } in data"
        :key="color"
        class="q-mb-sm"
        clickable
        v-ripple
        @click="selectColor(color)"
      >
        <q-menu class="no-scroll">
          <q-color v-model="currentColorRgb" @change="invokeColor" />
        </q-menu>
        <q-item-section avatar top>
          <q-avatar
            :style="{ background: getColor(color) }"
            class="inset-shadow cursor-pointer"
          >
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ name }}</q-item-label>
          <q-item-label caption>{{ desc }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-card-section>
</template>

<script lang="ts">
import { colors } from 'quasar'
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component({ name: 'MpThemeManager' })
export default class MpThemeManager extends Vue {
  @Prop(Array) readonly data!: any[]

  private currentColor = ''

  private currentColorRgb = ''

  private selectColor(color: string) {
    this.currentColor = color
    this.currentColorRgb = this.getColor(color)
  }

  private getColor(color: string) {
    return colors.getBrand(color) || ''
  }

  private invokeColor() {
    colors.setBrand(this.currentColor, this.currentColorRgb)
  }
}
</script>

<style lang="scss"></style>
