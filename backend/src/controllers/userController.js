const User = require('../models/User');

exports.list = async (req, res, next) => {
  try {
    const { q, limit = 50 } = req.query;
    const query = {};
    if (q) query.$or = [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }];
    const users = await User.find(query).limit(parseInt(limit, 10)).select('_id name email role').lean();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

exports.updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) return res.status(400).json({ success: false, message: 'Role is required' });

    const requesterRole = req.user.role;

    // Only managers or admins can change roles
    if (!['manager', 'admin'].includes(requesterRole)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Disallow changing your own role
    if (String(req.user.id) === String(id)) {
      return res.status(403).json({ success: false, message: 'Cannot change your own role' });
    }

    const allowedByManager = ['employee', 'manager'];
    const allowedByAdmin = ['employee', 'manager', 'admin'];
    const allowed = requesterRole === 'admin' ? allowedByAdmin : allowedByManager;

    if (!allowed.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.role = role;
    await user.save();

    res.json({ success: true, data: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};
