<template>
  <q-dialog v-model="bar" persistent>
    <q-card>
      <q-bar class="bg-title text-title">
        <q-icon :name="`img:${logo}`" />
        <div>关于</div>

        <q-space />

        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip>关闭</q-tooltip>
        </q-btn>
      </q-bar>

      <q-card-section>
        <div class="text-h6">{{ title }}</div>
        <div class="text-subtitle2">{{ subtitle }}</div>
      </q-card-section>

      <q-separator />
      <q-card-section>
        {{
          `Copyright ${new Date().getFullYear()} 版权所有：武汉中地数码科技有限公司`
        }}
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component({
  name: 'MpAbout'
})
export default class MpAbout extends Vue {
  @Prop({
    type: String,
    required: false,
    default: 'statics/app-logo-128x128.png'
  })
  readonly logo!: string

  @Prop({
    type: String,
    required: false,
    default: 'MapGIS全空间一张图'
  })
  readonly title!: string

  @Prop({
    type: String,
    required: false,
    default: '全行业一张图应用平台'
  })
  readonly subtitle!: string

  private bar = false

  click() {
    this.bar = true
  }
}
</script>
