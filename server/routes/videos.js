const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { auth, admin } = require('../middleware/auth');

// @route   GET api/videos
// @desc    Get all videos with pagination and optional search
// @access  Public
router.get('/', videoController.getVideos);

// @route   GET api/videos/:id
// @desc    Get a single video by ID
// @access  Public (with optional auth for like status)
router.get('/:id', (req, res, next) => {
  // Optional auth middleware
  if (req.header('x-auth-token')) {
    auth(req, res, next);
  } else {
    next();
  }
}, videoController.getVideoById);

// @route   POST api/videos/:id/view
// @desc    Record an anonymous view for a video
// @access  Public
router.post('/:id/view', videoController.recordAnonymousView);

// @route   POST api/videos
// @desc    Create a new video
// @access  Admin only
router.post('/', [auth, admin], videoController.createVideo);

// @route   PUT api/videos/:id
// @desc    Update a video
// @access  Admin only
router.put('/:id', [auth, admin], videoController.updateVideo);

// @route   DELETE api/videos/:id
// @desc    Delete a video
// @access  Admin only
router.delete('/:id', [auth, admin], videoController.deleteVideo);

module.exports = router; 