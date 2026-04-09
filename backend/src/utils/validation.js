const ApiError = require('./api-error');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const assert = (condition, message, details = null, statusCode = 400) => {
  if (!condition) {
    throw new ApiError(statusCode, message, details);
  }
};

const requiredString = (value, field, { min = 1, max = 255 } = {}) => {
  const normalized = String(value || '').trim();
  assert(normalized.length >= min, `${field} is required`);
  assert(normalized.length <= max, `${field} must be at most ${max} characters`);
  return normalized;
};

const optionalString = (value, { max = 255, fallback = '' } = {}) => {
  const normalized = String(value || '').trim();
  assert(normalized.length <= max, `Value must be at most ${max} characters`);
  return normalized || fallback;
};

const requiredEmail = (value) => {
  const normalized = requiredString(value, 'Email', { max: 190 }).toLowerCase();
  assert(EMAIL_REGEX.test(normalized), 'Email address is invalid');
  return normalized;
};

const requiredNumber = (value, field, { min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY } = {}) => {
  const normalized = Number(value);
  assert(Number.isFinite(normalized), `${field} must be a valid number`);
  assert(normalized >= min, `${field} must be at least ${min}`);
  assert(normalized <= max, `${field} must be at most ${max}`);
  return normalized;
};

const optionalNumber = (value, { min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY, fallback = null } = {}) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  return requiredNumber(value, 'Value', { min, max });
};

const requiredInteger = (value, field, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) => {
  const normalized = Number.parseInt(value, 10);
  assert(!Number.isNaN(normalized), `${field} must be an integer`);
  assert(normalized >= min, `${field} must be at least ${min}`);
  assert(normalized <= max, `${field} must be at most ${max}`);
  return normalized;
};

const optionalInteger = (value, { min = 0, max = Number.MAX_SAFE_INTEGER, fallback = null } = {}) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  return requiredInteger(value, 'Value', { min, max });
};

const requiredBoolean = (value, field) => {
  assert(typeof value === 'boolean', `${field} must be true or false`);
  return value;
};

const optionalBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (String(value).toLowerCase() === 'true') {
    return true;
  }

  if (String(value).toLowerCase() === 'false') {
    return false;
  }

  throw new ApiError(400, 'Boolean value is invalid');
};

const optionalArray = (value, fallback = []) => {
  if (value === undefined || value === null) {
    return fallback;
  }

  assert(Array.isArray(value), 'Expected an array');
  return value;
};

const oneOf = (value, allowed, field) => {
  assert(allowed.includes(value), `${field} must be one of: ${allowed.join(', ')}`);
  return value;
};

module.exports = {
  assert,
  requiredString,
  optionalString,
  requiredEmail,
  requiredNumber,
  optionalNumber,
  requiredInteger,
  optionalInteger,
  requiredBoolean,
  optionalBoolean,
  optionalArray,
  oneOf,
};
