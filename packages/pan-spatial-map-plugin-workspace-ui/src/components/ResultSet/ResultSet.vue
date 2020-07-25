<template>
  <div class="result-set-container column">
    <q-tabs
      align="left"
      v-model="currentCategoryId"
      class="col-auto bg-title text-title full-width"
      dense
    >
      <q-tab
        class="category-tab"
        v-for="category in categories"
        :key="category.id"
        :name="category.id"
        :label="category.label"
      >
        <q-badge
          class="transparent category-tab-badge"
          floating
          clickable
          round
          @click.stop="closeCategory(category)"
        >
          <q-icon name="close" color="white" />
        </q-badge>
      </q-tab>
    </q-tabs>
    <q-tab-panels
      animated
      v-model="currentCategoryId"
      keep-alive
      class="col bg-container text-container full-width"
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

    const index = this.categories.findIndex(category => {
      return category.id === this.currentCategoryId
    })

    if (index === -1) {
      if (length > 0) {
        this.currentCategoryId = this.categories[length - 1].id
      } else {
        this.currentCategoryId = ''
      }
    }
  }

  private closeCategory(category) {
    this.removeCategory(category)
  }
}
</script>

<style lang="scss">
.result-set-container {
  height: 100%;

  .category-tab-badge {
    display: none;
  }

  .category-tab:hover .category-tab-badge {
    display: block;
  }

  td:first-child {
    /* bg color is important for td; just specify one */
    background-color: #eeeeee !important;
  }

  tr th {
    position: sticky;
    /* higher than z-index for td below */
    z-index: 2;
    /* bg color is important; just specify one */
    background: #eeeeee;
  }

  /* this will be the loading indicator */
  thead tr:last-child th {
    /* highest z-index */
    z-index: 3;
  }

  thead tr:first-child th {
    top: 0;
    z-index: 1;
  }

  tr:first-child th:first-child {
    /* highest z-index */
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

  .q-table tbody td {
    font-size: 12px;
  }
}
</style>
