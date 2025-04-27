'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const PartnerRelationship = app.model.define('partner_relationship', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: INTEGER, allowNull: false, comment: '用户ID' },
    partner_id: { type: INTEGER, allowNull: false, comment: '伴侣ID' },
    bind_time: { type: DATE, allowNull: false, comment: '绑定时间' },
    unbind_time: { type: DATE, allowNull: true, comment: '解绑时间' },
    status: { type: INTEGER, defaultValue: 1, comment: '状态: 1-有效, 0-已解绑' },
    created_at: DATE,
    updated_at: DATE,
  }, {
    tableName: 'partner_relationship',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  PartnerRelationship.associate = function() {
    app.model.PartnerRelationship.belongsTo(app.model.User, { foreignKey: 'user_id', as: 'user' });
    app.model.PartnerRelationship.belongsTo(app.model.User, { foreignKey: 'partner_id', as: 'partner' });
  };

  return PartnerRelationship;
};