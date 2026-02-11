const ioredis = require("ioredis");

module.exports = new ioredis({maxRetriesPerRequest: null});