// 行为积分表
module.exports = app => {
  const { INTEGER, DATE } = app.Sequelize;

  const BehaviorScore = app.model.define('behavior_score', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: INTEGER,
      allowNull: false,
      references: {
        model: 'wx_users',
        key: 'id',
      },
    },
    total_score: {
      type: INTEGER,
      defaultValue: 0,
      comment: '总积分',
    },
    positive_count: {
      type: INTEGER,
      defaultValue: 0,
      comment: '正向行为次数',
    },
    negative_count: {
      type: INTEGER,
      defaultValue: 0,
      comment: '负向行为次数',
    },
    created_at: DATE,
    updated_at: DATE,
  });

  BehaviorScore.associate = function() {
    BehaviorScore.belongsTo(app.model.WxUser, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };

  return BehaviorScore;
};
