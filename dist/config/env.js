"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    PORT: process.env.PORT || 8002,
    DBURL: process.env.DBURL ||
        'mongodb+srv://suryanshbusinesswork:education54@sibera-box.ofemtir.mongodb.net/spentiva?retryWrites=true&w=majority',
    JWT_SECRET: process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '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',
    SERVICES: {
        EMAIL: {
            NODEMAILER: {
                HOST: process.env.NODEMAILER_HOST || 'smtp.gmail.com',
                PORT: parseInt(process.env.NODEMAILER_PORT || '465'),
                USER: process.env.NODEMAILER_USER || 'suryansh@exyconn.com',
                PASS: process.env.NODEMAILER_PASS || 'ylip muer ugqn xvym',
            },
        },
    },
};
