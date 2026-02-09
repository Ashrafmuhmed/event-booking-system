const router = require('express').Router() ;
const reservationController = require('../controllers/reservation.controller');

router.post( '/reserve' , reservationController.postReservation ) ;

router.delete( '/reserve' , reservationController.deleteReservation)

module.exports = router;