const ERR_USER_CANCEL = -100;
const ERR_ENCRYPT_FAIL = -101;
const ERR_DECRYPT_FAIL = -102;
const ERR_NULL_KEY = -103;
const ERR_UNEXPECTED_STATE = -104;
const ERR_FILE_TOO_LARGE = -105;
const ERR_BINARY_FILE = -106;

/* Workaround of ReferenceError: _construct is not defined */
const _Error = Error;

const formatBytes = (value) => {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
};

class UserCancelError extends _Error {
  code: number;

  constructor() {
    super('User Canceled.');
    this.name = 'UserCancelError';
    this.code = ERR_USER_CANCEL;
  }
}

class EncryptFailError extends _Error {
  code: number;

  constructor(reason) {
    super(reason);
    this.name = 'EncryptFailError';
    this.code = ERR_ENCRYPT_FAIL;
  }
}

class DecryptFailError extends _Error {
  code: number;

  constructor(reason) {
    super(reason);
    this.name = 'DecryptFailError';
    this.code = ERR_DECRYPT_FAIL;
  }
}

class NullKeyError extends _Error {
  code: number;

  constructor() {
    super('Cannot find key.');
    this.name = 'NullKeyError';
    this.code = ERR_NULL_KEY;
  }
}

class UnexpectedStateError extends _Error {
  code: number;

  constructor(name, value) {
    super('Unexpected state "' + name + '" with value "' + value + '"');
    this.name = 'UnexpectedStateError';
    this.code = ERR_UNEXPECTED_STATE;
  }
}

class FileTooLargeError extends _Error {
  code: number;
  size: number;
  limit: number;

  constructor(size, limit) {
    super(`File is too large to open. Size: ${formatBytes(size)}, limit: ${formatBytes(limit)}.`);
    this.name = 'FileTooLargeError';
    this.code = ERR_FILE_TOO_LARGE;
    this.size = size;
    this.limit = limit;
  }
}

class BinaryFileError extends _Error {
  code: number;

  constructor() {
    super('Binary or non-UTF-8 files cannot be opened as text.');
    this.name = 'BinaryFileError';
    this.code = ERR_BINARY_FILE;
  }
}

export {
  ERR_USER_CANCEL,
  UserCancelError,
  ERR_ENCRYPT_FAIL,
  EncryptFailError,
  ERR_DECRYPT_FAIL,
  DecryptFailError,
  ERR_NULL_KEY,
  NullKeyError,
  ERR_UNEXPECTED_STATE,
  UnexpectedStateError,
  ERR_FILE_TOO_LARGE,
  FileTooLargeError,
  ERR_BINARY_FILE,
  BinaryFileError,
};
