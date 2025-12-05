"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = db;
const mongoose_1 = require("mongoose");
const logger_1 = require("../utils/logger");
function db(dbUrl) {
    (0, mongoose_1.connect)(dbUrl)
        .then(() => {
        logger_1.logger.info('✅ Database Connected Successfully', {
            database: 'MongoDB',
            url: dbUrl.split('@')[1] || 'hidden', // Show only host part for security
        });
    })
        .catch(error => {
        logger_1.logger.error('❌ Database Connection Failed', {
            error: error.message,
            stack: error.stack,
        });
        process.exit(1); // Exit if database connection fails
    });
}
