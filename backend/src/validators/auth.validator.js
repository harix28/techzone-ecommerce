const {
  assert,
  optionalString,
  requiredEmail,
  requiredString,
} = require('../utils/validation');

const validateRegisterPayload = (payload = {}) => {
  const name = requiredString(payload.name, 'Name', { min: 2, max: 120 });
  const email = requiredEmail(payload.email);
  const password = requiredString(payload.password, 'Password', { min: 8, max: 128 });
  const phone = optionalString(payload.phone, { max: 30 });

  assert(/[A-Z]/i.test(password) && /\d/.test(password), 'Password must include letters and numbers');

  return { name, email, password, phone };
};

const validateLoginPayload = (payload = {}) => ({
  email: requiredEmail(payload.email),
  password: requiredString(payload.password, 'Password', { min: 8, max: 128 }),
});

module.exports = {
  validateRegisterPayload,
  validateLoginPayload,
};
