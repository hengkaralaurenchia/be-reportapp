'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Report extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Report.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });

      Report.hasMany(models.Notification, {
        foreignKey: 'report_id'
      });
    }
  }
  Report.init({
    user_id: DataTypes.BIGINT,
    type: DataTypes.STRING,
    location: DataTypes.STRING,
    description: DataTypes.TEXT,
    image: {
      type: DataTypes.STRING,
      get() {
        //getter : menipulasi data hasil response datanya
        const rawValue = this.getDataValue('image');
        //image yg di db cuman filename, di response jadi link yg bisa dibuka/ditampilin gambarnya
        return rawValue ? `http://192.168.1.10:5000/uploads/${rawValue}` : null;
      }
    },
    fix_image: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue('fix_image');
        return rawValue ? `http://192.168.1.10:5000/uploads/${rawValue}` : null;
      }
    },
    status: DataTypes.STRING,
    estimated_completion: DataTypes.DATE,
    completed_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Report',
  });
  return Report;
};