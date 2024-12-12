'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 创建问卷模板表
    await queryInterface.createTable('questionnaire_templates', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      title: Sequelize.STRING(100),
      description: Sequelize.TEXT,
      status: Sequelize.INTEGER,
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });

    // 创建问题模板表
    await queryInterface.createTable('question_templates', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      questionnaire_id: Sequelize.INTEGER,
      question_text: Sequelize.TEXT,
      question_type: Sequelize.STRING(20),
      options: Sequelize.TEXT,
      order: Sequelize.INTEGER,
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });

    // 创建用户问卷表
    await queryInterface.createTable('user_questionnaires', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: Sequelize.INTEGER,
      template_id: Sequelize.INTEGER,
      status: Sequelize.INTEGER,
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });

    // 创建用户答案表
    await queryInterface.createTable('user_answers', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_questionnaire_id: Sequelize.INTEGER,
      question_id: Sequelize.INTEGER,
      answer: Sequelize.TEXT,
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });

    // 插入默认问卷模板数据
    await queryInterface.bulkInsert('questionnaire_templates', [
      {
        title: '学习习惯调查',
        description: '了解学生的学习习惯和方法',
        status: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: '职业规划调查',
        description: '了解学生的职业发展方向',
        status: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: '课程满意度调查',
        description: '收集学生对课程的反馈',
        status: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 插入默认问题模板数据
    await queryInterface.bulkInsert('question_templates', [
      // 学习习惯调查的问题
      {
        questionnaire_id: 1,
        question_text: '你每天的学习时间是多少？',
        question_type: 'single_choice',
        options: JSON.stringify([ '1-2小时', '2-4小时', '4-6小时', '6小时以上' ]),
        order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        questionnaire_id: 1,
        question_text: '你最常用的学习方法是什么？',
        question_type: 'multiple_choice',
        options: JSON.stringify([ '看书笔记', '视频学习', '练习题', '小组讨论' ]),
        order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // 职业规划调查的问题
      {
        questionnaire_id: 2,
        question_text: '你期望的职业方向是什么？',
        question_type: 'single_choice',
        options: JSON.stringify([ '技术开发', '产品设计', '项目管理', '其他' ]),
        order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        questionnaire_id: 2,
        question_text: '你认为需要提升哪些能力？',
        question_type: 'multiple_choice',
        options: JSON.stringify([ '专业技能', '沟通能力', '领导力', '创新能力' ]),
        order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // 课程满意度调查的问题
      {
        questionnaire_id: 3,
        question_text: '你对课程内容的满意度如何？',
        question_type: 'single_choice',
        options: JSON.stringify([ '非常满意', '满意', '一般', '不满意' ]),
        order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        questionnaire_id: 3,
        question_text: '你觉得课程还需要改进的地方是什么？',
        question_type: 'text',
        options: null,
        order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_answers');
    await queryInterface.dropTable('user_questionnaires');
    await queryInterface.dropTable('question_templates');
    await queryInterface.dropTable('questionnaire_templates');
  },
};
