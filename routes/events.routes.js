const router = require('express').Router();
const {isOrganizer} = require('../middlewares/isOrganizer.middleware');
const eventsController = require('../controllers/events.controller');

router.post('/create-event', isOrganizer, eventsController.createEvent);

router.get('/event/reservations', eventsController.getEventReservations);

router.get('/events', eventsController.getEvents);


router.delete('/event', eventsController.removeEvent);

router.get('/event', eventsController.getEvent);


module.exports = router;