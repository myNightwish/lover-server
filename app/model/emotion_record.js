// 情绪记录表
module.exports = app => {
  const { INTEGER, STRING, DATE, TEXT } = app.Sequelize;
  
  const EmotionRecord = app.model.define('emotion_record', {
    id: { 
      type: INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    user_id: {
      type: INTEGER,
      allowNull: false,
      references: {
        model: 'wx_users',
        key: 'id'
      }
    },
    emotion_type: {
      type: STRING(20),
      allowNull: false,
      comment: '情绪类型：happy/sad/angry/anxious/neutral'
    },
    intensity: {
      type: INTEGER,
      allowNull: false,
      comment: '情绪强度：1-5'
    },
    trigger: {
      type: TEXT,
      comment: '触发原因'
    },
    created_at: DATE,
    updated_at: DATE
  });

  EmotionRecord.associate = function() {
    EmotionRecord.belongsTo(app.model.WxUser, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return EmotionRecord;
};