// 记忆拼图表
module.exports = app => {
  const { INTEGER, TEXT, FLOAT, DATE } = app.Sequelize;

  const MemoryPuzzle = app.model.define('memory_puzzle', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: INTEGER,
      allowNull: false,
    },
    partner_id: {
      type: INTEGER,
      allowNull: false,
    },
    event_description: {
      type: TEXT,
      allowNull: false,
    },
    match_score: {
      type: FLOAT,
      comment: '匹配度得分：0-100',
    },
    created_at: DATE,
    updated_at: DATE,
  });

  MemoryPuzzle.associate = function() {
    const { WxUser } = app.model;

    MemoryPuzzle.belongsTo(WxUser, {
      foreignKey: 'user_id',
      as: 'user',
    });

    MemoryPuzzle.belongsTo(WxUser, {
      foreignKey: 'partner_id',
      as: 'partner',
    });
    // 添加自关联
    MemoryPuzzle.hasOne(MemoryPuzzle, {
      foreignKey: 'user_id',
      sourceKey: 'partner_id',
      as: 'partnerPuzzle',
      constraints: false,
    });
  };
  MemoryPuzzle.sync({ force: false }) // force: false 确保不会删除表
    .then(() => {})
    .catch(err => {
      console.error('同步 MemoryPuzzle 表失败:', err);
    });
  return MemoryPuzzle;
};
