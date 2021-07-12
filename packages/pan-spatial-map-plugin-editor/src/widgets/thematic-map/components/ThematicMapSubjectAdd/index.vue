<template>
  <!-- todo新建专题图 -->
  <mp-window-wrapper :visible="saVisible">
    <mp-window
      title="新建专题图"
      :visible.sync="saVisible"
      anchor="top-center"
      :verticalOffset="60"
    >
      <div class="thematic-map-subject-add">
        <div class="subject-add-content">
          <!-- 基础选项 -->
          <base-items />
          <!-- 属性表模块 -->
          <!-- <attribute-table-items /> -->
          <!-- 统计表模块 -->
          <!--  <statistic-table-items /> -->
          <!-- 弹框模块 -->
          <!--  <popup-items /> -->
        </div>
        <!-- 保存按钮 -->
        <div class="subject-add-save-btn">
          <a-button @click="onCancel">取消</a-button>
          <a-button type="primary" @click="onSave">保存</a-button>
        </div>
      </div>
    </mp-window>
  </mp-window-wrapper>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { mapGetters, mapMutations } from '../../store'
import BaseItems from './components/BaseItems'
import AttributeTableItems from './components/AttributeTableItems.vue'
import StatisticTableItems from './components/StatisticTableItems.vue'
import PopupItems from './components/PopupItems.vue'

@Component({
  components: {
    BaseItems,
    AttributeTableItems,
    StatisticTableItems,
    PopupItems
  },
  computed: {
    ...mapGetters(['isVisible'])
  },
  methods: {
    ...mapMutations(['setVisible'])
  }
})
export default class ThematicMapSubjectAdd extends Vue {
  get saVisible() {
    return this.isVisible('sa')
  }

  set saVisible(nV) {
    if (!nV) {
      this.resetVisible('sa')
    }
  }

  onSave() {}

  onCancel() {}
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
