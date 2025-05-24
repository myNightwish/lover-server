const Service = require('egg').Service;
const {
  DIMENSIONS,
  RELATIONSHIP_QUESTIONS,
  SELF_QUESTIONS,
  PARTENER_QUESTIONS,
  createQuestionnaireTemplate,
} = require('../const/totalQuestionaire.js');

class InitUserProgressService extends Service {
    /**
    * 初始化用户所有必要数据
    * @param {number} userId - 用户ID
    */
    async initializeUserData(userId) {
      const { ctx } = this;

      try {
        // 开启事务确保数据一致性
        const result = await ctx.model.transaction(async (transaction) => {
          // 1. 初始化积分系统
          await this.initializePoints(userId, transaction);

          // 2. 初始化共情任务
          await this.initializeEmpathyTasks(userId, transaction);

          // 3. 初始化问卷
          await this.initializeQuestionnaires(userId, transaction);

          return true;
        });

        return result;
      } catch (error) {
        ctx.logger.error(
          '[InitUserProgress] Initialize user data failed:',
          error
        );
        throw new Error('初始化用户数据失败');
      }
    }

    /**
    * 初始化积分系统
    */
    async initializePoints(userId, transaction) {
      const { ctx } = this;
      const INITIAL_POINTS = 50;

      // 创建积分余额
      await ctx.model.PointsBalance.create(
        {
          user_id: userId,
          balance: INITIAL_POINTS,
        },
        { transaction }
      );

      // 记录初始积分发放
      await ctx.model.PointsRecord.create(
        {
          user_id: 0, // 系统账号
          target_id: userId,
          type: 'system_init',
          points: INITIAL_POINTS,
          description: '系统初始赠予',
          category: 'system',
        },
        { transaction }
      );

      // 确保存在默认兑换项目
      const defaultItems = [
        {
          title: '15分钟按摩',
          description: '享受15分钟的放松按摩',
          points_cost: 15,
          is_system: true,
        },
        {
          title: '一个笑话',
          description: '听对方讲一个有趣的笑话',
          points_cost: 5,
          is_system: true,
        },
        {
          title: '深度倾听30分钟',
          description: '专注倾听对方分享30分钟',
          points_cost: 30,
          is_system: true,
        },
        {
          title: '做顿晚餐',
          description: '为对方准备一顿温暖的晚餐',
          points_cost: 50,
          is_system: true,
        },
      ];

      for (const item of defaultItems) {
        const existingItem = await ctx.model.ExchangeItem.findOne({
          where: { title: item.title, is_system: true },
          transaction,
        });

        if (!existingItem) {
          await ctx.model.ExchangeItem.create(item, { transaction });
        }
      }
    }

    /**
    * 初始化共情任务
    */
    async initializeEmpathyTasks(userId, transaction) {
      const { ctx } = this;

      // 创建用户进度记录
      await ctx.model.UserProgress.create(
        {
          user_id: userId,
          experience: 0,
        },
        { transaction }
      );

      // 确保存在默认任务
      const defaultTasks = [
        {
          title: '换位思考日记',
          description:
            '记录一件让伴侣感到困扰的事情，试着从Ta的角度思考和感受',
          exp_reward: 30,
          status: 'active',
        },
        {
          title: '感恩日记',
          description: '写下今天想要感谢伴侣的三件小事',
          exp_reward: 25,
          status: 'active',
        },
        {
          title: '深度倾听练习',
          description: '用15分钟时间专注倾听伴侣分享，不打断，只是倾听和理解',
          exp_reward: 35,
          status: 'active',
        },
        {
          title: '情绪识别挑战',
          description: '观察伴侣一天的情绪变化，尝试理解背后的原因',
          exp_reward: 28,
          status: 'active',
        },
        {
          title: '共同回忆',
          description: '和伴侣一起回忆一个快乐的时刻，分享各自的感受',
          exp_reward: 20,
          status: 'active',
        },
      ];

      for (const task of defaultTasks) {
        const existingTask = await ctx.model.EmpathyTask.findOne({
          where: { title: task.title },
          transaction,
        });

        if (!existingTask) {
          const createdTask = await ctx.model.EmpathyTask.create(task, {
            transaction,
          });

          // 为用户创建任务实例
          await ctx.model.UserTask.create(
            {
              user_id: userId,
              task_id: createdTask.id,
              completed: false,
            },
            { transaction }
          );
        }
      }
    }

