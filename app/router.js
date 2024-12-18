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
  router.post('/api/questionnaire/submit', authWx, controller.questionnaire.submit);
  router.get('/api/questionnaire/detail', authWx, controller.questionnaire.detail);
  router.get('/api/questionnaire/friends', authWx, controller.questionnaire.friends);
  router.post('/api/questionnaire/analyze', authWx, controller.questionnaire.analyze);
  router.post('/api/questionnaire/addfriends', authWx, controller.questionnaire.addFriends);
  // 获取GPT分析结果
  router.get('/api/questionnaire/gptanalysis', authWx, controller.questionnaire.getGptAnalysis);

  // oos存储
  router.get('/api/oss/upload-params', authWx, controller.oss.getUploadParams);
  router.post('/api/wxUser/update', authWx, controller.wxUser.updateWxUser);
};
