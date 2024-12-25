// 共情任务表
module.exports = app => {
  const { INTEGER, STRING, TEXT, DATE, BOOLEAN } = app.Sequelize;
  
  const EmpathyTask = app.model.define('empathy_task', {
    id: { 
      type: INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    title: STRING(100),
    description: TEXT,
    exp_reward: INTEGER,
    status: {
      type: STRING(20),
      defaultValue: 'active'
    },
    created_at: DATE,
    updated_at: DATE
  });

  EmpathyTask.associate = function() {
    app.model.EmpathyTask.hasMany(app.model.UserTask, {
      foreignKey: 'task_id',
      as: 'user_tasks'
    });
  };

  return EmpathyTask;
};