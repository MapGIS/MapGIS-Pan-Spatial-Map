const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV)

const plugins = []
if (IS_PROD) {
  plugins.push('transform-remove-console')
}

module.exports = {
  presets: ['@vue/cli-plugin-babel/preset', '@vue/babel-preset-jsx'],
  env: {
    development: {
      plugins: ['dynamic-import-node']
    }
  },
  plugins
}
