const ERR_USER_CANCEL = -100;
const ERR_ENCRYPT_FAIL = -101;
const ERR_DECRYPT_FAIL = -102;

class UserCancelError extends Error {
  constructor() {
    super('User Canceled.');
    this.name = 'UserCancelError';
    this.code = ERR_USER_CANCEL;
  }
}

class EncryptFailError extends Error {
  constructor(reason) {
    super(reason);
    this.name = 'EncryptFailError';
    this.code = ERR_ENCRYPT_FAIL;
  }
}

class DecryptFailError extends Error {
  constructor(reason) {
    super(reason);
    this.name = 'DecryptFailError';
    this.code = ERR_DECRYPT_FAIL;
  }
}

export { ERR_USER_CANCEL, UserCancelError, ERR_ENCRYPT_FAIL, EncryptFailError, ERR_DECRYPT_FAIL, DecryptFailError };
