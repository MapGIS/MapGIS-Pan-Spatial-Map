<template>
  <div class="result-set-container column">
    <q-tabs
      align="left"
      v-model="currentCategoryId"
      class="col-auto bg-title text-title width100"
    >
      <q-tab
        v-for="category in categories"
        :key="category.id"
        :name="category.id"
        :label="category.label"
      />
    </q-tabs>
    <q-tab-panels
      animated
      v-model="currentCategoryId"
      class="col bg-container text-container width100"
    >
      <q-tab-panel
        v-for="category in categories"
        :key="category.id"
        :name="category.id"
        class="q-pa-none"
      >
        <div class="fit">
          <component
            :is="category.component"
            :data="category"
            @open="$emit('open')"
          />
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { ResultSetMixin } from '@mapgis/pan-spatial-map-store'

@Component({
  name: 'MpResultSet',
  components: {}
})
export default class MpResultSet extends Mixins(ResultSetMixin) {
  @Watch('categories')
  private categoriesChanged() {
    const { length } = this.categories
    if (length > 0) {
      this.currentCategoryId = this.categories[length - 1].id
    }
  }
}
</script>

<style lang="scss">
.result-set-container {
  height: 30em;
}
.width100 {
  width: 100%;
}
tr th {
  position: sticky;
  z-index: 2;
  background: #fff;
}

thead tr:last-child th {
  top: 4em;
  z-index: 3;
  background-color: #eeeeee;
}

thead tr:first-child th {
  top: 0;
  z-index: 1;
}

tr:first-child th:first-child {
  z-index: 3;
}

td:first-child {
  z-index: 1;
}

td:first-child,
th:first-child {
  position: sticky;
  left: 0;
}
</style>
