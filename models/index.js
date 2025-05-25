"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(path.join(__dirname, "..", "config", "config.json"))[env];
const db = {};

let sequelize;
// Initialize Sequelize instance using env variable or config file
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Dynamically read all model files and import them
fs.readdirSync(__dirname)
    .filter((file) => {
      return (
          file.indexOf(".") !== 0 && // Exclude hidden files
          file !== basename &&       // Exclude this file itself
          file.slice(-3) === ".js"   // Include only .js files
      );
    })
    .forEach((file) => {
      const model = require(path.join(__dirname, file))(sequelize);
      db[model.name] = model;
    });

// Setup associations if defined in models
Object.keys(db).forEach((modelName) => {
  if (typeof db[modelName].associate === "function") {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
