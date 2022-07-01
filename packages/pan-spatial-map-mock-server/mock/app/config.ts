import faker from 'faker'
import path from 'path'
import fs from 'fs'
import { Response, Request, json } from 'express'

const configs: string[] = [
  'base',
  'district',
  'sheet',
  'pano',
  'panomult',
  'plot'
]

export const saveConfig = (req: Request, res: Response) => {
  return res.json({})
}

export const getConfig = (req: Request, res: Response) => {
  const { name } = req.params

  if (name) {
    if (configs.includes(name)) {
      const configFileName = `../data/configs/${name}.config.json`

      const file = path.join(__dirname, configFileName)
      let data = fs.readFileSync(file)

      if (data[0] === 0xef && data[1] === 0xbb && data[2] === 0xbf) {
        data = data.slice(3)
      }

      res.writeHead(200, { 'content-type': 'text/plain;charset=utf-8' })
      return res.end(data.toString())
    }
  }

  return res.status(400).json({
    code: -1,
    errorMessage: `获取配置${name}.config.json失败`
  })
}
