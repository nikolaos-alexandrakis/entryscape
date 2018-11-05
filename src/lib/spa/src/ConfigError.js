/**
 * Just a wrapper of Error
 */
export default class ConfigError extends Error {
  constructor(...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConfigError);
    }
  }
}
