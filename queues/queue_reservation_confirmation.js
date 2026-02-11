const { Queue } = require('bullmq');

module.exports = new Queue('reservation-confirmation');