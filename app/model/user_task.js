// 用户任务完成记录表
module.exports = app => {
  const { INTEGER, TEXT, DATE, BOOLEAN } = app.Sequelize;

  const UserTask = app.model.define('user_task', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: INTEGER,
    task_id: INTEGER,
    response: TEXT,
    completed: {
      type: BOOLEAN,
      defaultValue: false,
    },
    completed_at: DATE,
    created_at: DATE,
    updated_at: DATE,
  });

  UserTask.associate = function() {
    app.model.UserTask.belongsTo(app.model.EmpathyTask, {
      foreignKey: 'task_id',
      as: 'task',
    });
  };
  UserTask.sync({ force: false }) // force: false 确保不会删除表
    .then(() => {})
    .catch(err => {
      console.error('同步 UserTask 表失败:', err);
    });

  return UserTask;
};
