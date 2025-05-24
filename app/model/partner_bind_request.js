'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE, ENUM } = app.Sequelize;

  const PartnerBindRequest = app.model.define('partner_bind_request', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    requester_id: { type: INTEGER, allowNull: false, comment: '发起请求的用户ID' },
    target_id: { type: INTEGER, allowNull: false, comment: '目标用户ID' },
    status: { 
      type: ENUM('pending', 'accepted', 'rejected', 'canceled'),
      defaultValue: 'pending',
      comment: '请求状态: pending-待处理, accepted-已接受, rejected-已拒绝, canceled-已取消'
    },
    created_at: DATE,
    updated_at: DATE,
  }, {
    tableName: 'partner_bind_request',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  PartnerBindRequest.associate = function() {
    app.model.PartnerBindRequest.belongsTo(app.model.User, { foreignKey: 'requester_id', as: 'requester' });
    app.model.PartnerBindRequest.belongsTo(app.model.User, { foreignKey: 'target_id', as: 'target' });
  };

  return PartnerBindRequest;
};