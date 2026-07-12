const cron = require('node-cron');
const Challenge = require('../models/Challenge');
const logger = require('../utils/logger');

const initCronJobs = () => {
  // Cron running every night at midnight to check expired challenges
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('Running cron job: Checking challenges deadlines...');
      const now = new Date();
      
      // Update challenges that are past their end date
      const result = await Challenge.updateMany(
        { endDate: { $lt: now }, status: 'Active' },
        { status: 'Completed' }
      );
      
      logger.info(`Completed challenges cron run: updated ${result.modifiedCount} challenges`);
    } catch (error) {
      logger.error('Error running challenges cron job', error);
    }
  });

  logger.info('Cron jobs initialized successfully');
};

module.exports = initCronJobs;
