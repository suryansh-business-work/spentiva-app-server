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
