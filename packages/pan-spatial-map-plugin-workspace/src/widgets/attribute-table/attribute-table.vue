<template>
  <div class="mp-widget-attribute-table">
    <template v-if="closeable">
      <span class="switch-button" @click="onSwitchAttributeTable">
        <a-icon :type="iconType" />
      </span>
    </template>
    <div
      v-show="open"
      class="attribute-table-wrapper"
      :style="{ height: `${viewHeight}px` }"
    >
      <!-- Top Resize Handle -->
      <div class="resize-line-wrapper">
        <div class="resize-line" @mousedown="onResizeAttributeTable"></div>
      </div>
      <div class="result-set-container">
        <a-tabs
          v-if="categories && categories.length > 0"
          v-model="currentCategoryId"
          type="editable-card"
          size="small"
          hide-add
          @edit="onEdit"
        >
          <a-tab-pane
            v-for="category in categories"
            :key="category.id"
            :tab="category.label"
          >
            <a-tabs
              v-if="category.tables && category.tables.length > 0"
              type="editable-card"
              size="small"
              hide-add
              @edit="onEditTable"
              v-model="category.tab"
              style="margin-top:5px"
              class="children-tabs-container"
            >
              <a-tab-pane
                v-for="table in category.tables"
                :key="table.id"
                :tab="table.label"
              >
                <component
                  v-if="
                    table.id === category.tab &&
                      category.id === currentCategoryId
                  "
                  :is="table.component"
                  :ref="table.id"
                  :data="table"
                  :viewHeight="viewHeight"
                  :open="open"
                />
              </a-tab-pane>
            </a-tabs>
            <template v-else>
              <component
                v-if="category.id === currentCategoryId"
                :is="category.component"
                :ref="category.id"
                :data="category"
                :viewHeight="viewHeight"
                :open="open"
              />
            </template>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import { ResultSetMixin } from '@mapgis/pan-spatial-map-store'
import MpResultTab from './components/ResultTab/ResultTab'

@Component({
  name: 'MpAttributeTable',
  components: {
    MpResultTab
  }
})
export default class MpAttributeTable extends Mixins(
  WidgetMixin,
  ResultSetMixin
) {
  @Prop({ type: Number, required: false, default: 400 })
  private readonly maxViewHeight!: number

  @Prop({ type: Boolean, default: false })
  private readonly initOpen?: boolean

  @Prop({ type: Boolean, required: false, default: true })
  private readonly closeable!: boolean

  private viewHeight = this.maxViewHeight * 0.5

  private initViewHeight = this.maxViewHeight * 0.5

  private open = this.initOpen

  get iconType() {
    return `${this.open ? 'down' : 'up'}`
  }

  @Watch('maxViewHeight')
  maxViewHeightChanged() {
    this.viewHeight = this.maxViewHeight * 0.5
    this.initViewHeight = this.maxViewHeight * 0.5
  }

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

  created() {
    this.$root.$on(
      'switch-attribute-table',
      this.switchAttributeTable.bind(this)
    )
    this.$root.$on('open-attribute-table', this.openAttributeTable.bind(this))
    this.$root.$on('close-attribute-table', this.closeAttributeTable.bind(this))
  }

  private onEdit(targetKey, action) {
    const item = this.categories.find(x => x.id === targetKey)
    this.closeCategory(item)
  }

  private onEditTable(targetKey, action) {
    this.closeTable(targetKey)
  }

  onResizeAttributeTable(event) {
    let startY = event.clientY
    const self = this
    const move = moveEvent => {
      moveEvent.preventDefault()
      moveEvent.stopPropagation()
      const offset = startY - moveEvent.clientY
      startY -= offset

      const height = self.viewHeight + offset

      if (height > self.maxViewHeight) {
        self.viewHeight = self.maxViewHeight
      } else if (height < 10) {
        self.viewHeight = 0
        self.open = false
      } else {
        self.viewHeight = height
      }
    }

    const up = moveEvent => {
      document.removeEventListener('mousemove', move, true)
      document.removeEventListener('mouseup', up, true)
    }
    document.addEventListener('mousemove', move, true)
    document.addEventListener('mouseup', up, true)
  }

  onSwitchAttributeTable() {
    this.open = !this.open
    if (this.open && this.viewHeight === 0) {
      this.viewHeight = this.initViewHeight
    }
  }

  private openAttributeTable() {
    this.open = true

    if (this.open && this.viewHeight === 0) {
      this.viewHeight = this.initViewHeight
    }
  }

  private closeAttributeTable() {
    this.open = false
  }

  private closeTable(key: string) {
    this.removeTable(key)
  }

  private closeCategory(category) {
    /**
     * 1.防止移除后，绘制在地图上的面无法移除
     * 2.this.currentCategoryId === category.id这个判断是为了提升性能，
     * 由于只有当前活跃的tab才会绘制图层，如果不活跃在组件内已经把点线面
     * 移除了，所以当我们移除父tab的时候，如果不是活跃状态，不用再去清
     * 除页面的点线面了
     */
    if (this.currentCategoryId === category.id) {
      if (category.tables.length > 0) {
        this.$refs[this.currentTableId][0].clear()
      } else {
        this.$refs[this.currentCategoryId][0].clear()
      }
    }
    // 加上延时后，可以解决移除父tab的时候，子tab里面的组件不走beforeDestroy的生命周期
    window.setTimeout(() => {
      this.removeCategory(category)
    })
  }
}
</script>

<style lang="less" scoped>
.mp-widget-attribute-table {
  position: relative;
  .switch-button {
    position: absolute;
    width: 64px;
    left: calc(50% - 32px);
    top: calc(-1em - 2px);
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    background-color: @base-bg-color;
    border-radius: 4px 4px 0 0;
    border: 1px solid @border-color;
    border-bottom-color: transparent;
    cursor: pointer;

    &:hover {
      color: white;
      background: @primary-color;
    }
  }
  .result-set-container {
    height: 100%;
    background-color: @base-bg-color;
    padding-top: 5px;
    /deep/ .ant-tabs {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      .ant-tabs-nav-container {
        padding: 0 2px;
        height: 32px;
        .ant-tabs-tab {
          height: 32px;
          line-height: 32px;
        }
      }
      .children-tabs-container {
        .ant-tabs-nav-container {
          padding: 0 10px;
        }
      }
      .ant-tabs-bar {
        margin: 0;
      }
      .ant-tabs-content {
        height: calc(~'100% - 32px');
      }
    }
  }
  .attribute-table-wrapper {
    display: flex;
    flex-direction: column;
    .resize-line-wrapper {
      position: relative;
      .resize-line {
        width: 100%;
        border: 1px solid @border-color;
        cursor: ns-resize;

        &:hover {
          border-color: @primary-color;
        }
      }
    }
    .attribute-table {
      background-color: @base-bg-color;
      flex: auto;
    }
  }
}
</style>
