const { Sequelize } = require("sequelize");
const Account = require("./Account");
const Payment = require("./Payment");
const System = require("./System");

const dirname = process.env.platform === 'win32' ? __dirname.substring(2) : __dirname;
let dialect;

if (process.env.NODE_ENV === 'test')
   dialect = 'sqlite::memory';
else
   dialect = `sqlite::${dirname}/db.sqlite`;

const sequelize = new Sequelize(dialect, { logging: false });

async function init() {

   Account.init(sequelize);
   Payment.init(sequelize);
   System.init(sequelize);

   Payment.belongsTo(Account, {
      foreignKey: {
         name: 'account',
         allowNull: false,
      },
      onDelete: 'CASCADE',
   });

   const force = process.env.NODE_ENV !== 'production';

   await sequelize.sync({ force });

   // make main account a company
   try {
      const account = process.env.MAIN_ACCOUNT;
      const type = 'company';

      await Account.create({ account, type });
   } catch {}

   // create system row
   try {
      await System.create({
         id: 1,
         fuel_price: 10,
      });
   } catch {}

}

module.exports = {
   sequelize,
   init
}