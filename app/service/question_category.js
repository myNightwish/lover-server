'use strict';

const Service = require('egg').Service;

class QuestionCategoryService extends Service {
  // 获取所有问题分类
  async getAll() {
    return await this.ctx.model.QuestionCategory.findAll({
      where: { status: 1 },
      order: [['id', 'ASC']],
    });
  }

  // 根据ID获取问题分类
  async getById(id) {
    return await this.ctx.model.QuestionCategory.findByPk(id);
  }

  // 创建问题分类
  async create(data) {
    return await this.ctx.model.QuestionCategory.create(data);
  }

  // 更新问题分类
  async update(id, data) {
    const category = await this.ctx.model.QuestionCategory.findByPk(id);
    if (!category) {
      return null;
    }
    return await category.update(data);
  }

  // 删除问题分类
  async delete(id) {
    const category = await this.ctx.model.QuestionCategory.findByPk(id);
    if (!category) {
      return false;
    }
    await category.update({ status: 0 });
    return true;
  }
}

module.exports = QuestionCategoryService;