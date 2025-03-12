const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, admin } = require('../middleware/auth');

// @route   GET api/users
// @desc    Get all users
// @access  Admin only
router.get('/', [auth, admin], userController.getUsers);

// @route   GET api/users/liked-videos
// @desc    Get current user's liked videos
// @access  Private
router.get('/liked-videos', auth, userController.getLikedVideos);

// @route   GET api/users/watch-history
// @desc    Get current user's watch history
// @access  Private
router.get('/watch-history', auth, userController.getWatchHistory);

// @route   DELETE api/users/watch-history
// @desc    Clear current user's watch history
// @access  Private
router.delete('/watch-history', auth, userController.clearWatchHistory);

// @route   PUT api/users/profile
// @desc    Update current user's profile
// @access  Private
router.put('/profile', auth, userController.updateProfile);

// @route   PUT api/users/change-password
// @desc    Change current user's password
// @access  Private
router.put('/change-password', auth, userController.changePassword);

// @route   GET api/users/:id
// @desc    Get a single user by ID
// @access  Admin only
router.get('/:id', [auth, admin], userController.getUserById);

// @route   POST api/users
// @desc    Create a new user
// @access  Admin only
router.post('/', [auth, admin], userController.createUser);

// @route   PUT api/users/:id
// @desc    Update a user
// @access  Admin only or self
router.put('/:id', auth, userController.updateUser);

// @route   DELETE api/users/:id
// @desc    Delete a user
// @access  Admin only
router.delete('/:id', [auth, admin], userController.deleteUser);

module.exports = router; 