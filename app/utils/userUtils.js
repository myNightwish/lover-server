// app/utils/userUtils.js
const WxUser = require('../model/wx_user.js'); // 引入新的 wxUser 模型

// 根据 openid 查找微信用户
async function getUserByOpenId(openid) {
  return await WxUser.findOne({ where: { openid } }); // 使用 wxUser 模型查找
}

// 创建微信用户
async function createUser(openid, nickName, avatarUrl) {
  const wxUser = await WxUser.create({
    openid,
    nickName,
    avatarUrl,
  });
  return wxUser;
}

module.exports = {
  getUserByOpenId,
  createUser,
};
