// 用户进度表
module.exports = app => {
  const { INTEGER, DATE } = app.Sequelize;
  
  const UserProgress = app.model.define('user_progress', {
    id: { 
      type: INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    user_id: INTEGER,
    experience: {
      type: INTEGER,
      defaultValue: 0
    },
    created_at: DATE,
    updated_at: DATE
  });

  UserProgress.associate = function() {
    app.model.UserProgress.belongsTo(app.model.WxUser, {
      foreignKey: 'user_id'
    });
    
    app.model.UserProgress.hasMany(app.model.UserTask, {
      foreignKey: 'user_id',
      as: 'completed_tasks'
    });
  };

  return UserProgress;
};