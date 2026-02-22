const Events = require('../models/event.model');
const Users = require('../models/user.model');
const sequelize = require('../utils/db-connection');
const {Op} = require("sequelize");

exports.createEvent = async (req, res, next) => {

    const {title, description, date, totalCapacity} = req.body;


    if (!title || !description || !date || !totalCapacity) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing required fields'
        });
    }

    try {
        const event = await Events.findOne({
            where: {title}
        });

        if (event) {
            return res.status(400).json({
                status: 'error',
                message: 'There is already an event with this title!'
            });
        }

        const nEvent = await sequelize.transaction(async (transaction) => {
            const newEvent = await Events.create({
                title,
                description,
                date,
                totalCapacity,
                availableCapacity: totalCapacity,
            }, {transaction});
            await newEvent.setOrganizers([req.user.id], {transaction});
            return newEvent;
        });

        return res.status(201).json({
            status: 'success',
            message: 'Event created successfully!',
            event: nEvent
        });
    } catch (error) {
        next(error);
    }

};

exports.getEvents = async (req, res, next) => {

    try {
        const events = await Events.findAll({
            include: {
                model: Users,
                as: 'organizers',
                attributes: ['id', 'username', 'email'],
                through: {
                    attributes: []
                }
            },
            attributes: ['id', 'title', 'description', 'date', 'totalCapacity', 'availableCapacity'],
        })
        return res.status(200).json({
            status: 'success',
            events: events
        });
    } catch (error) {
        next(error);
    }


}

exports.getEvent = async (req, res, next) => {

    const {title} = req.body;


    if (!title) {
        return res.status(400).json({
            status: 'error',
            message: 'Title is required'
        });
    }

    try {
        const events = await Events.findAll({
            where: {
                title: {
                    [Op.iLike]: `%${title}%`
                }
            },
            include: {
                model: Users,
                as: 'organizers',
                attributes: ['id', 'username', 'email'],
                through: {
                    attributes: []
                }
            }
        });

        if (events.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No events found'
            });
        }

        res.status(200).json({
            status: 'success',
            events
        });
    } catch (error) {
        next(error);
    }


}

exports.removeEvent = async (req, res, next) => {

    const {id} = req.body;

    if (!id) {
        return res.status(400).json({
            status: 'error',
            message: 'Event ID is required'
        });
    }

    try {
        const event = await Events.findByPk(
            id,
            {
                include: [
                    {
                        model: Users,
                        as: 'organizers',
                        attributes: ['id', 'username', 'email'],
                    }
                ]
            }
        )

        if (!event) {
            return res.status(404).json({
                status: 'error',
                message: 'Event not found!',
            });
        }

        const {organizers} = event;
        let canDelete = false;
        organizers.forEach((organizer) => {
            if (organizer.id === req.user.id)
                canDelete = true;
        })

        if (canDelete) {
            await event.destroy()
            res.status(200).json({
                status: 'success',
                message: 'Event deleted!',
            });
        } else {
            return res.status(401).json({
                status: 'error',
                message: 'You are not authorized to delete!',
            });
        }

    } catch (error) {
        next(error);
    }

};

const extractReservations = (event) => {

    const reservations = [];
    if (!event || !event.reservations) {
        return [];
    }

    event.reservations.forEach(
        reservation => {
            const res = {
                reservationId: reservation.reservation.id,
                username: reservation.username,
                email: reservation.email,
                quantity: reservation.reservation.quantity,
            };
            reservations.push(res);
        }
    );

    return reservations;

}

exports.getEventReservations = async (req, res, next) => {

    const {eventId} = req.body;

    if (!eventId) {
        return res.status(400).json({
            status: 'error',
            message: 'Event ID is required'
        });
    }

    try {
        const event = await Events.findByPk(eventId, {
            include: [
                {
                    model: Users,
                    as: 'organizers',
                    attributes: ['id'],
                    through: {
                        attributes: []
                    }
                },
                {
                    model: Users,
                    as: 'reservations',
                }
            ]
        });

        if (!event) {
            return res.status(404).json({
                status: 'error',
                message: 'Event not found'
            });
        }

        const {organizers} = event;
        let canAccess = false;

        organizers.forEach((organizer) => {
            if (organizer.id === req.user.id)
                canAccess = true;
        });

        if (!canAccess)
            throw new Error('You cant access this event, you are not organizer') ;

        const reservations = extractReservations(event);

        res.status(200).json({
            status: 'success',
            reservations,
        });

    } catch (error) {
        next(error);
    }

};