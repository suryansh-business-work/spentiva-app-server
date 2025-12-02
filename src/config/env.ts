export default {
  PORT: process.env.PORT || 8002,
  DBURL:
    process.env.DBURL ||
    'mongodb+srv://suryanshbusinesswork:education54@sibera-box.ofemtir.mongodb.net/spentiva?retryWrites=true&w=majority',
  SERVICES: {
    EMAIL: {
      POSTMASK: process.env.POSTMASK || '4f990416-098b-4ae3-b96f-48aa5ce47504',
      NODEMAILER: {
        HOST: process.env.NODEMAILER_HOST || 'smtp.gmail.com',
        PORT: parseInt(process.env.NODEMAILER_PORT || '465'),
        USER: process.env.NODEMAILER_USER || 'suryansh@exyconn.com',
        PASS: process.env.NODEMAILER_PASS || 'ylip muer ugqn xvym'
      }
    }
  }
};
