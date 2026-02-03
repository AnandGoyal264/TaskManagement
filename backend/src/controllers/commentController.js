const Comment = require('../models/Comment');
const Task = require('../models/Task');
const { createCommentSchema, updateCommentSchema } = require('../validations/comment');

exports.addComment = async (req, res, next) => {
  try {
    const { error, value } = createCommentSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.message });

    const task = await Task.findById(value.taskId);
    if (!task || task.deleted) return res.status(404).json({ success: false, message: 'Task not found' });

    const comment = await Comment.create({ text: value.text, author: req.user.id, task: value.taskId });

    task.comments.push(comment._id);
    await task.save();

    console.info('Comment added', { commentId: comment._id, author: req.user.id, taskId: value.taskId });

    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
};

exports.getCommentsByTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    console.info('Fetching comments for task', { taskId, user: req.user?.id });
    const comments = await Comment.find({ task: taskId }).populate('author', 'name email').sort({ createdAt: 1 });
    res.json({ success: true, data: comments });
  } catch (err) {
    next(err);
  }
};

exports.updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = updateCommentSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.message });

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    // Only author, manager, or admin can edit
    const isAuthor = String(comment.author) === String(req.user.id);
    const isManagerOrAdmin = ['manager', 'admin'].includes(req.user.role);
    
    if (!isAuthor && !isManagerOrAdmin) {
      return res.status(403).json({ success: false, message: 'You can only edit your own comments or you must be a manager/admin' });
    }

    comment.text = value.text;
    await comment.save();
    res.json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    // Only author, manager, or admin can delete
    const isAuthor = String(comment.author) === String(req.user.id);
    const isManagerOrAdmin = ['manager', 'admin'].includes(req.user.role);
    
    if (!isAuthor && !isManagerOrAdmin) {
      return res.status(403).json({ success: false, message: 'You can only delete your own comments or you must be a manager/admin' });
    }

    // Remove from task
    await Task.updateOne({ _id: comment.task }, { $pull: { comments: comment._id } });
    await Comment.deleteOne({ _id: id });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};
