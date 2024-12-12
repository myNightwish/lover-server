// app/model/token.js
module.exports = app => {
  const { STRING, DATE, INTEGER } = app.Sequelize;

  const Token = app.model.define('token', {
    userId: {
      type: INTEGER,
      allowNull: false,
    },
    refreshToken: {
      type: STRING,
      allowNull: false,
    },
    createdAt: {
      type: DATE,
      allowNull: false,
      defaultValue: app.Sequelize.NOW,
    },
  });
  Token.sync({ force: false }) // force: false 确保不会删除表
    .then(() => {})
    .catch(err => {
      console.error('同步 Token 表失败:', err);
    });
  return Token;
};
