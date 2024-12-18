module.exports = app => {
  // 在启动时进行模型同步
  app.beforeStart(async () => {
    // 你可以选择是否强制同步数据库（force: true会删除并重建表）
    await app.model.sync({ force: false }); // 这样可以保留现有数据并同步新的表结构
  });
};
