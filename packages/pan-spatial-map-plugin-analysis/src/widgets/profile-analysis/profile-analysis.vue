<template>
  <div>
    <mapgis-ui-group-tab
      title="数据"
      :has-top-margin="false"
    ></mapgis-ui-group-tab>
    <mapgis-ui-row class="model">
      <mapgis-ui-radio-group v-if="layers.length > 0" v-model="layer">
        <mapgis-ui-radio
          v-for="(node, index) in layers"
          :style="radioStyle"
          :key="`model-${index}`"
          :value="node"
        >
          {{ node.title }}
        </mapgis-ui-radio>
      </mapgis-ui-radio-group>
      <div v-else>
        暂无数据！
      </div>
    </mapgis-ui-row>
    <mapgis-3d-analysis-profile
      :profileType="profileType"
      :polygonHeight="polygonHeight"
      :polygonColor="polygonColor"
      :polyLineColor="polyLineColor"
      :pointColor="pointColor"
      :polylineGroundColor="polylineGroundColor"
      :showPolygon="showPolygon"
      :samplePrecision="samplePrecision"
      :echartsDivId="'profileeChart'"
      @load="load"
      @success="success"
      @remove="remove"
    >
    </mapgis-3d-analysis-profile>
    <!-- 剖面信息 -->
    <mp-window-wrapper :visible="profile2dVisible">
      <mapgis-ui-window
        @window-size="onProfile2dWindowSize"
        :visible.sync="profile2dVisible"
        :min-width="800"
        :max-height="250"
        anchor="bottom-center"
        title="剖面信息"
        ref="profileWindow"
      >
        <div ref="profile2dChart">
          <div id="profileeChart" style="width: 800px; height: 180px"></div>
        </div>
      </mapgis-ui-window>
    </mp-window-wrapper>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import {
  WidgetMixin,
  LayerType,
  IGSSceneSublayerType,
  LoadStatus,
  Objects
} from '@mapgis/web-app-framework'
import { Util } from '@mapgis/webclient-vue-ui'

const { ColorUtil } = Util

@Component({
  name: 'MpProfileAnalysis'
})
export default class MpProfileAnalysis extends Mixins(WidgetMixin) {
  private polygonHeight = 100 // 剖面高度

  private polygonColor = 'rgb(0,0,255)' // 剖面颜色

  private polyLineColor = 'rgb(0,255,0)' // 交互线颜色(开启剖面的时候生效)

  private pointColor = 'rgb(0,255,0)' // 交互点颜色(关闭剖面的时候生效)

  private polylineGroundColor = 'rgb(255,0,0)' // 剖切线颜色

  private showPolygon = false // 是否显示剖面

  private samplePrecision = 2 // 采样精度(采样间隔，平面距离，单位米，模型默认为0.2，地形为2)

  private profileType = 0

  private profile2dVisible = false

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
  private profileAnalysis = null

  /**
   * 动态获取基础目录树上已勾选的三维数据
   */
  @Watch('document', { immediate: true, deep: true })
  getScenes() {
    if (!this.document) return
    const layers = []
    this.document.defaultMap
      .clone()
      .getFlatLayers()
      .forEach((layer, index) => {
        if (layer.loadStatus === LoadStatus.loaded) {
          if (layer.type === LayerType.IGSScene) {
            if (layer.activeScene) {
              const { type } = layer.activeScene.sublayers[0]
              if (
                type === IGSSceneSublayerType.elevation ||
                type === IGSSceneSublayerType.modelCache
              ) {
                // 剖切分析支持地形和模型
                layers.push(layer)
              }
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
    const { type } = layer.activeScene.sublayers[0]
    const source = this.landscapeLayerFuc()
    /**
     * 修改说明：为优化用户体验，取消自动缩放至模型设置
     * 修改人：龚跃健
     * 修改时间：2021/12/24
     * */
    if (type === IGSSceneSublayerType.modelCache) {
      // 模型只要把模型移到当前视图范围下即可进行分析
      // Objects.SceneController.getInstance(
      //   this.Cesium,
      //   this.vueCesium,
      //   this.viewer
      // ).zoomToM3dLayerBySource(source[0])
      this.samplePrecision = 0.2
      this.polygonHeight = 2
      this.profileType = 1
    } else if (type === IGSSceneSublayerType.elevation) {
      // 地形
      // const bound = layer.fullExtent
      // if (bound) {
      //   this.viewer.camera.flyTo({
      //     destination: this.Cesium.Rectangle.fromDegrees(
      //       bound.xmin,
      //       bound.ymin,
      //       bound.xmax,
      //       bound.ymax
      //     )
      //   })
      // }
      this.samplePrecision = 2
      this.polygonHeight = 100
      this.profileType = 0
      // 设置当前地形对象
      // this.viewer.terrainProvider = source[0]
    }
  }

  /**
   * 剖面信息弹框size变化
   * @param mode
   */
  onProfile2dWindowSize(mode?: 'max' | 'normal') {
    this.$nextTick(() => {
      if (this.profileAnalysis && this.profileAnalysis.profileeChart) {
        const width =
          mode === 'max' ? this.$refs.profile2dChart.clientWidth : 800
        this.profileAnalysis.profileeChart.resize({ width })
      }
    })
    this.changeProfileWindowApha()
  }

  /**
   * 获取被分析图层
   */
  landscapeLayerFuc() {
    const { layer } = this
    const { type, id } = layer.activeScene.sublayers[0]
    let source = null
    if (type === IGSSceneSublayerType.modelCache) {
      source = Objects.SceneController.getInstance(
        this.Cesium,
        this.vueCesium,
        this.viewer
      ).findSource(id)
    } else if (type === IGSSceneSublayerType.elevation) {
      source = Objects.SceneController.getInstance(
        this.Cesium,
        this.vueCesium,
        this.viewer
      ).findTerrainSource(id)
    }
    return [source]
  }

  changeProfileWindowApha() {
    const components = document.getElementsByClassName('mp-window-wrapper')[0]
    const bgColor = document.defaultView.getComputedStyle(components, null)[
      'background-color'
    ]
    const colorObject = ColorUtil.getColorObject(bgColor, 0.6)
    const { r, g, b, a } = colorObject
    const component = this.$refs.profileWindow

    component.style.background = `rgba(${r},${g},${b},${a})`
  }

  load(profileAnalysis) {
    this.profileAnalysis = profileAnalysis
  }

  success() {
    this.profile2dVisible = true
  }

  onActive() {
    this.profileAnalysis.mount()
    this.isActive = true
  }

  /**
   * 打开模块
   */
  onOpen() {
    this.isActive = true
    this.changeLayer()
    this.changeProfileWindowApha()
  }

  /**
   * 关闭模块
   */
  onClose() {
    this.profileAnalysis.unmount()
    this.isActive = false
  }

  // 移除剖面分析
  remove() {
    this.profile2dVisible = false
  }
}
</script>

<style lang="less" scoped>
.model {
  font-size: 12px;
  .mapgis-ui-radio-wrapper {
    font-size: 12px;
  }
}
</style>
