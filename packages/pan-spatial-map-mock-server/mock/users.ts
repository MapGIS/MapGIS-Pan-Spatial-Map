import faker from 'faker'
import qs from 'qs'
import { Response, Request } from 'express'

const userList: any[] = [
  {
    id: 0,
    username: 'admin',
    password: 'onemap.sa',
    NickName: faker.name.findName()
  }
]
const userCount = 1

export const login = (req: Request, res: Response) => {
  const { userName, password } = qs.parse(req.body)
  for (const user of userList) {
    if (user.username === userName && user.password === password) {
      return res.json({
        code: 0,
        data: {
          NickName: user.NickName,
          LoginName: userName
        }
      })
    }
  }
  return res.status(400).json({
    code: -1,
    errorMessage: '用户名密码错误'
  })
}
