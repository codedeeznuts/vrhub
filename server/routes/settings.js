const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { auth, admin } = require('../middleware/auth');

// @route   GET api/settings
// @desc    Get all settings
// @access  Public (some settings may be filtered for non-admin users)
router.get('/', settingsController.getSettings);

// @route   PUT api/settings
// @desc    Update settings
// @access  Admin only
router.put('/', [auth, admin], settingsController.updateSettings);

module.exports = router; 