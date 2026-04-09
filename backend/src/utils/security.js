const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const hashPassword = (value) => bcrypt.hash(value, 12);
const comparePassword = (value, hash) => bcrypt.compare(value, hash);
const hashToken = (value) => crypto.createHash('sha256').update(value).digest('hex');
const randomToken = () => crypto.randomBytes(48).toString('hex');

module.exports = {
  hashPassword,
  comparePassword,
  hashToken,
  randomToken,
};
