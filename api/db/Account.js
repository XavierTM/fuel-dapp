const { Model, DataTypes } = require("sequelize");


class Account extends Model {
   static init(sequelize) {
      super.init({
         account: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
         },
         type: {
            type: DataTypes.ENUM('company', 'customer'),
            allowNull: false,
         }
      }, { sequelize });
   }
}


module.exports = Account;