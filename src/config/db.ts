import { connect } from 'mongoose';
import { logger } from '../utils/logger';

export default function db(dbUrl: string) {
  connect(dbUrl)
    .then(() => {
      logger.info('✅ Database Connected Successfully', {
        database: 'MongoDB',
        url: dbUrl.split('@')[1] || 'hidden', // Show only host part for security
      });
    })
    .catch(error => {
      logger.error('❌ Database Connection Failed', {
        error: error.message,
        stack: error.stack,
      });
      process.exit(1); // Exit if database connection fails
    });
}
