"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = db;
const mongoose_1 = require("mongoose");
function db(dbUrl) {
    (0, mongoose_1.connect)(dbUrl)
        .then(() => {
        console.log('Database Connected');
    })
        .catch(error => {
        console.log('Error while connecting to the database', error);
    });
}
