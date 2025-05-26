/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware } = app;
  // const wxAuth = require('./middleware/wxAuth.js'); // 保留原有微信鉴权中间件，用于特定场景
  const authCommon = middleware.auth(); // 通用鉴权中间件
  const partnerRequired = middleware.partnerRequired();
  //  用户相关
  //  需要鉴权的接口
  // 微信小程序登录
  router.post('/api/loginAndAutoSignUp', controller.wxUser.loginAndAutoSignUp);
  router.post('/api/refresh-token', authCommon, controller.user.refreshToken);
  // 普通 web
  router.post('/api/user/register', controller.user.register);
  router.post('/api/user/login', controller.user.login);
  // 个人信息：
  router.get('/api/user/info', authCommon, controller.user.getUserInfo);
  router.post('/api/wxUser/update', authCommon, controller.wxUser.updateWxUser);
  router.get('/api/oss/upload-params', authCommon, controller.oss.getUploadParams); // oos存储
  // 伴侣绑定相关功能
  router.post('/api/partners/bind-request', authCommon, controller.partner.sendBindRequest); // 发送绑定请求
  router.post('/api/partners/unbind', authCommon, partnerRequired, controller.partner.unbindPartner); // 解除绑定关系
  router.get('/api/partners/bind-status', authCommon, controller.partner.getBindStatus); // 获取当前绑定状态
  
  router.post('/api/partners/bind-request/:requestId/accept', authCommon, controller.partner.acceptBindRequest); // 接受绑定请求
  router.post('/api/partners/bind-request/:requestId/reject', authCommon, controller.partner.rejectBindRequest); // 拒绝绑定请求
  router.get('/api/partners/bind-requests', authCommon, controller.partner.getBindRequests); // 获取绑定请求列表
  // 聊天相关：
  router.post('/api/chat/start', authCommon, controller.chat.start);
  router.get('/api/chat/query/:id', authCommon, controller.chat.query);
  router.get('/api/chat/history', authCommon, controller.chat.history);

  // 问卷调查：
  router.get('/api/questionnaire/init', authCommon, controller.questionnaire.init);
  router.get('/api/questionnaire/list', authCommon, controller.questionnaire.list);
  router.post('/api/questionnaire/submit', authCommon, controller.questionnaire.submit);
  router.get('/api/questionnaire/detail', authCommon, controller.questionnaire.detail);
  router.get('/api/questionnaire/friends',authCommon, controller.questionnaire.friends);
  router.post('/api/questionnaire/analyze', authCommon, controller.questionnaire.analyze);
  router.post('/api/questionnaire/addfriends', authCommon, controller.questionnaire.addFriends);
  // 获取GPT分析结果
  router.get(
    '/api/questionnaire/gptanalysis',
    authCommon,
    controller.questionnaire.getGptAnalysis
  );

  // 情绪记录相关路由
  router.post('/api/emotion/record', authCommon, controller.emotion.recordEmotion);
  router.get('/api/emotion/trend', authCommon, controller.emotion.getEmotionTrend);

  // 记忆拼图相关路由
  router.post(
    '/api/memory-puzzle/create',
    authCommon,
    partnerRequired,
    controller.memoryPuzzle.createPuzzle
  );
  router.get(
    '/api/memory-puzzle/:puzzleId',
    authCommon,
    controller.memoryPuzzle.getPuzzleResult
  );

  // 冲突记录相关路由
  router.post(
    '/api/conflict/record',
    authCommon,
    partnerRequired,
    controller.conflict.recordConflict
  );
  router.get(
    '/api/conflict/analysis',
    authCommon,
    controller.conflict.getConflictAnalysis
  );

  // 共情游戏相关路由
  router.get('/api/empathy/tasks', authCommon, partnerRequired, controller.empathy.getTasks);
  router.post(
    '/api/empathy/complete-task',
    authCommon,
    controller.empathy.completeTask
  );
  router.get('/api/empathy/progress', authCommon, controller.empathy.getProgress);

  // 成长档案相关路由
  router.get('/api/growth/archive', authCommon, controller.growth.getArchive);
  router.get('/api/growth/milestones', authCommon, controller.growth.getMilestones);

  router.get(
    '/api/empathy/current-task',
    authCommon,
    controller.empathy.getCurrentTask
  );
  router.get(
    '/api/empathy/task-history',
    authCommon,
    controller.empathy.getTaskHistory
  );

  // 激励系统
  router.post(
    '/api/behavior/record',
    authCommon,
    controller.behavior.recordBehavior
  );
  router.get(
    '/api/behavior/analysis',
    authCommon,
    controller.behavior.getBehaviorAnalysis
  );
  router.get(
    '/api/behavior/categories',
    authCommon,
    controller.behavior.getBehaviorCategories
  );

  // 花园数据
  router.get('/api/growth/garden-data', authCommon, controller.garden.getGardenData);
  // 积分相关
  router.get('/api/points/overview', authCommon, controller.points.getOverview); // 积分明细
  router.post('/api/points/record', authCommon, controller.points.recordBehavior);
  router.get('/api/points/exchange-items', authCommon, controller.points.getExchangeItems);
  router.post('/api/points/exchange-items', authCommon, controller.points.createExchangeItem);
  router.post('/api/points/exchange/complete', authCommon, controller.points.completeExchange);
  router.post('/api/points/exchange', authCommon, controller.points.exchange);
  router.get('/api/points/checkin/status', authCommon, controller.points.getCheckinStatus);

  // 消息系统相关路由
  router.get('/api/messages/all', authCommon, controller.message.getMessages);
  router.put('/api/messages/read/:messageId', authCommon, controller.message.markAsRead);

  // categories 问答问题相关：
  router.get('/api/categories', authCommon, controller.question.getCategories);
  router.get('/api/categories/:id', authCommon, controller.question.getCategoryDetail);
  router.get('/api/categories/:id/topics', authCommon, controller.question.getTopicsByCategory);
  router.get('/api/topics/:id/questions', authCommon, controller.question.getQuestionsByTopic);
  router.post('/api/topics/:id/unlock', authCommon, controller.question.unlockTopic);
  //  会话相关
  router.post('/api/sessions', authCommon, controller.session.createSession);
  router.get('/api/sessions', authCommon, controller.session.getUserSessions);
  router.get('/api/sessions/:id', authCommon, controller.session.getSessionDetail);
  router.post('/api/sessions/:id/invite', authCommon, controller.session.invitePartner);
  router.post('/api/sessions/:id/complete', authCommon, controller.session.completeSession);
  // 问题回答相关
  router.post('/api/sessions/:sessionId/answers', authCommon, controller.question.submitAnswer);
  router.get('/api/sessions/:sessionId/answers', authCommon, controller.question.getSessionAnswers);
  router.post('/api/sessions/:sessionId/results', authCommon, controller.question.saveSessionResults);
  
  // 在路由文件中添加注销路由
  router.post('/api/user/logout', authCommon, controller.user.logout);
};
