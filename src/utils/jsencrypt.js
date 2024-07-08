import JSEncrypt from 'jsencrypt/bin/jsencrypt.min'

// 密钥对生成 http://web.chacuo.net/netrsakeypair

const publicKey =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmlnNiUAVjYCDUOK8tLtC\n' +
  '1i2lXborhfqcdwWDq9k9tHe0zKBD6JBqnrSgXc+nSFSR6Y05J4F55eHxRWtF3i65\n' +
  '0RS0D1qZlG4U3we6zgvk5pfd3o3QR3PaxudXV+tR/DZMkARTpDkK5mmYIWO/laTL\n' +
  'KXqwfPBQcgMwQD8yAWuXSomhzfMBZrREeUs9Y+fxC3tSRe6iCQPKZ+xbHv0CcBgH\n' +
  'DMfYozgQEyn+PFQNx0EVMPQBqcFSLBJR02pTOiPLbnOpH+QyoxdTEn/AV/OU6uZ3\n' +
  'pX7jwfXw4IyvP3JskUMSQmtR3QP5qcOS5Gr8pDdBFZBvGWU1kpGAkWyYXvgLZK8r\n' +
  'HwIDAQAB'

// 前端不存储私钥，所以记住密码功能记住的密码无法在前端解密，请自己把握要么关闭该功能，要么在前端存储私钥
const privateKey = ''

// 加密
export function encrypt(txt) {
  const encryptor = new JSEncrypt()
  // 设置公钥
  encryptor.setPublicKey(publicKey)
  // 对数据进行加密
  return encryptor.encrypt(txt)
}

// 解密
export function decrypt(txt) {
  const encryptor = new JSEncrypt()
  // 设置私钥
  encryptor.setPrivateKey(privateKey)
  // 对数据进行解密
  return encryptor.decrypt(txt)
}
