const express = require('express');
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

// list users - protected
router.get('/', auth, userController.list);

// update role - only manager/admin
router.patch('/:id/role', auth, userController.updateRole);

module.exports = router;
