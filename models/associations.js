const Event = require('./event.model');
const EventOrganizers = require('./event_organizer.model');
const User = require('./user.model');
const Reservation = require('./reservations.model');

exports.initAssociations = () => {

    // M-N relation between Event and User
    User.belongsToMany(Event, {
        through: EventOrganizers,
        as: "organizedEvents",
        foreignKey: 'organizer_id',
        otherKey: 'event_id',
        onDelete: 'CASCADE',
    });

    Event.belongsToMany(User, {
        through: EventOrganizers,
        as: "organizers",
        foreignKey: 'event_id',
        otherKey: 'organizer_id',
        onDelete: 'CASCADE',
    });

    // M-N relation between Event and User , Reservations
    User.belongsToMany(Event, {
        through: Reservation,
        as: "reservatedEvents",
        foreignKey: 'userId',
        otherKey: 'eventId',
    });

    Event.belongsToMany(User, {
        through: Reservation,
        as: "reservations",
        foreignKey: 'eventId',
        otherKey: 'userId',
    });

};