<template>
  <div class="mp-widget-profile-analysis">
    <mp-group-tab title="数据" :has-top-margin="false"></mp-group-tab>
    <a-row class="model">
      <a-radio-group v-if="layers.length > 0" v-model="layer">
        <a-radio
          v-for="(node, index) in layers"
          :style="radioStyle"
          :key="`model-${index}`"
          :value="node"
        >
          {{ node.title }}
        </a-radio>
      </a-radio-group>
      <div v-else>
        暂无数据！
      </div>
    </a-row>
    <mp-group-tab title="参数设置"></mp-group-tab>
    <mp-setting-form :label-width="72">
      <a-form-item label="贴地线颜色">
        <MpColorPicker
          :color.sync="formData.groundLineColor"
          :disableAlpha="false"
          class="color-picker"
        ></MpColorPicker>
      </a-form-item>
      <a-form-item label="交互线颜色">
        <MpColorPicker
          :color.sync="formData.lineColor"
          :disableAlpha="false"
          class="color-picker"
        ></MpColorPicker>
      </a-form-item>
      <a-form-item label="采样精度">
        <a-input
          v-model.number="formData.samplePrecision"
          type="number"
          min="0"
          addon-after="(米)"
        />
      </a-form-item>
      <a-form-item label="显示剖面">
        <a-switch size="small" v-model="formData.showPolygon" />
      </a-form-item>
      <a-form-item label="剖面高度" v-show="formData.showPolygon">
        <a-input
          v-model.number="formData.height"
          type="number"
          min="0"
          addon-after="(米)"
        />
      </a-form-item>
      <a-form-item label="剖面颜色" v-show="formData.showPolygon">
        <MpColorPicker
          :color.sync="formData.polygonColor"
          :disableAlpha="false"
          class="color-picker"
        ></MpColorPicker>
      </a-form-item>
    </mp-setting-form>

    <!-- 二维剖面 -->
    <mp-window-wrapper :visible="profile2dVisible">
      <mp-window
        :visible.sync="profile2dVisible"
        :min-width="400"
        :max-height="250"
        anchor="bottom-left"
        title="二维剖面"
      >
        <div
          id="profileChart"
          style="width: 380px; height: 180px; float: right"
        ></div>
      </mp-window>
    </mp-window-wrapper>
    <div class="mp-footer-actions">
      <a-button type="primary" @click="analysis">
        分析
      </a-button>
      <a-button type="primary" @click="remove">
        清除
      </a-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import {
  WidgetMixin,
  LayerType,
  IGSSceneSublayerRenderType,
  LoadStatus,
  Objects
} from '@mapgis/web-app-framework'
import * as echarts from 'echarts'

@Component({
  name: 'MpProfileAnalysis'
})
export default class MpProfileAnalysis extends Mixins(WidgetMixin) {
  private formData = {
    height: 100, // 剖面高度
    polygonColor: 'rgb(0,0,255)', // 剖面颜色
    lineColor: 'rgba(0,255,0,1)', // 交互线颜色
    groundLineColor: 'rgba(255,0,0,1)', // 贴地线颜色
    showPolygon: false, // 是否显示剖面
    samplePrecision: 2 // 采样精度(采样间隔，平面距离，单位米，模型默认为0.2，地形为2)
  }

  // radio样式
  radioStyle = {
    display: 'block',
    height: '30px',
    lineHeight: '30px'
  }

  // 模型和地形集合
  private layers = []

  // 选中图层
  private layer = null

  // 剖面分析对象
  private terrainProfile = null

  // 是否显示二维剖面
  private profile2dVisible = false

  // 深度检测是否已开启
  private depthTestAgainstTerrain = false

  // 进度条对象
  private loading = null

  private txtColor = '#000000a6'

