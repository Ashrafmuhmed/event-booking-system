const router = require('express').Router() ;
const userController = require('../controllers/users.controller');

router.get('/users' , userController.getUsers ) ;

router.get( '/user_organizing' , userController.getEventsOrgByUser ) ;

module.exports = router ;