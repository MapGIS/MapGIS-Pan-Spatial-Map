<template>
  <div class="mp-widget-retrospect">
    <a-spin tip="正在加载..." :spinning="loading">
      <a-row type="flex" align="middle" justify="start" class="retrospect-row">
        <a-col :span="5">
          专题选择：
        </a-col>
        <a-col :span="19">
          <a-tree-select
            class="retrospect-tree-select"
            :value="subject"
            @change="onSubjectChange"
            :dropdown-style="dropdownStyle"
            :replaceFields="replaceFields"
            :tree-data="treeData"
          />
        </a-col>
      </a-row>
      <div class="retrospect-time-line">
        <time-line
          id="retrospect-time-line"
          ref="time-line"
          v-model="timeIndex"
          :timeLineList="timeLineYearList"
          :playInterval="interval"
          :autoPlay="isPlay"
        />
        <a-row
          class="retrospect-row"
          type="flex"
          align="middle"
          justify="space-between"
        >
          <a-col :span="24 / btns.length" v-for="btn in btns" :key="btn.name">
            <a-tooltip placement="bottom" :title="btn.tooltip">
              <a-icon
                class="retrospect-btn"
                :type="btn.name"
                @click="btn.func"
              />
            </a-tooltip>
          </a-col>
        </a-row>
        <transition name="fade">
          <a-row
            class="retrospect-row"
            type="flex"
            align="middle"
            justify="end"
            v-show="showInterval"
          >
            <a-col :span="7">
              时间间隔：
            </a-col>
            <a-col :span="15">
              <a-input-number
                class="retrospect-input-number"
                v-model="interval"
                :min="1"
              />
            </a-col>
            <a-col :span="2" class="retrospect-input-number-unit">
              秒
            </a-col>
          </a-row>
        </transition>
        <div class="retrospect-shade" v-show="!timeLineList.length">
          该数据没有年度，无法进行专题回溯
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import { dataCatalogManagerInstance } from '@mapgis/pan-spatial-map-store'
import TimeLine from './components/TimeLine.vue'

interface IControl {
  name: string
  tooltip: string
  func: () => void
}

interface IDataCatalog {
  name: string // 节点名称
  description: string // 节点描述
  guid: string
  serverURL?: string
  children?: IDataCatalog[] // 子节点数组
  displayName?: string
}

interface IMpRetrospect {
  [k: string]: any
}

@Component({
  name: 'MpRetrospect',
  components: {
    TimeLine
  }
})
export default class MpRetrospect extends Mixins<IMpRetrospect>(WidgetMixin) {
  // 加载开关
  loading = false

  // 目录树中选中的图层id
  dataCatalogTreeCheckedIds: string[] = []

  // 目录树数据源
  dataCatalogTreeData: IDataCatalog[] = []

  // 专题选择数据
  treeData: IDataCatalog[] = []

  // 年度列表
  timeLineList: IDataCatalog[] = []

  // 选中的专题
  subject = ''

  // 是否展示时间轴
  showTimeLine = false

  // 是否展示播放时长
  showInterval = false

  // 播放时长
  interval = 3

  // 当前播放的年度索引
  timeIndex = 0

  // 是否播放
  isPlay = false

  /**
   * 树形选择控件下拉框样式
   */
  get dropdownStyle() {
    return {
      maxWidth: '200px',
      maxHeight: '400px',
      overflow: 'auto'
    }
  }

  /**
   * 格式化树形选择控件数据源
   */
  get replaceFields() {
    return {
      children: 'children',
      title: 'name',
      value: 'guid'
    }
  }

  /**
   * 时间轴展示的年度
   */
  get timeLineYearList() {
    return this.timeLineList.map(v => this.getYear(v.name))
  }

  /**
   * 时间轴操作按钮
   */
  get btns() {
    let playName = 'play-circle'
    let playTooltip = '播放'
    if (this.isPlay) {
      playName = 'pause-circle'
      playTooltip = '暂停'
    }
    return [
      { name: 'redo', func: this.reset, tooltip: '重置' },
      { name: 'backward', func: this.prev, tooltip: '上一年' },
      { name: playName, func: this.btnPlay, tooltip: playTooltip },
      { name: 'forward', func: this.next, tooltip: '下一年' },
      { name: 'clock-circle', func: this.setInterval, tooltip: '播放间隔' }
    ]
  }

  /**
   * 获取年度
   * @param str<string>
   */
  getYear(str: string) {
    return Number(str.substring(0, 4))
  }

  /**
   * 是否是年度节点
   * @param str<string>
   */
  hasYearNode(str: string) {
    return !isNaN(this.getYear(str))
  }

  /**
   * 获取选中的节点
   * @param data<array>
   * @param value<string>
   * @param node<array>
   */
  getCheckedNode(data: IDataCatalog[], value: string, node: IDataCatalog[]) {
    for (let n = 0; n < data.length; n++) {
      const item = data[n]
      if (item.guid === value) {
        node = [item]
        break
      } else if (item.children && item.children.length) {
        node = this.getCheckedNode(item.children, value, node)
      }
    }
    return node
  }

