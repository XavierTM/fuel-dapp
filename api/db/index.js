const { Sequelize } = require("sequelize");
const Account = require("./Account");

const dirname = process.env.platform === 'win32' ? __dirname.substring(2) : __dirname;
const dialect = `sqlite::${dirname}/db.sqlite`;
const sequelize = new Sequelize(dialect, { logging: false });

async function init() {
   Account.init(sequelize);

   const force = process.env.NODE_ENV !== 'production';

   await sequelize.sync({ force });

}

module.exports = {
   sequelize,
   init
}