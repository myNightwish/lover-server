const Controller = require('egg').Controller;
const crypto = require('crypto');

class UserController extends Controller {
  // 用户注册
  async register() {
    const { ctx } = this;
    const data = ctx.request.body;
    
    try {
      // 验证数据
      ctx.validate({
        username: { type: 'string', required: true },
        password: { type: 'string', required: true },
        nickname: { type: 'string', required: false },
        email: { type: 'string', required: false },
        phone: { type: 'string', required: false },
      });
      
      // 检查用户名是否已存在
      const existingUser = await ctx.model.User.findOne({
        where: { username: data.username }
      });
      
      if (existingUser) {
        ctx.body = {
          success: false,
          message: '用户名已存在'
        };
        return;
      }
      
      // 加密密码
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync(data.password, salt, 1000, 64, 'sha512').toString('hex');
      
      // 创建用户
      const user = await ctx.model.User.create({
        username: data.username,
        password: hash,
        salt,
        nickname: data.nickname || data.username,
        email: data.email,
        phone: data.phone,
        avatar: data.avatar || '/static/images/default-avatar.png',
        status: 'active',
        role: 'user'
      });
      
      // 生成token
      const token = await ctx.service.auth.generateToken(user);
      
      // 返回用户信息和token
      ctx.body = {
        success: true,
        data: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          token
        }
      };
    } catch (error) {
      ctx.body = {
        success: false,
        message: error.message || '注册失败'
      };
    }
  }

  // 用户登录
  async login() {
    const { ctx } = this;
    const { username, password } = ctx.request.body;
    
    try {
      // 验证数据
      ctx.validate({
        username: { type: 'string', required: true },
        password: { type: 'string', required: true }
      });
      
      // 查找用户
      const user = await ctx.model.User.findOne({
        where: { username }
      });
      
      if (!user) {
        ctx.body = {
          success: false,
          message: '用户名或密码错误'
        };
        return;
      }
      
      // 验证密码
      const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
      if (hash !== user.password) {
        ctx.body = {
          success: false,
          message: '用户名或密码错误'
        };
        return;
      }
      
      // 生成token
      const token = await ctx.service.auth.generateToken(user);
      
      // 返回用户信息和token
      ctx.body = {
        success: true,
        data: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          token
        }
      };
    } catch (error) {
      ctx.body = {
        success: false,
        message: error.message || '登录失败'
      };
    }
  }

  // 获取当前用户信息
  async getCurrentUser() {
    const { ctx } = this;
    
    try {
      // 获取当前用户
      const user = await ctx.model.User.findByPk(ctx.user.id);
      
      if (!user) {
        ctx.body = {
          success: false,
          message: '用户不存在'
        };
        return;
      }
      
      // 返回用户信息
      ctx.body = {
        success: true,
        data: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          partner_id: user.partner_id,
          created_at: user.created_at
        }
      };
    } catch (error) {
      ctx.body = {
        success: false,
        message: '获取用户信息失败'
      };
    }
  }

  // 更新用户信息
  async updateUser() {
    const { ctx } = this;
    const data = ctx.request.body;
    
    try {
      // 获取当前用户
      const user = await ctx.model.User.findByPk(ctx.user.id);
      
      if (!user) {
        ctx.body = {
          success: false,
          message: '用户不存在'
        };
        return;
      }
      
      // 更新用户信息
      const updateData = {};
      
      if (data.nickname) updateData.nickname = data.nickname;
      if (data.email) updateData.email = data.email;
      if (data.phone) updateData.phone = data.phone;
      if (data.avatar) updateData.avatar = data.avatar;
      
      // 如果要更新密码，需要验证旧密码
      if (data.newPassword && data.oldPassword) {
        const hash = crypto.pbkdf2Sync(data.oldPassword, user.salt, 1000, 64, 'sha512').toString('hex');
        if (hash !== user.password) {
          ctx.body = {
            success: false,
            message: '旧密码错误'
          };
          return;
        }
        
        // 更新密码
        const salt = crypto.randomBytes(16).toString('hex');
        const newHash = crypto.pbkdf2Sync(data.newPassword, salt, 1000, 64, 'sha512').toString('hex');
        
        updateData.password = newHash;
        updateData.salt = salt;
      }
      
      await user.update(updateData);
      
      // 返回更新后的用户信息
      ctx.body = {
        success: true,
        data: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          partner_id: user.partner_id
        }
      };
    } catch (error) {
      ctx.body = {
        success: false,
        message: error.message || '更新用户信息失败'
      };
    }
  }

  // 绑定伴侣
  async bindPartner() {
    const { ctx } = this;
    const { partnerCode } = ctx.request.body;
    
    try {
      // 验证数据
      ctx.validate({
        partnerCode: { type: 'string', required: true }
      });
      
      // 获取当前用户
      const user = await ctx.model.User.findByPk(ctx.user.id);
      
      if (!user) {
        ctx.body = {
          success: false,
          message: '用户不存在'
        };
        return;
      }
      
      // 如果已经绑定伴侣，不能再次绑定
      if (user.partner_id) {
        ctx.body = {
          success: false,
          message: '您已经绑定了伴侣'
        };
        return;
      }
      
      // 查找伴侣
      const partner = await ctx.model.User.findOne({
        where: { bind_code: partnerCode }
      });
      
      if (!partner) {
        ctx.body = {
          success: false,
          message: '伴侣绑定码无效'
        };
        return;
      }
      
      // 不能绑定自己
      if (partner.id === user.id) {
        ctx.body = {
          success: false,
          message: '不能绑定自己为伴侣'
        };
        return;
      }
      
      // 如果伴侣已经绑定了其他人，不能绑定
      if (partner.partner_id && partner.partner_id !== user.id) {
        ctx.body = {
          success: false,
          message: '该伴侣已经绑定了其他用户'
        };
        return;
      }
      
      // 绑定伴侣
      await user.update({ partner_id: partner.id });
      await partner.update({ partner_id: user.id });
      
      // 返回绑定结果
      ctx.body = {
        success: true,
        data: {
          id: user.id,
          partner_id: partner.id,
          partner_nickname: partner.nickname,
          partner_avatar: partner.avatar
        }
      };
    } catch (error) {
      ctx.body = {
        success: false,
        message: error.message || '绑定伴侣失败'
      };
    }
  }

  // 解绑伴侣
  async unbindPartner() {
    const { ctx } = this;
    
    try {
      // 获取当前用户
      const user = await ctx.model.User.findByPk(ctx.user.id);
      
      if (!user) {
        ctx.body = {
          success: false,
          message: '用户不存在'
        };
        return;
      }
      
      // 如果没有绑定伴侣，不需要解绑
      if (!user.partner_id) {
        ctx.body = {
          success: false,
          message: '您还没有绑定伴侣'
        };
        return;
      }
      
      // 获取伴侣
      const partner = await ctx.model.User.findByPk(user.partner_id);
      
      // 解绑伴侣
      await user.update({ partner_id: null });
      
      // 如果伴侣存在，也解绑伴侣
      if (partner) {
        await partner.update({ partner_id: null });
      }
      
      // 返回解绑结果
      ctx.body = {
        success: true,
        message: '解绑伴侣成功'
      };
    } catch (error) {
      ctx.body = {
        success: false,
        message: error.message || '解绑伴侣失败'
      };
    }
  }

  // 生成伴侣绑定码
  async generateBindCode() {
    const { ctx } = this;
    
    try {
      // 获取当前用户
      const user = await ctx.model.User.findByPk(ctx.user.id);
      
      if (!user) {
        ctx.body = {
          success: false,
          message: '用户不存在'
        };
        return;
      }
      
      // 生成绑定码
      const bindCode = crypto.randomBytes(3).toString('hex').toUpperCase();
      
      // 更新用户绑定码
      await user.update({ bind_code: bindCode });
      
      // 返回绑定码
      ctx.body = {
        success: true,
        data: {
          bind_code: bindCode
        }
      };
    } catch (error) {
      ctx.body = {
        success: false,
        message: error.message || '生成绑定码失败'
      };
    }
  }

  // 获取伴侣信息
  async getPartnerInfo() {
    const { ctx } = this;
    
    try {
      // 获取当前用户
      const user = await ctx.model.User.findByPk(ctx.user.id);
      
      if (!user) {
        ctx.body = {
          success: false,
          message: '用户不存在'
        };
        return;
      }
      
      // 如果没有绑定伴侣
      if (!user.partner_id) {
        ctx.body = {
          success: false,
          message: '您还没有绑定伴侣'
        };
        return;
      }
      
      // 获取伴侣信息
      const partner = await ctx.model.User.findByPk(user.partner_id);
      
      if (!partner) {
        ctx.body = {
          success: false,
          message: '伴侣不存在'
        };
        return;
      }
      
      // 返回伴侣信息
      ctx.body = {
        success: true,
        data: {
          id: partner.id,
          username: partner.username,
          nickname: partner.nickname,
          avatar: partner.avatar,
          bind_date: user.updated_at // 使用更新时间作为绑定时间
        }
      };
    } catch (error) {
      ctx.body = {
        success: false,
        message: error.message || '获取伴侣信息失败'
      };
    }
  }

  // 获取用户的会话列表
  async getUserSessions() {
    const { ctx } = this;
    
    try {
      // 获取用户创建的会话
      const createdSessions = await ctx.model.QuestionSession.findAll({
        where: { creator_id: ctx.user.id },
        include: [
          {
            model: ctx.model.User,
            as: 'Creator',
            attributes: ['id', 'username', 'nickname', 'avatar']
          },
          {
            model: ctx.model.User,
            as: 'Partner',
            attributes: ['id', 'username', 'nickname', 'avatar']
          },
          {
            model: ctx.model.QuestionCategory,
            as: 'Category',
            attributes: ['id', 'name', 'description', 'icon']
          }
        ],
        order: [['created_at', 'DESC']]
      });
      
      // 获取用户参与的会话（作为伴侣）
      const participatedSessions = await ctx.model.QuestionSession.findAll({
        where: { partner_id: ctx.user.id },
        include: [
          {
            model: ctx.model.User,
            as: 'Creator',
            attributes: ['id', 'username', 'nickname', 'avatar']
          },
          {
            model: ctx.model.User,
            as: 'Partner',
            attributes: ['id', 'username', 'nickname', 'avatar']
          },
          {
            model: ctx.model.QuestionCategory,
            as: 'Category',
            attributes: ['id', 'name', 'description', 'icon']
          }
        ],
        order: [['created_at', 'DESC']]
      });
      
      // 合并会话列表
      const allSessions = [...createdSessions, ...participatedSessions];
      
      // 按创建时间排序
      allSessions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      // 返回会话列表
      ctx.body = {
        success: true,
        data: allSessions
      };
    } catch (error) {
      ctx.body = {
        success: false,
        message: error.message || '获取用户会话列表失败'
      };
    }
  }

  // 获取用户的问答统计
  async getUserStats() {
    const { ctx } = this;
    
    try {
      // 获取用户创建的会话数量
      const createdSessionsCount = await ctx.model.QuestionSession.count({
        where: { creator_id: ctx.user.id }
      });
      
      // 获取用户参与的会话数量
      const participatedSessionsCount = await ctx.model.QuestionSession.count({
        where: { partner_id: ctx.user.id }
      });
      
      // 获取用户完成的会话数量
      const completedSessionsCount = await ctx.model.QuestionSession.count({
        where: { 
          [ctx.app.Sequelize.Op.or]: [
            { creator_id: ctx.user.id },
            { partner_id: ctx.user.id }
          ],
          status: 'completed'
        }
      });
      
      // 获取用户回答的问题数量
      const answeredQuestionsCount = await ctx.model.QuestionAnswer.count({
        where: { user_id: ctx.user.id }
      });
      
      // 获取用户的平均匹配度
      const sessions = await ctx.model.QuestionSession.findAll({
        where: { 
          [ctx.app.Sequelize.Op.or]: [
            { creator_id: ctx.user.id },
            { partner_id: ctx.user.id }
          ],
          status: 'completed',
          similarity_percentage: { [ctx.app.Sequelize.Op.ne]: null }
        },
        attributes: ['similarity_percentage']
      });
      
      let averageSimilarity = 0;
      if (sessions.length > 0) {
        const totalSimilarity = sessions.reduce((sum, session) => sum + session.similarity_percentage, 0);
        averageSimilarity = Math.round(totalSimilarity / sessions.length);
      }
      
      // 返回统计数据
      ctx.body = {
        success: true,
        data: {
          created_sessions_count: createdSessionsCount,
          participated_sessions_count: participatedSessionsCount,
          completed_sessions_count: completedSessionsCount,
          answered_questions_count: answeredQuestionsCount,
          average_similarity: averageSimilarity
        }
      };
    } catch (error) {
      ctx.body = {
        success: false,
        message: error.message || '获取用户统计数据失败'
      };
    }
  }

  // 获取用户的收藏问题
  async getFavoriteQuestions() {
    const { ctx } = this;
    
    try {
      // 获取用户收藏的问题
      const favorites = await ctx.model.UserFavorite.findAll({
        where: { user_id: ctx.user.id, type: 'question' },
        include: [
          {
            model: ctx.model.Question,
            as: 'Question',
            include: [
              {
                model: ctx.model.QuestionCategory,
                as: 'Category',
                attributes: ['id', 'name', 'icon']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      });
      
      // 返回收藏问题列表
      ctx.body = {
        success: true,
        data: favorites.map(favorite => favorite.Question)
      };
    } catch (error) {
      ctx.body = {
        success: false,
        message: error.message || '获取用户收藏问题失败'
      };
    }
  }

  // 添加收藏问题
  async addFavoriteQuestion() {
    const { ctx } = this;
    const { questionId } = ctx.request.body;
    
    try {
      // 验证数据
      ctx.validate({
        questionId: { type: 'number', required: true }
      });
      
      // 检查问题是否存在
      const question = await ctx.model.Question.findByPk(questionId);
      
      if (!question) {
        ctx.body = {
          success: false,
          message: '问题不存在'
        };
        return;
      }
      
      // 检查是否已经收藏
      const existingFavorite = await ctx.model.UserFavorite.findOne({
        where: {
          user_id: ctx.user.id,
          question_id: questionId,
          type: 'question'
        }
      });
      
      if (existingFavorite) {
        ctx.body = {
          success: false,
          message: '已经收藏过该问题'
        };
        return;
      }
      
      // 添加收藏
      await ctx.model.UserFavorite.create({
        user_id: ctx.user.id,
        question_id: questionId,
        type: 'question'
      });
      
      // 返回结果
      ctx.body = {
        success: true,
        message: '收藏问题成功'
      };
    } catch (error) {
      ctx.body = {
        success: false,
        message: error.message || '收藏问题失败'
      };
    }
  }

  // 取消收藏问题
  async removeFavoriteQuestion() {
    const { ctx } = this;
    const { questionId } = ctx.request.body;
    
    try {
      // 验证数据
      ctx.validate({
        questionId: { type: 'number', required: true }
      });
      
      // 查找收藏记录
      const favorite = await ctx.model.UserFavorite.findOne({
        where: {
          user_id: ctx.user.id,
          question_id: questionId,
          type: 'question'
        }
      });
      
      if (!favorite) {
        ctx.body = {
          success: false,
          message: '未收藏该问题'
        };
        return;
      }
      
      // 删除收藏
      await favorite.destroy();
      
      // 返回结果
      ctx.body = {
        success: true,
        message: '取消收藏成功'
      };
    } catch (error) {
      ctx.body = {
        success: false,
        message: error.message || '取消收藏问题失败'
      };
    }
  }
}

module.exports = UserController;