export class RAMENError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RAMENError);
    }

    this.name = 'RAMENError';
  }
}
