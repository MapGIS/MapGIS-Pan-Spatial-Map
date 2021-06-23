<template>
  <div
    class="mp-widget-scene-roaming"
    :class="isFullScreen ? '' : 'window-size'"
  >
    <div class="scene-title">
      <a-button
        type="primary"
        icon="pull-request"
        :disabled="isShowPointTable || isShowEditTable"
        @click="onClickCreatPath"
        >交互选点</a-button
      >
      <a-button type="primary" @click="onClickCancelPath">取消选点</a-button>
    </div>
    <div class="scene-panel-table">
      <a-table
        v-show="!isShowPointTable && !isShowEditTable"
        :columns="columns"
        :data-source="tableData"
        :pagination="pagination"
        :scroll="{ y: 108 }"
        :row-selection="{
          selectedRowKeys: selectedRowKeys,
          type: 'radio',
          onChange: onSelectChange
        }"
        :rowKey="
          record => {
            return record.id
          }
        "
      >
        <template slot="name" slot-scope="text, record">
          <a-input
            v-if="record.editable"
            :value="text"
            @change="e => handleChange(e.target.value, record, 'name')"
          ></a-input>
          <template v-else>
            {{ text }}
          </template>
        </template>
        <template slot="path" slot-scope="text, record">
          <a-input
            v-if="record.editable"
            :value="text"
            @change="e => handleChange(e.target.value, record, 'path')"
          ></a-input>
          <template v-else>
            <EditableCell
              :text="text"
              @editPath="onEditPath(record)"
            ></EditableCell>
          </template>
        </template>
        <template slot="operate" slot-scope="text, record">
          <div v-if="record.editable">
            <a-button
              shape="circle"
              icon="check"
              @click="onClickCheck(record)"
            />
            <a-button
              shape="circle"
              icon="close"
              @click="onClickClose(record)"
            />
          </div>

          <div v-else>
            <a-tooltip placement="bottom">
              <template slot="title">
                <span>删除</span>
              </template>
              <a-button
                :disabled="editingKey !== ''"
                shape="circle"
                icon="delete"
                @click="onClickDelete(record)"
              />
            </a-tooltip>
            <a-tooltip placement="bottom">
              <template slot="title">
                <span>编辑</span>
              </template>
              <a-button
                :disabled="editingKey !== ''"
                shape="circle"
                icon="edit"
                @click="onClickEdit(record)"
              />
            </a-tooltip>
          </div>
        </template>
      </a-table>

      <a-table
        v-show="isShowPointTable"
        :columns="pointColumns"
        :data-source="pointTableData"
        :pagination="pointPagination"
        :scroll="{ y: 108 }"
        :rowKey="
          record => {
            return record.id
          }
        "
      >
      </a-table>

      <a-table
        v-show="isShowEditTable"
        :columns="editColumns"
        :data-source="editTableData"
        :pagination="editPagination"
        :scroll="{ y: 393 }"
        :rowKey="
          record => {
            return record.id
          }
        "
      >
        <template slot="xCoord" slot-scope="text, record">
          <a-input
            :value="text"
            @change="e => handleEditChange(e.target.value, record, 'xCoord')"
          ></a-input>
        </template>
        <template slot="yCoord" slot-scope="text, record">
          <a-input
            :value="text"
            @change="e => handleEditChange(e.target.value, record, 'yCoord')"
          ></a-input>
        </template>
        <template slot="zCoord" slot-scope="text, record">
          <a-input
            :value="text"
            @change="e => handleEditChange(e.target.value, record, 'zCoord')"
          ></a-input>
        </template>
      </a-table>
    </div>
    <div v-show="!isShowEditTable" class="scene-panel-form">
      <a-form-model
        :model="formData"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
        labelAlign="left"
      >
        <a-form-model-item label="移动速度:">
          <a-input
            v-model.number="formData.speed"
            type="number"
            addon-after="(米/秒)"
          />
        </a-form-model-item>
        <a-form-model-item label="附加高程:">
          <a-input v-model.number="formData.exHeight" type="number" />
        </a-form-model-item>
        <a-form-model-item label="方位角:">
          <a-input v-model.number="formData.azimuth" type="number" />
        </a-form-model-item>
        <a-form-model-item label="俯仰角:">
          <a-input v-model.number="formData.pitch" type="number" />
        </a-form-model-item>
        <a-form-model-item label="视角:">
          <a-select v-model="formData.perspective">
            <a-select-option
              v-for="item in perspectiveOptions"
              :key="item.value"
            >
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="插值:">
          <a-select v-model="formData.interpolation">
            <a-select-option
              v-for="item in interpolationOptions"
              :key="item.value"
            >
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
      </a-form-model>
    </div>
    <div v-show="!isShowEditTable" class="scene-footer">
      <div class="footer-checkbox">
        <a-checkbox-group
          v-model="checkedVal"
          :options="checkboxOptions"
        ></a-checkbox-group>
      </div>
      <div class="footer-btn">
        <a-button v-show="!isStart" type="primary" @click="onClickStart"
          >开始</a-button
        >
        <a-button v-show="isStart" type="primary" @click="onClickStop"
          >停止</a-button
        >
        <a-button v-show="isPause" type="primary" @click="onClickGoOn"
          >继续</a-button
        >
        <a-button v-show="!isPause" type="primary" @click="onClickPause"
          >暂停</a-button
        >
        <a-button
          :disabled="editingKey !== ''"
          type="primary"
          @click="onClickSave"
          >保存</a-button
        >
      </div>
    </div>
    <div v-show="isShowEditTable" class="edit-footer">
      <a-button type="primary" @click="onCancelEdit">取消</a-button>
      <a-button type="primary" @click="onConfirmEdit">确认</a-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin, UUID } from '@mapgis/web-app-framework'
