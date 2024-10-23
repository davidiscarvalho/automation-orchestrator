const TaskManager = require('./utils/taskManager');
const logger = require('./utils/logger');

class Orchestrator {
  constructor(config) {
    this.config = config;
    this.taskManager = new TaskManager(config.database.url);
  }

  async run() {
    logger.info('Starting orchestrator run');
    try {
      const tasks = await this.taskManager.getTasksToRun();
      
      for (const task of tasks) {
        try {
          logger.info(`Running task: ${task.name}`);
          await task.run();
          logger.info(`Task ${task.name} completed successfully`);
        } catch (error) {
          logger.error(`Error running task ${task.name}: ${error.message}`);
          continue;
        }
      }
    } catch (error) {
      logger.error(`Orchestrator error: ${error.message}`);
      throw error;
    }

    logger.info('Orchestrator run completed');
  }
}

module.exports = Orchestrator;