const Task = require('../models/Task');
const User = require('../models/User');
const { createObjectCsvStringifier } = require('csv-writer');

exports.summary = async (req, res, next) => {
  try {
    // Managers see full org-level analytics, employees see personal analytics
    if (req.user.role === 'employee') {
      const match = { deleted: false, assignee: req.user.id };
      const total = await Task.countDocuments(match);
      const byStatus = await Task.aggregate([
        { $match: match },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);
      const byPriority = await Task.aggregate([
        { $match: match },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]);
      return res.json({ success: true, data: { total, byStatus, byPriority } });
    }

    const match = { deleted: false };

    const total = await Task.countDocuments(match);

    const byStatus = await Task.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const byPriority = await Task.aggregate([
      { $match: match },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    const topUsers = await Task.aggregate([
      { $match: match },
      { $group: { _id: '$createdBy', created: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } } } },
      { $sort: { created: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $project: { created: 1, completed: 1, user: { name: '$user.name', email: '$user.email', id: '$user._id' } } },
    ]);

    res.json({ success: true, data: { total, byStatus, byPriority, topUsers } });
  } catch (err) {
    next(err);
  }
};

exports.trends = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 30;
    const assignee = req.query.assignee;
    const from = new Date();
    from.setDate(from.getDate() - (days - 1));
    from.setHours(0, 0, 0, 0);

    const match = { deleted: false, createdAt: { $gte: from } };
    if (assignee && ['manager', 'admin'].includes(req.user.role)) {
      match.assignee = require('mongoose').Types.ObjectId(assignee);
    } else if (req.user.role === 'employee') {
      match.assignee = require('mongoose').Types.ObjectId(req.user.id);
    }

    const rows = await Task.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // build full series
    const map = {};
    rows.forEach((r) => (map[r._id] = r.count));

    const series = [];
    for (let i = 0; i < days; i++) {
      const dt = new Date(from);
      dt.setDate(from.getDate() + i);
      const key = dt.toISOString().slice(0, 10);
      series.push({ date: key, count: map[key] || 0 });
    }

    res.json({ success: true, data: series });
  } catch (err) {
    next(err);
  }
};

exports.exportCsv = async (req, res, next) => {
  try {
    const { status, assignee } = req.query;
    const query = { deleted: false };
    if (status) query.status = status;
    if (assignee) query.assignee = assignee;

    const tasks = await Task.find(query).populate('createdBy', 'name email').populate('assignee', 'name email').lean();

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'id', title: 'ID' },
        { id: 'title', title: 'Title' },
        { id: 'description', title: 'Description' },
        { id: 'status', title: 'Status' },
        { id: 'priority', title: 'Priority' },
        { id: 'dueDate', title: 'Due Date' },
        { id: 'createdAt', title: 'Created At' },
        { id: 'createdBy', title: 'Created By' },
        { id: 'assignee', title: 'Assignee' },
      ],
    });

    const records = tasks.map((t) => ({
      id: t._id.toString(),
      title: t.title,
      description: t.description || '',
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate ? t.dueDate.toISOString() : '',
      createdAt: t.createdAt ? t.createdAt.toISOString() : '',
      createdBy: t.createdBy ? `${t.createdBy.name} <${t.createdBy.email}>` : '',
      assignee: t.assignee ? `${t.assignee.name} <${t.assignee.email}>` : '',
    }));

    const header = csvStringifier.getHeaderString();
    const csv = header + csvStringifier.stringifyRecords(records);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="tasks_export_${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
};
