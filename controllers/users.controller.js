const Users = require('../models/user.model');
const Events = require('../models/event.model');
const LIMIT = 10;

exports.getUsers = async (req, res, next) => {

    const pg = !req.query.pg ? 1 : req.query.pg;

    try {
        const users = Users.findAll({
            limit: LIMIT,
            offset: LIMIT * (pg - 1)
        });
        res.status(200).json(users);
    } catch (err) {
        next(err);
    }


};

exports.getEventsOrgByUser = async (req, res, next) => {

    const {id} = req.body;

    try {
        if (!id) {
            const err = new Error('Something went wrong');
            err.status = 500;
            throw err;
        }

        const user = await Users.findByPk(
            id,
            {
                attributes: ['username', 'email', 'role'],
                include: [
                    {
                        model: Events,
                        as: 'organizedEvents',
                        attributes: ['title', 'description', 'date', 'totalCapacity', 'availableCapacity'],
                        through: {attributes: []}
                    }
                ]
            }
        );

        if (!user)
            throw new Error('User does not exist');

        res.status(200).json({
            message: 'user fetched successfully',
            user
        });
    } catch (err) {
        next(err);
    }


};

exports.getReservations = async (req, res, next) => {

    const userId = req.user.id;

    try{
        const user = Users.findByPk(
            userId, {
                attributes: ['username', 'email'],
                include: [{
                    model: Events,
                    as: 'reservatedEvents',
                    attributes: ['title'],
                    through: {attributes: ['quantity', 'id']}
                }]
            }
        )
        if (!user) {
            const err = new Error('User does not exist');
            err.status = 500;
            throw err;
        }

        if (!user.reservatedEvents || user.reservatedEvents.length === 0) {
            return res.status(200).json({
                status: 'success',
                message: 'No reservations found',
                reservations: []
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Reservations fetched successfully',
            reservations: user.reservatedEvents
        });
    }catch(err) {
        next(err);
    }


};