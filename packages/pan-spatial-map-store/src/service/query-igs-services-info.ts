import axios from 'axios'

class QueryIgsServicesInfo {
  /**
   * 获取数据源
   * @param {Object} param
   * @param {string} param.ip 服务器IP
   * @param {String} param.port 服务端口
   */
  getDataSource({ ip, port }) {
    const url = `http://${ip}:${port}/igs/rest/mrcs/datasource?f=json&getAttr=true`
    const promise = new Promise((resolve, reject) => {
      axios.get(url).then(
        res => {
          const { data } = res
          if (!data) {
            resolve(undefined)
          } else {
            resolve(data)
          }
        },
        error => {
          reject(error)
        }
      )
    })
    return promise.then(data => {
      return data
    })
  }

  /**
   * 获取数据源下数据库
   * @param {Object} param
   * @param {string} param.ip 服务器IP
   * @param {Number} param.port 服务端口
   * @param {String} param.dataSource 数据源名称
   * @param {String} param.user 用户名
   * @param {String} param.password 密码
   */
  getDataBase({ ip, port, dataSource, user, password }) {
    const url = `http://${ip}:${port}/igs/rest/mrcs/datasource/${dataSource}?user=${user}&psw=${password}&f=json`
    const promise = new Promise((resolve, reject) => {
      axios.get(url).then(
        res => {
          const { data } = res
          if (!data) {
            resolve(undefined)
          } else {
            resolve(data)
          }
        },
        error => {
          reject(error)
        }
      )
    })
    return promise.then(data => {
      return data
    })
  }

  /**
   * 获取GDBP下指定数据库指定类型的所有数据
   * @param {Object} param
   * @param {string} param.ip 服务器IP
   * @param {Number} param.port 服务端口
   * @param {String} param.gdbp 数据源/数据库
   * @param {String} param.type 数据类型
   * @param {String} param.user 用户名
   * @param {String} param.password 密码
   */
  getGDBData({ ip, port, gdbp, type, user, password }) {
    const url = `http://${ip}:${port}/igs/rest/mrcs/datasource/${gdbp}/${type}?user=${user}&psw=${password}&containAll=false&f=json`
    const promise = new Promise((resolve, reject) => {
      axios.get(url).then(
        res => {
          const { data } = res
          if (!data) {
            resolve(undefined)
          } else {
            resolve(data)
          }
        },
        error => {
          reject(error)
        }
      )
    })
    return promise.then(data => {
      return data
    })
  }

  /**
   * 获取瓦片列表
   * @param {Object} param
   * @param {string} param.ip 服务器IP
   * @param {Number} param.port 服务端口
   */
  getTiles({ ip, port }) {
    const url = `http://${ip}:${port}/igs/rest/mrcs/tiles?version=2&f=json`
    const promise = new Promise((resolve, reject) => {
      axios.get(url).then(
        res => {
          const { data } = res
          if (!data) {
            resolve(undefined)
          } else {
            resolve(data)
          }
        },
        error => {
          reject(error)
        }
      )
    })
    return promise.then(data => {
      return data
    })
  }

  /**
   * 获取地图列表
   * @param {Object} param
   * @param {string} param.ip 服务器IP
   * @param {Number} param.port 服务端口
   */
  getDocs({ ip, port }) {
    const url = `http://${ip}:${port}/igs/rest/mrcs/docs?version=2&f=json`
    const promise = new Promise((resolve, reject) => {
      axios.get(url).then(
        res => {
          const { data } = res
          if (!data) {
            resolve(undefined)
          } else {
            resolve(data)
          }
        },
        error => {
          reject(error)
        }
      )
    })
    return promise.then(data => {
      return data
    })
  }

  /**
   * 获取文档信息
   * @param {Object} param
   * @param {string} param.ip 服务器IP
   * @param {Number} param.port 服务端口
   * @param {string} param.name 地图文档名称
   */
  getDocInfo({ ip, port, name }) {
    const url = `http://${ip}:${port}/igs/rest/mrcs/docs/${name}?f=json&tree=true`
    const promise = new Promise((resolve, reject) => {
      axios.get(url).then(
        res => {
          const { data } = res
          if (!data) {
            resolve(undefined)
          } else {
            resolve(data)
          }
        },
        error => {
          reject(error)
        }
      )
    })
    return promise.then(data => {
      return data
    })
  }

  /**
   * 获取三维文档列表
   * @param {Object} param
   * @param {string} param.ip 服务器IP
   * @param {Number} param.port 服务端口
   */
  getG3dDocs({ ip, port }) {
    const url = `http://${ip}:${port}/igs/rest/g3d/getdoclist`
    const promise = new Promise((resolve, reject) => {
      axios.get(url).then(
        res => {
          const { data } = res
          if (!data) {
            resolve(undefined)
          } else {
            resolve(data)
          }
        },
        error => {
          reject(error)
        }
      )
    })
    return promise.then(data => {
      return data
    })
  }

  /**
   * 获取三维文档列表
   * @param {Object} param
   * @param {string} param.ip 服务器IP
   * @param {Number} param.port 服务端口
   * @param {string} param.name 服务名
   */
  getMapInfoService({ ip, port, name }) {
    const url = `http://${ip}:${port}/igs/rest/mrms/info/${name}?guid=`
    const promise = new Promise((resolve, reject) => {
      axios.get(url).then(
        res => {
          const { data } = res
          if (!data) {
            resolve(undefined)
          } else {
            resolve(data)
          }
        },
        error => {
          reject(error)
        }
      )
    })
    return promise.then(data => {
      return data
    })
  }
}

export default new QueryIgsServicesInfo()
