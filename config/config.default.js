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
  config.jwt = {
    secret: '1234', // 替换为实际的密钥
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
    dialect: 'sqlite', // 修改为 sqlite
    storage: 'database.sqlite', // SQLite 文件路径
    // old类型：
    // dialect: 'mysql', // 数据库类型
    host: 'localhost', // 数据库地址
    port: 3306, // 数据库端口
    database: 'relationGrowth', // 数据库名
    username: 'root', // 用户名
    password: '', // 密码
    // timezone: '+08:00', // 设置时区
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
