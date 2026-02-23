const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, 
    legacyHeaders: false, 
    skip: (req, res) => {
        return false;
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, 
    message: 'Too many login attempts, please try again after 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
});

const eventsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: 'Too many requests to events endpoint, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const reservationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many reservation requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    apiLimiter,
    authLimiter,
    eventsLimiter,
    reservationLimiter
};
