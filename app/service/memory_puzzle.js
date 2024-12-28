const Service = require('egg').Service;

class MemoryPuzzleService extends Service {
  /**
   * 创建记忆拼图
   * @param userId
   * @param partnerId
   * @param description
   */
  async createPuzzle(userId, partnerId, description) {
    const { ctx } = this;

    try {
      const puzzle = await ctx.model.MemoryPuzzle.create({
        user_id: userId,
        partner_id: partnerId,
        event_description: description,
      });

      // 等待伴侣的描述后计算匹配度:todo
      // const partnerPuzzle = await this.waitForPartnerDescription(puzzle.id, partnerId);
      const partnerPuzzle = '跟你吃好吃的';

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
   * @param puzzleId
   * @param partnerId
   */
  async waitForPartnerDescription(puzzleId, partnerId) {
    const { ctx } = this;

    // 轮询检查伴侣是否提交描述，最多等待5分钟
    for (let i = 0; i < 10; i++) {
      const partnerPuzzle = await ctx.model.MemoryPuzzle.findOne({
        where: {
          user_id: partnerId,
          partner_id: ctx.user.id,
        },
        order: [[ 'created_at', 'DESC' ]],
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
   * @param puzzle1
   * @param puzzle2
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

  async getPuzzleResult(puzzleId) {
    const { ctx } = this;

    try {
      const puzzle = await ctx.model.MemoryPuzzle.findOne({
        where: { id: puzzleId },
        include: [{
          model: ctx.model.WxUser,
          as: 'partner',
        }],
      });

      if (!puzzle) {
        throw new Error('拼图不存在');
      }

      return {
        match_score: puzzle.match_score,
        partner_description: puzzle.partner?.event_description,
        // todo
        // analysis: await this.generatePuzzleAnalysis(puzzle),
      };
    } catch (error) {
      ctx.logger.error('[MemoryPuzzleService] Get puzzle result failed:', error);
      throw new Error('获取拼图结果失败');
    }
  }

  async generatePuzzleAnalysis(puzzle) {
    // 基于匹配度生成分析
    if (puzzle.match_score >= 90) {
      return '你们对这段回忆有着极其相似的感受，这体现了深厚的情感连接。';
    } else if (puzzle.match_score >= 70) {
      return '你们对这段回忆的主要细节都记得很清楚，这是很好的共同记忆。';
    } else if (puzzle.match_score >= 50) {
      return '你们对这段回忆有不同的侧重点，这反映了各自独特的视角。';
    }
    return '建议多交流这段回忆，分享各自的感受和想法。';

  }
}

module.exports = MemoryPuzzleService;
