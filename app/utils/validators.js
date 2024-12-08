const Joi = require('joi');

const chatSchema = Joi.object({
  question: Joi.string().required().min(1).max(1000),
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
});
module.exports = { chatSchema, paginationSchema };