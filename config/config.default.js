/* eslint valid-jsdoc: "off" */

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
const path = require('path');
require('dotenv').config();
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1732811219584_6592';
  // JWT配置
  config.jwt = {
    secret: 'pipilovewater', // 访问令牌密钥
    refreshSecret: 'pipijiang', // 刷新令牌密钥
    expiresIn: '3h', // 访问令牌过期时间
    refreshExpiresIn: '7d' // 刷新令牌过期时间
  };
  config.rabbitmq = {
    url: process.env.RABBITMQ_URL,
    queues: {
      chatGPT: 'chatgpt_queue',
    },
  };
  config.redis = {
    client: {
      host: 'localhost', // Redis 服务器地址
      port: '6379', // Redis 端口号，默认是 6379
      password: '', // 如果 Redis 有密码，设置密码，否则可以为空
      db: 0, // 使用的数据库索引，默认是 0
    },
  };
  config.openai = {
    apiKey: process.env.OPENAI_API_KEY,
    maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS, 10),
    baseURL: process.env.AI_BASE_URL,
  };
   // 静态文件配置
   config.static = {
    prefix: '/public/',
    dir: path.join(appInfo.baseDir, 'app/public'),
  };
  // add your middleware config here
  config.middleware = [];
  config.cors = {
    origin: '*', // 或者指定允许的源
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  };
  config.security = {
    csrf: {
      enable: false,
      ignoreJSON: true,
    },
    // domainWhiteList: [ 'http://localhost:5173' ],
    // allowOrigins: [ 'http://localhost:5173', 'http://example.com'],
  };
  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  config.sequelize = {
    dialect: 'sqlite', // 默认使用 sqlite
    storage:
      process.env.NODE_ENV === 'production'
        ? 'database_prod.sqlite'
        : 'database_dev.sqlite', // 根据环境选择存储文件
    // old类型：
    // dialect: 'mysql', // 数据库类型
    // 对于 MySQL 等数据库，使用环境变量设置数据库连接参数：
    host: process.env.NODE_ENV === 'production' ? '43.140.193.60' : '127.0.0.1', // 根据环境选择数据库主机
    port: 3306, // 如果是 MySQL 数据库，使用端口 3306
    database:
      process.env.NODE_ENV === 'production'
        ? 'relationGrowth_prod'
        : 'relationGrowth_dev', // 根据环境选择数据库名称
    username: 'root', // 默认使用 root 用户
    password: '', // 默认密码
    define: {
      freezeTableName: true, // 是否冻结表名
      timestamps: false, // 是否自动添加 `createdAt` 和 `updatedAt`
    },
  };
  config.oss = {
    accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
    accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
    bucketHost: process.env.OSS_BUCKET_HOST,
    timeout: 1, // Policy有效时间（小时）
    maxSize: 10, // 最大上传文件大小（MB）
  };
  return {
    ...config,
    ...userConfig,
  };
};
