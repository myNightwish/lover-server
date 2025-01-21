// 积分余额表
module.exports = (app) => {
  const { INTEGER, DATE } = app.Sequelize;

  const PointsBalance = app.model.define('points_balance', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: INTEGER,
      allowNull: false,
      unique: true,
    },
    balance: {
      type: INTEGER,
      defaultValue: 50,
      comment: '当前积分余额',
    },
    created_at: DATE,
    updated_at: DATE,
  });

  PointsBalance.associate = function () {
    PointsBalance.belongsTo(app.model.WxUser, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };
     PointsBalance.sync({ force: false }) // force: false 确保不会删除表
       .then(() => {})
       .catch((err) => {
         console.error('同步 PointsBalance 表失败:', err);
       });

  return PointsBalance;
};
