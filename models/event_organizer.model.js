const {DataTypes} = require('sequelize');
const sequelize = require('../utils/db-connection');
const Event = require('./event.model');
const User = require('./user.model');

module.exports = sequelize.define(
    'event_organizer', {

        event_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model : Event,
                key: 'id'
            } ,
            onDelete: 'CASCADE',
        },
        organizer_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model : User,
                key: 'id'
            }
        }

    }, {
        tableName: 'event_organizer',
        timestamps: false,
        indexes: [
            {
                name: 'event_organizer_by_event_id',
                fields: ['event_id'],
            },
            {
                name: 'event_organizer_by_organizer_id',
                fields: ['organizer_id'],
            }
        ]
    }
);