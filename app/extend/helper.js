// app/extend/helper.js
const axios = require('axios');

module.exports = {
  async getWeChatUserInfo(code) {
    // 使用微信的 API 获取用户信息
    const appid = 'wxdaf83a61aa973ca1';
    const secret = '4c5216ff5bc30066641ac7f1b61925ee';
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;

    try {
      const response = await axios.get(url);
      const { openid, unionid, errcode } = response.data;

      if (errcode) {
        throw new Error(`微信 API 错误：${errcode}`);
      }

      // 返回用户信息
      return { openid, unionid };
    } catch (err) {
      throw new Error(`获取微信用户信息失败：${err.message}`);
    }
  },
  success(data = null, message = 'success') {
    return {
      success: true,
      data,
      message,
    };
  },

  error(message = 'error', status = 400) {
    return {
      success: false,
      error: message,
      status,
    };
  },

  formatConversation(conversation) {
    return {
      id: conversation.id,
      question: conversation.question,
      answer: conversation.answer,
      status: conversation.status,
      tokenCount: conversation.tokenCount,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  },
};
