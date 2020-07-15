<template>
  <q-card-section class="q-pa-md q-gutter-md">
    <q-list bordered separator class="rounded-borders">
      <q-item
        v-for="{ id, name, desc } in data"
        :key="id"
        class="q-pb-sm"
        clickable
        v-ripple
        @click="selectLayout(id)"
      >
        <q-item-section>
          <q-item-label>{{ name }}</q-item-label>
          <q-item-label caption>{{ desc }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-card-section>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component({ name: 'MpLayoutManager' })
export default class MpLayoutManager extends Vue {
  $q: any

  @Prop(Array) readonly data!: any[]

  private selectLayout(id: string) {
    this.$q
      .dialog({
        title: '提示',
        message: '是否应用此布局效果?',
        ok: '确定',
        cancel: '取消',
        persistent: true
      })
      .onOk(() => {
        this.$q.localStorage.set('active-layout', id)
        window.location.reload()
      })
  }
}
</script>

<style lang="scss"></style>
