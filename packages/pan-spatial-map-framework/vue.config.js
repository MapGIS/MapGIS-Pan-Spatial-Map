const path = require('path')
const webpack = require('webpack')
const ThemeColorReplacer = require('webpack-theme-color-replacer')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const { getThemeColors, modifyVars } = require('./src/utils/themeUtil')
const { resolveCss } = require('./src/utils/theme-color-replacer-extend')
const defaultSettings = require('./src/config/default/setting.config.js')

const TerserPlugin = require('terser-webpack-plugin')

const productionGzipExtensions = ['js', 'css']
const isProd = process.env.NODE_ENV === 'production'
const name = defaultSettings.title

console.log(`NODE_ENV=${process.env.NODE_ENV}`)

module.exports = {
  devServer: {
    hot: true,
    open: true
    // proxy: {
    //   '/api': { //此处要与 /services/api.js 中的 API_PROXY_PREFIX 值保持一致
    //     target: process.env.VUE_APP_API_BASE_URL,
    //     changeOrigin: true,
    //     pathRewrite: {
    //       '^/api': ''
    //     }
    //   }
    // }
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [path.resolve(__dirname, './src/theme/theme.less')]
    }
  },
  configureWebpack: (config) => {
    config.name = name
    config.entry.app = ['babel-polyfill', 'whatwg-fetch', './src/main.js']
    config.performance = {
      hints: false
    }
    config.plugins.push(
      new ThemeColorReplacer({
        fileName: 'css/theme-colors-[contenthash:8].css',
        matchColors: getThemeColors(),
        injectCss: true,
        resolveCss
      })
    )
    // Ignore all locale files of moment.js
    config.plugins.push(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/))
    // 生产环境下将资源压缩成gzip格式
    if (isProd) {
      // add `CompressionWebpack` plugin to webpack plugins
      config.plugins.push(
        new CompressionWebpackPlugin({
          algorithm: 'gzip',
          test: new RegExp(`\\.(${productionGzipExtensions.join('|')})$`),
          threshold: 10240,
          minRatio: 0.8
        })
      )

      let optimization = {
        minimize: false
      }

      Object.assign(config, {
        optimization
      })
    }
  },
  chainWebpack: (config) => {
    // 生产环境下关闭css压缩的 colormin 项，因为此项优化与主题色替换功能冲突
    if (isProd) {
      config.plugin('optimize-css').tap((args) => {
        args[0].cssnanoOptions.preset[1].colormin = false
        return args
      })
    }
    config.module
      .rule('images')
      .test(/\.(png|jpe?g|gif|ico)$/i)
      .use('url-loader')
      .loader('url-loader')
      .tap((options) =>
        Object.assign(options, { limit: 2000, esModule: false })
      )
    config.plugin('fork-ts-checker').tap((args) => {
      args[0].memoryLimit = 14336
      return args
    })
  },
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars: modifyVars(),
          javascriptEnabled: true
        }
      }
    }
  },
  publicPath: process.env.VUE_APP_PUBLIC_PATH,
  outputDir: 'dist',
  assetsDir: 'static',
  productionSourceMap: false
}
