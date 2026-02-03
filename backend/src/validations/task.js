const Joi = require('joi');

const createTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().allow('', null),
  status: Joi.string().valid('todo', 'in-progress', 'done', 'archived'),
  priority: Joi.string().valid('low', 'medium', 'high'),
  dueDate: Joi.date().iso().allow(null),
  assignee: Joi.string().hex().length(24).allow(null),
  assignees: Joi.array().items(Joi.string().hex().length(24)).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
});

// Update schema: all fields optional for partial updates
const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  description: Joi.string().allow('', null).optional(),
  status: Joi.string().valid('todo', 'in-progress', 'done', 'archived').optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  dueDate: Joi.date().iso().allow(null).optional(),
  assignee: Joi.string().hex().length(24).allow(null).optional(),
  assignees: Joi.array().items(Joi.string().hex().length(24)).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
};
