const Task = require('../models/Task');
const User = require('../models/User');
const { createTaskSchema, updateTaskSchema } = require('../validations/task');
const { sendTaskAssignmentEmail } = require('../services/emailService');

exports.createTask = async (req, res, next) => {
  try {
    const { error, value } = createTaskSchema.validate(req.body);
    if (error) {
      console.warn('Task validation failed on create:', error.message, 'payload:', req.body);
      return res.status(400).json({ success: false, message: error.message });
    }

    // Only managers or admins can set assignee/assignees on create; employees cannot assign tasks to others
    if ((value.assignee || value.assignees) && !['manager', 'admin'].includes(req.user.role)) {
      delete value.assignee;
      delete value.assignees;
    }

    // If assignee was provided, validate the user exists and is an employee
    if (value.assignee) {
      const assigneeUser = await User.findById(value.assignee);
      if (!assigneeUser) return res.status(400).json({ success: false, message: 'Assignee not found' });
      if (assigneeUser.role !== 'employee') return res.status(400).json({ success: false, message: 'Assignee must be an employee' });
    }

    // If multiple assignees provided, validate each one
    if (value.assignees && Array.isArray(value.assignees)) {
      const invalidAssignees = [];
      for (const assigneeId of value.assignees) {
        const assigneeUser = await User.findById(assigneeId);
        if (!assigneeUser || assigneeUser.role !== 'employee') {
          invalidAssignees.push(assigneeId);
        }
      }
      if (invalidAssignees.length) {
        return res.status(400).json({ success: false, message: `Invalid assignees: ${invalidAssignees.join(', ')}` });
      }
    }

    value.createdBy = req.user.id;
    const task = await Task.create(value);

    // Send email notifications to assignees
    const creator = await User.findById(req.user.id);
    const creatorName = creator?.name || 'Manager';

    // Handle single assignee (backward compatibility)
    if (value.assignee) {
      const assignee = await User.findById(value.assignee);
      if (assignee?.email) {
        await sendTaskAssignmentEmail(assignee.email, assignee.name, task.title, task._id, creatorName);
      }
    }

    // Handle multiple assignees
    if (value.assignees && Array.isArray(value.assignees)) {
      for (const assigneeId of value.assignees) {
        const assignee = await User.findById(assigneeId);
        if (assignee?.email) {
          await sendTaskAssignmentEmail(assignee.email, assignee.name, task.title, task._id, creatorName);
        }
      }
    }

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, assignee, search, sortBy = 'createdAt', sortDir = 'desc', priority } = req.query;

    const query = { deleted: false };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignee) query.assignee = assignee;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];

    const pageNum = Math.max(1, parseInt(page, 10));
    const perPage = Math.min(100, parseInt(limit, 10) || 20);

    const sort = {};
    const dir = sortDir === 'asc' ? 1 : -1;
    sort[sortBy] = dir;

    const total = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .sort(sort)
      .skip((pageNum - 1) * perPage)
      .limit(perPage)
      .populate('createdBy', 'name email')
      .populate('assignee', 'name email')
      .lean();

    res.json({
      success: true,
      data: tasks,
      meta: { total, page: pageNum, limit: perPage, pages: Math.ceil(total / perPage) },
    });
  } catch (err) {
    next(err);
  }
};

exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('createdBy', 'name email').populate('assignee', 'name email').lean();
    if (!task || task.deleted) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// Debug endpoint: full task with comments and files populated (for debugging visibility issues)
