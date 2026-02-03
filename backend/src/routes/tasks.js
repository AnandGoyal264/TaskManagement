const express = require('express');
const auth = require('../middleware/auth');
const taskController = require('../controllers/taskController');

const router = express.Router();

router.use(auth);

router.post('/bulk', taskController.bulkCreate);
router.post('/', taskController.createTask);
router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTaskById);
// debug: full task with comments and files
router.get('/:id/full', taskController.getTaskFull);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.softDeleteTask);

module.exports = router;
