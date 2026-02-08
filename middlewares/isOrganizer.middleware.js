exports.isOrganizer = (req, res, next) => {
    if (req.user.role != 'organizer') {
        res.status(401).json('You are not authorized');
    } else
        next();
}