<template>
  <div class='mp-widget-city-grow'>
<!--    <a-space direction='vertical' style='flex: 1'>-->
      <a-row>
        <label class='mp-widget-label'>MapGIS文档地址设置</label>
      </a-row>
      <a-row>
        <a-radio-group v-model='radioVal'>
          <a-radio
            :value='1'
          >
            选择现有文档地址
          </a-radio>
          <a-radio
            :value='2'
          >
            输入新的文档地址
          </a-radio>
        </a-radio-group>
      </a-row>
      <div v-if='radioVal === 1'>
        <a-row class='mp-row-style'>
          <a-select
            notFoundContent='请添加分类'
            placeholder='请选择现有文档地址'
            @change='onUrlChange'
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
        <a-row>
          <label class='mp-widget-label'>参数设置</label>
        </a-row>
        <mapgis-3d-city-grow-options
          v-if='radioVal === 1'
          :cityGrowOptions='cityGrowOptions'
          style='width: 360px'
          @commitOptions='getCityGrowOptions'
        ></mapgis-3d-city-grow-options>
        <mp-window-wrapper :visible='startCityGrow'>
          <template v-slot:default='slotProps'>
            <mp-window
              title='城市生长'
              :visible.sync='startCityGrow'
              :horizontal-offset='28'
              :vertical-offset='30'
              :width='playWidth'
              :height='100'
              :has-padding='false'
              anchor='bottom-center'
              v-bind='slotProps'
            >
              <template>
                <mapgis-3d-city-grow
                  v-if='startCityGrow'
                  :baseUrl='cityGrowOptions.baseUrl'
                  :featureStyle='featureStyle'
                  :width='playWidth - 20'
                  ref='cityGrow'
                  @loaded='load'
                ></mapgis-3d-city-grow>
              </template>
            </mp-window>
          </template>
        </mp-window-wrapper>
      </div>
      <div v-else>
        <a-row class='mp-row-style'>
          <a-input-search
            placeholder='基地址'
            enter-button='确认'
            @search='searchFields'>
          </a-input-search>
        </a-row>
        <a-row>
          <a-textarea
            class='url-example'
            disabled
            :value='`示例 : ${this.urlExample}`'
            auto-size
          ></a-textarea>
        </a-row>
        <mapgis-3d-city-grow-options
          v-if='radioVal === 2'
          :cityGrowOptions='url'
          @commitOptions='getCityGrowOptions'
          style='width: 360px'
        ></mapgis-3d-city-grow-options>
        <mp-window-wrapper :visible='startCityGrow'>
          <template v-slot:default='slotProps'>
            <mp-window
              title='城市生长'
              :visible.sync='startCityGrow'
              :horizontal-offset='28'
              :vertical-offset='30'
              :width='playWidth'
              :height='100'
              :has-padding='false'
              anchor='bottom-center'
              v-bind='slotProps'
            >
              <template>
                <mapgis-3d-city-grow
                  v-if='startCityGrow'
                  :baseUrl='url'
                  :featureStyle='featureStyle'
                  :width='playWidth - 20'
                  ref='cityGrow'
                  @loaded='load'
                ></mapgis-3d-city-grow>
              </template>
            </mp-window>
          </template>
        </mp-window-wrapper>
      </div>
<!--    </a-space>-->
  </div>
</template>

<script lang='ts'>
import { Mixins, Component, Watch } from 'vue-property-decorator'
import {
  WidgetMixin,
  UrlUtil
} from '@mapgis/web-app-framework'

@Component({
  name: 'MpCityGrow'
})
export default class MpCityGrow extends Mixins(WidgetMixin) {

  private radioVal = 1

  private url = ''

  private dataList = []

  private cityGrowOptions = {}

  private urlExample = 'http://192.168.21.192:6163/igs/rest/mrfs/docs/shengZhenBaiMo/0/0'

  private featureStyle = {}

  private startCityGrow = false

  private playWidth = 600

  // 城市生长对象
  private cityGrow = null

  private get urlOptions() {
    const config = this.widgetInfo.config
    this.dataList = config
    return config
  }

  load(e){
    this.cityGrow = e;
  }

  onUrlChange(val) {
    const mapOption = this.dataList.filter(x =>
      x.baseUrl === val)

    this.cityGrowOptions = mapOption[0]
  }

  searchFields(value) {
    if (!UrlUtil.isUrlValid(value)) {
      this.$message.warn('请输入正确的数据地址')
      return
    }
    this.url = value
  }

  getCityGrowOptions(featureStyle) {
    this.featureStyle = featureStyle
    this.startCityGrow = true
  }

  onClose() {
    this.hideCityGrow()
    if (this.cityGrow){
      this.cityGrow.unmount()
    }
  }

  hideCityGrow() {
    this.startCityGrow = false
  }

}
</script>

<style lang='less' scoped>
.mp-widget-city-grow{
  margin: 10px;
}
.mp-row-style {
  width: 360px;
  margin: 8px 0;
}

.mp-widget-label{
  width: 56px;
  height: 12px;
  font-size: 14px;
  font-family: Microsoft YaHei;
  font-weight: bold;
  color: #333333;
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
