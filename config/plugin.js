/** @type Egg.EggPlugin */
// module.exports = {
//   // had enabled by egg
//   // static: {
//   //   enable: true,
//   // }
// };
exports.sequelize = {
  enable: true,
  package: 'egg-sequelize',
};
exports.io = {
  enable: true,
  package: 'egg-socket.io',
};
// exports.mysql = {
//   enable: true,
//   package: 'egg-mysql',
// };
// config/plugin.js
exports.cors = {
  enable: true,
  package: 'egg-cors',
};
exports.validate = {
  enable: true,
  package: 'egg-validate',
};
exports.redis = {
  enable: true,
  package: 'egg-redis',
};