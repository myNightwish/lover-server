// 积分记录表
module.exports = (app) => {
  const { INTEGER, STRING, TEXT, DATE } = app.Sequelize;

  const PointsRecord = app.model.define('points_record', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: INTEGER,
      allowNull: false,
      comment: '积分发起用户',
    },
    target_id: {
      type: INTEGER,
      allowNull: false,
      comment: '积分接收用户',
    },
    type: {
      type: STRING(20),
      allowNull: false,
      comment: 'praise(表扬)/criticism(批评)/exchange(兑换)',
    },
    points: {
      type: INTEGER,
      allowNull: false,
      comment: '积分变动值',
    },
    description: {
      type: TEXT,
      allowNull: false,
      comment: '行为描述',
    },
    category: {
      type: STRING(50),
      comment: '行为类别',
    },
    created_at: DATE,
    updated_at: DATE,
  });

  PointsRecord.associate = function () {
    const { User } = app.model;

    PointsRecord.belongsTo(User, {
      foreignKey: 'user_id',
      as: 'user',
    });

    PointsRecord.belongsTo(User, {
      foreignKey: 'target_id',
      as: 'target',
    });
  };
   PointsRecord.sync({ force: false }) // force: false 确保不会删除表
     .then(() => {})
     .catch((err) => {
       console.error('同步 PointsRecord 表失败:', err);
     });

  return PointsRecord;
};
