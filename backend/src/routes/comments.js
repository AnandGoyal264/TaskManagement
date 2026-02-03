const express = require('express');
const auth = require('../middleware/auth');
const commentController = require('../controllers/commentController');

const router = express.Router();

router.use(auth);

router.post('/', commentController.addComment);
router.get('/task/:taskId', commentController.getCommentsByTask);
router.put('/:id', commentController.updateComment);
router.delete('/:id', commentController.deleteComment);

module.exports = router;
