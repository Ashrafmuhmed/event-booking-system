const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const {Op} = require("sequelize");
const sgmail = require('@sendgrid/mail');
const {generateAccessToken} = require('../utils/jwt-helpers');
sgmail.setApiKey(process.env.SENDGRID_API_KEY);

exports.signupController = async (req, res, next) => {

    const {username, email, password, role} = req.body;

    try {
        const user = await User.findOne({
            where: {
                [Op.or]: [{username: username}, {email: email}]
            }
        })
        if (user) {
            const field = user.username === username ? 'username' : 'email';
            return res.status(400).json(`This ${field} is already in use.`);
        }
        const hashedPassword = await bcrypt.hash(password, 15)
        const newUser = User.create({
            username,
            email,
            role,
            password: hashedPassword
        });

        res.status(200).json({message: 'registered successfully', user: newUser});
    } catch (err) {
        next(err);
    }

};

exports.loginController = async (req, res, next) => {

    const {email, password} = req.body;
    let loggedInUser;
    const user = await User.findOne({
        where: {email: email},
        attributes: ['id', 'email', 'password']
    })

    const accessToken = await generateAccessToken(user);

    if (!user) {
        return res.status(401).json("There is no account with this email.");
    }
    const passwordMatched = await bcrypt.compare(password, user.password)
    if (!passwordMatched) {
        return res.status(401).json("wrong email or password");
    }

    return res.status(200).json({message: "You are logged in.", token: accessToken});


}

exports.logoutController = (req, res, next) => {
    return res.status(200).json({
        message: "Logout successful. Delete token on client side."
    });
};

exports.getForgetPasswordController = async (req, res, next) => {

    const {email} = req.body;

    try {
        const user = await User.findOne({where: {email}});

        if (!user) {
            return res.status(401).send("No user found.");
        }

        const token = crypto.randomBytes(16).toString('hex');
        user.resetToken = token;
        user.resetTokenExpire = Date.now() + 300000; // the token will expire after 5 min.
        await user.save();

        await sgmail.send({
            to: user.email,
            from: process.env.SENDGRID_EMAIL,
            subject: 'Reset Password',
            html: ` <a href="localhost:3000/reset/${token}"> Reset password</a> `,
        });

        return res.status(200).json('Check your email for reset password');
    } catch (err) {
        next(err);
    }

}

exports.postResetPasswordController = async (req, res, next) => {

    const {token} = req.params;
    const {newPassword} = req.body;

    try {
        const user = await User.findOne({
            where: {resetToken: token, resetTokenExpire: {[Op.gt]: Date.now()}}
        });

        if (!user) {
            return res.status(401).json('Expiry token is expired');
        }

        user.resetToken = undefined;
        user.resetTokenExpire = undefined;
        await user.save();

        const hash = await bcrypt.hash(newPassword, 10);
        user.password = hash;
        await user.save();

        return res.status(200).json('Password updated!');
    } catch (err) {
        next(err);
    }

}

