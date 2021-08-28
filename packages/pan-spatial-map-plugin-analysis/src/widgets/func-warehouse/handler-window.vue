<template>
  <div class="mp-handler-window">
    <template v-if="funcParamCopy.Parameters">
      <mp-group-tab title="参数" :has-top-margin="false"></mp-group-tab>
      <mp-setting-form :no-last-margin-bottom="true" :wrapper-width="300">
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
      </mp-setting-form>
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

  // 是否显示进度条
  private showLoading = false

  // 功能执行参数
  private executeParam = null

  // 功能执行结果图层
  private clipLayer = null

  // 功能参数副本
  private funcParamCopy = {}

  @Watch('funcParam', { deep: true, immediate: true })
  funcParamChange(val) {
    // this.deleteLayer()
    const item = JSON.parse(JSON.stringify(this.funcParam))
    this.funcParamCopy = item
  }

  /**
   * 执行工作流
   */
  doExecuteWorkflow() {
    const params = []
    this.funcParamCopy.Parameters.forEach(item => {
      const value = item.DefaultValue
      const id = item.Name
      params.push({
        key: id,
        value
      })
    })
    const flowId = this.funcParamCopy.FlowNo
    params.push({
      ip: this.ip || baseConfigInstance.config.ip,
      port: this.port || baseConfigInstance.config.port,
      key: 'flowId',
      value: flowId
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
        if (res.ParaName && res.Value) {
          const paramName = res.ParaName
          const value = res.Value
          this.funcParamCopy.Parameters.forEach(item => {
            if (item.Name === paramName) {
              item.DefaultValue = value
            }
            return item
          })

          if (this.executeParam) {
            let url
            for (let i = 0; i < this.executeParam.length; i++) {
              if (
                typeof this.executeParam[i].value === 'string' &&
                this.executeParam[i].value.indexOf(value) >= 0
              ) {
                url = this.executeParam[i].value
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
