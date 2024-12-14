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
      ctx.model.UsWxUserer.findByPk(userId),
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
      }],
      order: [[ 'created_at', 'DESC' ]], // 根据添加时间倒序
    });
    console.log('friends000', friends);

    // 格式化返回结果
    return friends.map(f => ({
      friendId: f.friend?.id || 0, // 从关联的 friend 对象获取 ID
      nickName: f.friend?.nickName || '未设置昵称', // 从关联的 friend 对象获取昵称
      avatarUrl: f.friend?.avatarUrl || 'https://m.duitang.com/blogs/tag/?name=%E5%88%98%E4%BA%A6%E8%8F%B2%E5%B0%8F%E9%BE%99%E5%A5%B3', // 从关联的 friend 对象获取头像
      createdAt: f.created_at,
    }));
  }
  async addFriends(userId, shareId) {
    const { ctx } = this;
    if (shareId && shareId !== userId) {
      try {
        // 开启事务
        const transaction = await ctx.model.transaction();
        await this.createFriendRelationship(userId, shareId, transaction);
        // 提交事务
        await transaction.commit();
      } catch (err) {
        console.log('create error');
      }
    }
  }
}

module.exports = FriendService;
