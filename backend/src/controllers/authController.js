const User = require('../models/User');
const { registerSchema, loginSchema } = require('../validations/auth');
const { signToken } = require('../utils/jwt');

exports.register = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.message });

    const existing = await User.findOne({ email: value.email });
    if (existing) return res.status(409).json({ success: false, message: 'Email already in use' });

    const user = await User.create(value);
    const token = signToken({ id: user._id, role: user.role });

    res.status(201).json({ success: true, data: { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token } });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.message });

    const user = await User.findOne({ email: value.email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const match = await user.comparePassword(value.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = signToken({ id: user._id, role: user.role });
    res.json({ success: true, data: { user: { id: user._id, name: user.name, email: user.email }, token } });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
