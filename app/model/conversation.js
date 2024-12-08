module.exports = app => {
  const { STRING, TEXT, INTEGER, ENUM } = app.Sequelize;

  const Conversation = app.model.define('conversation', {
    userId: {
      type: STRING(64),
      allowNull: false,
      field: 'user_id',
    },
    question: {
      type: TEXT,
      allowNull: false,
    },
    answer: {
      type: TEXT,
      allowNull: true,
    },
    status: {
      type: ENUM('pending', 'processing', 'completed', 'failed'),
      defaultValue: 'pending',
    },
    tokenCount: {
      type: INTEGER,
      defaultValue: 0,
      field: 'token_count',
    },
    error: {
      type: TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'conversations',
    underscored: true,
    timestamps: true,
  });

  // 可选：同步表格
  Conversation.sync({ force: false })
    .then(() => {
      console.log('Conversation 表已同步');
    })
    .catch(err => {
      console.error('同步 Conversation 表失败:', err);
    });

  // 定义静态方法（查找用户的对话记录）
  Conversation.findByUserId = async function(userId, page, pageSize) {
    return await this.findAndCountAll({
      where: { userId },
      order: [['created_at', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });
  };

  // 定义实例方法（标记为完成）
  Conversation.prototype.markAsCompleted = async function(answer, tokenCount) {
    this.answer = answer;
    this.tokenCount = tokenCount;
    this.status = 'completed';
    await this.save({ fields: ['answer', 'tokenCount', 'status'] });
  };

  // 定义实例方法（标记为失败）
  Conversation.prototype.markAsFailed = async function(error) {
    this.status = 'failed';
    this.error = error;
    await this.save({ fields: ['status', 'error'] });
  };

  return Conversation;
};
