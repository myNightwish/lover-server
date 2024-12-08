/* eslint valid-jsdoc: "off" */

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
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
      port: '6379',      // Redis 端口号，默认是 6379
      password: '',      // 如果 Redis 有密码，设置密码，否则可以为空
      db: 0,             // 使用的数据库索引，默认是 0
    },
  };
  config.openai = {
    apiKey: process.env.OPENAI_API_KEY || "sk-Gdz6my6Hh52tLBfDE57b413046Dd4e4cAa3003E0Db73D43c",
    maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS, 10) || 50,
    baseURL: process.env.AI_BASE_URL || 'https://vip.apiyi.com/v1',
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
    dialect: 'mysql', // 数据库类型
    host: 'localhost', // 数据库地址
    port: 3306, // 数据库端口
    database: 'shoppingList', // 数据库名
    username: 'root', // 用户名
    password: '', // 密码
    timezone: '+08:00', // 设置时区
    define: {
      freezeTableName: true, // 是否冻结表名
      timestamps: false,     // 是否自动添加 `createdAt` 和 `updatedAt`
    },
  };
  return {
    ...config,
    ...userConfig,
  };
};
