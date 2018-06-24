'use strict';

import crypto from 'crypto';
import { DecryptFailError } from './Errors';

class Encryptor {
  constructor() {
    this.info = {
      cipher: {
        algorithm: 'aes-256-cbc',
        ivLength: 16,
      },
      hmac: {
        algorithm: 'sha256',
        key: 'sjIIhOQJWjlOl4J',
      },
    };
  }

  getInfo() {
    return this.info;
  }

  // return: Object { iv, enc content }
  encrypt(key, content) {
    let iv = crypto.randomBytes(this.info.cipher.ivLength);
    let cipher = crypto.createCipheriv(this.info.cipher.algorithm, this.hmac(key), iv);
    return {
      iv: iv,
      content: Buffer.concat([cipher.update(content), cipher.final()]),
    };
  }

  // return: Buffer
  decrypt(key, raw, iv) {
    let decipher = crypto.createDecipheriv(this.info.cipher.algorithm, this.hmac(key), Buffer.from(iv));
    try {
      return Buffer.concat([decipher.update(raw), decipher.final()]);
    } catch (err) {
      throw new DecryptFailError('Wrong Password');
    }
  }

  // return: Buffer
  hmac(data) {
    let hmac = crypto.createHmac(this.info.hmac.algorithm, this.info.hmac.key);
    hmac.update(data);
    return hmac.digest();
  }

  // return: Array[String]
  listCiphers() {
    return crypto.getCiphers();
  }

  listHashes() {
    return crypto.getHashes();
  }
}

export default new Encryptor();
