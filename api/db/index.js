const { Sequelize } = require("sequelize");
const Account = require("./Account");

const dirname = process.env.platform === 'win32' ? __dirname.substring(2) : __dirname;
const dialect = `sqlite::${dirname}/db.sqlite`;
const sequelize = new Sequelize(dialect, { logging: false });

async function init() {
   Account.init(sequelize);

   const force = process.env.NODE_ENV !== 'production';

   await sequelize.sync({ force });

   // make main account a company
   try {
      const account = process.env.MAIN_ACCOUNT;
      const type = 'company';

      await Account.create({ account, type });
   } catch {}

}

module.exports = {
   sequelize,
   init
}