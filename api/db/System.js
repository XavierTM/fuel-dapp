

const { Model, DataTypes } = require("sequelize");


class System extends Model {
   static init(sequelize) {
      super.init({
         fuel_price: {
            type: DataTypes.FLOAT,
            allowNull: false,
         },
      }, { sequelize });
   }
}


module.exports = System;