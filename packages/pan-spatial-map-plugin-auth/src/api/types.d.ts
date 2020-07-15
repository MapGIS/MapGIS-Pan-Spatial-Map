export interface IAuthConfig {
  whiteList: string[]
  loginPath: string
  proxyTable: Record<string, string> | undefined
}
