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

export const getWidgets = (req: Request, res: Response) => {
  let widgets: Array<object> = []
  let widgetDirName = '../data/widgets'
  let widgetDirPath = path.join(__dirname, widgetDirName)

  const files = fs.readdirSync(widgetDirPath)
  files.forEach(function(item, index) {
    let stat = fs.lstatSync(`${widgetDirPath}/${item}`)
    if (stat.isDirectory() === true) {
      widgets.push({ name: item })
    }
  })

  return res.json(widgets)
}

export const getThemes = (req: Request, res: Response) => {
  let themes: Array<object> = []
  let themeDirName = '../data/themes'
  let themeDirPath = path.join(__dirname, themeDirName)

  const files = fs.readdirSync(themeDirPath)
  files.forEach(function(item, index) {
    let stat = fs.lstatSync(`${themeDirPath}/${item}`)
    if (stat.isDirectory() === true) {
      themes.push({ name: item })
    }
  })

  return res.json(themes)
}

export const saveAppConfig = (req: Request, res: Response) => {
  return res.status(400).json({
    message: '保存失败'
  })
}
