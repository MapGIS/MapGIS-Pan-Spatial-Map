import * as Zondy from '@mapgis/webclient-es6-service'
import axios from 'axios'

/**
 * 工作流执行参数结构
 */
export interface ExecuteWorkflowParam {
  ip: string // ip
  port: string // port
  flowID: string // 工作流id
  param: object // 工作流执行参数
  isAsy: boolean // 是否异步调用，默认true
  f: string // 返回值类型，默认json
}

/**
 * 工作流执行状态参数结构
 */
export interface WorkflowStatusParam {
  ip: string
  port: string
  id: string // 工作流id
  f?: string
}

export default class WorkflowAnalysis {
  /**
   * 执行工作流
   * @param {object} option
   * @param {string|null} option.f 返回值类型，默认json
   * @param {boolean|null} option.isAsy 是否异步调用，默认true
   * @param {string|null} option.ip ip,默认使用配置ip
   * @param {string|port} oprion.port port,默认使用配置port
   * @param {string} option.flowID 工作流id
   * @param {object} option.param 工作流执行参数
   */
  public static executeWorkflow(option: ExecuteWorkflowParam) {
    option = option || {}
    return new Promise((resolve, reject) => {
      if (option.flowID) {
        option.f = option.f || 'json'
        option.isAsy = option.isAsy || true
        option.param = option.param || {}
        const url = `http://${option.ip}:${option.port}/igs/rest/mrfws/execute/${option.flowID}?f=${option.f}&isAsy=${option.isAsy}`
        axios
          .post(url, option.param, {
            headers: {
              'Content-Type': 'text/plain'
            }
          })
          .then(res => {
            if (res.status === 200) {
              resolve(res.data)
            } else {
              reject('请求失败')
            }
          })
          .catch(e => {
            reject(e)
          })
      } else {
        reject('参数错误')
      }
    })
  }

  /**
   * 获取工作流执行状态
   * @param {object} option
   * @param {string|null} option.ip ip,默认使用配置ip
   * @param {string|null} option.port port,默认使用配置port
   * @param {string} option.id 工作流id
   */
  public static getWorkflowStatus(option: WorkflowStatusParam) {
    option = option || {}
    return new Promise((resolve, reject) => {
      if (option.id) {
        const url = `http://${option.ip}:${option.port}/igs/rest/mrfws/status/${option.id}`
        axios
          .get(url)
          .then(res => {
            if (res.status === 200) {
              resolve(res.data)
            } else {
              reject('请求失败')
            }
          })
          .catch(e => {
            reject(e)
          })
      } else {
        reject('参数错误')
      }
    })
  }

  /**
   * 获取工作流列表
   * @param {object|null} option
   * @param {string|null} option.ip ip默认使用系统配置ip
   * @param {string|null} option.port port默认使用系统配置port
   */
  public static getWorkflowList(option: WorkflowStatusParam) {
    option = option || {}
    return new Promise((resolve, reject) => {
      const url = `http://${option.ip}:${option.port}/igs/rest/mrfws/workflows?f=json`
      axios
        .get(url)
        .then(res => {
          if (res.status === 200) {
            resolve(res.data)
          } else {
            reject('请求失败')
          }
        })
        .catch(e => {
          reject(e)
        })
    })
  }

  /**
   * 获取工作流执行结果
   * @param {object} option
   * @param {string|null} option.ip ip,默认使用配置ip
   * @param {string|null} option.port port,默认使用配置port
   * @param {string} option.id 工作流id
   * @param {string|null} option.f 返回结果类型，默认json
   */
  public static getWorkflowResult(option: WorkflowStatusParam) {
    option = option || {}
    return new Promise((resolve, reject) => {
      if (option.id) {
        option.f = option.f || 'json'
        const url = `http://${option.ip}:${option.port}/igs/rest/mrfws/results/${option.id}?f=${option.f}`
        axios
          .get(url)
          .then(res => {
            if (res.status === 200) {
              resolve(res.data)
            } else {
              reject('请求失败')
            }
          })
          .catch(e => {
            reject(e)
          })
      } else {
        reject('参数错误')
      }
    })
  }
}
