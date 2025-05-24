// 积分兑换项目表
module.exports = app => {
  const { INTEGER, STRING, TEXT, DATE, BOOLEAN } = app.Sequelize;
  
  const ExchangeItem = app.model.define('exchange_item', {
    id: { 
      type: INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    title: {
      type: STRING(100),
      allowNull: false
    },
    description: TEXT,
    points_cost: {
      type: INTEGER,
      allowNull: false
    },
    is_system: {
      type: BOOLEAN,
      defaultValue: false,
      comment: '是否系统预设'
    },
    creator_id: INTEGER,
    created_at: DATE,
    updated_at: DATE
  });
     ExchangeItem.sync({ force: false }) // force: false 确保不会删除表
       .then(() => {})
       .catch((err) => {
         console.error('同步 ExchangeItem 表失败:', err);
       });

  return ExchangeItem;
};