import { api } from '@mapgis/pan-spatial-map-store'
import EditableCell from './editable-cell'

@Component({ name: 'MpSceneRoaming', components: { EditableCell } })
export default class MpSceneRoaming extends Mixins(WidgetMixin) {
  // 绘制路径工具
  private draw

  // 表格一列配置
  private columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      ellipsis: true,
      scopedSlots: { customRender: 'name' }
    },
    {
      title: '坐标',
      dataIndex: 'path',
      key: 'path',
      align: 'center',
      ellipsis: true,
      scopedSlots: { customRender: 'path' }
    },
    {
      title: '操作',
      dataIndex: 'operate',
      key: 'operate',
      align: 'center',
      scopedSlots: { customRender: 'operate' }
    }
  ]

  // 表格二列配置
  private pointColumns = [
    {
      title: 'x坐标',
      dataIndex: 'xCoord',
      key: 'xCoord',
      align: 'center',
      ellipsis: true
    },
    {
      title: 'y坐标',
      dataIndex: 'yCoord',
      key: 'yCoord',
      align: 'center',
      ellipsis: true
    },
    {
      title: 'z坐标',
      dataIndex: 'zCoord',
      key: 'zCoord',
      align: 'center',
      ellipsis: true
    }
  ]

  // 表格三列配置
  private editColumns = [
    {
      title: '序号',
      dataIndex: 'number',
      key: 'number',
      align: 'center',
      ellipsis: true
    },
    {
      title: 'x坐标',
      dataIndex: 'xCoord',
      key: 'xCoord',
      align: 'center',
      ellipsis: true,
      scopedSlots: { customRender: 'xCoord' }
    },
    {
      title: 'y坐标',
      dataIndex: 'yCoord',
      key: 'yCoord',
      align: 'center',
      ellipsis: true,
      scopedSlots: { customRender: 'yCoord' }
    },
    {
      title: 'z坐标',
      dataIndex: 'zCoord',
      key: 'zCoord',
      align: 'center',
      ellipsis: true,
      scopedSlots: { customRender: 'zCoord' }
    }
  ]

  // 表格一数据
  private tableData = []

  // 表格一老版数据(未更新编辑数据)
  private cacheTableData = []

  // 表格二数据
  private pointTableData = []

  // 表格三数据
  private editTableData = []

  // 表格三老版数据(未更新编辑数据)
  private cacheEditData = []

  // 表格一分页器配置
  private pagination = {
    showSizeChanger: true,
    size: 'small',
    total: this.tableData.length,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`
  }

  // 表格二分页器配置
  private pointPagination = {
    showSizeChanger: true,
    size: 'small',
    total: this.pointTableData.length,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`
  }

  // 表格三分页器配置
  private editPagination = {
    showSizeChanger: true,
    size: 'small',
    total: this.editTableData.length,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`
  }

  // 表格一选中项 key 数组
  private selectedRowKeys = []

  // 表格一选中项
  private selectedRow

  // 表单数据
  private formData = {
    speed: 0,
    exHeight: 0,
    azimuth: 0,
    pitch: 0,
    perspective: '',
    interpolation: ''
  }

  // 视角下拉框
  private perspectiveOptions = [
    {
      label: '跟随',
      value: 1
    },
    {
      label: '锁定第一视角',
      value: 2
    },
    {
      label: '上帝视角',
      value: 3
    }
  ]

  // 插值下拉框
  private interpolationOptions = [
    {
      label: '拉格朗日插值',
      value: 'LagrangePolynomialApproximation'
    },
    {
      label: '线性近似',
      value: 'LinearApproximation'
    },
    {
      label: '埃尔米特插值',
      value: 'HermitePolynomialApproximation'
    }
  ]

  // 多选框组选中值
  private checkedVal = []

  // 多选框项
  private checkboxOptions = [
    {
      label: '循环',
      value: 'isLoop'
    },
    {
      label: '显示路径',
      value: 'showPath'
    },
    {
      label: '显示提示信息',
      value: 'showInfo'
    }
  ]

  // 是否开始
  private isStart = false

  // 是否暂停
  private isPause = false

  // 微件窗口是否全屏显示
  private isFullScreen = false

  // 是否显示表格二
  private isShowPointTable = false

  // 是否显示表格三
  private isShowEditTable = false

  // 新增路径的坐标点
  private coordsArr = []

  // 表格一正在编辑行的key
  private editingKey = ''

  // 表格三正在编辑行的id
  private editingID = ''

  created() {
    this.initData()
  }

  onClose() {
    this.onClickStop()
    this.onClickCancelPath()
  }

  onWindowSize(mode) {
    this.isFullScreen = mode === 'max'
  }

  // 初始化各项数据
  private initData() {
    const configData = this.widgetInfo.config

    this.tableData = configData.map(item => {
      return { ...item, path: item.path.join() }
    })

    this.cacheTableData = this.tableData.map(item => ({ ...item }))

    //  默认勾选表格的第一项数据
    this.onSelectChange([this.tableData[0].id])

    window.SceneWanderManager = {
      animation: null
    }

    //  初始化漫游动画
    window.SceneWanderManager.animation = new this.Cesium.AnimationAnalyse(
      this.webGlobe.viewer,
      {
        modelUrl: 'models/CesiumAir/Cesium_Air.gltf'
      }
    )

    this.$message.config({ top: '100px', duration: 2, maxCount: 1 })
  }

  // 表格一选中项发生变化时的回调
  private onSelectChange(selectedRowKeys) {
    this.selectedRowKeys = selectedRowKeys
    this.selectedRow = this.tableData.find(
      item => item.id === selectedRowKeys[0]
    )
    const {
      speed,
      exHeight,
      til,
      pitch,
      animationType,
      interpolationAlgorithm,
      isLoop,
      showPath,
      showInfo
    } = this.selectedRow.para

    // 根据选中项，初始化表单数据
    this.formData = {
      speed,
      exHeight,
      azimuth: til,
      pitch,
      perspective: animationType,
      interpolation: interpolationAlgorithm
    }

    // 根据选中项，初始化多选框组
    this.checkedVal = this.checkboxOptions.reduce((result, item) => {
      if (isLoop && item.value === 'isLoop') {
        result.push(item.value)
      }
      if (showPath && item.value === 'showPath') {
        result.push(item.value)
      }
      if (showInfo && item.value === 'showInfo') {
        result.push(item.value)
      }
      return result
    }, [])
  }

  // 点击交互选点按钮回调(创建路径)
  private onClickCreatPath() {
    this.isShowPointTable = true
    this.pointTableData = []
    this.coordsArr = []
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
        const height = cartographic.height + 3000

        this.coordsArr.push(lonDegree)
        this.coordsArr.push(latDegree)
        this.coordsArr.push(height)

        const pointDataItem = {
          id: UUID.uuid(),
          xCoord: lonDegree,
          yCoord: latDegree,
          zCoord: height
        }

        this.pointTableData.push(pointDataItem)
      }
    })
  }

  // 点击取消选点按钮回调(取消创建路径)
  private onClickCancelPath() {
    if (this.draw) this.draw.stopDrawing()

    this.isShowPointTable = false
  }

  // 点击删除列按钮回调
  private onClickDelete(record) {
    const index = this.tableData.findIndex(item => item.id === record.id)

    this.tableData.splice(index, 1)
  }

  // 点击编辑列按钮回调
  private onClickEdit(record) {
    this.editingKey = record.id

    this.tableData = this.tableData.reduce((result, item) => {
      if (item.id === record.id) {
        item.editable = true
      }
      result.push(item)
      return result
    }, [])
  }

  // 点击保存编辑列按钮回调
  private onClickCheck(record) {
    // 首先得判断修改的路径名是否和其他行路径名重复
    const copyTable = this.tableData.filter(item => item.id !== record.id)
    const targetData = this.tableData.find(item => item.id === record.id)

    if (copyTable.some(item => item.name === targetData.name)) {
      this.$message.warning('修改的路径名重复，请重新修改')
    } else {
      this.editingKey = ''

      this.tableData = this.tableData.reduce((result, item) => {
        if (item.id === record.id) {
          delete item.editable
        }
        result.push(item)
        return result
      }, [])

      this.cacheTableData = this.tableData.map(item => ({ ...item }))
    }
  }

  // 点击取消编辑列按钮回调
  private onClickClose(record) {
    this.editingKey = ''
    const oldTargetData = this.cacheTableData.find(
      item => item.id === record.id
    )
    this.tableData = this.tableData.reduce((result, item) => {
      if (item.id === record.id) {
        Object.assign(item, oldTargetData)
        delete item.editable
      }
      result.push(item)
      return result
    }, [])
  }

  // 表格一编辑框输入值变化时回调
  private handleChange(value, record, colName) {
    this.tableData = this.tableData.reduce((result, item) => {
      if (item.id === record.id) {
        item[colName] = value
      }
      result.push(item)
      return result
    }, [])
  }

  // 表格三编辑框输入值变化时回调
  private handleEditChange(value, record, colName) {
    this.editTableData = this.editTableData.reduce((result, item) => {
      if (item.id === record.id) {
        item[colName] = value
      }
      result.push(item)
      return result
    }, [])
  }

  // 点击开始按钮回调
  private onClickStart() {
    const pathCoords = this.selectedRow.path.split(',')

    this.onClickCancelPath()

    // 设置播放动画的各项属性
    if (pathCoords.length > 0) {
      window.SceneWanderManager.animation.positions = this.Cesium.Cartesian3.fromDegreesArrayHeights(
        pathCoords
      )
      window.SceneWanderManager.animation.speed = this.formData.speed
      window.SceneWanderManager.animation.exHeight = this.formData.exHeight
      window.SceneWanderManager.animation.offsetX = this.formData.azimuth
      window.SceneWanderManager.animation.offsetZ = this.formData.pitch
      window.SceneWanderManager.animation.animationType = this.formData.perspective
      window.SceneWanderManager.animation.isLoop = this.judgeIsCheckd('isLoop')
      window.SceneWanderManager.animation.isShowPath = this.judgeIsCheckd(
        'showPath'
      )
      window.SceneWanderManager.animation.showInfo = this.judgeIsCheckd(
        'showInfo'
      )

      switch (this.formData.interpolation) {
        case 'LagrangePolynomialApproximation':
          window.SceneWanderManager.animation.interpolationAlgorithm = this.Cesium.LagrangePolynomialApproximation // 拉格朗日插值
          break
        case 'LinearApproximation':
          window.SceneWanderManager.animation.interpolationAlgorithm = this.Cesium.LinearApproximation // 线性近似
          break
        case 'HermitePolynomialApproximation':
          window.SceneWanderManager.animation.interpolationAlgorithm = this.Cesium.HermitePolynomialApproximation // 埃尔米特插值
          break
        default:
          break
      }

      window.SceneWanderManager.animation.start()
      this.isStart = true
    }
  }

  // 点击停止按钮回调
  private onClickStop() {
    window.SceneWanderManager.animation.stop()
    this.isStart = false

    // 若点击停止时处于暂停状态，则将状态改为“继续”
    if (this.isPause) this.onClickGoOn()
  }

  // 点击继续按钮回调
  private onClickGoOn() {
    window.SceneWanderManager.animation.pause = false
    this.isPause = false
  }

  // 点击暂停按钮回调
  private onClickPause() {
    window.SceneWanderManager.animation.pause = true
    this.isPause = true
  }

  // 判断是否勾选了对应的多选框
  private judgeIsCheckd(type) {
    return this.checkedVal.includes(type)
  }

  // 点击保存按钮回调
  private onClickSave() {
    let configData = []

    configData = this.tableData
      .map(item => ({
        ...item,
        path: item.path.split(',')
      }))
      .reduce((result, item) => {
        // 只改变已勾选路径的各项表单参数，不改变未勾选的路径
        if (item.id === this.selectedRow.id) {
          item.para = {
            speed: this.formData.speed,
            exHeight: this.formData.exHeight,
            til: this.formData.azimuth,
            pitch: this.formData.pitch,
            animationType: this.formData.perspective,
            interpolationAlgorithm: this.formData.interpolation,
            isLoop: this.judgeIsCheckd('isLoop'),
            showPath: this.judgeIsCheckd('showPath'),
            showInfo: this.judgeIsCheckd('showInfo')
          }
        }
        result.push(item)
        return result
      }, [])

    if (this.coordsArr.length > 0) {
      let pathID
      if (this.tableData.length > 0) {
        const PathIdArr = this.tableData
          .map(item => item.name.replace(/[^\d]/g, ''))
          .sort((a, b) => {
            return a - b
          })
        pathID = +PathIdArr[PathIdArr.length - 1] + 1
      } else {
        pathID = 1
      }
      const pathItem = {
        name: `路线${pathID}`,
        id: pathID,
        path: this.coordsArr,
        para: {
          speed: this.formData.speed,
          exHeight: this.formData.exHeight,
          til: this.formData.azimuth,
          pitch: this.formData.pitch,
          animationType: this.formData.perspective,
          interpolationAlgorithm: this.formData.interpolation,
          isLoop: this.judgeIsCheckd('isLoop'),
          showPath: this.judgeIsCheckd('showPath'),
          showInfo: this.judgeIsCheckd('showInfo')
        }
      }

      configData.push(pathItem)
    }

    api
      .saveWidgetConfig({
        name: 'scene-roaming',
        config: JSON.stringify(configData)
      })
      .then(_ => {
        this.$message.success('保存成功')
        this.onClickCancelPath()

        api.getWidgetConfig('scene-roaming').then(res => {
          this.tableData = res.map(item => {
            return { ...item, path: item.path.join() }
          })

          this.cacheTableData = this.tableData.map(item => ({ ...item }))
        })
      })
      .catch(_ => {
        this.$message.error('保存失败')
      })
  }

  // 点击具体坐标列编辑按钮回调
  private onEditPath(record) {
    this.isShowEditTable = true
    this.editingID = record.id
    const pathArr = record.path.split(',')
    const newArr = []

    for (let i = 0; i < pathArr.length; i += 3) {
      const item = pathArr.slice(i, i + 3)
      newArr.push(item)
    }

    this.editTableData = newArr.reduce((result, item, index) => {
      result.push({
        id: UUID.uuid(),
        number: index + 1,
        xCoord: item[0],
        yCoord: item[1],
        zCoord: item[2]
      })
      return result
    }, [])

    this.cacheEditData = this.editTableData.map(item => ({ ...item }))
  }

  // 取消编辑table按钮回调
  private onCancelEdit() {
    this.isShowEditTable = false
    this.editingID = ''
    this.editTableData = this.cacheEditData
  }

  // 确认编辑table按钮回调
  private onConfirmEdit() {
    this.isShowEditTable = false

    const pathArr = this.editTableData
      .reduce((result, item) => {
        result.push([item.xCoord, item.yCoord, item.zCoord])
        return result
      }, [])
      .map(item => item.join(','))
      .join(',')

    this.tableData = this.tableData.reduce((result, item) => {
      if (item.id === this.editingID) {
        item.path = pathArr
      }
      result.push(item)
      return result
    }, [])

    this.cacheTableData = this.tableData.map(item => ({ ...item }))
    this.editingID = ''
  }
}
</script>

<style lang="less" scoped>
.mp-widget-scene-roaming {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.window-size {
  width: 344px;
}

.scene-title {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 0;

  .ant-btn {
    margin-right: 16px;
    padding: 0 15px;
  }
}

.scene-panel-table {
  width: 100%;

  ::v-deep .anticon-edit {
    margin-left: 8px;
  }

  ::v-deep .anticon-close {
    margin-left: 8px;
  }

  ::v-deep .ant-btn-circle {
    border: none;
    background: transparent;
  }
}

.scene-panel-form {
  width: 100%;
  margin-top: 8px;
  .ant-form-item {
    display: flex;
    align-items: center;
    margin-bottom: 0;
  }
  .ant-input {
    padding: 4px 11px;
  }
}

.scene-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 8px;

  .footer-checkbox {
    width: 100%;

    .ant-checkbox-group {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
  }

  .footer-btn {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-top: 8px;

    .ant-btn {
      padding: 0 15px;
    }
  }
}

.edit-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;

  .ant-btn {
    margin-left: 16px;
    padding: 0 15px;
  }
}
</style>
