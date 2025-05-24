module.exports = app => {
  const { INTEGER, DATE } = app.Sequelize;

  const UserFriend = app.model.define('user_friend', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    user_id: INTEGER,
    friend_id: INTEGER,
    created_at: DATE,
    updated_at: DATE,
  });

  UserFriend.associate = function() {
    // 与用户表的关联关系
    app.model.UserFriend.belongsTo(app.model.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
    app.model.UserFriend.belongsTo(app.model.User, {
      foreignKey: 'friend_id',
      as: 'friend',
    });
    // 关联到 GptAnalysis：通过 User 与 GptAnalysis 关联
    // app.model.UserFriend.hasMany(app.model.GptAnalysis, {
    //   foreignKey: 'user_id', // GptAnalysis 的 user_id 是外键
    //   as: 'gptAnalyses', // 给 GptAnalysis 取个别名
    // });
    // 关联到问卷得分表：通过 User 与 QuestionnaireScore 关联
    app.model.UserFriend.hasMany(app.model.QuestionnaireScore, {
      foreignKey: 'user_id', // QuestionnaireScore 的 user_id 是外键
      as: 'questionnaireScores', // 给 QuestionnaireScore 取个别名
    });
  };
  // 同步模型
  UserFriend.sync({ force: false }) // force: false 确保不会删除表
    .then(() => {})
    .catch(err => {
      console.error('同步 UserFriend 表失败:', err);
    });
  return UserFriend;
};
