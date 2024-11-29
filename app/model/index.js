const path = require('path');
const fs = require('fs');

module.exports = app => {
  const models = {};
  const files = fs.readdirSync(__dirname).filter(file =>
    file !== 'index.js' && file !== '.DS_Store') || [];
  files.forEach(file => {
    const model = require(path.join(__dirname, file))(app);
    models[model.name] = model;
  });

  app.model = models;
};
