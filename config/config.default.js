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
  // add your middleware config here
  config.middleware = [];
  config.security = {
    csrf: {
      enable: false,
    },
    domainWhiteList: [ 'http://localhost:5173' ],
    allowOrigins: [ 'http://localhost:5173', 'http://example.com' ],
  };
  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  config.sequelize = {
    dialect: 'mysql', // 数据库类型
    host: '127.0.0.1', // 数据库地址
    port: 3306, // 数据库端口
    database: 'shoppingList', // 数据库名
    username: 'root', // 用户名
    password: '', // 密码
    timezone: '+08:00', // 设置时区
  };
  return {
    ...config,
    ...userConfig,
  };
};
