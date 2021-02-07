import faker from 'faker'
import { Response, Request } from 'express'

const userList: any[] = [
  {
    id: 0,
    username: 'admin',
    password: 'sa.mapgis',
    nickName: faker.name.findName()
  }
]
const userCount = 1

export const login = (req: Request, res: Response) => {
  const { username, password } = req.body
  for (let i = 0; i < userList.length; i++) {
    const user = userList[i]
    if (user.username === username && user.password === password) {
      return res.json({
        user: {
          nickName: user.nickName
        },
        token: `${username}-token`
      })
    }
  }

  return res.status(400).json({
    message: '用户名密码错误'
  })
}

export const logout = (req: Request, res: Response) => {
  return res.json({})
}

export const getAppInfo = (req: Request, res: Response) => {
  return res.json({
    configPath: '/app.json',
    assetsPath: '/'
  })
}
