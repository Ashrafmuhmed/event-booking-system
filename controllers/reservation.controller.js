const Reservation = require('../models/reservations.model');
const sequelize = require('../utils/db-connection');
const Event = require('../models/event.model');
const User = require('../models/user.model');
const reservationQueue = require('../queues/queue_reservation_confirmation');

exports.postReservation = async (req, res, next) => {

    const {eventId, quantity} = req.body;
    const userId = req.user.id;
    console.log('Event reservation id ', eventId);
    let confirmationData;

    try {
        await sequelize.transaction(
            async (transaction) => {

                const event = await Event.findByPk(eventId, {
                    lock: transaction.LOCK.UPDATE,
                    transaction,
                })
                if (!event) {
                    throw new Error('Event doesnt exist');
                }

                if (event.availableCapacity < quantity) {
                    throw new Error('Available capacity is less then the quntity u need');
                }
                event.availableCapacity -= quantity;

                const existingReservation = await Reservation.findOne({
                    where: {userId, eventId},
                    transaction,
                    lock: transaction.LOCK.UPDATE
                })
                if (existingReservation) {
                    existingReservation.quantity += quantity;
                    await existingReservation.save({transaction})
                    await event.save({transaction});
                } else {
                    await event.save({transaction})
                    await event.addReservation(userId, {
                            through: {
                                quantity,
                            },
                            transaction
                        },
                    )
                    const user = await User.findByPk(userId, {
                        include: [{
                            model: Event,
                            as: 'reservatedEvents'
                        }],
                        transaction
                    });
                    const events = user.reservatedEvents;
                    const reservationId = events.find(ev => ev.eventId === eventId).id;
                    confirmationData = {
                        username: user.username,
                        email: user.email,
                        eventName: event.eventName,
                        reservationId
                    };
                    await reservationQueue.add('Reservation Confirmation', confirmationData, {delay: 4500});
                }
            });
        res.status(201).json({
            message: 'Reservation created',
        });
    } catch (error) {
        next(error);
    }
}
exports.deleteReservation = async (req, res, next) => {

    const {eventId} = req.body;
    const userId = req.user.id;

    try {
        const reservation = await Reservation.findOne({
            where: {
                eventId, userId
            }
        })

        if (!reservation) {
            throw new Error('Reservation not found.');
        }

        const event = await Event.findByPk(eventId)

        if (!event) {
            throw new Error('Event doesnt exist');
        }
        event.availableCapacity += reservation.quantity;
        await event.save();

        await reservation.destroy()

        res.status(201).json({
            message: 'Reservation deleted',
        });
    } catch (error) {
        next(error);
    }


}