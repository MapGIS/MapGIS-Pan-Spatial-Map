// 基础配置数据
const baseConfig = {
  baseIp: '192.168.88.49', // 基础IP地址
  basePort: '6163', // 基础Port端口
  isOverlay: 'true', // 图层是否叠加
  isLocation: 'true', // 图层是否定位
  startZindex: 3000 // 图层叠加层级
}

// 专题图配置数据
const subjectConfig = [
  {
    id: '115dc807-63d6-91e4-93a9-31cadb98af60',
    title: '社会经济服务', // 专题图分类标题
    visible: true, // 是否可见
    nodeType: 'panel', // 节点类型 ('panel' | 'list' | 'subject')
    children: [
      {
        id: '92fd7586-e248-c105-918d-843fb090e24a',
        title: '人口', // 专题图集合标题
        visible: true, // 是否可见
        nodeType: 'list', // 节点类型
        children: [
          /**
           * 分段专题图 = SubSectionMap
           * 普通专题图 = DataShowSubject
           * 热力图 = HeatMap
           * 统计专题图 = BaseMapWithGraph
           * 普通静态标注 = StatisticLabel
           * 标注专题图 = Label
           * 蜂窝图 = HexBin
           */
        ]
      }
    ]
  }
]

// 1.分段专题图（SubSectionMap）
const SubSectionMap = {
  id: '2cf1abdb-2ac3-39f1-3b05-63342964ebdd',
  title: '分段专题图',
  visible: true,
  nodeType: 'subject',
  type: 'SubSectionMap',
  config: {
    type: 'gdbp', // 请求使用方式gdbp|doc|geojson|excel等
    data: [
      // 多个年度
      {
        time: '2018', // 年度  可设置数字和字符串，（时间轴依赖字段）
        subData: [
          // 数组形式  一个年度下包含多个层级范围内的数据
          {
            minZoom: '6', // 最小级数
            maxZoom: '10', // 最大级数
            queryFeatureNum: '5000', // 查询要素个数
            ip: '', // 当前查询接口ip 不填就使用全局默认ip
            port: '', // 当前查询接口port 不填就使用全局默认port
            src: '', // 文件地址
            gdbp: 'gdbp://MapGISLocal/Templates/sfcls/海洋陆地', // 图层gdbp地址
            docName: '', // 地图文档服务名
            layerIndex: null, // 图层索引
            layerName: '', // 图层名
            showLegend: 'true', // 是否显示图例
            field: 'mpArea', // 颜色分段依赖的值
            webglTextField: 'fid', // 在webgl状态下，显示的文字标注的值
            dataBase: {
              // 从数据库查询数据所需条件
              code: '', // 行政区代码
              codeYear: '', // 行政区代码所在的年度（数据库中的年度）
              dataYear: '' // 数据所在的年度（数据库中的年度）
            },
            // 分段颜色 数组里面的每一个对象就为分段的条件（属性值范围区间和显示的颜色）
            color: [
              {
                min: '0', // 范围最小值
                max: '1990', // 范围最大值
                sectionColor: '#FF3300' // 分段颜色
              },
              {
                min: '1990',
                max: '3980',
                sectionColor: '#3300CC'
              }
            ],
            table: {
              // 展示右侧的表格数据
              showFields: [
                // 表格显示字段 （数组形式）
                '权属代码',
                '权属名称',
                'GDP万元'
              ],
              showFieldsTitle: {} // 表格的显示字段别名,key,value形式
            },

            graph: {
              // 右侧统计图的字段配置
              showFields: ['WRLD30_ID', 'mpLayer', 'POP_1994', 'SQMI'], // 右侧的显示字段（y轴字段）
              showFieldsTitle: {}, // 右侧统计图的显示字段别名,key,value形式
              field: 'COUNTRY', // 右侧统计图的x轴字段
              target: [] // 已经废弃掉
            },

            popup: {
              // 鼠标的悬浮时弹出的悬浮框
              showFields: [], // 悬浮框的显示字段
              showFieldsTitle: {}, // 悬浮框的内容主体的别名字段  key value 形式
              title: 'fid' // 悬浮框的头部字段
            }
          }
        ]
      }
    ]
  }
}

