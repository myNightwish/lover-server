'use strict';

const Service = require('egg').Service;

class QuestionService extends Service {
  // 获取分类下的所有问题
  async getByCategory(categoryId) {
    return await this.ctx.model.Question.findAll({
      where: { 
        category_id: categoryId,
        status: 1 
      },
      order: [['id', 'ASC']],
    });
  }

  // 根据ID获取问题
  async getById(id) {
    return await this.ctx.model.Question.findByPk(id);
  }

  // 批量获取问题
  async getByIds(ids) {
    return await this.ctx.model.Question.findAll({
      where: {
        id: ids,
        status: 1
      }
    });
  }

  // 创建问题
  async create(data) {
    return await this.ctx.model.Question.create(data);
  }

  // 更新问题
  async update(id, data) {
    const question = await this.ctx.model.Question.findByPk(id);
    if (!question) {
      return null;
    }
    return await question.update(data);
  }

  // 删除问题
  async delete(id) {
    const question = await this.ctx.model.Question.findByPk(id);
    if (!question) {
      return false;
    }
    await question.update({ status: 0 });
    return true;
  }

  // 随机获取指定数量的问题
  async getRandomQuestions(categoryId, count) {
    const questions = await this.ctx.model.Question.findAll({
      where: { 
        category_id: categoryId,
        status: 1 
      },
      order: this.app.Sequelize.literal('random()'),
      limit: count,
    });
    return questions;
  }
}

module.exports = QuestionService;