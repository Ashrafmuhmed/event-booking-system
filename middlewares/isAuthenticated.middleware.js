const { verifyAccessToken } = require('../utils/jwt-helpers');
exports.isAuthenticated = ( req , res , next ) => {
    const token = encoded.split(' ')[1];

    if(!token){
        return res.status(401).send('No token provided');
    }

    try{
        const decoded = verifyAccessToken(token);
        req.user=decoded;
        next();
    }catch(e){
        if(e.name==='TokenExpiredError'){            
            return res.status(401).send('Access token expired');
        }
        return res.status(401).send('Access token invalid');
    }

}