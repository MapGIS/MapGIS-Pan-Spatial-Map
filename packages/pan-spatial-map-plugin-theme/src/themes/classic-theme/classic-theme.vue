<template>
  <a-layout class="pan-spatial-map-wrapper">
    <component
      :is="headerContentComponent"
      ref="headerContent"
      v-bind="parseContentProps('header')"
    />
    <a-layout ref="bodyContent">
      <component
        :is="leftContentComponent"
        ref="leftContent"
        v-bind="parseContentProps('left')"
      />
      <mp-pan-spatial-map-side-panel
        v-if="maxSidePanelWidth && mapInitialized"
        v-bind="left.panel"
        :widgets="left.widgets"
        :max-width="maxSidePanelWidth"
        @update-widget-state="onUpdateWidgetState('left', $event)"
      />
      <a-layout class="main-wrapper">
        <a-layout-content class="content-wrapper">
          <component
            :is="toolbarContentComponent"
            ref="toolbarContent"
            v-bind="parseContentProps('toolbar')"
          />
          <slot v-if="mapInitialized" name="map" />
        </a-layout-content>
        <component
          :is="footerContentComponent"
          v-bind="parseContentProps('footer')"
          :max-view-height="maxFooterHeight"
        />
      </a-layout>
      <mp-map-container
        v-if="configInitialized"
        class="map-wrapper"
        :dataFlowList="dataFlowList"
        :cesium-lib-path="publicPath + 'cesium/Cesium.js'"
        :cesium-plugin-path="publicPath + 'cesium/webclient-cesium-plugin.js'"
        :map-options="mapOptions"
      />
    </a-layout>
  </a-layout>
</template>

<script>
import { ThemeMixin } from '@mapgis/web-app-framework'
import {
  baseConfigInstance,
  loadConfigs,
  DataFlowList
} from '@mapgis/pan-spatial-map-common'
import { mapState } from 'vuex'
import MpPanSpatialMapSidePanel from '../../components/SidePanel/SidePanel.vue'

export default {
  name: 'MpPanSpatialMapClassicTheme',
  components: {
    MpPanSpatialMapSidePanel
  },
  mixins: [ThemeMixin],
  props: {
    header: Object,
    toolbar: Object,
    left: Object
  },
  data() {
    return {
      publicPath: process.env.BASE_URL,
      maxFooterHeight: 0,
      maxSidePanelWidth: 0,
      showSetting: false,
      configInitialized: false
    }
  },
  computed: {
    ...mapState('setting', ['hideSetting']),

    dataFlowList() {
      return DataFlowList
    },
    headerContentComponent() {
      return this.parseContentComponent('header')
    },
    leftContentComponent() {
      return this.parseContentComponent('left')
    },
    toolbarContentComponent() {
      return this.parseContentComponent('toolbar')
    },
    footerContentComponent() {
      return this.parseContentComponent('footer')
    },
    mapOptions() {
      const lnglat = baseConfigInstance.config.center.split(',')
      /**
       * 修改说明：由于mapboxgl只支持在初始化的时候设置符号库，中途不支持修改。
       * mapboxgl在初始化的时候，还未加载矢量瓦片，无法获取要加载显示的矢量瓦片对应的符号库地址，可能会导致加载的矢量瓦片显示异常（符号不显示）
       * 因此，在展示矢量瓦片之前，需要在后台应用基本配置里配置矢量瓦片对应的符号库地址。
       * 但是如果要展示多个矢量瓦片，且矢量瓦片对应的符号库不一致时，还是会存在问题（暂时无法解决）
       * 如果用户在后台没有配置spriteUrl，那么就设置为通过/igs/rest/mrms/vtiles/sprite接口获取，该接口无需指定服务名。(只有net版支持)
       * 后台推荐配置的为形如“/igs/rest/mrcs/vtiles/矢量瓦片服务名/sprite”的服务接口。（IGS net和java版都支持）
       * 修改人：龚跃健
       * 修改日期：2021/11/25
       * 修改说明：默认使用内置的字体库和符号库，如果baseConfigInstance.config.ip和baseConfigInstance.config.port配置了，则使用配置服务上的符号库和字体库
       * 如果配置了baseConfigInstance.config.spriteUrl，就使用配置的符号库
       * 修改人：龚跃健
       * 修改日期：2021/12/30
       */
      const { location } = window
      let sprite = `${location.protocol}//${location.host}${process.env.BASE_URL}sprite/sprite`
      let glyphs = `${location.protocol}//${location.host}${process.env.BASE_URL}fonts/{fontstack}/{range}.pbf`
      const { ip, port, spriteUrl } = baseConfigInstance.config
      if (spriteUrl && spriteUrl.length > 0) {
        sprite = spriteUrl
      } else if (ip && ip.length > 0 && port && port.length > 0) {
        sprite = `http://${ip}:${port}/igs/rest/mrms/vtiles/sprite`
        glyphs = `http://${ip}:${port}/igs/rest/mrcs/vtiles/fonts/{fontstack}/{range}.pbf`
      }
      return {
        center: { lng: Number(lnglat[0]), lat: Number(lnglat[1]) },
        zoom: baseConfigInstance.config.initZoom,
        mapStyle: {
          sprite,
          glyphs
        }
      }
    }
  },
  mounted() {
    this.calcMaxFooterHeight()
    this.calcMaxSidePanelWidth()
    this.watchWindowSize()
  },
  async created() {
    await loadConfigs()
    this.configInitialized = true
  },
  beforeDestroy() {
    window.onresize = null
  },
  methods: {
    calcMaxFooterHeight() {
      this.maxFooterHeight =
        window.innerHeight - this.$refs.headerContent.$el.offsetHeight
    },
    calcMaxSidePanelWidth() {
      this.maxSidePanelWidth =
        this.$refs.bodyContent.$el.clientWidth -
        this.$refs.leftContent.$el.clientWidth
    },
    watchWindowSize() {
      window.onresize = () => {
        this.calcMaxFooterHeight()
        this.calcMaxSidePanelWidth()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.pan-spatial-map-wrapper {
  height: 100vh;
  position: relative;
  .main-wrapper {
    overflow-y: hidden;
    .content-wrapper {
      position: relative;
      padding: 0;
    }
  }
  .map-wrapper {
    position: absolute;
    top: 48px;
    left: 48px;
    width: calc(100% - 48px);
    height: calc(100% - 48px);
    z-index: 0;
  }
}
</style>
