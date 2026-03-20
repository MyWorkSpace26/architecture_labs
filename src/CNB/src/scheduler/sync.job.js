import cron from 'node-cron';
import { config } from '../config/config.js';

export class SyncJob {
  constructor(syncService) {
    this.syncService = syncService;
    this.task = null;
  }

  // Start the scheduled sync job
  start() {
    if (this.task) {
      console.log('Sync job is already running');
      return;
    }

    console.log(`Starting scheduled sync job with cron: ${config.syncTime}`);
    
    this.task = cron.schedule(config.syncTime, async () => {
      console.log('Running scheduled sync job...');
      try {
        const result = await this.syncService.syncToday();
        console.log(`Scheduled sync completed. Synced: ${result.synced}, Errors: ${result.errors.length}`);
        
        if (result.errors.length > 0) {
          console.error('Sync errors:', result.errors);
        }
      } catch (error) {
        console.error('Scheduled sync failed:', error.message);
      }
    }, {
      scheduled: true,
      timezone: 'Europe/Prague'
    });

    console.log('Sync job started successfully');
  }

  // Stop the scheduled sync job
  stop() {
    if (this.task) {
      this.task.stop();
      this.task = null;
      console.log('Sync job stopped');
    } else {
      console.log('No sync job is running');
    }
  }

  // Run sync job manually
  async runManual() {
    console.log('Running manual sync...');
    try {
      const result = await this.syncService.syncToday();
      console.log(`Manual sync completed. Synced: ${result.synced}, Errors: ${result.errors.length}`);
      
      if (result.errors.length > 0) {
        console.error('Manual sync errors:', result.errors);
      }
      
      return result;
    } catch (error) {
      console.error('Manual sync failed:', error.message);
      return { synced: 0, errors: [error.message] };
    }
  }

  // Get job status
  getStatus() {
    return {
      isRunning: !!this.task,
      schedule: config.syncTime,
      nextRun: this.task ? this.task.nextDate() : null
    };
  }
}
