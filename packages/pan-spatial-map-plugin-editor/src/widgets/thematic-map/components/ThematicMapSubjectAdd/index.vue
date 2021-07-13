<template>
  <!-- todo新建专题图 -->
  <mp-window-wrapper :visible="saVisible">
    <mp-window
      title="新建专题图"
      :visible.sync="saVisible"
      :verticalOffset="60"
      anchor="top-center"
    >
      <div class="thematic-map-subject-add" v-if="saVisible">
        <div class="subject-add-content">
          <!-- 基础选项 -->
          <base-items ref="baseItems" @type-change="subjectType = $event" />
          <!-- 属性表模块 -->
          <!-- <attribute-table-items /> -->
          <!-- 统计表模块 -->
          <!--  <statistic-table-items /> -->
          <!-- 弹框模块 -->
          <!--  <popup-items /> -->
          <!-- 各专题图专有配置 -->
          <component
            ref="subjectTypes"
            :is="subjectType"
            v-show="subjectType"
          />
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
import BaseItems from './components/BaseItems.vue'
import AttributeTableItems from './components/AttributeTableItems.vue'
import StatisticTableItems from './components/StatisticTableItems.vue'
import PopupItems from './components/PopupItems.vue'
import SubjectTypes from './components/SubjectTypes'

@Component({
  components: {
    BaseItems,
    AttributeTableItems,
    StatisticTableItems,
    PopupItems,
    ...SubjectTypes
  },
  computed: {
    ...mapGetters(['isVisible'])
  },
  methods: {
    ...mapMutations(['resetVisible', 'setNodeToSubjectConfig'])
  }
})
export default class ThematicMapSubjectAdd extends Vue {
  subjectType = ''

  get saVisible() {
    return this.isVisible('sa')
  }

  set saVisible(nV) {
    if (!nV) {
      this.resetVisible('sa')
    }
  }

  onSave() {
    if (this.$refs.subjectTypes) {
      const selfConfig = this.$refs.subjectTypes.getConfig()
      const [parentId, node] = this.$refs.baseItems.getConfig(selfConfig)
      this.setNodeToSubjectConfig({ parentId, node })
    } else {
      this.$message.warning('请选择专题类型')
    }
  }

  onCancel() {
    this.saVisible = false
  }
}
</script>
<style lang="less">
@import './index.less';
</style>