  /**
   * 获取二维剖面设置参数
   */
  getEchartOptions(smooth: boolean) {
    const echartsOptions = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: '#41aeff',
            type: 'solid'
          }
        },
        textStyle: {
          fontSize: 10
        },
        confine: true // 是否将 tooltip 框限制在图表的区域内。
      },
      title: {
        show: false
      },
      grid: {
        top: 25,
        left: 40,
        right: 20,
        bottom: 20,
        contentLabel: false
      },
      calculable: true,
      xAxis: [
        {
          type: 'value',
          max: 'dataMax',
          scale: true,
          axisLabel: {
            fontSize: 10,
            fontFamily: '微软雅黑',
            color: this.txtColor
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          scale: true,
          axisLabel: {
            fontFamily: '微软雅黑',
            color: this.txtColor,
            formatter(value) {
              const texts = []
              if (value > 99999) {
                const text = Number(value).toExponential(1)
                texts.push(text)
              } else {
                texts.push(parseInt(value))
              }
              return texts
            }
          },
          axisTick: {
            lineStyle: {
              color: this.txtColor
            }
          },
          axisLine: {
            lineStyle: {
              color: this.txtColor
            }
          },
          splitLine: {
            lineStyle: {
              color: '#d9d9d9',
              type: 'dotted'
            }
          }
        }
      ],
      series: [
        {
          type: 'line',
          smooth,
          itemStyle: {
            color: '#40a9ff'
          },
          markPoint: {
            symbol: 'circle',
            symbolSize: 15,
            label: { position: 'top' },
            data: [
              { type: 'max', name: '最高点' },
              { type: 'min', name: '最低点' }
            ]
          }
        }
      ]
    }
    return echartsOptions
  }

  /**
   * 动态获取基础目录树上已勾选的三维数据
   */
  @Watch('document', { deep: true, immediate: true })
  getScenes() {
    if (!this.document) return
    const layers = []
    this.document.defaultMap
      .clone()
      .getFlatLayers()
      .forEach((layer, index) => {
        if (layer.loadStatus === LoadStatus.loaded) {
          if (layer.type === LayerType.IGSScene) {
            const { renderType } = layer.activeScene.sublayers[0]
            if (
              renderType === IGSSceneSublayerRenderType.elevation ||
              renderType === IGSSceneSublayerRenderType.modelCache
            ) {
              // 剖切分析支持地形和模型
              layers.push(layer)
            }
          }
        }
      })
    this.layers = layers
    if (layers.length > 0) {
      this.layer = layers[layers.length - 1]
    } else {
      this.layer = layers
      this.layer = null
    }
  }

  /**
   * 切换三维数据
   */
  @Watch('layer', { deep: true, immediate: true })
  changeLayer() {
    if (!this.isActive || !this.layer) return
    const { layer } = this
    const { renderType } = layer.activeScene.sublayers[0]
    const source = this.landscapeLayerFuc()
    if (renderType === IGSSceneSublayerRenderType.modelCache) {
      // 模型只要把模型移到当前视图范围下即可进行分析
      Objects.SceneController.getInstance(
        this.Cesium,
        this.CesiumZondy,
        this.webGlobe
      ).zoomToM3dLayerBySource(source[0])
      this.$set(this.formData, 'samplePrecision', 0.2)
    } else if (renderType === IGSSceneSublayerRenderType.elevation) {
      // 地形
      const bound = layer.fullExtent
      if (bound) {
        this.webGlobe.viewer.camera.flyTo({
          destination: this.Cesium.Rectangle.fromDegrees(
            bound.xmin,
            bound.ymin,
            bound.xmax,
            bound.ymax
          )
        })
      }
      this.$set(this.formData, 'samplePrecision', 2)
      // 设置当前地形对象
      this.webGlobe.viewer.terrainProvider = source[0]
    }
  }

  /**
   * 打开模块
   */
  onOpen() {
    this.isActive = true
    this.changeLayer()
  }

  /**
   * 关闭模块
   */
  onClose() {
    this.isActive = false
  }

  // 微件激活时
  onActive() {
    const { viewer } = this.webGlobe
    if (viewer.scene.globe.depthTestAgainstTerrain) {
      this.depthTestAgainstTerrain = true
    }
    this.isActive = true
  }

  // 微件失活时
  onDeActive() {
    this.isActive = false
  }

  /**
   * rgba转cesium内部颜色
   */
  getColor(rgba) {
    return Objects.SceneController.getInstance(
      this.Cesium,
      this.CesiumZondy,
      this.webGlobe
    ).colorToCesiumColor(rgba)
  }

  /**
   * 获取被分析图层
   */
  landscapeLayerFuc() {
    const { layer } = this
    const { renderType } = layer.activeScene.sublayers[0]
    const { id } = this.layer.activeScene.sublayers[0]
    let res = null
    if (renderType === IGSSceneSublayerRenderType.modelCache) {
      res = Objects.SceneController.getInstance(
        this.Cesium,
        this.CesiumZondy,
        this.webGlobe
      ).findSource(id)
    } else if (renderType === IGSSceneSublayerRenderType.elevation) {
      res = Objects.SceneController.getInstance(
        this.Cesium,
        this.CesiumZondy,
        this.webGlobe
      ).findTerrainSource(id)
    }
    return res.source
  }

  /**
   * 开始分析
   */
  analysis() {
    const { viewer } = this.webGlobe
    this.profile2dVisible = false
    if (!this.depthTestAgainstTerrain) {
      viewer.scene.globe.depthTestAgainstTerrain = true
    }
    const {
      polygonColor,
      height,
      lineColor,
      groundLineColor,
      showPolygon,
      samplePrecision
    } = this.formData
    const pColor = this.getColor(polygonColor)
    const lColor = this.getColor(lineColor)
    const glColor = this.getColor(groundLineColor)
    // 地形平滑显示二维剖面，模型取消平滑
    let smooth = true
    const { renderType } = this.layer.activeScene.sublayers[0]
    if (renderType === IGSSceneSublayerRenderType.modelCache) {
      smooth = false
    } else if (renderType === IGSSceneSublayerRenderType.elevation) {
      smooth = true
    }
    const echartsOptions = this.getEchartOptions(smooth)
    if (!this.Cesium.defined(this.terrainProfile)) {
      this.terrainProfile = new this.Cesium.TerrainProfile(viewer, echarts, {
        echartsOptions: echartsOptions,
        polygonColor: pColor,
        polygonHeight: height,
        polyLineColor: lColor,
        showPolygon: showPolygon,
        polylineGroundColor: glColor,
        samplePrecision
      })
    }
    this.terrainProfile.profile(this.profileStart, this.profileSuccess)
  }

  /**
   * 打开分析提示遮罩层
   */
  showLoading() {
    if (!this.loading) {
      this.loading = this.$portal.show(
        {
          tip: '正在分析中，请稍等'
        },
        document.querySelector('.mp-map-container')
      )
    }
  }

  /**
   * 移除分析提示遮罩层
   */
  removeLoading() {
    if (this.loading) {
      this.loading = null
      this.$portal.remove()
    }
  }

  /**
   * 开始分析，显示进度条
   */
  profileStart() {
    this.showLoading()
  }

  /**
   * 分析结束，移除进度条，并显示二维剖面
   */
  profileSuccess() {
    this.profile2dVisible = true
    this.removeLoading()
  }

  remove() {
    // 恢复深度检测设置
    if (!this.depthTestAgainstTerrain) {
      this.webGlobe.viewer.scene.globe.depthTestAgainstTerrain = false
    }

    // 移除分析结果
    if (this.terrainProfile) {
      this.terrainProfile.destroy()
      this.terrainProfile = null
    }

    // 关闭二维剖面显示
    this.profile2dVisible = false

    // 移除进度条
    this.removeLoading()
  }
}
</script>

<style lang="less" scoped>
@import '../index.less';

::v-deep {
  .ant-input-number {
    width: 100%;
  }
}

.mp-widget-profile-analysis {
  display: flex;
  flex-direction: column;
  .model,
  .axis {
    font-size: 12px;
    .ant-radio-wrapper {
      font-size: 12px;
    }
  }
}
</style>
