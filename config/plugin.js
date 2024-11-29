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
