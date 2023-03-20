

const { Model, DataTypes } = require("sequelize");


class Payment extends Model {
   static init(sequelize) {
      super.init({
         tokens: {
            type: DataTypes.INTEGER,
            allowNull: false,
         },
      }, { sequelize });
   }
}


module.exports = Payment;