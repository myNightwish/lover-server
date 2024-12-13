/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const authWx = require('./middleware/wxAuth.js');
  // 加载中间件
  const auth = app.middleware.auth();
  router.post('/api/register', controller.auth.register);
  router.post('/api/login', controller.auth.login);
  // 家庭群组相关路由
  router.get('/api/families', auth, controller.family.getFamilies); // 获取当前用户关联的家庭群组
  router.post('/api/families/create', auth, controller.family.create); // 创建家庭群组
  router.post('/api/families/:familyId/invite', auth, controller.family.invite); // 邀请成员加入家庭
  router.post('/api/families/:invitationId/accept', controller.family.acceptInvitation); // 接受邀请
  router.delete('/api/families/:familyId', auth, controller.family.deleteFamily); // 解散群组
  // 邀请
  router.get('/api/invitations', auth, controller.family.getInvitations); // 获取邀请列表
  router.post('/api/invitations/:invitationId/accept', auth, controller.family.acceptInvitation); // 同意邀请
  router.post('/api/invitations/:invitationId/reject', auth, controller.family.rejectInvitation); // 拒绝邀请
  // 购物清单
  router.get('/api/lists/all', auth, controller.shoppingList.getAllShoppingLists); // 获取清单列表
  router.post('/api/lists/create', auth, controller.shoppingList.create); // 创建清单
  router.post('/api/lists/markpurchased', auth, controller.shoppingList.markItemsAsPurchased); // 标记购买
  router.get('/api/user/info', auth, controller.user.getUserInfo); // 获取用户身份信息

  // 微信小程序登录
  router.post('/api/loginAndAutoSignUp', controller.wxUser.loginAndAutoSignUp);

  // Chat routes
  router.post('/api/chat/start', controller.chat.start);
  router.get('/api/chat/query/:id', controller.chat.query);
  router.get('/api/chat/history', controller.chat.history);
  router.get('/api/chat/test', controller.chat.test);

  // 问卷调查
  router.get('/api/questionnaire/init', authWx, controller.questionnaire.init);
  router.get('/api/questionnaire/list', authWx, controller.questionnaire.list);
  router.post('/api/questionnaire/submit', authWx, controller.questionnaire.submit);
  router.get('/api/questionnaire/detail', authWx, controller.questionnaire.detail);
  router.get('/api/questionnaire/friends', authWx, controller.questionnaire.friends);
};
