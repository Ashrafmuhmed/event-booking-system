const {DataTypes} = require('sequelize');
const sequilize = require('../utils/db-connection');

module.exports = sequilize.define('event', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true

    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    totalCapacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isNotLessThan10(value) {
                return value > 10;
            }
        }
    },
    availableCapacity: {
        type: DataTypes.INTEGER,
        allowNull: false ,
        validate: {
            isNotNegative(value) {
                return value >= 0;
            }
        }
    }
} , {
    indexes: [
        {
            unique:true,
            fields:['title']
        }
    ]
});