module.exports = app => {
  // 在启动时进行模型同步
  app.beforeStart(async () => {
    // 你可以选择是否强制同步数据库（force: true会删除并重建表）
     // 应用启动前初始化模板数据
     const ctx = app.createAnonymousContext();
     const templateService = ctx.service.template;
     
     try {
       // 检查数据库中是否已有分类数据
       const categories = await ctx.model.QuestionCategory.findAll();
       if (categories.length === 0) {
         console.log('数据库中没有分类数据，开始初始化模板数据...');
         const result = await templateService.initTemplateData();
         if (result) {
           console.log('初始化模板数据成功');
         } else {
           console.log('初始化模板数据失败');
         }
       } else {
         console.log('数据库中已有分类数据，跳过初始化');
       }
     } catch (error) {
       console.error('检查或初始化模板数据失败:', error);
     }
    await app.model.sync({ force: false }); // 这样可以保留现有数据并同步新的表结构
  });
};
