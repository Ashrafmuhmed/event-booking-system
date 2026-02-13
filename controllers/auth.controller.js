const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const {Op} = require("sequelize");
const sgmail = require('@sendgrid/mail');
sgmail.setApiKey(process.env.SENDGRID_API_KEY);

exports.signupController = (req, res, next) => {

    const {username, email, password, role} = req.body;

    User.findOne({
        where: {
            [Op.or]: [{username: username}, {email: email}]
        }
    }).then(
        user => {
            if (user) {
                const field = user.username === username ? 'username' : 'email';
                return res.status(400).json(`This ${field} is already in use.`);
            }
            return bcrypt.hash(password, 15)
    }).then(
        hashedPassword => {
            return User.create({
                username,
                email,
                role,
                password: hashedPassword
            });
        }
    ).then(
        newUser => {
            req.session.loggedIn = true;
            req.session.user = newUser;
            res.status(201).json(newUser);
        }
    ).catch(err => next(err));
};

exports.loginController = (req, res, next) => {

    const {email, password} = req.body;
    let loggedInUser;
    User.findOne({
        where: {email: email},
        attributes: ['id', 'email', 'password']
    }).then(
        user => {

            if (!user) {
                return res.status(401).json("There is no account with this email.");
            }
            loggedInUser = {
                id: user.id,
                email: user.email
            };
            return bcrypt.compare(password, user.password).then(
                passwordMatched => {
                    if (!passwordMatched) {
                        return res.status(401).json("wrong email or password");
                    }
                    req.session.loggedIn = true;
                    req.session.user = loggedInUser;
                    return res.status(200).json("You are logged in.");
                }
            )
        }
    ).catch(err => next(err));

}

exports.logoutController = (req, res, next) => {

    if (!req.session.loggedIn) {
        return res.status(401).json("You are not logged in.");
    }

    req.session.destroy(err => {
        if (err) {
            return next(err);
        }
        res.status(200).json("Successfully logged out.");
    });
}

exports.getForgetPasswordController = (req, res, next) => {

    const {email} = req.body;

    User.findOne(
        {where: {email}},
    ).then(
        user => {

            if (!user) {
                return res.status(401).send("No user found.");
            }

            const token = crypto.randomBytes(16).toString('hex');
            return Promise.resolve().then(() => {

                user.resetToken = token;
                user.resetTokenExpire = Date.now() + 300000; // the token will expire after 5 min.
                return user.save()

            }).then(
                user => {
                    sgmail.send({
                            to: user.email,
                            from: process.env.SENDGRID_EMAIL,
                            subject: 'Reset Password',
                            html: ` <a href="localhost:3000/reset/${token}"> Reset password</a> `,
                        }
                    )

                }
            )
        }
    ).then(
        _ => res.status(200).json('Check your email for reset password'),
    ).catch(
        err => next(err)
    );

}

exports.postResetPasswordController = (req, res, next) => {

    const {token} = req.params;
    const {newPassword} = req.body;
    User.findOne(
        {where: {resetToken: token, resetTokenExpire: {[Op.gt]: Date.now()}}},
    ).then(
        user => {

            if (!user) {
                return res.status(401).json('Expiry token is expired');
            }

            user.resetToken = undefined;
            user.resetTokenExpire = undefined;
            return user.save()
                .then(_ => {
                    bcrypt.hash(newPassword, 10, (err, hash) => {
                        user.password = hash;
                        return user.save().then(user => res.status(200).json('Password updated!'));
                    })
                });

        }
    ).catch(err => {
        next(err);
    })

}

