const {
  optionalBoolean,
  optionalString,
  requiredInteger,
  requiredString,
} = require('../utils/validation');

const validateProfilePayload = (payload = {}) => ({
  name: requiredString(payload.name, 'Name', { min: 2, max: 120 }),
  phone: optionalString(payload.phone, { max: 30 }),
  avatar: optionalString(payload.avatar, { max: 500 }),
  password: payload.password ? requiredString(payload.password, 'Password', { min: 8, max: 128 }) : '',
});

const validateAddressPayload = (payload = {}) => ({
  label: optionalString(payload.label, { max: 50, fallback: 'Home' }),
  fullName: requiredString(payload.fullName, 'Full name', { min: 2, max: 120 }),
  phone: requiredString(payload.phone, 'Phone', { min: 6, max: 30 }),
  line1: requiredString(payload.line1 ?? payload.street, 'Address line 1', { min: 4, max: 190 }),
  line2: optionalString(payload.line2, { max: 190 }),
  city: requiredString(payload.city, 'City', { min: 2, max: 120 }),
  state: requiredString(payload.state, 'State', { min: 2, max: 120 }),
  postalCode: requiredString(payload.postalCode ?? payload.zip, 'Postal code', { min: 3, max: 20 }),
  country: requiredString(payload.country, 'Country', { min: 2, max: 80 }),
  isDefault: optionalBoolean(payload.isDefault, false),
});

const validateAdminUserPayload = (payload = {}) => ({
  roleId: payload.roleId ? requiredInteger(payload.roleId, 'Role', { min: 1, max: 99 }) : null,
  roleKey: payload.roleKey ? requiredString(payload.roleKey, 'Role', { min: 3, max: 30 }) : '',
  isActive: optionalBoolean(payload.isActive, true),
});

module.exports = {
  validateProfilePayload,
  validateAddressPayload,
  validateAdminUserPayload,
};
