'use strict'

const fs = require('fs')
const { ipcRenderer } = require('electron')
const { encryptor } = require('./Encryptor')
// This file looks looks
// | Base info | HMAC | IV | Enc Content |
// | 16        | 32   | 16 | ..          |
function Filesystem () {
  this.headerInfo = {
    length: 64,
    baseLength: 16,
    hmacLength: 32,
    ivLength: 16
  }
}

// Return: Object contains header metadata
Filesystem.prototype.getHeaderInfo = function () {
  return this.headerInfo
}

// Return: Boolean
Filesystem.prototype.shouldEncrypt = function (filepath) {
  return filepath.endsWith('.mii')
}

Filesystem.prototype.writeFile = function (filepath, content, cb) {
  if (this.shouldEncrypt(filepath)) {
    this.askKey((err, key) => {
      if (err) {
        cb(err)
      }

      // This return { iv, result }
      let encResult = encryptor.encrypt(key, content)
      let bufHmac = encryptor.hmac(content)
      // Pack base info, hmac of origin content, iv, enc content
      let bufFile = this.packHeader(encResult, bufHmac)
      fs.writeFile(filepath, bufFile, cb)
    })
  } else {
    fs.writeFile(filepath, content, 'utf8', cb)
  }
}

Filesystem.prototype.readFile = function (filepath, cb) {
  if (this.shouldEncrypt(filepath)) {
    this.askKey((err1, key) => {
      if (err1) {
        // Maybe need a log system
        cb(err1, null)
      }

      fs.readFile(filepath, (err2, fullContent) => {
        if (err2) {
          cb(err2, null)
        }

        let fileStruct = this.unpackHeader(fullContent)
        let decContent = encryptor.decrypt(key, fileStruct.encContent, fileStruct.iv)

        if (this.isContentOK(decContent, fileStruct.hmac)) {
          cb(null, decContent.toString('utf8'))
        } else {
          cb(new Error('Decrypt Fail'), null)
        }
      })
    })
  } else {
    fs.readFile(filepath, 'utf8', cb)
  }
}

// Should this be done in Filesystem module ?
Filesystem.prototype.askKey = function (cb) {
  ipcRenderer.on('reply-ask-key', (replyAskKeyEvent, replyAskKeyArgu) => {
    // Will any error happened ?
    cb(null, replyAskKeyArgu)
  })

  ipcRenderer.send('ask-key')
}

// Return: Buffer
Filesystem.prototype.packHeader = function (encResult, bufHmac) {
  const info = this.getHeaderInfo()
  let bufHeader = Buffer.alloc(info.length)
  // * Base info, add whatever you want :P
  bufHeader.write('Miikun@2018')
  // * Encrypt info
  bufHmac.copy(bufHeader, info.baseLength)
  // * IV
  encResult.iv.copy(bufHeader, info.baseLength + info.hmacLength)
  // this.dumpHeader(bufHeader)
  return Buffer.concat([bufHeader, encResult.result])
}

Filesystem.prototype.unpackHeader = function (raw) {
  const info = this.getHeaderInfo()
  let base = raw.slice(0, info.baseLength)
  let hmac = raw.slice(info.baseLength, info.baseLength + info.hmacLength)
  let iv = raw.slice(info.baseLength + info.hmacLength, info.length)
  let encContent = raw.slice(info.length)
  return { base, hmac, iv, encContent }
}

Filesystem.prototype.dumpHeader = function (header) {
  const info = this.getHeaderInfo()
  let base = header.slice(0, info.baseLength)
  let hmac = header.slice(info.baseLength, info.baseLength + info.hmacLength)
  let iv = header.slice(info.baseLength + info.hmacLength, info.length)
  console.log('[Dump Header] Total bytes: ' + header.byteLength)
  console.log('[Dump Header] Base info: ' + base.toString('utf8'))
  console.log('[Dump Header] HMAC: ' + hmac.toString('utf8'))
  console.log('[Dump Header] IV: ' + iv.toString('utf8'))
}

// Return: Boolean
// This function do HMAC on decryted content,
// and see if the value is same as HMAC recorded in header.
Filesystem.prototype.isContentOK = function (decContent, decHMAC) {
  return encryptor.hmac(decContent).equals(decHMAC)
}

export default new Filesystem()
