module.exports = app => {
  const { INTEGER, TEXT, STRING, DATE, JSON, BOOLEAN } = app.Sequelize;
  
  const TimelineMemory = app.model.define('timeline_memory', {
    id: { 
      type: INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    user_id: INTEGER,
    partner_id: INTEGER,
    title: STRING(100),
    description: TEXT,
    date: DATE,
    location: STRING(100),
    category: STRING(50),
    photos: {
      type: JSON,
      comment: '照片URL数组'
    },
    is_special: {
      type: BOOLEAN,
      defaultValue: false,
      comment: '是否为特殊记忆'
    },
    created_at: DATE,
    updated_at: DATE
  });

  TimelineMemory.associate = function() {
    const { User } = app.model;
    
    TimelineMemory.belongsTo(User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    
    TimelineMemory.belongsTo(User, {
      foreignKey: 'partner_id',
      as: 'partner'
    });
    
    TimelineMemory.hasMany(app.model.TimelineComment, { 
      foreignKey: 'memory_id', 
      as: 'comments' 
    });
  };
  
  TimelineMemory.sync({ force: false, alter: true })
  .then(() => {})
  .catch(err => {
    console.error('同步 TimelineMemory 表失败:', err);
  });

  return TimelineMemory;
};