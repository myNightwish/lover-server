// 冲突记录表
module.exports = app => {
  const { INTEGER, TEXT, STRING, DATE, JSON } = app.Sequelize;
  
  const ConflictRecord = app.model.define('conflict_record', {
    id: { 
      type: INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    user_id: INTEGER,
    partner_id: INTEGER,
    trigger: TEXT,
    emotion_state: STRING(20),
    resolution: TEXT,
    reflection: TEXT,
    tags: {
      type: JSON,
      comment: '冲突标签：["沟通方式", "价值观差异"]等'
    },
    created_at: DATE,
    updated_at: DATE
  });

  ConflictRecord.associate = function() {
    const { WxUser } = app.model;
    
    ConflictRecord.belongsTo(WxUser, {
      foreignKey: 'user_id',
      as: 'user'
    });
    
    ConflictRecord.belongsTo(WxUser, {
      foreignKey: 'partner_id',
      as: 'partner'
    });
  };

  return ConflictRecord;
};