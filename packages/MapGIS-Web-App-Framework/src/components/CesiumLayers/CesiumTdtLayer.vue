<template>
  <mapgis-3d-ogc-wmts-layer
    :layerStyle="layerStyle"
    :baseUrl="url_tdt"
    :srs="crs"
    tileMatrixSet=""
    wmtsLayer=""
  />
</template>

<script>
export default {
  name: 'mapgis-3d-tdt-layer',
  props: {
    layerStyle: {
      type: Object,
      default: () => ({ zIndex: 60 })
    },
    url: {
      type: String,
      default: null
    },
    domain: {
      type: String,
      default: null
    },
    protocol: {
      type: String,
      default: location.protocol.split(':')[0] || 'http'
    },
    ip: {
      type: String,
      default: 'localhost'
    },
    port: {
      type: String,
      default: '6163'
    },
    tileSize: {
      type: Number,
      default: 512
    },
    layerType: {
      type: String,
      default: 'vec'
    },
    token: {
      type: String,
      require: true
    },
    baseURL: {
      type: String,
      default: null
    },
    crs: {
      type: String,
      default: 'EPSG:4326'
    },
    isLabel: {
      type: Boolean,
      default: false
    },
    version: {
      type: String,
      default: '1.0.0'
    },
    tdtStyle: {
      type: String,
      default: 'default'
    },
    format: {
      type: String,
      default: 'tiles'
    }
  },
  data() {
    return {
      url_tdt: '',
      tilematrixSet: 'c',
      layerLabelMap: {
        vec: 'cva',
        ter: 'cta',
        img: 'cia'
      },
      layerZoomMap: {
        vec: 18,
        ter: 14,
        img: 18
      },
      maxZoom: 18
    }
  },
  created() {
    this.$_init()
  },
  methods: {
    $_init() {
      if (this.url) {
        this.url_tdt = this.url
        return
      }
      let layerType = this.layerType
      let layer =
        this.isLabel && this.layerLabelMap[layerType]
          ? this.layerLabelMap[layerType]
          : layerType
      const tilematrixSet = this.crs === 'EPSG:4326' ? 'c' : 'w'
      if (this.baseURL) {
        let str = this.baseURL.split('gov.cn/')[1]
        if (this.baseURL.indexOf('?') > 0) {
          str = str.split('?')[0]
        }
        layerType = str.substring(0, str.length - 7)
        layer =
          this.isLabel && this.layerLabelMap[layerType]
            ? this.layerLabelMap[layerType]
            : layerType
        this.url_tdt = this.baseURL
        if (this.baseURL.indexOf('?') < 0) {
          this.url_tdt += '?'
        }
      } else if (layerType.indexOf('igs') > 0) {
        let domain = this.domain
        if (!domain) {
          domain = `${this.protocol}://${this.ip}:${this.port}`
        }
        const tempUrl = `${domain}/igs/rest/cts/tianditu/{layerType}/{x}/{y}/{z}?`
        switch (layerType) {
          case 'vec_igs':
            layerType = 'vector'
            break
          case 'img_igs':
            layerType = 'raster'
            break
          case 'cva_igs':
            layerType = 'vectorAnno'
            break
          case 'cia_igs':
            layerType = 'rasterAnno'
            break
          default:
            layerType = 'vector'
            break
        }
        this.url_tdt = tempUrl.replace('{layerType}', layerType)
      } else {
        const tempUrl = `http://t${Math.round(
          Math.random() * 7
        )}.tianditu.gov.cn/{layer}_{proj}/wmts?`
        this.url_tdt = tempUrl
          .replace('{layer}', layer)
          .replace('{proj}', tilematrixSet)
      }

      const params = []
      if (this.layerType.indexOf('igs') < 0) {
        params.push('request=GetTile')
        if (this.version) {
          params.push(`version=${this.version}`)
        }
        if (this.tdtStyle) {
          params.push(`style=${this.tdtStyle}`)
        }
        params.push(`tilematrixSet=${tilematrixSet}`)
        params.push(`format=${this.format}`)
        if (this.tileSize) {
          params.push(`width=${this.tileSize}`)
          params.push(`height=${this.tileSize}`)
        }
        params.push(`layer=${layer}`)
        params.push('tilematrix={TileMatrix}')
        params.push('tilerow={TileRow}')
        params.push('tilecol={TileCol}')
      }

      if (layerType === 'ter') {
        this.maxZoom = 14
      } else {
        this.maxZoom = 18
      }
      if (this.token) {
        params.push(`tk=${this.token}`)
      }
      params.push('service=WMTS')
      this.url_tdt += params.join('&')
    }
  }
}
</script>

<style lang="scss" scoped></style>
