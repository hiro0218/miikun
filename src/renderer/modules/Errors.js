const ERR_USER_CANCEL = -100;
const ERR_ENCRYPT_FAIL = -101;
const ERR_DECRYPT_FAIL = -102;

/* Workaround of ReferenceError: _construct is not defined */
const _Error = Error;

class UserCancelError extends _Error {
  constructor() {
    super('User Canceled.');
    this.name = 'UserCancelError';
    this.code = ERR_USER_CANCEL;
  }
}

class EncryptFailError extends _Error {
  constructor(reason) {
    super(reason);
    this.name = 'EncryptFailError';
    this.code = ERR_ENCRYPT_FAIL;
  }
}

class DecryptFailError extends _Error {
  constructor(reason) {
    super(reason);
    this.name = 'DecryptFailError';
    this.code = ERR_DECRYPT_FAIL;
  }
}

export { ERR_USER_CANCEL, UserCancelError, ERR_ENCRYPT_FAIL, EncryptFailError, ERR_DECRYPT_FAIL, DecryptFailError };
