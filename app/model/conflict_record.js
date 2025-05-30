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
    growth_points: INTEGER,
    tags: {
      type: JSON,
      comment: '冲突标签：["沟通方式", "价值观差异"]等'
    },
    created_at: DATE,
    updated_at: DATE
  });

  ConflictRecord.associate = function() {
    const { User } = app.model;
    
    ConflictRecord.belongsTo(User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    
    ConflictRecord.belongsTo(User, {
      foreignKey: 'partner_id',
      as: 'partner'
    });
    ConflictRecord.hasMany(app.model.ConflictNote, { foreignKey: 'conflict_id', as: 'notes' });
  };
  ConflictRecord.sync({ force: false, alert: true }) // force: false 确保不会删除表
  .then(() => {})
  .catch(err => {
    console.error('同步 ConflictRecord 表失败:', err);
  });

  return ConflictRecord;
};