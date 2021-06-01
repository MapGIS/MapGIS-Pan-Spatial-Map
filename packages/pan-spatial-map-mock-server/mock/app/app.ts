import faker from 'faker'
import path from 'path'
import fs from 'fs'
import { Response, Request, json } from 'express'

export const saveWidgetConfig = (req: Request, res: Response) => {
  return res.json({})
}

export const getWidgetConfig = (req: Request, res: Response) => {
  const { name } = req.query

  if (name) {
    let configFileName = `../data/configs/${name}/config.json`
    let file = path.join(__dirname, configFileName)
    let data

    if (fs.existsSync(file)) {
      data = fs.readFileSync(file)
    } else {
      configFileName = `../data/widgets/${name}/config.json`
      file = path.join(__dirname, configFileName)
      data = fs.readFileSync(file)
    }

    if (data[0] === 0xef && data[1] === 0xbb && data[2] === 0xbf) {
      data = data.slice(3)
    }

    res.writeHead(200, { 'content-type': 'text/plain;charset=utf-8' })
    return res.end(data.toString())
  }

  return res.status(400).json({
    code: -1,
    errorMessage: `获取配置${req}.config失败`
  })
}
