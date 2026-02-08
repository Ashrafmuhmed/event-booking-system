exports.isAuthenticated = ( req , res , next ) => {
    if(req.user){
        next();
    }else{
        res.status(400).send({message:"Not authorized"});
    }
}