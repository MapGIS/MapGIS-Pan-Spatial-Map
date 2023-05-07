const path = require('path')
const webpack = require('webpack')
const GitRevisionPlugin = require('git-revision-webpack-plugin')
const GitRevision = new GitRevisionPlugin()
const buildDate = JSON.stringify(new Date().toLocaleString())
const ThemeColorReplacer = require('webpack-theme-color-replacer')
const { getThemeColors, modifyVars } = require('./src/utils/themeUtil')
const { resolveCss } = require('./src/utils/theme-color-replacer-extend')

function resolve(dir) {
  return path.join(__dirname, dir)
}

// check Git
function getGitHash() {
  try {
    return GitRevision.version()
  } catch (e) {}
  return 'unknown'
}

const isProd = process.env.NODE_ENV === 'production'

// vue.config.js
const vueConfig = {
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [path.resolve(__dirname, './src/theme/theme.less')]
    }
  },
  configureWebpack: config => {
    config.entry.app = ['babel-polyfill', './src/main.js']

    // webpack plugins
    config.plugins.push(
      new ThemeColorReplacer({
        fileName: 'css/theme-colors-[contenthash:8].css',
        matchColors: getThemeColors(),
        injectCss: true,
        resolveCss
      })
    )

    // Ignore all locale files of moment.js
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/
      })
    )

    config.plugins.push(
      new webpack.DefinePlugin({
        APP_VERSION: `"${require('./package.json').version}"`,
        GIT_HASH: JSON.stringify(getGitHash()),
        BUILD_DATE: buildDate
      })
    )
  },

  chainWebpack: config => {
    config.resolve.alias.set('@$', resolve('src'))

    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()
    svgRule
      .oneOf('inline')
      .resourceQuery(/inline/)
      .use('vue-svg-icon-loader')
      .loader('vue-svg-icon-loader')
      .end()
      .end()
      .oneOf('external')
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'assets/[name].[hash:8].[ext]'
      })

    // 生产环境下关闭css压缩的 colormin 项，因为此项优化与主题色替换功能冲突
    if (isProd) {
      config.plugin('optimize-css').tap(args => {
        args[0].cssnanoOptions.preset[1].colormin = false
        return args
      })
    }
    config.module
      .rule('images')
      .test(/\.(png|jpe?g|gif|ico)$/i)
      .use('url-loader')
      .loader('url-loader')
      .tap(options => Object.assign(options, { limit: 2000, esModule: false }))
  },

  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars: {
            ...modifyVars(),
            'border-radius-base': '2px',
            'layout-header-height': '48px',
            'menu-collapsed-width': '48px'
          },
          javascriptEnabled: true
        }
      },
      scss: {
        additionalData: `@import "./src/theme/mapgis-ui/index.scss";`
      }
    }
  },

  devServer: {
    // development server port 8000
    port: 8000,
    proxy: {
      // detail: https://cli.vuejs.org/config/#devserver-proxy
      [process.env.VUE_APP_API_BASE_URL]: {
        target: process.env.VUE_APP_API_URL,
        changeOrigin: true,
        pathRewrite: {
          ['^' + process.env.VUE_APP_API_BASE_URL]: ''
        }
      }
    }
  },

  // disable source map in production
  productionSourceMap: false,
  lintOnSave: undefined,
  // babel-loader no-ignore node_modules/*
  transpileDependencies: [],
  publicPath: process.env.VUE_APP_CONTEXT_PATH
}

module.exports = vueConfig
