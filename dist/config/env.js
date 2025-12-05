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
