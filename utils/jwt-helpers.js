const jwt = require('jsonwebtoken');

exports.generateAccessToken = ( user ) => {
    return jwt.sign( {
        userId : user.id,
        email : user.email,
        role : user.role,
    } , process.env.ACCESS_TOKEN_SECRET , {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
    } );
};

exports.verifyAccessToken = ( token ) => {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
}