    /**
    * 初始化问卷系统
    */
    async initializeQuestionnaires(userId, transaction) {
      const { ctx } = this;

      // 确保问卷维度存在
      const dimensions = await this.ensureQuestionnaireDimensions(transaction);

      // 确保问卷类型存在
      const types = await this.ensureQuestionnaireTypes(transaction);

      // 初始化问卷模板
      await this.initializeQuestionnaireTemplates(
        dimensions,
        types,
        transaction
      );

      // 为用户创建问卷实例
      const templates = await ctx.model.QuestionnaireTemplate.findAll({
        where: { status: 1 },
        transaction,
      });

      for (const template of templates) {
        await ctx.model.UserQuestionnaire.create(
          {
            user_id: userId,
            template_id: template.id,
            created_at: new Date(),
            updated_at: new Date(),
          },
          { transaction }
        );
      }
    }

    /**
    * 确保问卷维度存在
    */
    async ensureQuestionnaireDimensions(transaction) {
      const { ctx } = this;
      const dimensions = [
        {
          name: DIMENSIONS.COMMUNICATION_CONFLICT,
          description:
            '沟通是关系的基础，冲突解决能力直接决定矛盾是否升级（戈特曼研究所核心指标）',
          weight: 30,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: DIMENSIONS.TARGET_VALUE,
          description:
            '价值观差异是离婚主因之一（参考《中国离婚纠纷大数据报告》）',
          weight: 25,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: DIMENSIONS.TRUST_CONNECT,
          description:
            '信任缺失易导致猜忌，情感连接弱化预示关系疏离（依恋理论核心）',
          weight: 20,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: DIMENSIONS.POWER_BALANCE,
          description:
            '权力失衡易引发怨恨（社会交换理论），协作能力反映关系韧性',
          weight: 15,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: DIMENSIONS.CLOSE_NEED,
          description: '肢体亲密度满意度、情感表达方式匹配度',
          weight: 10,
          created_at: new Date(),
          updated_at: new Date(),
        }
      ];

      const createdDimensions = [];
      for (const dim of dimensions) {
        const [dimension] =
          await ctx.model.QuestionnaireDimension.findOrCreate({
            where: { name: dim.name },
            defaults: dim,
            transaction,
          });
        createdDimensions.push(dimension);
      }

      return createdDimensions;
    }

    /**
    * 确保问卷类型存在
    */
    async ensureQuestionnaireTypes(transaction) {
      const { ctx } = this;
      const types = [
        {
          code: 'self_awareness',
          name: '了解自己',
          description: '探索内心，发现真实的自己',
          need_partner: false,
          need_sync: false,
          analysis_type: 'self',
          status: 1,
        },
        {
          code: 'partner_awareness',
          name: '了解Ta',
          description: '深入了解你的另一半',
          need_partner: true,
          need_sync: false,
          analysis_type: 'partner',
          status: 1,
        },
        {
          code: 'relationship_assessment',
          name: '关系体检',
          description: '全面评估你们的关系状况',
          need_partner: true,
          need_sync: false,
          analysis_type: 'relationship',
          status: 1,
        },
      ];

      const createdTypes = [];
      for (const type of types) {
        const [questionnaireType] =
          await ctx.model.QuestionnaireType.findOrCreate({
            where: { code: type.code },
            defaults: type,
            transaction,
          });
        createdTypes.push(questionnaireType);
      }

      return createdTypes;
    }

    /**
    * 初始化问卷模板
    */
    async initializeQuestionnaireTemplates(dimensions, types, transaction) {
      const { ctx } = this;

      const templates = [
        {
          title: '了解自己',
          description: '探索内心，发现真实的自己',
          type_code: 'self_awareness',
          questions: SELF_QUESTIONS,
        },
        {
          title: '了解Ta',
          description: '深入了解你的另一半',
          type_code: 'partner_awareness',
          questions: PARTENER_QUESTIONS,
        },
        {
          title: '关系体检',
          description: '全面评估你们的关系状况',
          type_code: 'relationship_assessment',
          questions: RELATIONSHIP_QUESTIONS,
        },
      ];

      for (const template of templates) {
        const type = types.find((t) => t.code === template.type_code);
        if (!type) continue;

        const [questionnaireTemplate] =
          await ctx.model.QuestionnaireTemplate.findOrCreate({
            where: { title: template.title },
            defaults: {
              title: template.title,
              description: template.description,
              type_id: type.id,
              status: 1,
            },
            transaction,
          });
        // 创建问题
        for (const question of template.questions || []) {
          const dimension = dimensions.find(
            (d) => d.name === question.dimension
          );

          if (!dimension) continue;

          await ctx.model.QuestionTemplate.findOrCreate({
            where: {
              questionnaire_id: questionnaireTemplate.id,
              question_text: question.questionText,
            },
            defaults: {
              questionnaire_id: questionnaireTemplate.id,
              dimension_id: dimension.id,
              question_text: question.questionText,
              question_type: question.type,
              options: question.options,
              order: question.order,
            },
            transaction,
          });
        }
      }
    }
};

module.exports = InitUserProgressService;
