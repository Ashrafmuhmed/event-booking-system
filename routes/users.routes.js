const router = require('express').Router() ;
const userController = require('../controllers/users.controller');

router.get('/users' , userController.getUsers ) ;

router.get( '/user_organizing' , userController.getEventsOrgByUser ) ;

router.get( '/user/reservation' , userController.getReservations ) ;

module.exports = router ;