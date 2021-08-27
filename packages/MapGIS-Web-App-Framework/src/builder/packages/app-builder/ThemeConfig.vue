<template>
  <div class="mp-builder-theme-config">
    <div class="theme-wrapper">
      <div class="theme-item" v-for="(item, index) in themes" :key="index">
        <div
          :class="['normal', { active: isThemeActive(item) }]"
          @click="onSelectTheme(item)"
        >
          <div class="theme-image">
            <img :src="`${assetsPath}${item.icon}`" />
          </div>
        </div>
        <div class="theme-text">
          <span>{{ item.manifest.name }}</span>
        </div>
      </div>
    </div>
    <a-divider />
    <mp-setting-form layout="vertical">
      <a-form-item label="样式">
        <a-select v-model="activedStyleName" placeholder="请选择">
          <a-select-option
            v-for="(item, index) in styles"
            :key="index"
            :value="item.name"
          >
            {{ item.description }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="整体风格设置">
        <mp-img-checkbox-group
          :key="activedStyle.name"
          @change="onThemeModeChange"
          :default-values="[activedStyle.theme]"
        >
          <mp-img-checkbox title="暗色菜单风格" :img="DarkImg" value="dark" />
          <mp-img-checkbox title="亮色菜单风格" :img="LightImg" value="light" />
          <mp-img-checkbox title="暗黑模式" :img="NightImg" value="night" />
        </mp-img-checkbox-group>
      </a-form-item>
      <a-form-item label="主题色">
        <mp-color-checkbox-group
          :key="activedStyle.name"
          @change="onThemeColorChange"
          :defaultValues="[palettes.indexOf(activedStyle.color)]"
          :multiple="false"
        >
          <mp-color-checkbox
            v-for="(color, index) in palettes"
            :key="index"
            :color="color"
            :value="index"
          />
        </mp-color-checkbox-group>
      </a-form-item>
    </mp-setting-form>
  </div>
</template>

<script>
import DarkImg from '../../../assets/images/dark.svg'
import LightImg from '../../../assets/images/light.svg'
import NightImg from '../../../assets/images/night.svg'
import { AppManager } from '../../managers'
import { UUID } from '../../../model/utils'

export default {
  name: 'MpThemeConfig',
  props: {
    appConfig: {
      type: Object
    },
    themes: {
      type: Array
    }
  },
  data() {
    return {
      DarkImg: DarkImg,
      LightImg: LightImg,
      NightImg: NightImg,
      customStyle: {
        name: 'customStyle',
        description: '自定义',
        color:
          (this.appConfig.theme.customStyle &&
            this.appConfig.theme.customStyle.color) ||
          '#1890ff',
        theme:
          (this.appConfig.theme.customStyle &&
            this.appConfig.theme.customStyle.theme) ||
          'dark'
      },
      palettes: [
        '#f5222d',
        '#fa541c',
        '#fadb14',
        '#3eaf7c',
        '#13c2c2',
        '#1890ff',
        '#722ed1',
        '#eb2f96'
      ]
    }
  },
  computed: {
    assetsPath() {
      const app = AppManager.getInstance().getApplication()

      return `${app.baseAPI}${app.appAssetsPath}`
    },
    activedThemeName() {
      return this.appConfig.theme.name
    },
    activedTheme() {
      return this.themes.find(val => {
        return this.activedThemeName === val.name
      })
    },
    styles() {
      return this.activedTheme.manifest.styles.concat(this.customStyle)
    },
    activedStyleName: {
      get() {
        return this.appConfig.theme.style || this.customStyle.name
      },
      set(newValue) {
        this.selectStyle(
          this.styles.find(val => {
            return newValue === val.name
          })
        )
      }
    },
    activedStyle() {
      return this.styles.find(val => {
        return this.activedStyleName === val.name
      })
    },
    isThemeActive() {
      return function(theme) {
        return this.activedThemeName === theme.name
      }
    },
    isStyleActive() {
      return function(style) {
        return this.activedStyleName === style.name
      }
    }
  },
  watch: {
    activedStyle: {
      immediate: true,
      deep: true,
      handler() {
        this.$emit('theme-change', this.activedStyle)
      }
    }
  },
  methods: {
    onSelectTheme(theme) {
      const self = this
      this.$confirm({
        title: '提示',
        content: '切换主题将重置样式和微件, 是否继续?',
        onOk() {
          // 切换theme,需要替换appConfig的内容
          self.appConfig.theme.name = theme.name
          // 重置mapWidgets和contentWidgets
          self.$set(self.appConfig, 'mapWidgets', theme.layout.mapWidgets)
          self.$set(
            self.appConfig,
            'contentWidgets',
            theme.layout.contentWidgets
          )

          // 规范化widget.id
          let allConfigedWidgets = []
          allConfigedWidgets = allConfigedWidgets.concat(
            self.appConfig.mapWidgets.widgets
          )
          self.appConfig.contentWidgets.groups.forEach(group => {
            allConfigedWidgets = allConfigedWidgets.concat(group.widgets)
          })

          allConfigedWidgets.forEach(widget => {
            if ('id' in widget === false) {
              self.$set(widget, 'id', `widget_${UUID.uuid()}`)
            }
          })

          // 切换主题后，样式默认选择第一个
          self.selectStyle(theme.manifest.styles[0])
        }
      })
    },
    selectStyle(style) {
      // 切换theme,需要替换appConfig的内容
      if (style.name !== 'customStyle') {
        this.$set(this.appConfig.theme, 'style', style.name)
        this.$delete(this.appConfig.theme, 'customStyle')
      } else {
        this.$set(this.appConfig.theme, 'customStyle', {
          color: style.color,
          theme: style.theme
        })
        this.$delete(this.appConfig.theme, 'style')
      }
    },
    onThemeModeChange(values) {
      this.customStyle.theme = values[0]
      this.customStyle.color = this.activedStyle.color
      this.selectStyle(this.customStyle)
    },
    onThemeColorChange(values, colors) {
      this.customStyle.theme = this.activedStyle.theme
      this.customStyle.color = colors[0]
      this.selectStyle(this.customStyle)
    }
  }
}
</script>

<style lang="less" scoped>
.mp-builder-theme-config {
  padding: 12px;
  .theme-wrapper {
    display: flex;
    flex-wrap: wrap;
    .theme-item {
      display: inline-block;
      vertical-align: top;
      margin: 2px 3px;
      width: 75px;
      text-align: center;
      .normal {
        cursor: pointer;
        border-width: 2px;
        border-style: solid;
        border-color: transparent;
        &.active,
        &:hover {
          border-color: @primary-color;
        }
      }
      .theme-image {
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 67.5%; /*相对于这个盒子的宽度设置的，为保证图片比例，其值=width * 67.5%*/
        box-sizing: border-box;
        img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          padding: 5px;
          transition: all ease-in-out 0.3s;
          &:hover {
            transform: scale(1.1);
          }
        }
      }
      .theme-text {
        font-size: 12px;
        text-align: center;
        word-wrap: break-word;
        white-space: pre-wrap;
      }
    }
  }
  /deep/ .ant-divider-horizontal {
    margin: 8px 0;
  }
}
</style>
