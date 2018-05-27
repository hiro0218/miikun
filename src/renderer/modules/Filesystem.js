'use strict';

import fs from 'fs';
import { ipcRenderer } from 'electron';
import encryptor from './Encryptor';
import { UserCancelError, DecryptFailError } from './Errors';

// This file looks looks
// | Base info | HMAC | IV | Enc Content |
// | 16        | 32   | 16 | ..          |
function Filesystem() {
  this.header = {
    length: 64,
    baseLength: 16,
    hmacLength: 32,
    ivLength: 16,
  };
}

// Return: Object contains header metadata
Filesystem.prototype.getHeader = function() {
  return this.header;
};

// Return: Boolean
Filesystem.prototype.shouldEncrypt = function(path) {
  return path.endsWith('.mii');
};

Filesystem.prototype.writeFile = function(path, content, cb) {
  if (this.shouldEncrypt(path)) {
    this.askKey((err, key) => {
      if (err) {
        cb(err);
        return;
      }
      fs.writeFile(path, this.encrypt(key, content), cb);
      // backup un-encrypt file at develop
      if (process.env.NODE_ENV === 'development') {
        fs.writeFile(path + '.backup.md', content, 'utf8', cb);
      }
    });
  } else {
    fs.writeFile(path, content, 'utf8', cb);
  }
};

Filesystem.prototype.readFile = function(path, cb) {
  if (this.shouldEncrypt(path)) {
    this.askKey((err1, key) => {
      if (err1) {
        cb(err1, null);
        return;
      }

      fs.readFile(path, (err2, content) => {
        if (err2) {
          cb(err2, null);
          return;
        }

        try {
          const decContent = this.decrypt(key, content);
          cb(null, decContent.toString('utf8'));
        } catch (err) {
          cb(err, null);
        }
      });
    });
  } else {
    fs.readFile(path, 'utf8', cb);
  }
};

Filesystem.prototype.askKey = function(cb) {
  ipcRenderer.once('reply-ask-key', (replyAskKeyEvent, replyAskKeyArgu) => {
    if (replyAskKeyArgu === null) {
      cb(new UserCancelError(), null);
    } else {
      cb(null, replyAskKeyArgu);
    }
  });

  ipcRenderer.send('ask-key');
};

Filesystem.prototype.encrypt = function(key, content) {
  // This return { iv, result }
  let encResult = encryptor.encrypt(key, content);
  let bufHmac = encryptor.hmac(content);
  // Pack base info, hmac of origin content, iv, enc content
  let bufFile = this.packHeader(encResult, bufHmac);
  return bufFile;
};

Filesystem.prototype.decrypt = function(key, content) {
  let fileStruct = this.unpackHeader(content);
  try {
    let decContent = encryptor.decrypt(key, fileStruct.encContent, fileStruct.iv);
    if (encryptor.hmac(decContent).equals(fileStruct.hmac)) {
      return decContent;
    } else {
      throw new DecryptFailError('Content mismatch.');
    }
  } catch (err) {
    throw err;
  }
};

// Return: Buffer
Filesystem.prototype.packHeader = function(encResult, bufHmac) {
  const info = this.getHeader();
  let bufHeader = Buffer.alloc(info.length);
  // * Base info, add whatever you want :P
  bufHeader.write('Miikun@2018');
  // * Encrypt info
  bufHmac.copy(bufHeader, info.baseLength);
  // * IV
  encResult.iv.copy(bufHeader, info.baseLength + info.hmacLength);
  // this.dumpHeader(bufHeader)
  return Buffer.concat([bufHeader, encResult.result]);
};

Filesystem.prototype.unpackHeader = function(raw) {
  const info = this.getHeader();
  let base = raw.slice(0, info.baseLength);
  let hmac = raw.slice(info.baseLength, info.baseLength + info.hmacLength);
  let iv = raw.slice(info.baseLength + info.hmacLength, info.length);
  let encContent = raw.slice(info.length);
  return { base, hmac, iv, encContent };
};

Filesystem.prototype.dumpHeader = function(header) {
  const info = this.getHeader();
  let base = header.slice(0, info.baseLength);
  let hmac = header.slice(info.baseLength, info.baseLength + info.hmacLength);
  let iv = header.slice(info.baseLength + info.hmacLength, info.length);
  console.log('[Dump Header] Total bytes: ' + header.byteLength);
  console.log('[Dump Header] Base info: ' + base.toString('utf8'));
  console.log('[Dump Header] HMAC: ' + hmac.toString('utf8'));
  console.log('[Dump Header] IV: ' + iv.toString('utf8'));
};

export default new Filesystem();
