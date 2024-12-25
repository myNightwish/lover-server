const Service = require('egg').Service;

class MemoryPuzzleService extends Service {
  /**
   * 创建记忆拼图
   */
  async createPuzzle(userId, partnerId, description) {
    const { ctx } = this;
    
    try {
      const puzzle = await ctx.model.MemoryPuzzle.create({
        user_id: userId,
        partner_id: partnerId,
        event_description: description,
      });

      // 等待伴侣的描述后计算匹配度
      const partnerPuzzle = await this.waitForPartnerDescription(puzzle.id, partnerId);
      if (partnerPuzzle) {
        const matchScore = await this.calculateMatchScore(puzzle, partnerPuzzle);
        await puzzle.update({ match_score: matchScore });
      }

      return puzzle;
    } catch (error) {
      ctx.logger.error('[MemoryPuzzleService] Create puzzle failed:', error);
      throw new Error('创建记忆拼图失败');
    }
  }

  /**
   * 等待伴侣描述
   */
  async waitForPartnerDescription(puzzleId, partnerId) {
    const { ctx } = this;
    
    // 轮询检查伴侣是否提交描述，最多等待5分钟
    for (let i = 0; i < 30; i++) {
      const partnerPuzzle = await ctx.model.MemoryPuzzle.findOne({
        where: {
          user_id: partnerId,
          partner_id: ctx.user.id,
        },
        order: [['created_at', 'DESC']],
      });

      if (partnerPuzzle) {
        return partnerPuzzle;
      }

      await new Promise(resolve => setTimeout(resolve, 10000)); // 等待10秒
    }

    return null;
  }

  /**
   * 计算描述匹配度
   */
  async calculateMatchScore(puzzle1, puzzle2) {
    const { ctx } = this;
    
    // 使用GPT分析两段描述的相似度
    const similarity = await ctx.service.openai.analyzeSimilarity(
      puzzle1.event_description,
      puzzle2.event_description
    );

    return similarity * 100; // 转换为百分比
  }
}

module.exports = MemoryPuzzleService;