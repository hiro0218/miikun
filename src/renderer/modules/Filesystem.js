'use strict';

import fs from 'fs';
import encryptor from './Encryptor';
import { NullKeyError, DecryptFailError } from './Errors';
import store from '../store';

// This file looks looks
// | Base info | HMAC | IV | Enc Content |
// | 16        | 32   | 16 | ..          |

class Filesystem {
  constructor() {
    this.header = {
      length: 64,
      baseLength: 16,
      hmacLength: 32,
      ivLength: 16,
    };
    this.key = null;
  }

  // Return: Object contains header metadata
  getHeader() {
    return this.header;
  }

  // Return: Boolean
  shouldEncrypt(path) {
    return path.endsWith('.mii');
  }

  writeFile(path, content, cb, key = null) {
    if (this.shouldEncrypt(path)) {
      // Use the cached key instead of state, because when readFile fail, I
      // can keep the old key of current file.
      // It's hard and will make code looks ugly if implemnt in Editor.vue.
      key = key === null ? this.key : key;
      // Prevent null key, it should not happen
      // at this time.
      if (key === '' || key === null) {
        cb(new NullKeyError());
        return;
      }
      // Backup file at develop.
      if (process.env.NODE_ENV === 'development') {
        fs.writeFile(path + '.backup.md', content, 'utf8', cb);
      }
      content = this.encrypt(key, content);
    }
    fs.writeFile(path, content, 'utf8', cb);
  }

  readFile(path, cb) {
    let key = null;
    const isEncrypt = this.shouldEncrypt(path);

    if (isEncrypt) {
      key = store.state.Editor.crypt.key;
      // Prevent null key, it should not happen
      // at this time.
      if (key === '' || key === null) {
        cb(new NullKeyError());
        return;
      }
    }
    // Notice it's an async function, only return
    // the callback, not readFile
    fs.readFile(path, (err, content) => {
      if (err) {
        cb(err, null);
        return;
      }
      // Decrypt
      if (isEncrypt) {
        try {
          content = this.decrypt(key, content);
        } catch (err2) {
          cb(err2, null);
          return;
        }
      }
      this.updateKey(key);
      cb(null, content.toString('utf8'));
    });
  }

  encrypt(key, content) {
    // This return { iv, content }
    let encResult = encryptor.encrypt(key, content);
    let bufHmac = encryptor.hmac(content);
    // Pack base info, hmac of origin content, iv, enc content
    let bufFile = this.packHeader(encResult, bufHmac);
    return bufFile;
  }

  decrypt(key, content) {
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
  }

  // Return: Buffer
  packHeader(encResult, bufHmac) {
    const info = this.getHeader();
    let bufHeader = Buffer.alloc(info.length);
    // * Base info, add whatever you want :P
    bufHeader.write('Miikun@2018');
    // * Encrypt info
    bufHmac.copy(bufHeader, info.baseLength);
    // * IV
    encResult.iv.copy(bufHeader, info.baseLength + info.hmacLength);
    // this.dumpHeader(bufHeader)
    return Buffer.concat([bufHeader, encResult.content]);
  }

  unpackHeader(raw) {
    const info = this.getHeader();
    let base = raw.slice(0, info.baseLength);
    let hmac = raw.slice(info.baseLength, info.baseLength + info.hmacLength);
    let iv = raw.slice(info.baseLength + info.hmacLength, info.length);
    let encContent = raw.slice(info.length);
    return { base, hmac, iv, encContent };
  }

  dumpHeader(header) {
    const info = this.getHeader();
    let base = header.slice(0, info.baseLength);
    let hmac = header.slice(info.baseLength, info.baseLength + info.hmacLength);
    let iv = header.slice(info.baseLength + info.hmacLength, info.length);
    console.log('[Dump Header] Total bytes: ' + header.byteLength);
    console.log('[Dump Header] Base info: ' + base.toString('utf8'));
    console.log('[Dump Header] HMAC: ' + hmac.toString('utf8'));
    console.log('[Dump Header] IV: ' + iv.toString('utf8'));
  }

  updateKey(key) {
    this.key = key;
  }
}

export default new Filesystem();
