const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const { auth, admin } = require('../middleware/auth');

// @route   GET api/tags
// @desc    Get all tags
// @access  Public
router.get('/', tagController.getTags);

// @route   GET api/tags/:id
// @desc    Get a single tag by ID
// @access  Public
router.get('/:id', tagController.getTagById);

// @route   POST api/tags
// @desc    Create a new tag
// @access  Admin only
router.post('/', [auth, admin], tagController.createTag);

// @route   PUT api/tags/:id
// @desc    Update a tag
// @access  Admin only
router.put('/:id', [auth, admin], tagController.updateTag);

// @route   DELETE api/tags/:id
// @desc    Delete a tag
// @access  Admin only
router.delete('/:id', [auth, admin], tagController.deleteTag);

module.exports = router; 