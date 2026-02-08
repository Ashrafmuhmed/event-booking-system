const { DataTypes  } = require('sequelize');
const sequelize = require('../utils/db-connection');
const User = require('./user.model');
const Event = require('./event.model');

module.exports = sequelize.define( 'reservation', {
    id : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    } ,
    userId : {
        type: DataTypes.INTEGER,
        references: {
            model: User ,
            key: 'id'
        } ,
        onDelete: 'CASCADE',
    } ,
    eventId : {
        type: DataTypes.INTEGER,
        references: {
            model: Event,
            key: 'id'
        },
        onDelete: 'CASCADE',
    } ,
    quantity : {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
}) ;