  /**
   * 获取选中节点下的年度列表
   * @param data<array> 目录树
   */
  getDataCatalogTimeList(data: IDataCatalog[]) {
    return data.reduce<IDataCatalog[]>((results, item) => {
      if (this.hasYearNode(item.name)) {
        results.push(item)
      } else if (
        /(分类|专题)(:|：)/.test(item.description) &&
        item.children &&
        item.children.length
      ) {
        return this.getDataCatalogTimeList(item.children)
      }

      return results
    }, [])
  }

  /**
   * 回溯专题变化
   * @param value<string>
   */
  onSubjectChange(value: string) {
    this.subject = value
    this.isPlay = false
    const checkedNode = this.getCheckedNode(this.dataCatalogTreeData, value, [])
    this.timeLineList = this.getDataCatalogTimeList(checkedNode)
    this.timeIndex = 0
  }

  /**
   * 处理目录树， 筛选出有年度的专题展示
   * @param tree<array>
   */
  handleDataCatalog(
    tree: IDataCatalog[],
    parentNode?: IDataCatalog,
    guids: string[] = []
  ) {
    if (!tree.length) return []
    for (let n = 0; n < tree.length; n++) {
      const item = tree[n]
      if (item.children && item.children.length) {
        this.handleDataCatalog(item.children, item, guids)
      }
      if (item.children && !item.children.length) {
        item.children = undefined
      }
      const _hasYearNode = this.hasYearNode(item.name)
      if (_hasYearNode) {
        guids.push(parentNode!.guid)
      }
      if (_hasYearNode || (!item.children && !guids.includes(item.guid))) {
        tree.splice(n, 1)
        n--
      }
    }

    return tree
  }

  /**
   * 时间轴变化
   */
  @Watch('timeIndex')
  changeTimeIndex(nV: number) {
    if (this.timeLineList.length) {
      const ids = this.getCheckedIds(this.timeLineList[nV])
      this.updateCheckedIds(ids)
    }
  }

  /**
   * 获取回溯年度的图层服务
   * @param <object>
   */
  getCheckedIds({ guid, children, serverURL }: IDataCatalog) {
    let ids: string[] = []
    if (children && children.length && children.some(v => v.serverURL)) {
      ids = children.map(v => v.guid)
    } else if (serverURL) {
      ids = [guid]
    }
    return ids
  }

  /**
   * 重置目录树组件已选图层
   */
  resetCheckedIds() {
    dataCatalogManagerInstance.checkedLayerConfigIDs = [
      ...this.dataCatalogTreeCheckedIds
    ]
  }

  /**
   * 更新目录树组件图层, 不保留目录树已勾选图层
   * @param ids<array>
   */
  updateCheckedIds(ids: string[]) {
    dataCatalogManagerInstance.checkedLayerConfigIDs = ids
  }

  /**
   * 打开专题回溯面板
   */
  async onOpen() {
    this.loading = true
    this.showTimeLine = true
    this.dataCatalogTreeCheckedIds = [
      ...dataCatalogManagerInstance.checkedLayerConfigIDs
    ]
    const dataCatalogTreeData = await dataCatalogManagerInstance.getDataCatalogTreeData()
    if (dataCatalogTreeData.length) {
      this.treeData = this.handleDataCatalog(
        JSON.parse(JSON.stringify(dataCatalogTreeData))
      )
      this.dataCatalogTreeData = dataCatalogTreeData
      this.onSubjectChange(dataCatalogTreeData[0].guid)
    }
    this.loading = false
  }

  /**
   * 关闭专题回溯面板
   */
  onClose() {
    this.interval = 3
    this.showInterval = false
    this.isPlay = false
    this.resetCheckedIds()
    window.setTimeout(() => (this.showTimeLine = false))
  }

  /**
   * 视图窗口变化
   */
  onResize() {
    const ref: any = this.$refs['time-line']
    if (ref) {
      ref.resize()
    }
  }

  /**
   * 播放或暂停
   */
  btnPlay() {
    this.isPlay = this.timeLineList.length > 1 ? !this.isPlay : false
  }

  /**
   * 下一时间
   */
  next() {
    if (this.timeIndex < this.timeLineList.length - 1) {
      this.timeIndex++
    }
  }

  /**
   * 上一时间
   */
  prev() {
    if (this.timeIndex > 0) {
      this.timeIndex--
    }
  }

  /**
   * 重置
   */
  reset() {
    this.timeIndex = 0
    this.isPlay = false
  }

  /**
   * 设置自动播放的时间
   */
  setInterval() {
    this.showInterval = !this.showInterval
  }
}
</script>

<style lang="less" scoped>
.retrospect-tree-select,
.retrospect-input-number {
  width: 100%;
}

.retrospect-row {
  margin: 12px 0;
}

.retrospect-input-number-unit {
  text-align: right;
}
.retrospect-time-line {
  min-height: 300px;
  position: relative;
  overflow: hidden;
  padding: 0 10px;
}
.retrospect-btn {
  font-size: 18px;
  cursor: pointer;
}
.retrospect-shade {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: black;
  opacity: 0.7;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  padding: 5px;
  word-wrap: break-word;
}
</style>
