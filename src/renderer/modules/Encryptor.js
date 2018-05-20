'use strict'

const crypto = require('crypto')

function Encryptor () {
  this.info = {
    cipher: {
      algorithm: 'aes-256-cbc',
      ivLength: 16
    },
    hmac: {
      algorithm: 'sha256',
      key: 'sjIIhOQJWjlOl4J'
    }
  }
}

Encryptor.prototype.getInfo = function () {
  return this.info
}

// return: Object { iv, enc content }
Encryptor.prototype.encrypt = function (key, raw) {
  let iv = crypto.randomBytes(this.info.cipher.ivLength)
  let cipher = crypto.createCipheriv(this.info.cipher.algorithm, this.hmac(key), iv)
  return {
    iv: iv,
    result: Buffer.concat([cipher.update(raw), cipher.final()])
  }
}

// return: Buffer
Encryptor.prototype.decrypt = function (key, raw, iv) {
  let decipher = crypto.createDecipheriv(this.info.cipher.algorithm, this.hmac(key), Buffer.from(iv))
  try {
    return Buffer.concat([decipher.update(raw), decipher.final()])
  } catch (err) {
    throw new Error('Decrypt Fail: Wrong Password')
  }
}

// return: Buffer
Encryptor.prototype.hmac = function (data) {
  let hmac = crypto.createHmac(this.info.hmac.algorithm, this.info.hmac.key)
  hmac.update(data)
  return hmac.digest()
}

// return: Array[String]
Encryptor.prototype.listCiphers = function () {
  return crypto.getCiphers()
}

// return: Array[String]
Encryptor.prototype.listHashes = function () {
  return crypto.getHashes()
}

module.exports = new Encryptor()
