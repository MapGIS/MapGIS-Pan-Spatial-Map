<template>
  <div class='mp-widget-city-grow'>
    <a-row>
      <label class='mp-widget-label'>MapGIS文档地址设置</label>
    </a-row>
    <div>
      <a-row class='mp-row-style'>
        <a-select
          v-model='selectResult'
          :show-search='true'
          :not-found-content='null'
          :filter-option='true'
          :allowClear='true'
          placeholder='请选择或输入文档地址'
          @change='onUrlChange'
          @search='handleSearch'
          @blur='handleBlur'
          style='width: 360px'
        >
          <a-select-option
            v-for='item in urlOptions'
            :key='item.baseUrl'
          >
            {{ item.baseUrl }}
          </a-select-option>
        </a-select>

      </a-row>
      <a-row style='height: 42px'>
        <a-textarea
          class='url-example'
          disabled
          :value='`示例 : ${this.urlExample}`'
          auto-size
        ></a-textarea>
      </a-row>
      <a-row>
        <label class='mp-widget-label'>参数设置</label>
      </a-row>
      <mapgis-3d-city-grow-options
        v-if='radioVal === 1'
        :cityGrowOptions='cityGrowOptions'
        style='width: 360px'
        @commitOptions='getCityGrowOptions'
        @saveConfig='saveConfig'
        ref='cityGrowOptions'
      ></mapgis-3d-city-grow-options>
      <mp-window-wrapper :visible='startCityGrow'>
        <template v-slot:default='slotProps'>
          <mp-window
            title='城市生长'
            :visible.sync='startCityGrow'
            :horizontal-offset='28'
            :vertical-offset='30'
            :width='playWidth'
            :height='60'
            :has-padding='false'
            anchor='bottom-center'
            v-bind='slotProps'
          >
            <template>
              <mapgis-3d-city-grow
                v-if='startCityGrow'
                :baseUrl='url'
                :featureStyle='featureStyle'
                ref='cityGrow'
                @loaded='load'
              ></mapgis-3d-city-grow>
            </template>
          </mp-window>
        </template>
      </mp-window-wrapper>
    </div>
  </div>
</template>

<script lang='ts'>
import { Mixins, Component, Watch } from 'vue-property-decorator'
import {
  WidgetMixin,
  UrlUtil
} from '@mapgis/web-app-framework'
import { api } from '@mapgis/pan-spatial-map-common'

@Component({
  name: 'MpCityGrow'
})
export default class MpCityGrow extends Mixins(WidgetMixin) {

  private radioVal = 1

  private selectResult = ''

  private url = ''

  private cityGrowOptions = { }

  private urlExample = 'http://192.168.21.191:6163/igs/rest/mrfs/docs/shengZhenBaiMo/0/0'

  private featureStyle = {}

  private startCityGrow = false

  private playWidth = 715

  // 城市生长对象
  private cityGrow = null

  private handleSearchTag = false

  private urlOptionsArray =
    [
      {
        'baseUrl': 'http://192.168.21.191:6163/igs/rest/mrfs/docs/shengZhenBaiMo/0/0',
        'startTimeField': 'startTime',
        'endTimeField': 'endTime',
        'heightField': 'height'
      }
    ]

  private urlOptions = []


  async mounted() {
    const config = await api.getWidgetConfig('city-grow')
    this.urlOptions = config || this.urlOptionsArray
  }

  load(e) {
    this.cityGrow = e
  }

  onUrlChange(val) {
    if (val && !this.handleSearchTag) {
      const mapOption = this.urlOptions.filter(x =>
        x.baseUrl === val)

      this.cityGrowOptions = mapOption[0]
      this.url = val
    } else if (val === undefined) {
      this.cityGrowOptions = {}
    }
  }

  handleBlur(value) {
    if (value == undefined){
      this.selectResult = this.cityGrowOptions
    }
  }

  handleSearch(value) {
    if (value !== '') {
      if (!UrlUtil.isUrlValid(value)) {
        this.$message.warn('请输入正确的数据地址')
        return
      }
      this.cityGrowOptions = value
      this.url = value
      this.handleSearchTag = true
    } else {
      this.handleSearchTag = false
    }
  }

  getCityGrowOptions(featureStyle) {
    this.featureStyle = {}
    this.$nextTick(function() {
      this.featureStyle = featureStyle
      this.saveConfig()
    })
    this.startCityGrow = true
  }

  saveConfig() {
    let findTag = false
    const config = JSON.parse(JSON.stringify(this.urlOptions))
    this.featureStyle.baseUrl = this.url

    for (let i = 0; i < this.urlOptions.length; i++) {
      if (this.urlOptions[i].baseUrl === this.url){
        config[i] = this.featureStyle
        findTag = true
      }
    }
    if (!findTag){
      config.push(this.featureStyle)
    }

    api
      .saveWidgetConfig({
        name: 'city-grow',
        config: config
      })
      .then(() => {
        console.log('更新城市生长配置成功')
      })
      .catch(() => {
        console.log('更新城市生长配置失败')
      })
  }

  onClose() {
    this.hideCityGrow()
    if (this.cityGrow) {
      this.cityGrow.unmount()
    }

    this.cityGrowOptions = {}
    this.$refs.cityGrowOptions.unmount()
    this.selectResult = ''
  }

  hideCityGrow() {
    this.startCityGrow = false
  }

}
</script>

<style lang='less' scoped>
.mp-widget-city-grow {
  margin: 0px 5px;
}

.mp-row-style {
  width: 360px;
  margin: 8px 0;
}

.mp-widget-label {
  width: 41px;
  height: 12px;
  font-size: 14px;
  font-family: Microsoft YaHei;
  font-weight: bold;
  //color: #333333;
  line-height: 36px;
}

.url-example {
  padding: 3px 0;
  color: @text-color-secondary;
  word-break: break-all;
  white-space: break-spaces;
  font-size: 12px;

  &.ant-input {
    border: none;
    background-color: transparent;
    resize: none;
    min-height: 24px;
  }
}
</style>
