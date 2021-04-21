<template>
  <div class="mp-widget-retrospect">
    <a-row type="flex" align="middle" class="retrospect-row">
      <a-col :span="5">
        专题回溯：
      </a-col>
      <a-col :span="19">
        <a-tree-select
          class="retrospect-tree-select"
          :value="subject"
          @change="onSubjectChange"
          :dropdown-style="dropdownStyle"
          :replaceFields="replaceFields"
          :tree-data="dataCatalog"
        />
      </a-col>
    </a-row>
    <div class="retrospect-time-line">
      <time-line
        id="retrospect-time-line"
        ref="time-line"
        v-model="timeIndex"
        :timeLineList="timeLineList"
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
            <a-icon class="retrospect-btn" :type="btn.name" @click="btn.func" />
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
      <div class="retrospect-shade" v-show="!dataCatalogTimeList.length">
        该数据没有年度，无法进行专题回溯
      </div>
    </div>
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
  serverUrl?: string
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
  dataCatalog: IDataCatalog[] = []

  dataCatalogTimeList: IDataCatalog[] = []

  subject = ''

  // selectedId = ''

  showTimeLine = false

  showInterval = false

  interval = 3

  timeIndex = 0

  isPlay = false

  get dropdownStyle() {
    return {
      maxWidth: '200px',
      maxHeight: '400px',
      overflow: 'auto'
    }
  }

  get replaceFields() {
    return {
      children: 'children',
      title: 'name',
      value: 'guid'
    }
  }

  /**
   * 时间轴实例
   */
  get timeLineRef() {
    return this.$refs['time-line']
  }

  /**
   * 时间轴展示数据
   */
  get timeLineList() {
    return this.dataCatalogTimeList.map(v => v.displayName)
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
   * 回溯专题变化
   * @param value<string>
   */
  onSubjectChange(value: string) {
    this.clear()
    this.subject = value
    const checkedNode = this.getCheckedNode(this.dataCatalog, value, [])
    this.dataCatalogTimeList = this.getDataCatalogTimeList(checkedNode)
    this.timeIndex = 0
    console.log('当前节点/时间轴数据', value, this.dataCatalogTimeList)
  }

  /**
   * 获取选中的节点
   * @param data<array>
   * @param value<string>
   * @param node<array>
   */
  getCheckedNode(data: IDataCatalog[], value: string, node: IDataCatalog[]) {
    for (let n = 0, item: IDataCatalog; (item = data[n++]); ) {
      if (item.guid === value) {
        node = [item]
        break;
      } else if (item.children && item.children.length) {
        node = this.getCheckedNode(item.children, value, node)
      }
    }
    console.log(11);
    
    return node
  }

  /**
   * 递归获取专题下的年度列表
   * @param data<object> 目录树
   */
  getDataCatalogTimeList(data: IDataCatalog[]) {
    return data.reduce<IDataCatalog[]>((results, item) => {
      const { name, description, children } = item
      const str = name.substring(0, 4)

      if (!isNaN(Number(str))) {
        results.push({
          ...item,
          displayName: str
        })
      } else {
        const isType = /分类(:|：)/.test(description)
        const isSubject = /专题(:|：)/.test(description)
        if ((isType || isSubject) && children && children.length) {
          return this.getDataCatalogTimeList(children)
        }
      }

      return results
    }, [])
  }

  /**
   * 时间轴变化
   */
  @Watch('timeIndex')
  changeTimeIndex(nV: number) {
    if (this.dataCatalogTimeList.length) {
      // this.selectedId = this.dataCatalogTimeList[nV].guid
    }
  }

  /**
   * 打开专题回溯面板
   */
  async onOpen() {
    this.showTimeLine = true
    this.dataCatalog = await dataCatalogManagerInstance.getDataCatalogTreeData()
    console.log('目录树-----', this.dataCatalog)
    this.onSubjectChange(this.dataCatalog[0].guid)
  }

  /**
   * 关闭专题回溯面板
   */
  onClose() {
    this.clear()
    window.setTimeout(() => (this.showTimeLine = false))
  }

  /**
   * 视图窗口变化
   */
  onResize() {
    if (this.timeLineRef) {
      ;(this.timeLineRef as any).resize()
    }
  }

  /**
   * 清空操作
   */
  clear() {
    // if (this.selectedId) {
    //   this.selectedId = ''
    // }
    this.reset()
  }

  /**
   * 播放或暂停
   */
  btnPlay() {
    this.isPlay = !this.isPlay
  }

  /**
   * 下一时间
   */
  next() {
    if (this.timeIndex < this.dataCatalogTimeList.length - 1) {
      this.timeIndex += 1
    }
  }

  /**
   * 上一时间
   */
  prev() {
    if (this.timeIndex > 0) {
      this.timeIndex -= 1
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
.retrospect-row {
  margin: 12px 0;
}
.retrospect-tree-select,
.retrospect-input-number {
  width: 100%;
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