// 2.普通专题图（底图加数据展示，DataShowSubject）
const DataShowSubject = {
  id: 'b9d9e842-fdfa-b17c-d5ce-75bd49df2ee3',
  title: '普通专题图',
  visible: true,
  nodeType: 'subject',
  type: 'DataShowSubject',
  config: {
    subData: [
      {
        year: '2019', // 年度,时间轴依赖属性
        ip: '', // 显示时用到的ip
        port: '', // 显示时用到的端口
        searchIp: '', // 查询时用到的ip
        searchPort: '', // 查询时用到的端口
        searchName: '海洋陆地', // 查询时所用的地图文档服务名
        serverName: '2014年建设用地供应_面积', // 显示时所用的地图文档服务名
        type: 'IGSIMAGE', // 地图显示的类型（对应serverName）
        table: {
          // 右侧表格数据
          layerIndex: [
            // 右侧表格显示时使用的图层，图层索引数组
            '0'
          ],
          layerName: '海洋陆地', // 地图文档图层名
          showFields: [
            // 右侧表格显示的字段
            'POP_1994',
            'CONTINENT',
            'COLOR_INDEX',
            'mpLayer'
          ],
          showFieldsTitle: {}, // 右侧表格显示的字段别名 key value键值对
          type: 'sum', // 统计类型  三张  求和 sum 求个数count  直接显示attr
          sumFiled: [
            // 求和字段用到此参数   对某些字段作参考
            'COUNTRY'
          ],
          sumColumn: [
            // 求和字段用到此参数   依赖 sumField,对此字段做统计计算
            'POP_1994'
          ],
          countField: [] // 统计个数字段用到此参数   对此字段做求和计数统计
        },
        graph: {
          // 右侧统计图参数
          layerIndex: [
            // 查询的图层索引数组
            '0'
          ],
          layerName: '地质灾害隐患点2015', // 图层名
          showFields: [
            // 统计图显示的字段
            '隐患点新增数量',
            '隐患点消除数量',
            '特大型隐患点'
          ],
          showFieldsTitle: {}, // 显示字段别名
          field: '权属名称', // 统计图x轴字段
          target: [] // 废弃掉，已使用showFields代替
        }
      }
    ]
  }
}

// 3.热力图
const HeatMap = {
  id: '860aba03-5499-730d-3b8a-7e7b2ed93ff5',
  title: 'newNode',
  visible: true,
  nodeType: 'subject',
  type: 'HeatMap',
  config: {
    type: 'file', // 数据来源  三种  暂时只要一种file
    data: [
      // 配置多年度数据  数组形式
      {
        time: '2016', // 年度 时间轴专用
        ip: '', // 数据查询IP地址
        port: '', // 数据查询端口
        src: '', // 热力图json文件地址  后台文件夹地址
        gdbp: '', // 使用图层查询数据时使用
        docName: '', // 地图文档服务名
        layerIndex: '', // 地图文档索引
        weight: '' // 权重值 即所有属性值数组列表的下标
      }
    ]
  }
}

// 4.统计专题图 BaseMapWithGraph
const BaseMapWithGraph = {
  id: 'd977d577-480b-b0fc-2d39-9075dee3272c',
  title: '统计专题图',
  visible: true,
  nodeType: 'subject',
  type: 'BaseMapWithGraph',
  config: {
    type: 'Gdbp',
    data: [
      {
        time: '2019',
        subData: [
          {
            minZoom: '6',
            maxZoom: '15',
            ip: '192.168.176.40',
            port: '6163',
            src: '',
            gdbp: 'gdbp://MapGISLocal/采矿权/sfcls/采矿许可登记面积统计2014',
            showTextLabel: 'true', // 是否显示统计图上的文本文字
            docName: '2014年地质灾害预报预警避免伤亡人员',
            layerIndex: null,
            graphType: 'pie', // 统计图类型 饼状和柱状
            table: {
              showFields: ['有效', '新立', '注销'],
              showFieldsTitle: {},
              type: 'att', // 三种统计方式 同上
              sumFiled: [],
              sumColumn: []
            },
            graph: {
              showFields: ['有效', '新立', '注销'],
              showFieldsTitle: {},
              field: '行政区划名称',
              target: []
            }
          }
        ]
      }
    ]
  }
}

