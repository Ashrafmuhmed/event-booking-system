const Events = require('../models/event.model');
const Users = require('../models/user.model');
const sequelize = require('../utils/db-connection');
const {Op} = require("sequelize");

exports.createEvent = (req, res, next) => {

    const {title, description, date, totalCapacity} = req.body;

    Events.findOne({
        where: {title}
    }).then(
        event => {
            if (event) {
                return res.json('There is already a event with this title!');
            }

            return sequelize.transaction(async (transaction) => {
                const newEvent = await Events.create({
                    title,
                    description,
                    date,
                    totalCapacity,
                    availableCapacity: totalCapacity,
                }, {transaction});
                await newEvent.setOrganizers([req.user.id], {transaction});
                return newEvent;
            })
        }
    ).then(
        event => {
            return res.status(200).json({
                status: 'success',
                message: 'Event created!',
            });
        }
    ).catch(
        err => next(err)
    );


};

exports.getEvents = (req, res, next) => {

    Events.findAll({
        include: {
            model: Users,
            as: 'organizers',
            attributes: ['id', 'username', 'email'],
            through: {
                attributes: []
            }
        },
        attributes: ['id', 'title', 'description', 'totalCapacity', 'availableCapacity'],
    }).then(
        events => {
            return res.json(events);
        }
    ).catch(error => {
        res.status(500).send({
            message: error.message,
        })
    })

}

exports.getEvent = (req, res, next) => {

    const {title} = req.body;

    Events.findAll({
        where: {
            title: {
                [Op.iLike]: `%${title}%`
            }
        }
    }).then(
        events => {

            res.json({
                status: 'success',
                events
            });

        }
    ).catch(error => {
        next(error);
    })

}

exports.removeEvent = (req, res, next) => {

    const {id} = req.body;

    Events.findByPk(
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
    ).then(
        event => {
            if (!event) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Event not found!',
                });
            }
            
            const {organizers} = event;
            let canDelete = false;
            organizers.forEach((organizer) => {
                if (organizer.id === req.user.id )
                    canDelete = true;
            })

            if (canDelete)
                return event.destroy()
                    .then(
                        _ => res.status(200).json({
                            status: 'success',
                            message: 'Event deleted!',
                        })
                    );
            else
                return res.status(401).json({
                    status: 'error',
                    message: 'You are not authorized to delete!',
                })
        }
    ).catch(error => next(error))


}