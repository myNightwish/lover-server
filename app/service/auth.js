// app/service/auth.js
const Service = require('egg').Service;
const jwt = require('jsonwebtoken'); // 确保安装了 jwt 库：npm install jsonwebtoken

class AuthService extends Service {
  // 验证 Token 并返回用户信息
  async verifyToken(token) {
    const { app } = this;

    let decoded;
    try {
      decoded = jwt.verify(token, app.config.jwt.secret);
    } catch (err) {
      console.log('解析错误------', err);

    }
    // 根据解码信息查找用户
    let user;
    try {
      user = await this.ctx.model.User.findByPk(decoded.id);
    } catch (err) {
      console.log('解码信息错误------', err);

    }

    // 返回简单的用户信息（避免返回整个 Sequelize 实例）
    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
    // return user; // 返回用户信息
  }
}

module.exports = AuthService;
