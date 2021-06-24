<template>
  <q-table
    class="my-sticky-header-table"
    :data="data"
    :columns="columns"
    separator="cell"
    :pagination="{ rowsPerPage: 0 }"
    hide-bottom
    flat
  >
    <template v-slot:body="props">
      <q-tr :props="props" class @click="rowClick(props)">
        <q-td key="index" :props="props">{{ props.rowIndex + 1 }}</q-td>
        <q-td key="x" :props="props">{{
          props.row.geometry.coordinates[0]
        }}</q-td>
        <q-td key="y" :props="props">{{
          props.row.geometry.coordinates[1]
        }}</q-td>
        <q-td key="delete" :props="props">
          <q-btn
            dense
            flat
            icon="close"
            @click.stop="deleteRow(props, 'barrier')"
          />
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>
<script lang="ts">
import { Vue, Prop, Component, Emit } from 'vue-property-decorator'

@Component({ name: 'MpHinderTable' })
export default class MpHinderTable extends Vue {
  @Prop(Array) data!: array

  @Prop(Array) columns!: array

  rowClick(props) {
    this.$emit('rowClick', props)
  }

  deleteRow(props, type) {
    this.$emit('deleteRow', props, type)
  }
}
</script>
<style lang="scss" scoped>
.my-sticky-header-table {
  // height: 250px;
  max-height: 100%;
  ::v-deep thead tr th {
    position: sticky;
    z-index: 2;
  }

  ::v-deep thead tr:first-child th {
    background-color: white;
  }

  ::v-deep thead tr:first-child th {
    top: 0;
    z-index: 2;
  }
  ::v-deep td:last-child {
    background-color: white;
  }

  ::v-deep th:last-child,
  td:last-child {
    position: sticky;
    right: 0;
    z-index: 1;
  }
}
</style>
