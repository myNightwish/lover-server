const Service = require('egg').Service;

class FriendService extends Service {
  /**
   * 创建双向好友关系
   * @param {number} userId - 用户ID
   * @param {number} friendId - 好友ID
   * @param {object} transaction - 数据库事务对象
   */
  async createFriendRelationship(userId, friendId, transaction) {
    const { ctx } = this;

    // 验证用户是否存在
    await this.validateUsers(userId, friendId);

    // 检查是否已经是好友
    const existingFriendship = await ctx.model.UserFriend.findOne({
      where: {
        user_id: userId,
        friend_id: friendId,
      },
    });

    if (existingFriendship) {
      return { message: '已经是好友关系' };
    }

    // 创建双向好友关系
    await Promise.all([
      ctx.model.UserFriend.create({
        user_id: userId,
        friend_id: friendId,
        created_at: new Date(),
        updated_at: new Date(),
      }, { transaction }),
      ctx.model.UserFriend.create({
        user_id: friendId,
        friend_id: userId,
        created_at: new Date(),
        updated_at: new Date(),
      }, { transaction }),
    ]);

    return { message: '好友关系建立成功' };
  }

  /**
   * 验证用户是否存在
   * @param userId
   * @param friendId
   */
  async validateUsers(userId, friendId) {
    const { ctx } = this;
    const [ user, friend ] = await Promise.all([
      ctx.model.WxUser.findByPk(userId),
      ctx.model.WxUser.findByPk(friendId),
    ]);

    if (!user || !friend) {
      throw new Error('用户不存在');
    }

    if (userId === friendId) {
      throw new Error('不能添加自己为好友');
    }
  }

  /**
   * 获取用户的好友列表
   * @param {number} userId - 用户ID
   */
  async getFriendList(userId) {
    const { ctx } = this;

    // 查询好友列表
    const friends = await ctx.model.UserFriend.findAll({
      where: { user_id: userId },
      include: [{
        model: ctx.model.WxUser,
        as: 'friend', // 必须和关联别名一致
        attributes: [ 'id', 'nickName', 'avatarUrl' ], // 只获取需要的字段
      }, {
        model: ctx.model.QuestionnaireScore, // 加入 QuestionnaireScore 关联
        as: 'questionnaireScores', // 关联别名
        required: false, // 不强制匹配，允许没有得分数据
        attributes: [ 'questionnaire_id', 'scores' ], // 获取问卷 ID 和得分数据
        include: [
          {
            model: ctx.model.QuestionnaireTemplate, // 加入问卷模板的关联
            as: 'questionnaire_template', // 关联别名
            attributes: [ 'id', 'title' ], // 获取问卷的标题
          },
        ],
      }],
      order: [[ 'created_at', 'DESC' ]], // 根据添加时间倒序
    });

    // 格式化返回结果
    return friends.map(f => ({
      friendId: f.friend?.id || 0, // 从关联的 friend 对象获取 ID
      nickName: f.friend?.nickName || '未设置昵称', // 从关联的 friend 对象获取昵称
      avatarUrl: f.friend?.avatarUrl || 'https://m.duitang.com/blogs/tag/?name=%E5%88%98%E4%BA%A6%E8%8F%B2%E5%B0%8F%E9%BE%99%E5%A5%B3', // 从关联的 friend 对象获取头像
      createdAt: f.created_at,
      questionnaireScores: f.questionnaireScores && f.questionnaireScores.map(score => ({
        questionnaireId: score.questionnaire_id, // 获取问卷 ID
        scores: score.scores, // 获取得分数据
        questionnaireTitle: score.questionnaire_template?.title || '未找到问卷', // 获取问卷标题
      })) || [], // 如果没有得分数据，返回空数组
    }));
  }
  async addFriends(userId, shareId) {
    const { ctx } = this;
    if (shareId && shareId !== userId) {
      try {
        // 开启事务
        const transaction = await ctx.model.transaction();
        const res = await this.createFriendRelationship(userId, shareId, transaction);
        // 提交事务
        await transaction.commit();
        return res;
      } catch (err) {
        console.log('create error');
        throw new Error('建立好友失败');
      }
    }
  }
}

module.exports = FriendService;
