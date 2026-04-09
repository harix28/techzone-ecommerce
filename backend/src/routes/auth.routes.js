const express = require('express');

const router = express.Router();
const controller = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');
const { requireAuth } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rate-limit');

router.post('/register', authLimiter, controller.register);
router.post('/login', authLimiter, controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);
router.get('/me', requireAuth, controller.me);
router.get('/profile', requireAuth, userController.getProfile);
router.put('/profile', requireAuth, userController.updateProfile);

module.exports = router;
