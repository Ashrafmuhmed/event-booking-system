const Reservation = require('../models/reservations.model');
const sequelize = require('../utils/db-connection');
const Event = require('../models/event.model');
const User = require('../models/user.model');

exports.postReservation = (req, res, next) => {

    const {eventId, quantity} = req.body;
    const userId = req.user.id;
    console.log('Event reservation id ', eventId);

    sequelize.transaction(
        (transaction) => {

            return Event.findByPk(eventId, {
                lock: transaction.LOCK.UPDATE,
                transaction,
            }).then(
                (event) => {
                    if (!event) {
                        throw new Error('Event doesnt exist');
                    }

                    if (event.availableCapacity < quantity) {
                        throw new Error('Available capacity is less then the quntity u need');
                    }
                    event.availableCapacity -= quantity;

                    return Reservation.findOne({
                        where: {userId, eventId},
                        transaction,
                        lock: transaction.LOCK.UPDATE
                    }).then(
                        existingReservation => {
                            if (existingReservation) {
                                existingReservation.quantity += quantity;
                                return existingReservation.save({transaction}).then(
                                    _ => {
                                        return event.save({transaction});
                                    }
                                );
                            } else {
                                return event.save({transaction}).then(
                                    _ => {
                                        return event.addReservation(userId, {
                                                through: {
                                                    quantity,
                                                },
                                                transaction
                                            },
                                        );
                                    }
                                );
                            }

                        }
                    )
                }
            ).then(
                _ => {
                    return res.status(201).json({
                        message: 'Reservation created',
                    });
                }
            ).catch(
                err => next(err)
            );
        }
    )
}

exports.deleteReservation = (req, res, next) => {

    const {eventId} = req.body;
    const userId = req.user.id;

    Reservation.findOne({
        where: {
            eventId, userId
        }
    }).then(
        reservation => {

            if (!reservation) {
                throw new Error('Reservation not found.');
            }

            return Event.findByPk(eventId).then(
                event => {
                    if (!event) {
                        throw new Error('Event doesnt exist');
                    }
                    event.availableCapacity += reservation.quantity;
                    return event.save();
                }
            ).then(
                _ => reservation.destroy()
            )

        }
    ).then(
        _ => {
            res.status(201).json({
                message: 'Reservation deleted',
            })
        }
    ).catch(
        err => next(err)
    );

}