exports.getTaskFull = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignee', 'name email')
      .populate({ path: 'comments', populate: { path: 'author', select: 'name email' } })
      .populate({ path: 'files', populate: { path: 'uploader', select: 'name email' } })
      .lean();
    if (!task || task.deleted) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { error, value } = updateTaskSchema.validate(req.body);
    if (error) {
      console.warn('Task validation failed on update:', error.message, 'payload:', req.body);
      return res.status(400).json({ success: false, message: error.message });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Keep a snapshot of previous assignees to notify newly assigned users
    const previousAssignee = task.assignee ? String(task.assignee) : null;
    const previousAssignees = Array.isArray(task.assignees) ? task.assignees.map(String) : [];

    // If assignee/assignees is being changed, only manager or admin can do that
    if ((value.assignee || value.assignees) && !['manager', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only managers can assign tasks' });
    }

    // Validate assignee exists and is an employee
    if (value.assignee) {
      const assigneeUser = await User.findById(value.assignee);
      if (!assigneeUser) return res.status(400).json({ success: false, message: 'Assignee not found' });
      if (assigneeUser.role !== 'employee') return res.status(400).json({ success: false, message: 'Assignee must be an employee' });
    }

    // Validate multiple assignees
    if (value.assignees && Array.isArray(value.assignees)) {
      const invalidAssignees = [];
      for (const assigneeId of value.assignees) {
        const assigneeUser = await User.findById(assigneeId);
        if (!assigneeUser || assigneeUser.role !== 'employee') {
          invalidAssignees.push(assigneeId);
        }
      }
      if (invalidAssignees.length) {
        return res.status(400).json({ success: false, message: `Invalid assignees: ${invalidAssignees.join(', ')}` });
      }
    }

    // If employee attempts to update, restrict to changing status only and only for their assigned tasks
    if (req.user.role === 'employee') {
      // Allow only status field
      const allowed = ['status'];
      const keys = Object.keys(value);
      const illegal = keys.filter((k) => !allowed.includes(k));
      if (illegal.length) return res.status(403).json({ success: false, message: 'Employees can only update task status' });

      // Must be assignee (either single or in multiple assignees)
      const isSingleAssignee = task.assignee && String(task.assignee) === String(req.user.id);
      const isMultipleAssignee = task.assignees && task.assignees.some(id => String(id) === String(req.user.id));
      
      if (!isSingleAssignee && !isMultipleAssignee) {
        return res.status(403).json({ success: false, message: 'You can only update tasks assigned to you' });
      }
    }

    // Apply changes
    Object.assign(task, value);
    await task.save();

    // After save: if manager/admin changed assignee(s), notify newly assigned employees
    if (['manager', 'admin'].includes(req.user.role)) {
      const toNotify = [];

      if (value.assignee) {
        const aid = String(value.assignee);
        if (aid !== previousAssignee) toNotify.push(aid);
      }

      if (value.assignees && Array.isArray(value.assignees)) {
        for (const aid of value.assignees.map(String)) {
          if (!previousAssignees.includes(aid)) toNotify.push(aid);
        }
      }

      if (toNotify.length) {
        const creator = await User.findById(req.user.id);
        const creatorName = creator?.name || 'Manager';
        for (const uid of toNotify) {
          const u = await User.findById(uid);
          if (u?.email) {
            await sendTaskAssignmentEmail(u.email, u.name, task.title, task._id, creatorName);
          }
        }
      }
    }

    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

exports.softDeleteTask = async (req, res, next) => {
  try {
    console.log("request is coming");
    const task = await Task.findByIdAndUpdate(req.params.id, { deleted: true, deletedAt: new Date() }, { new: true });
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

exports.bulkCreate = async (req, res, next) => {
  try {
    // Expect an array of tasks in req.body.tasks or req.body directly
    const items = Array.isArray(req.body.tasks) ? req.body.tasks : Array.isArray(req.body) ? req.body : [];
    
    if (!items.length) {
      return res.status(400).json({ success: false, message: 'No tasks provided' });
    }

    // Validate and prepare all items
    const validated = [];
    for (const item of items) {
      const { error, value } = createTaskSchema.validate(item);
      if (error) {
        return res.status(400).json({ success: false, message: `Validation error: ${error.message}` });
      }
      
      // Check if assignee exists (if provided)
      if (value.assignee) {
        const assigneeUser = await User.findById(value.assignee);
        if (!assigneeUser) {
          return res.status(400).json({ success: false, message: `Assignee ${value.assignee} not found` });
        }
        if (assigneeUser.role !== 'employee') {
          return res.status(400).json({ success: false, message: 'Assignee must be an employee' });
        }
      }
      
      // Check if multiple assignees exist (if provided)
      if (value.assignees && Array.isArray(value.assignees)) {
        const invalidAssignees = [];
        for (const assigneeId of value.assignees) {
          const assigneeUser = await User.findById(assigneeId);
          if (!assigneeUser || assigneeUser.role !== 'employee') {
            invalidAssignees.push(assigneeId);
          }
        }
        if (invalidAssignees.length) {
          return res.status(400).json({ success: false, message: `Invalid assignees: ${invalidAssignees.join(', ')}` });
        }
      }
      
      validated.push({ ...value, createdBy: req.user.id });
    }

    const created = await Task.insertMany(validated);

    // Send emails for bulk created tasks
    const creator = await User.findById(req.user.id);
    const creatorName = creator?.name || 'Manager';

    for (const task of created) {
      // Handle single assignee
      if (task.assignee) {
        const assignee = await User.findById(task.assignee);
        if (assignee?.email) {
          await sendTaskAssignmentEmail(assignee.email, assignee.name, task.title, task._id, creatorName);
        }
      }

      // Handle multiple assignees
      if (task.assignees && Array.isArray(task.assignees)) {
        for (const assigneeId of task.assignees) {
          const assignee = await User.findById(assigneeId);
          if (assignee?.email) {
            await sendTaskAssignmentEmail(assignee.email, assignee.name, task.title, task._id, creatorName);
          }
        }
      }
    }
    res.status(201).json({ success: true, data: created, count: created.length });
  } catch (err) {
    next(err);
  }
};
