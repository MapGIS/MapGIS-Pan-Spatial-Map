<template>
  <div class="mp-handler-window">
    <template v-if="funcParamCopy.Parameters">
      <mapgis-ui-group-tab title="参数" :has-top-margin="false"></mapgis-ui-group-tab>
      <mapgis-ui-clouddisk-model-fields
        style="width:350px;"
        ref="fieldsData"
        v-if="hackReset"
        :isOneMap="true"
        :detailButton="false"
        :autoHeight="'calc(100vh - 300px)'"
        :params="funcParamCopy.Parameters"
        :modelGroup="funcParamCopy.Group"
        :modelType="modelType"
        :showLoading="showLoading"
        :handleParams="handleParams"
        @handleConfirm="doExecuteWorkflow"
        @handleClearParams="handleClearParams"
      >
      </mapgis-ui-clouddisk-model-fields>
      <!-- <mp-setting-form :no-last-margin-bottom="true" :wrapper-width="300">
        <a-form-item
          v-for="(item, index) in funcParamCopy.Parameters"
          :key="index"
          :label="item.Name"
        >
          <a-input :disabled="item.Direction == 1" v-model="item.DefaultValue">
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-button
            type="primary"
            :loading="showLoading"
            @click="doExecuteWorkflow"
          >
            执行
          </a-button>
        </a-form-item>
      </mp-setting-form> -->
    </template>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator'
import {
  WidgetMixin,
  Analysis,
  UUID,
  LayerType,
  LoadStatus
} from '@mapgis/web-app-framework'
import {
  baseConfigInstance,
  DataCatalogManager,
  eventBus,
  events
} from '@mapgis/pan-spatial-map-common'

// {
//  "DataType": 1, // 参数类型，1为string，0为Int、2为Float、3为Bool、4为Date、5为DateTime、6为Unknow
//  "DefaultValue": "GDBP://MapGISLocal/Sample/sfcls/wh_中心线new", // 参数默认值
//  "Direction": 0, // 工作流参数方向0为输入（IN）、1为输出（OOUT）、2为输入输出（INOUT）
//  "Index": 1, // 参数对应索引号，默认从1开始编号
//  "Name": "clsName" // 参数名称
// }

// 第一版本参考IGServer界面设计，暂时先不根据DataType去区分设计界面。

@Component({
  name: 'MpHandlerWindow'
})
export default class MpHandlerWindow extends Mixins(WidgetMixin) {
  // ip
  @Prop({ type: String, required: true, default: null }) ip: string

  // port
  @Prop({ type: String, required: true, default: null }) port: string

  // 功能参数
  @Prop({ type: Object, required: true, default: () => ({}) }) funcParam: object

  // 功能仓库组件对应的映射关系
  public DataTypeMap = {
    0: 'INT',
    1: 'STRING',
    2: 'FLOAT',
    3: 'BOOLEAN',
    4: 'TIME',
    5: 'TIMESTAMP',
    6: 'UNKNOW'
  }

  // 功能仓库组件对应的映射关系
  public DirectionMap = {
    0: 'IN',
    1: 'OUT',
    2: 'INOUT',
  }

  // 类型为igs
  private modelType = 'igs'

  // 是否显示进度条
  private showLoading = false

  // 功能执行参数
  private executeParam = null

  // 功能执行结果图层
  private clipLayer = null

  // 功能参数副本
  private funcParamCopy = {}

  // 用于清空数据功能
  private hackReset = true

  @Watch('funcParam', { deep: true, immediate: true })
  funcParamChange(val) {
    // this.deleteLayer()
    const item = JSON.parse(JSON.stringify(this.funcParam))
    this.funcParamCopy = this.formatParams(item)

    console.warn('【获取模型】', this.funcParamCopy)
  }

  /**
   * 将参数类型等内容映射为组件可识别的信息（如将1映射为STRING）
   * 王魁帅
   */
  formatParams(item) {
    if (item.Parameters && item.Parameters.length > 0) {
      item.Parameters.forEach(ele => {
        ele.briefDescp = null
        ele.dataSourceType = null
        ele.descp = null
        ele.example = null
        ele.need = null
        ele.xattrs = null
        if (!ele.value) {
          ele.value = (ele.DefaultValue === 'true' || ele.DefaultValue === 'false') ? JSON.parse(ele.DefaultValue) : ele.DefaultValue
        }
        ele.Direction = this.DirectionMap[ele.Direction]
        ele.DataType = this.DataTypeMap[ele.DataType]
        for (const key in ele) { // 首字母小写
          const newKey = key.slice(0,1).toLowerCase() + key.slice(1)
          ele[newKey] = ele[key]
        }
      })
    }
    return item
  }

