module.exports = app => {
  const { INTEGER, TEXT, DATE } = app.Sequelize;
  
  const TimelineComment = app.model.define('timeline_comment', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    memory_id: INTEGER,
    user_id: INTEGER,
    content: TEXT,
    created_at: DATE,
    updated_at: DATE
  });
  
  TimelineComment.associate = function() {
    const { TimelineMemory, User } = app.model;
    
    TimelineComment.belongsTo(TimelineMemory, { 
      foreignKey: 'memory_id', 
      as: 'memory' 
    });
    
    TimelineComment.belongsTo(User, { 
      foreignKey: 'user_id', 
      as: 'user' 
    });
  };
  
  TimelineComment.sync({ force: false, alter: true })
  .then(() => {})
  .catch(err => {
    console.error('同步 TimelineComment 表失败:', err);
  });
  
  return TimelineComment;
};