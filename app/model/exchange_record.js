// 积分兑换记录表
module.exports = (app) => {
  const { INTEGER, STRING, DATE } = app.Sequelize;

  const ExchangeRecord = app.model.define('exchange_record', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: INTEGER,
      allowNull: false,
      comment: '发起兑换的用户ID',
    },
    target_id: {
      type: INTEGER,
      allowNull: false,
      comment: '需要履行兑换的用户ID',
    },
    item_id: {
      type: INTEGER,
      allowNull: false,
      comment: '兑换项目ID',
    },
    points_cost: {
      type: INTEGER,
      allowNull: false,
      comment: '消耗的积分',
    },
    status: {
      type: STRING(20),
      defaultValue: 'pending',
      comment: 'pending(待履行)/completed(已完成)/cancelled(已取消)',
    },
    created_at: DATE,
    updated_at: DATE,
  });

  ExchangeRecord.associate = function () {
    const { WxUser, ExchangeItem } = app.model;

    ExchangeRecord.belongsTo(WxUser, {
      foreignKey: 'user_id',
      as: 'user',
    });

    ExchangeRecord.belongsTo(WxUser, {
      foreignKey: 'target_id',
      as: 'target',
    });

    ExchangeRecord.belongsTo(ExchangeItem, {
      foreignKey: 'item_id',
      as: 'item',
    });
  };

  return ExchangeRecord;
};
