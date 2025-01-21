/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const authWx = require('./middleware/wxAuth.js');

  // 微信小程序登录
  router.post('/api/loginAndAutoSignUp', controller.wxUser.loginAndAutoSignUp);
  router.post('/api/refresh-token', authWx, controller.wxUser.refreshToken);
  router.get('/api/user/info', authWx, controller.wxUser.getUserInfo);

  // Chat routes
  router.post('/api/chat/start', authWx, controller.chat.start);
  router.get('/api/chat/query/:id', authWx, controller.chat.query);
  router.get('/api/chat/history', authWx, controller.chat.history);

  // 问卷调查
  router.get('/api/questionnaire/init', authWx, controller.questionnaire.init);
  router.get('/api/questionnaire/list', authWx, controller.questionnaire.list);
  router.post(
    '/api/questionnaire/submit',
    authWx,
    controller.questionnaire.submit
  );
  router.get(
    '/api/questionnaire/detail',
    authWx,
    controller.questionnaire.detail
  );
  router.get(
    '/api/questionnaire/friends',
    authWx,
    controller.questionnaire.friends
  );
  router.post(
    '/api/questionnaire/analyze',
    authWx,
    controller.questionnaire.analyze
  );
  router.post(
    '/api/questionnaire/addfriends',
    authWx,
    controller.questionnaire.addFriends
  );
  // 获取GPT分析结果
  router.get(
    '/api/questionnaire/gptanalysis',
    authWx,
    controller.questionnaire.getGptAnalysis
  );

  // oos存储
  router.get('/api/oss/upload-params', authWx, controller.oss.getUploadParams);
  router.post('/api/wxUser/update', authWx, controller.wxUser.updateWxUser);

  // 情绪记录相关路由
  router.post('/api/emotion/record', authWx, controller.emotion.recordEmotion);
  router.get('/api/emotion/trend', authWx, controller.emotion.getEmotionTrend);

  // 记忆拼图相关路由
  router.post(
    '/api/memory-puzzle/create',
    authWx,
    controller.memoryPuzzle.createPuzzle
  );
  router.get(
    '/api/memory-puzzle/:puzzleId',
    authWx,
    controller.memoryPuzzle.getPuzzleResult
  );

  // 冲突记录相关路由
  router.post(
    '/api/conflict/record',
    authWx,
    controller.conflict.recordConflict
  );
  router.get(
    '/api/conflict/analysis',
    authWx,
    controller.conflict.getConflictAnalysis
  );

  // 共情游戏相关路由
  router.get('/api/empathy/tasks', authWx, controller.empathy.getTasks);
  router.post(
    '/api/empathy/complete-task',
    authWx,
    controller.empathy.completeTask
  );
  router.get('/api/empathy/progress', authWx, controller.empathy.getProgress);

  // 成长档案相关路由
  router.get('/api/growth/archive', authWx, controller.growth.getArchive);
  router.get('/api/growth/milestones', authWx, controller.growth.getMilestones);

  router.get(
    '/api/empathy/current-task',
    authWx,
    controller.empathy.getCurrentTask
  );
  router.get(
    '/api/empathy/task-history',
    authWx,
    controller.empathy.getTaskHistory
  );

  // 激励系统
  router.post(
    '/api/behavior/record',
    authWx,
    controller.behavior.recordBehavior
  );
  router.get(
    '/api/behavior/analysis',
    authWx,
    controller.behavior.getBehaviorAnalysis
  );
  router.get(
    '/api/behavior/categories',
    authWx,
    controller.behavior.getBehaviorCategories
  );
  // 伴侣绑定
  router.post('/api/relationship/bind', authWx, controller.relationship.bind);
  // 花园数据
  router.get(
    '/api/growth/garden-data',
    authWx,
    controller.garden.getGardenData
  );

  // 积分系统相关路由
  router.get('/api/points/overview', authWx, controller.points.getOverview);
  router.post('/api/points/record', authWx, controller.points.recordBehavior);
  router.get(
    '/api/points/exchange-items',
    authWx,
    controller.points.getExchangeItems
  );
  router.post(
    '/api/points/exchange-items',
    authWx,
    controller.points.createExchangeItem
  );
  router.post(
    '/api/points/exchange/complete/:id',
    authWx,
    controller.points.completeExchange
  );
  router.post('/api/points/exchange', authWx, controller.points.exchange);
  router.get('/api/points/history', authWx, controller.points.getHistory);

  // 消息系统相关路由
  router.get('/api/messages/all', authWx, controller.message.getMessages);
  router.put(
    '/api/messages/read/:messageId',
    authWx,
    controller.message.markAsRead
  );
};
