const Controller = require('egg').Controller;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthController extends Controller {
  async register() {
    const { ctx } = this;
    const { username, password, email } = ctx.request.body;

    // 检查用户是否已存在
    const existingUser = await ctx.model.User.findOne({ where: { email } });
    if (existingUser) {
      ctx.throw(400, {
        message: 'User with this email already exists',
      });
    }

    // 哈希密码（如果需要，使用 bcrypt）
    const hashedPassword = await bcrypt.hash(password, 10);
    // const hashedPassword = password;

    // 创建新用户
    const user = await ctx.model.User.create({
      username,
      password: hashedPassword,
      email,
    });

    ctx.body = {
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async login() {
    const { ctx, app } = this;
    const { email, password } = ctx.request.body;

    // 根据邮箱查找用户
    const user = await ctx.model.User.findOne({ where: { email } });
    if (!user) {
      ctx.throw(400, { msg: '用户未找到' });
    }

    // 验证密码（如果需要，使用 bcrypt）
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      ctx.throw(400, '密码错误');
    }

    // 生成 JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      app.config.jwt.secret, // 推荐将 JWT 密钥配置化
      { expiresIn: '1h' }
    );

    ctx.body = {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }
}

module.exports = AuthController;
