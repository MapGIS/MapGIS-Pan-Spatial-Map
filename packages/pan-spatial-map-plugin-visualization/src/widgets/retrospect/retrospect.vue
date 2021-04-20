<template>
  <div class="mp-widget-retrospect">
    <a-row type="flex" align="middle" class="retrospect-row">
      <a-col :span="7">
        选择类别：
      </a-col>
      <a-col :span="17">
        <a-select
          class="retrospect-select"
          :value="subjectType"
          @change="onSubjectTypeChange"
        >
          <a-select-option
            v-for="item in subjectTypes"
            :value="item"
            :key="item"
            >{{ item }}
          </a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <a-row type="flex" align="middle" class="retrospect-row">
      <a-col :span="7">
        专题回溯：
      </a-col>
      <a-col :span="17">
        <a-select
          class="retrospect-select"
          :value="subject"
          @change="onSubjectChange"
        >
          <a-select-option
            v-for="item in subjects"
            :value="item.guid"
            :key="item.name"
            >{{ item.name }}
          </a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <div class="retrospect-time-line">
      <time-line
        id="retrospect-time-line"
        ref="time-line"
        v-model="timeIndex"
        :timeLineList="timeDisplayList"
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
      <div class="retrospect-shade" v-show="!timeLineList.length">
        <div>
          <p>该数据没有年度，</p>
          <p>无法进行专题回溯</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import { dataCatalogManagerInstance } from '@mapgis/pan-spatial-map-store'
import TimeLine, { ITimeLineList } from './components/TimeLine'

interface IControl {
  name: string
  tooltip: string
  func: () => void
}

interface IDataCatalog extends ITimeLineList {
  description: string // 节点描述
  icon: string // 节点的图标(可选)
  level: string // 节点的层次
  children: IData[] // 子节点数组
}

@Component({
  name: 'MpRetrospect',
  components: {
    TimeLine
  }
})
export default class MpRetrospect extends Mixins(WidgetMixin) {
  baseTreeData: Record<string, any>[] = []

  form = this.$form.createForm(this, { name: 'retrospect_form' })

  subjectType = ''

  subjectTypes: string[] = []

  subject = ''

  subjects: IDataCatalog[] = []

  selectedId = ''

  showTimeLine = false

  showInterval = false

  interval = 3

  timeIndex = 0

  timeLineList: ITimeLineList[] = []

  isPlay = false

  /**
   * 时间轴实例
   */
  get timeLineRef() {
    return this.$refs['time-line']
  }

  /**
   * 时间轴展示数据
   */
  get timeDisplayList() {
    return this.timeLineList.map(v => v.name)
  }

  /**
   * 年度时间轴操作按钮
   */
  get btns(): Array<IControl> {
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
   * 选择类别变化
   * @param value<string>
   */
  onSubjectTypeChange(value: string) {
    this.clear()
    this.subjectType = value
    this.subjects = this.baseTreeData.find(
      ({ children, name }) => value === name
    ).children
    console.log('获取专题----------', this.subjects)
    if (this.subjects.length) {
      this.onSubjectChange(this.subjects[0].guid)
    }
  }

  /**
   * 回溯专题变化
   * @param value<string>
   */
  onSubjectChange(value: string) {
    this.clear()
    this.subject = value
    const { children } = this.subjects.find(v => v.guid === value)
    if (children && children.length) {
      this.timeLineList = this.getTimeLineList(children)
      this.timeIndex = 0
      console.log('当前专题/时间轴数据-------', value, this.timeLineList)
    }
  }

  /**
   * @description 递归获取专题下的年度列表
   * @param data<IDataCatalog>
   * @param results<ITimeLineList>
   */
  getTimeLineList(data) {
    return data.reduce((results, { children, name, guid }) => {
      if (children && children.length) {
        return this.getTimeLineList(children)
      } else if (/\d+/g.test(name)) {
        // todo 业务逻辑
        const _name = name.match(/\d+/g)[0]
        // if (/\((\d+)\)/g.test(name)) {
        //   _name = name.match(/\((.+?)\)/g)[0]
        // }
        // console.log('年份', name, _name)
        results.push({
          name: _name,
          guid
        })
      }
      return results
    }, [])
  }

  /**
   * 时间轴变化
   */
  @Watch('timeIndex')
  changeTimeIndex(nV) {
    if (this.timeLineList.length) {
      this.selectedId = this.timeLineList[nV].guid
    }
  }

  /**
   * 打开专题回溯面板
   */
  async onOpen() {
    this.showTimeLine = true
    this.baseTreeData = await dataCatalogManagerInstance.getDataCatalogTreeData()
    this.subjectTypes = this.baseTreeData.map(({ name }) => name)
    console.log('类别列表-------', this.subjectTypes)
    this.onSubjectTypeChange(this.subjectTypes[0])
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
      this.timeLineRef.resize()
    }
  }

  /**
   * 清空操作
   */
  clear() {
    if (this.selectedId) {
      this.selectedId = ''
    }
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
    if (this.timeIndex < this.timeLineList.length - 1) {
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
.retrospect-select,
.retrospect-input-number {
  width: 100%;
}
.retrospect-input-number-unit {
  text-align: right;
}
.retrospect-time-line {
  // width: 100%;
  min-height: 300px;
  position: relative;
  overflow: hidden;
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
  p {
    margin-bottom: 0;
  }
}
</style>
