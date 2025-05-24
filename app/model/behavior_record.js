// 行为记录表
module.exports = app => {
  const { INTEGER, STRING, TEXT, DATE, ENUM } = app.Sequelize;

  const BehaviorRecord = app.model.define('behavior_record', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    partner_id: {
      type: INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    type: {
      type: ENUM('positive', 'negative'),
      allowNull: false,
      comment: '行为类型：positive(正向)/negative(负向)',
    },
    points: {
      type: INTEGER,
      allowNull: false,
      comment: '积分变化值',
    },
    category: {
      type: STRING(50),
      allowNull: false,
      comment: '行为类别：关心、责任、沟通等',
    },
    description: {
      type: TEXT,
      allowNull: false,
      comment: '行为描述',
    },
    created_at: DATE,
    updated_at: DATE,
  });

  BehaviorRecord.associate = function() {
    const { User } = app.model;

    BehaviorRecord.belongsTo(User, {
      foreignKey: 'user_id',
      as: 'user',
    });

    BehaviorRecord.belongsTo(User, {
      foreignKey: 'partner_id',
      as: 'partner',
    });
  };

  return BehaviorRecord;
};
