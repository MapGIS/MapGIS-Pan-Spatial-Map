const path = require('path')
const webpack = require('webpack')
const GitRevisionPlugin = require('git-revision-webpack-plugin')
const GitRevision = new GitRevisionPlugin()
const buildDate = JSON.stringify(new Date().toLocaleString())
const ThemeColorReplacer = require('webpack-theme-color-replacer')
const { getThemeColors, modifyVars } = require('./src/utils/themeUtil')
const { resolveCss } = require('./src/utils/theme-color-replacer-extend')
const WebpackDynamicPublicPathPlugin = require('webpack-dynamic-public-path')

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

function filterArgs(str) {
  const argv = process.argv
  const result = argv.find(item => item.match(str))
  if (result) {
    return result.split('=')[1]
  }
  return null
}

function getPublicPath() {
  const customPrefix = filterArgs('prefix')
  const initPublicPath = process.env.VUE_APP_CONTEXT_PATH

  if (!isProd || !customPrefix) {
    return initPublicPath
  }

  const firstSlashIndex = initPublicPath.indexOf('/')
  const secondSlashIndex = initPublicPath.indexOf('/', firstSlashIndex + 1)
  const oldPrefix = initPublicPath.substring(firstSlashIndex + 1, secondSlashIndex)
  const publicPath = initPublicPath.replace(oldPrefix, customPrefix)

  return publicPath
}

const searchList = [
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/calcChain',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/vmlDrawing',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/table',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/endnotes',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/webSettings',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footnotes',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/header',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
  'http://schemas.openxmlformats.org/officeDocument/2006/extended-properties',
  'http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes',
  'http://schemas.openxmlformats.org/officeDocument/2006/math',
  'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
  'http://schemas.openxmlformats.org/markup-compatibility/2006',
  'http://schemas.openxmlformats.org/drawingml/2006/main',
  'http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing',
  'http://schemas.openxmlformats.org/drawingml/2006/picture',
  'http://schemas.openxmlformats.org/package/2006/content-types',
  'http://schemas.openxmlformats.org/package/2006/metadata/core-properties',
  'http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties',
  'http://schemas.openxmlformats.org/package/2006/relationships/metadata/custom-properties',
  'http://schemas.openxmlformats.org/package/2006/relationships',
  'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
  'http://www.xfa.org/schema/xci/',
  'http://www.xfa.org/schema/xfa-connection-set/',
  'http://www.xfa.org/schema/xfa-data/1.0/',
  'http://www.xfa.org/schema/xfa-data/',
  'http://www.xfa.org/schema/xfa-form/',
  'http://www.xfa.org/schema/xfa-locale-set/',
  'http://www.xfa.org/schema/xfa-source-set/',
  'http://www.xfa.org/schema/xfa-template/',
  'http://www.xfa.org/schema/xdc/'
]

const strReplaceRules = searchList.map(search => {
  return {
    search,
    replace: '',
    flags: 'g'
  }
})

// vue.config.js
const vueConfig = {
  parallel: false,
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

      // 开启分离js
      config.optimization.runtimeChunk('single')
      config.optimization.splitChunks({
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 100 * 1024,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              // get the name. E.g. node_modules/packageName/not/this/part.js
              // or node_modules/packageName
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1]
              // npm package names are URL-safe, but some servers don't like @ symbols
              return `npm.${packageName.replace('@', '')}`
            },
            minSize: 100 * 1024,
            maxSize: 1 * 1000 * 1024,
            minChunks: 1
          }
        }
      })

      // 支持运行时设置publicPath
      config
        .plugin('dynamicPublicPathPlugin')
        .use(WebpackDynamicPublicPathPlugin, [{ externalPublicPath: 'window.externalPublicPath' }])
    }
    config.module
      .rule('images')
      .test(/\.(png|jpe?g|gif|ico)$/i)
      .use('url-loader')
      .loader('url-loader')
      .tap(options => Object.assign(options, { limit: 2000, esModule: false }))

    config.module
      .rule('links')
      .test(/\.js$/)
      .use('string-replace-loader')
      .loader('string-replace-loader')
      .options({ multiple: strReplaceRules })
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
  publicPath: getPublicPath()
}

module.exports = vueConfig
