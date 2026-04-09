const asyncHandler = require('../utils/async-handler');
const userService = require('../services/user.service');
const { validateAddressPayload, validateAdminUserPayload, validateProfilePayload } = require('../validators/user.validator');
const { requiredInteger } = require('../utils/validation');

exports.getProfile = asyncHandler(async (req, res) => {
  const profile = await userService.getProfile(req.user.id);
  res.json({ success: true, data: profile });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const profile = await userService.updateProfile(req.user.id, validateProfilePayload(req.body));
  res.json({ success: true, data: profile, message: 'Profile updated successfully' });
});

exports.listAddresses = asyncHandler(async (req, res) => {
  const addresses = await userService.listUserAddresses(req.user.id);
  res.json({ success: true, data: addresses });
});

exports.createAddress = asyncHandler(async (req, res) => {
  const address = await userService.createAddress(req.user.id, validateAddressPayload(req.body));
  res.status(201).json({ success: true, data: address, message: 'Address saved successfully' });
});

exports.updateAddress = asyncHandler(async (req, res) => {
  const address = await userService.updateAddress(
    req.user.id,
    requiredInteger(req.params.id, 'Address', { min: 1 }),
    validateAddressPayload(req.body),
  );
  res.json({ success: true, data: address, message: 'Address updated successfully' });
});

exports.deleteAddress = asyncHandler(async (req, res) => {
  await userService.deleteAddress(req.user.id, requiredInteger(req.params.id, 'Address', { min: 1 }));
  res.json({ success: true, message: 'Address deleted successfully' });
});

exports.listUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  res.json({ success: true, data: result.items, meta: result.meta });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const profile = await userService.updateUser(
    requiredInteger(req.params.id, 'User', { min: 1 }),
    validateAdminUserPayload(req.body),
  );
  res.json({ success: true, data: profile, message: 'User updated successfully' });
});
