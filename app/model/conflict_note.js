module.exports = app => {
  const { INTEGER, TEXT, DATE } = app.Sequelize;
  const ConflictNote = app.model.define('conflict_note', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    conflict_id: INTEGER,
    user_id: INTEGER,
    content: TEXT,
    created_at: DATE,
    updated_at: DATE
  });
  ConflictNote.associate = function() {
    const { ConflictRecord, User } = app.model;
    ConflictNote.belongsTo(ConflictRecord, { foreignKey: 'conflict_id', as: 'conflict' });
    ConflictNote.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  };
  ConflictNote.sync({ force: false, alert: true }) // force: false 确保不会删除表
  .then(() => {})
  .catch(err => {
    console.error('同步 ConflictNote 表失败:', err);
  });
  return ConflictNote;
};