import faker from 'faker'
import qs from 'qs'
import path from 'path'
import fs from 'fs'
import { Response, Request, json } from 'express'

const configs: string[] = ['baseTreeConfig', 'default']

export const getConfigById = (req: Request, res: Response) => {
  const { id } = req.query

  if (id) {
    if (configs.includes(id as string)) {
      const configFileName = `data/${id}.json`

      let file = path.join(__dirname, configFileName)

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
    errorMessage: `获取配置${id}.json失败`
  })
}
