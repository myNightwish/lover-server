'use strict';

module.exports = app => {
  const { INTEGER, DATE } = app.Sequelize;

  const UserPartner = app.model.define('user_partner', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: INTEGER, comment: '用户ID' },
    partner_id: { type: INTEGER, comment: '伴侣ID' },
    status: { type: INTEGER, defaultValue: 1, comment: '状态：0-删除，1-正常' },
    created_at: DATE,
    updated_at: DATE
  });

  // 定义关联关系
  UserPartner.associate = function() {
    app.model.UserPartner.belongsTo(app.model.User, { as: 'partner', foreignKey: 'partner_id' });
  };

  return UserPartner;
};