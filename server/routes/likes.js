const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');
const { auth } = require('../middleware/auth');

// @route   POST api/likes/videos/:id
// @desc    Toggle like on a video
// @access  Private
router.post('/videos/:id', auth, likeController.toggleLike);

// @route   GET api/likes
// @desc    Get all videos liked by the current user
// @access  Private
router.get('/', auth, likeController.getLikedVideos);

module.exports = router; 