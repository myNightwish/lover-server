const Service = require('egg').Service;

class QuestionnaireMigrationService extends Service {
  /**
   * 迁移问卷分析数据
   */
  async migrateAnalysisData() {
    const { ctx } = this;

    try {
      // 获取所有旧的分析数据
      const oldAnalyses = await ctx.model.QuestionnaireAnalysisBack.findAll();

      // 批量迁移数据
      for (const analysis of oldAnalyses) {
        const user = await ctx.model.WxUser.findByPk(analysis.user_id);
        if (!user?.partner_id) continue;

        await ctx.model.QuestionnaireAnalysis.create({
          user_id: analysis.user_id,
          partner_id: user.partner_id,
          content: {
            scores: JSON.parse(analysis.scores || '{}'),
            analysis: JSON.parse(analysis.analysis_result || '{}'),
            gptAnalysis: JSON.parse(analysis.gpt_analysis || '{}'),
            gptStatus: analysis.gpt_status,
          },
        });
      }

      return {
        success: true,
        message: '数据迁移完成',
      };
    } catch (error) {
      ctx.logger.error('[QuestionnaireMigration] Migration failed:', error);
      throw new Error('数据迁移失败');
    }
  }

  /**
   * 验证迁移结果
   */
  async validateMigration() {
    const { ctx } = this;

    try {
      const oldCount = await ctx.model.QuestionnaireAnalysisBack.count();
      const newCount = await ctx.model.QuestionnaireAnalysis.count();

      const validUsers = await ctx.model.WxUser.count({
        where: {
          partner_id: {
            [ctx.model.Sequelize.Op.not]: null,
          },
        },
      });

      return {
        success: true,
        data: {
          oldRecords: oldCount,
          newRecords: newCount,
          validUsers,
          migrationRate: `${((newCount / oldCount) * 100).toFixed(2)}%`,
        },
      };
    } catch (error) {
      ctx.logger.error('[QuestionnaireMigration] Validation failed:', error);
      throw new Error('迁移验证失败');
    }
  }
}

module.exports = QuestionnaireMigrationService;