  handleParams (params) {
    this.funcParamCopy.Parameters = params
  }

  /**
   * 点击清空按钮的回调
   * 王魁帅
   */
  handleClearParams () {
    this.$refs.fieldsData.clearParams()
    this.hackReset = false
    this.$nextTick(() => {
      this.hackReset = true
    })
  }

  /**
   * 执行工作流
   */
  doExecuteWorkflow() {
    const params = []
    this.funcParamCopy.Parameters.forEach(item => {
      const value = item.value
      const id = item.Name
      params.push({
        Key: id,
        Value: value
      })
    })
    const flowId = this.funcParamCopy.FlowNo
    params.push({
      Ip: this.ip || baseConfigInstance.config.ip,
      Port: this.port || baseConfigInstance.config.port,
      Key: 'flowId',
      Value: flowId
    })
    this.executeParam = params
    this.showLoading = true
    Analysis.WorkflowAnalysis.executeWorkflow({
      ip: this.ip || baseConfigInstance.config.ip,
      port: this.port || baseConfigInstance.config.port,
      flowID: flowId,
      param: params,
      isAsy: false
    })
      .then(guid => {
        this.getStatus(guid)
      })
      .catch(() => {
        this.showLoading = false
        this.$message.error(`执行${this.funcParamCopy.FlowName}失败`)
      })
  }

  /**
   * 获取功能执行状态
   */
  getStatus(guid) {
    Analysis.WorkflowAnalysis.getWorkflowStatus({
      id: guid,
      ip: this.ip || baseConfigInstance.config.ip,
      port: this.port || baseConfigInstance.config.port
    }).then(status => {
      if (status === 'Succeeded') {
        Analysis.WorkflowAnalysis.getWorkflowResult({
          id: guid,
          ip: this.ip || baseConfigInstance.config.ip,
          port: this.port || baseConfigInstance.config.port
        }).then(res => {
          this.showLoading = false
          this.$message.success('工作流执行成功,可至图层树功能查看结果')
          this.dealWithExecuteRes(res)
        })
      } else if (status === 'Runing') {
        window.setTimeout(() => {
          this.getStatus(guid)
        }, 1000)
      } else {
        this.showLoading = false
        this.$message.error('分析失败')
      }
    })
  }

  /**
   * 处理功能执行结果
   */
  dealWithExecuteRes(result) {
    console.log(result)
    if (result.results && result.results.length > 0) {
      const res = result.results[0]
      if (res.DataType === 1) {
        // res.Value = 'overlayResult' // 测试用
        if (res.ParaName && res.Value) {
          const paramName = res.ParaName
          const value = res.Value
          this.funcParamCopy.Parameters.forEach(item => {
            if (item.Name === paramName) {
              item.DefaultValue = value
              item.value = value
            }
            return item
          })

          if (this.executeParam) {
            let url
            for (let i = 0; i < this.executeParam.length; i++) {
              if (
                typeof this.executeParam[i].Value === 'string' &&
                this.executeParam[i].Value.indexOf(value) >= 0
              ) {
                url = this.executeParam[i].Value
                break
              }
            }
            if (url) {
              this.addNewLayer(url, value)
            }
          }
        }
      }
    }
  }

  /**
   * 若工作流执行结果生成新图层，则将图层添加至添加服务中，可在添加服务中进行管理，同时显示在地图容器中，并用图层树管理
   */
  addNewLayer(gdbp, name) {
    const nameStrs = name.split('/')
    const nameStr = nameStrs[nameStrs.length - 1]
    const ip = this.ip || baseConfigInstance.config.ip
    const port = this.port || baseConfigInstance.config.port

    const url = `http://${ip}:${port}/igs/rest/mrms/layers?gdbps=${gdbp as string}`

    const data = {
      name: 'IGS图层',
      description: '功能仓库_结果图层',
      data: {
        type: 'IGSVector',
        url,
        name: `${this.funcParam.FlowName}_${nameStr}`
      }
    }
    eventBus.$emit(events.ADD_DATA_EVENT, data)
  }
}
</script>

<style lang="less" scoped>
.mp-handler-window {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
