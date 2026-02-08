const Users = require('../models/user.model');
const Events = require('../models/event.model');
const LIMIT = 10;

exports.getUsers = (req, res, next) => {

    const pg = !req.query.pg ? 1 : req.query.pg;

    Users.findAll({
        limit: LIMIT,
        offset: LIMIT * (pg - 1)
    }).then(
        users => {
            res.status(200).json(users);
        }
    ).catch(
        err => next(err)
    );

};

exports.getEventsOrgByUser = (req, res, next) => {

    const {id} = req.body;

    Users.findByPk(
        id,
        {
            attributes: ['username', 'email'],
            include: [
                {
                    model: Events,
                    as: 'organizedEvents',
                    attributes: ['title', 'description', 'date', 'totalCapacity', 'availableCapacity'],
                    through: {attributes: []}
                }
            ]
        }
    ).then(
        user => {
            if (!user)
                return next(new Error('User does not exist'));

            res.status(200).json({
                message: 'user fetched successfully',
                user
            });
        }
    ).catch(
        err => next(err)
    );

};