import { BaseConfig } from './base'

export { default as baseConfigInstance } from './base'

export const loadConfigs = async () => {
  await BaseConfig.load()
}
