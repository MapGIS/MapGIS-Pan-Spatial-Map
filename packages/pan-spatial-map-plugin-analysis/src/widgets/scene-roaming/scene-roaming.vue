<template>
  <div class="mp-widget-scene-roaming">
    <div v-if="!roaming">
      <a-button
        v-if="!interactiveAdding"
        type="primary"
        class="full-width"
        @click="onAddPathStart"
      >
        添加路线
      </a-button>
      <div v-else class="add-path-status">
        <a-button @click="onAddPathCancel" class="add-path-status-action">
          取消
        </a-button>
        <a-button
          type="primary"
          class="add-path-status-action"
          @click="onAddPathComplete"
          :disabled="addedPositions.length < 2"
        >
          完成
        </a-button>
      </div>
      <div v-if="!interactiveAdding" class="path-container">
        <mp-group-tab :title="pathTotal">
          <mp-toolbar slot="handle" :bordered="false">
            <mp-toolbar-command
              icon="save"
              title="保存"
              @click="onSaveConfig"
            ></mp-toolbar-command>
          </mp-toolbar>
        </mp-group-tab>
        <div class="path-list">
          <path-item
            :key="index"
            v-for="(item, index) in reversePaths"
            :path="item"
            @goto-path="onGotoPath(item)"
            @delete-path="onDeletePath(item)"
          />
        </div>
      </div>
      <div v-else class="path-container">
        <mp-group-tab title="路线坐标"> </mp-group-tab>
        <a-table
          class="path-list position-list"
          size="small"
          :columns="addedPositionsColumns"
          :data-source="positions"
          :rowKey="
            record => {
              return record.number
            }
          "
        >
          <template slot="position" slot-scope="text">
            <div class="path-position" :title="text">{{ text }}</div>
          </template>
        </a-table>
      </div>
    </div>
    <path-roaming
      v-else
      ref="refPathRoaming"
      :path="roamingPath"
      @goto-home="onGotoHome"
    ></path-roaming>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import { api } from '@mapgis/pan-spatial-map-common'
import PathItem from './components/PathItem.vue'
import PathRoaming from './components/PathRoaming.vue'

@Component({
  name: 'MpSceneRoaming',
  components: { PathItem, PathRoaming }
})
export default class MpSceneRoaming extends Mixins(WidgetMixin) {
  // 绘制路径工具
  private draw

  private interactiveAdding = false

  private roaming = false

  private roamingPath = null

  private addedPositions = []

  private addedPositionsColumns = [
    {
      title: '序号',
      dataIndex: 'number',
      align: 'center',
      ellipsis: true,
      width: 42
    },
    {
      title: '经度',
      dataIndex: 'x',
      align: 'center',
      ellipsis: true,
      scopedSlots: { customRender: 'position' }
    },
    {
      title: '纬度',
      dataIndex: 'y',
      align: 'center',
      ellipsis: true,
      scopedSlots: { customRender: 'position' }
    },
    {
      title: '高度',
      dataIndex: 'z',
      align: 'center',
      ellipsis: true,
      scopedSlots: { customRender: 'position' },
      width: 60
    }
  ]

  get paths() {
    return this.widgetInfo.config
  }

  get reversePaths() {
    const tempPaths = [...this.paths]
    return tempPaths.reverse()
  }

  get pathTotal() {
    return `${this.paths.length}条路线`
  }

  get positions() {
    return this.addedPositions.map((position, index) => {
      return { number: index + 1, ...position }
    })
  }

  // 微件关闭时
  onClose() {
    this.stopAdded()
    this.stopRoaming()
  }

  // 微件失活时
  onDeActive() {
    this.stopAdded()
  }

  private onAddPathStart() {
    this.interactiveAdding = true
    this.draw = new this.Cesium.DrawElement(this.webGlobe.viewer)

    const material = this.Cesium.Material.fromType('Color')
    material.uniforms.color = new this.Cesium.Color(0.9, 0.6, 0.1, 0.5)

    this.draw.startDrawingMarker({
      material,
      addDefaultMark: true,
      callback: coord => {
        // 获取当前坐标系标准
        const ellipsoid = this.webGlobe.viewer.scene.globe.ellipsoid
        // 根据坐标系标准，将笛卡尔坐标转换为地理坐标
        const cartographic = ellipsoid.cartesianToCartographic(coord)
        // 获取该位置的经纬度坐标和镜头高度
        const lonDegree = this.Cesium.Math.toDegrees(cartographic.longitude)
        const latDegree = this.Cesium.Math.toDegrees(cartographic.latitude)
        const height = cartographic.height

        this.addedPositions.push({
          x: lonDegree,
          y: latDegree,
          z: height
        })
      }
    })
  }

  private onAddPathComplete() {
    let pathId
    if (this.paths.length > 0) {
      const pathIds = this.paths
        .map((item, index) => {
          return item.id || index + 1
        })
        .sort((a, b) => {
          return a - b
        })
      pathId = +pathIds[pathIds.length - 1] + 1
    } else {
      pathId = 1
    }
    const path = {
      name: `路线${pathId}`,
      id: pathId,
      path: this.addedPositions
        .map(item => {
          return [item.x, item.y, item.z]
        })
        .reduce(function(a, b) {
          return a.concat(b)
        }),
      para: {
        speed: 60,
        exHeight: 1000,
        til: 0,
        pitch: 0,
        animationType: 1,
        interpolationAlgorithm: 'LagrangePolynomialApproximation',
        isLoop: true,
        showPath: true,
        showInfo: true
      }
    }
    this.paths.push(path)

    this.stopAdded()
  }

  private onAddPathCancel() {
    this.stopAdded()
  }

  private onGotoPath(path) {
    this.roamingPath = path
    this.roaming = true
  }

  private onGotoHome() {
    this.roaming = false
  }

  private onDeletePath(path) {
    const index = this.paths.indexOf(path)
    if (index > -1) {
      this.paths.splice(index, 1)
    }
  }

  private onSaveConfig() {
    const this_ = this

    api
      .saveWidgetConfig({
        name: 'scene-roaming',
        config: JSON.stringify(this.widgetInfo.config)
      })
      .then(() => {
        this_.$message.success('保存成功')
      })
      .catch(() => {
        this_.$message.error('保存失败')
      })
  }

  private stopAdded() {
    if (this.draw) {
      this.draw.stopDrawing()
    }
    this.interactiveAdding = false
    this.addedPositions = []
  }

  private stopRoaming() {
    this.$refs.refPathRoaming && this.$refs.refPathRoaming.onClickStop()
  }
}
</script>

<style lang="less" scoped>
.mp-widget-scene-roaming {
  .full-width {
    width: 100%;
  }
  .add-path-status {
    display: flex;
    justify-content: space-between;
    .add-path-status-action {
      width: calc(50% - 4px);
    }
  }
  .path-container {
    .path-list {
      width: 280px;
      margin: 0 auto;
    }
    .position-list {
      /deep/.ant-table {
        font-size: 12px;
        .path-position {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      /deep/.ant-table-pagination.ant-pagination {
        margin: 8px 0 0 0;
      }
    }
  }
}
</style>
