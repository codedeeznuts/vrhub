const express = require('express');
const router = express.Router();
const studioController = require('../controllers/studioController');
const { auth, admin } = require('../middleware/auth');

// @route   GET api/studios
// @desc    Get all studios
// @access  Public
router.get('/', studioController.getStudios);

// @route   GET api/studios/:name
// @desc    Get a single studio by name
// @access  Public
router.get('/:name', studioController.getStudioByName);

// @route   POST api/studios
// @desc    Create a new studio
// @access  Admin only
router.post('/', [auth, admin], studioController.createStudio);

// @route   PUT api/studios/:id
// @desc    Update a studio
// @access  Admin only
router.put('/:id', [auth, admin], studioController.updateStudio);

// @route   DELETE api/studios/:id
// @desc    Delete a studio
// @access  Admin only
router.delete('/:id', [auth, admin], studioController.deleteStudio);

module.exports = router;