// 5.普通静态标注 StatisticLabel
const StatisticLabel = {
  id: 'a982b4fe-8285-0470-6e14-6fa43dbb9bcc',
  title: '普通静态标注',
  visible: true,
  nodeType: 'subject',
  type: 'StatisticLabel',
  config: {
    data: [
      {
        time: '2019',
        subData: [
          {
            type: 'gdbp',
            minZoom: '1',
            maxZoom: '15',
            ip: '',
            port: '',
            gdbp: 'gdbp://MapGISLocal/GDP/sfcls/市级GDP2013GEO',
            docName: '',
            layerIndex: null,
            field: '',
            labelStyle: {
              // 标注样式  主要包括星星 圆形 方形 三角形等
              labelType: 'star',
              textStyle: {
                // 文字样式
                fillColor: '#FF3300', // 文字背景填充颜色
                textColor: '#FF3366' // 文字颜色
              },
              radius: [
                // 图形半径大小,数组形式
                {
                  min: 1, // 最小范围值
                  max: 5, // 最大范围值
                  radius: 20 // 图形半径值
                },
                {
                  min: 5,
                  max: 9
                }
              ],
              text: {
                // 显示文字处理
                type: 'att', // 数据处理方式  三种
                field: 'ID', // 属性值
                baseField: 'ID', // 基准字段
                countField: 'ID', // 级数基准字段
                countFieldValue: '', // 计数字段实际值
                sumField: 'ID' // 求和字段
              }
            },
            dataBase: {
              code: '',
              codeYear: '',
              dataYear: ''
            },
            table: {
              showFields: [],
              showFieldsTitle: {}
            },
            graph: {
              showFields: [],
              showFieldsTitle: {},
              field: 'ID'
            },
            popup: {
              showFields: [],
              showFieldsTitle: {},
              title: 'ID'
            }
          }
        ]
      }
    ]
  }
}

// 6.标注专题图 Label（静态标注+聚合标注）
const Label = {
  id: '12da19de-3f8a-30fa-c800-d37fb4b7b43f',
  title: '标注专题图',
  visible: true,
  nodeType: 'subject',
  type: 'Label',
  config: {
    type: 'gdbp',
    data: [
      // 数组形式只有两级第一级别为静态标注，第二级为聚合标注
      {
        time: '2019',
        subData: [
          {
            minZoom: '1',
            maxZoom: '8',
            ip: '',
            port: '',
            gdbp: 'gdbp://MapGISLocal/GDP/sfcls/市级GDP2013GEO',
            docName: '2014年地质灾害防治项目数量',
            layerIndex: '地质灾害防治项目数量2014',
            field: '',
            text: {
              // 文字处理方式
              type: 'att',
              field: 'ID',
              baseField: null,
              countField: null,
              countFieldValue: '',
              sumField: null
            },
            color: 'rgb(255, 255, 102)', // 背景颜色
            textColor: 'rgb(255, 51, 0)', // 文字颜色
            dataBase: {
              code: '',
              codeYear: '',
              dataYear: ''
            },
            table: {
              showFields: [
                'mpLayer',
                '地质灾害防治项目',
                '治理项目',
                '监测预警项目'
              ],
              showFieldsTitle: {}
            },
            graph: {
              showFields: ['治理项目', '监测预警项目', '地质灾害防治项目'],
              showFieldsTitle: {},
              field: '权属名称',
              target: []
            },
            popup: {
              showFields: ['治理项目', '地质灾害防治项目', '监测预警项目'],
              showFieldsTitle: {},
              title: '权属名称'
            }
          }
        ]
      }
    ]
  }
}

// 7.蜂窝图  HexBin
const HexBin = {
  id: 'd0f331e0-8843-d87e-7679-9c6902d40d5b',
  title: 'newNode',
  visible: true,
  nodeType: 'subject',
  type: 'HexBin',
  config: {
    type: 'gdbp',
    data: [
      {
        time: '2019',
        ip: '',
        port: '',
        gdbp: 'gdbp://MapGISLocal/GDP/sfcls/市级GDP2013GEO',
        docName: '海洋陆地',
        layerIndex: '0',
        hexBinStyle: {
          // 蜂窝图样式设置
          style: null, // 蜂窝图样式设置  color point gradient
          size: '', // 六边形大小
          showLayerImage: null, // 是否显示图层图像
          showSourceFeature: null, // 是否显示元要素
          polygonSideNum: '', // 多边形边数
          opacity: '' // 透明度
        },
        table: {
          showFields: [],
          showFieldsTitle: {}
        },
        graph: {
          showFields: [],
          showFieldsTitle: {},
          field: 'ID',
          target: []
        }
      }
    ]
  }
}
